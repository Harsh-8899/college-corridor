import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { verifyTurnstileToken } from "@/lib/security/turnstile";
import { generateAndSendOtp, OtpType } from "@/lib/auth/otp-service";

const requestOtpSchema = z.object({
  emailOrPhone: z.string().min(4, "Invalid credential length."),
  type: z.enum(["email_verification", "phone_verification", "password_reset"]),
  captchaToken: z.string().nullable().optional()
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const body = await request.json().catch(() => null);
    
    // 1. Zod check
    const parsed = requestOtpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: parsed.error.errors[0].message } },
        { status: 400 }
      );
    }

    const { emailOrPhone, type, captchaToken } = parsed.data;
    const cleanCredential = emailOrPhone.trim().toLowerCase();

    // 2. Validate Turnstile Token
    const isCaptchaValid = await verifyTurnstileToken(captchaToken, ip);
    if (!isCaptchaValid) {
      return NextResponse.json(
        { error: { message: "Security check failed. Please refresh and try again." } },
        { status: 400 }
      );
    }

    // 3. User Resolution
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

    // For password reset, require user presence
    if (!user && type === "password_reset") {
      return NextResponse.json(
        { error: { message: "No registered account found with these details." } },
        { status: 404 }
      );
    }

    // For registration email verification retry
    if (!user && type === "email_verification") {
      return NextResponse.json(
        { error: { message: "Verification failed: user record not found. Please register first." } },
        { status: 404 }
      );
    }

    // Guest phone verification flow
    if (!user && type === "phone_verification") {
      const cleanPhone = cleanCredential.replace(/[\s-()]/g, "");
      const { requestOTP } = await import("@/lib/auth/otp");
      const otpRes = await requestOTP(cleanPhone);
      if (!otpRes.success) {
        return NextResponse.json(
          { error: { message: otpRes.message } },
          { status: 400 }
        );
      }
      return NextResponse.json({
        success: true,
        message: otpRes.message,
        devCode: otpRes.otp
      });
    }

    const targetUser = user!;

    // 4. Generate and send the verification code
    const targetAddress = type === "phone_verification" ? targetUser.phone! : targetUser.email;
    const otpRes = await generateAndSendOtp(targetUser.id, targetAddress, type as OtpType, ip);

    if (!otpRes.success) {
      return NextResponse.json(
        { error: { message: otpRes.message } },
        { status: 429 }
      );
    }

    return NextResponse.json({
      success: true,
      message: otpRes.message,
      devCode: otpRes.devCode // For dev sandbox
    });

  } catch (error) {
    console.error("Failed to request verification code:", error);
    return NextResponse.json(
      { error: { message: "Internal server error during verification request." } },
      { status: 500 }
    );
  }
}
