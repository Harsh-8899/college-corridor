import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { verifyTurnstileToken } from "@/lib/security/turnstile";
import { generateAndSendOtp } from "@/lib/auth/otp-service";

const registrationSchema = z.object({
  fullName: z.string().min(2, "Full Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().min(10, "Please enter a valid 10-digit phone number."),
  password: z.string().min(6, "Password must be at least 6 characters.").optional().or(z.literal("")),
  city: z.string().min(2, "City is required."),
  state: z.string().min(2, "State is required."),
  captchaToken: z.string().nullable().optional()
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const body = await request.json().catch(() => null);
    
    // 1. Zod Validation
    const parsed = registrationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: parsed.error.errors[0].message } },
        { status: 400 }
      );
    }

    const { fullName, email, phone, password, city, state, captchaToken } = parsed.data;
    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = phone.replace(/[\s-()]/g, "");

    // 2. Cloudflare Turnstile token validation
    const isCaptchaValid = await verifyTurnstileToken(captchaToken, ip);
    if (!isCaptchaValid) {
      return NextResponse.json(
        { error: { message: "Security check failed. Please refresh and try again." } },
        { status: 400 }
      );
    }

    // 3. Uniqueness Check for Email & Phone (on fully ACTIVE accounts)
    const existingEmailUser = await prisma.user.findFirst({
      where: {
        email: cleanEmail,
        status: { not: "PENDING_VERIFICATION" }
      }
    });

    if (existingEmailUser) {
      return NextResponse.json(
        { error: { message: "This email is already registered. Please login." } },
        { status: 400 }
      );
    }

    const existingPhoneUser = await prisma.user.findFirst({
      where: {
        phone: cleanPhone,
        status: { not: "PENDING_VERIFICATION" }
      }
    });

    if (existingPhoneUser) {
      return NextResponse.json(
        { error: { message: "This phone number is already linked to another account." } },
        { status: 400 }
      );
    }

    // 4. Role Fetch
    let studentRole = await prisma.role.findUnique({ where: { name: "STUDENT" } });
    if (!studentRole) {
      studentRole = await prisma.role.create({
        data: { name: "STUDENT", description: "Default student role" }
      });
    }

    // Hash password if supplied
    const passwordHash = password ? bcrypt.hashSync(password, 10) : null;

    // 5. Look up if there is an existing PENDING registration we can update, else create new
    let user = await prisma.user.findFirst({
      where: {
        email: cleanEmail,
        status: "PENDING_VERIFICATION"
      }
    });

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: fullName,
          fullName,
          phone: cleanPhone,
          password: passwordHash,
          roleId: studentRole.id,
          city,
          state,
          source: "DIRECT_REGISTER"
        }
      });
    } else {
      // Create user record in PENDING_VERIFICATION status
      user = await prisma.user.create({
        data: {
          name: fullName,
          fullName,
          email: cleanEmail,
          phone: cleanPhone,
          password: passwordHash,
          roleId: studentRole.id,
          status: "PENDING_VERIFICATION",
          city,
          state,
          source: "DIRECT_REGISTER"
        }
      });
    }

    // 6. Generate and Send Email Verification OTP
    const otpRes = await generateAndSendOtp(user.id, cleanEmail, "email_verification", ip);
    
    if (!otpRes.success) {
      return NextResponse.json(
        { error: { message: otpRes.message } },
        { status: 429 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Registration recorded successfully! Verification OTP code dispatched.",
      userId: user.id,
      devCode: otpRes.devCode // Propagated for frontend developer console bypass in testing
    });

  } catch (error) {
    console.error("User registration failed:", error);
    return NextResponse.json(
      { error: { message: "Internal server error during registration." } },
      { status: 500 }
    );
  }
}
