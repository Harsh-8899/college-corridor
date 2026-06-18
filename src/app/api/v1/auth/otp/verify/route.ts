import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { verifyOtpCode, OtpType } from "@/lib/auth/otp-service";

const verifyOtpSchema = z.object({
  emailOrPhone: z.string().min(4, "Invalid credential length.").optional(),
  phone: z.string().min(10).optional(),
  code: z.string().length(6, "Verification code must be exactly 6 digits."),
  type: z.enum(["email_verification", "phone_verification", "password_reset"]).optional()
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    
    // 1. Zod schema validation
    const parsed = verifyOtpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: parsed.error.errors[0].message } },
        { status: 400 }
      );
    }

    const { phone, code } = parsed.data;
    let { emailOrPhone, type } = parsed.data;
    
    // Backward compatibility mapping for old lead-capture format
    if (phone && !emailOrPhone) {
      emailOrPhone = phone;
      type = "phone_verification";
    }

    if (!emailOrPhone) {
      return NextResponse.json(
        { error: { message: "Email or phone credential is required." } },
        { status: 400 }
      );
    }

    const cleanCredential = emailOrPhone.trim().toLowerCase();
    const targetType = type || "phone_verification";

    // 2. Resolve User
    let user;
    if (cleanCredential.includes("@")) {
      user = await prisma.user.findUnique({
        where: { email: cleanCredential }
      });
    } else {
      const cleanPhone = cleanCredential.replace(/[\s-()]/g, "");
      user = await prisma.user.findFirst({
        where: { phone: cleanPhone }
      });
    }

    // Special fallback for guests verifying phone before registration
    // If the student doesn't have a registered account yet, we verify their phone OTP verification using the older OTPVerification table!
    if (!user) {
      if (targetType === "phone_verification") {
        // Fallback to legacy verification tracking
        const record = await prisma.oTPVerification.findFirst({
          where: {
            phone: cleanCredential.replace(/[\s-()]/g, ""),
            status: "PENDING"
          },
          orderBy: { createdAt: "desc" }
        });

        if (!record) {
          return NextResponse.json(
            { error: { message: "No active verification request found for this phone number." } },
            { status: 404 }
          );
        }

        if (new Date() > record.expiresAt) {
          await prisma.oTPVerification.update({
            where: { id: record.id },
            data: { status: "EXPIRED" }
          });
          return NextResponse.json({ error: { message: "OTP has expired. Please request a new one." } }, { status: 400 });
        }

        if (record.otp !== code) {
          await prisma.oTPVerification.update({
            where: { id: record.id },
            data: { attempts: { increment: 1 } }
          });
          return NextResponse.json({ error: { message: "Incorrect OTP code." } }, { status: 400 });
        }

        await prisma.oTPVerification.update({
          where: { id: record.id },
          data: { status: "VERIFIED" }
        });

        return NextResponse.json({
          success: true,
          message: "OTP verified successfully."
        });
      }

      return NextResponse.json(
        { error: { message: "Verification failed: account user not found." } },
        { status: 404 }
      );
    }

    // 3. Verify OTP
    const verifyRes = await verifyOtpCode(user.id, code, targetType as OtpType);
    if (!verifyRes.success) {
      return NextResponse.json(
        { error: { message: verifyRes.message } },
        { status: 400 }
      );
    }

    // 4. Update status flags upon successful verification
    if (targetType === "email_verification") {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          status: "ACTIVE",
          emailVerified: new Date()
        }
      });
    } else if (targetType === "phone_verification") {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          phoneVerified: true
        }
      });
    }

    // Also update legacy verification table to keep leads creation compatible
    if (targetType === "phone_verification") {
      await prisma.oTPVerification.updateMany({
        where: {
          phone: cleanCredential.replace(/[\s-()]/g, ""),
          status: "PENDING"
        },
        data: {
          status: "VERIFIED"
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: verifyRes.message
    });

  } catch (error) {
    console.error("OTP verification endpoint failed:", error);
    return NextResponse.json(
      { error: { message: "Internal server error during verification check." } },
      { status: 500 }
    );
  }
}
