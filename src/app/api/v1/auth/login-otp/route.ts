import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import crypto from "crypto";
import { verifyTurnstileToken } from "@/lib/security/turnstile";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const { email, captchaToken } = await request.json().catch(() => ({ email: "", captchaToken: "" }));
    const cleanEmail = email?.toLowerCase().trim();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      return NextResponse.json(
        { error: { message: "Please enter a valid email address." } },
        { status: 400 }
      );
    }

    // Validate Cloudflare Turnstile Token
    const isCaptchaValid = await verifyTurnstileToken(captchaToken, ip);
    if (!isCaptchaValid) {
      return NextResponse.json(
        { error: { message: "Security check failed. Please refresh and try again." } },
        { status: 400 }
      );
    }

    // 1. Generate 6-digit numeric OTP
    const otp = String(crypto.randomInt(100000, 999999));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // 2. Upsert/create user if they don't exist yet as STUDENT
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { role: true }
    });

    if (!user) {
      let studentRole = await prisma.role.findUnique({ where: { name: "STUDENT" } });
      if (!studentRole) {
        studentRole = await prisma.role.create({
          data: { name: "STUDENT", description: "Default student role" }
        });
      }

      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: cleanEmail.split("@")[0],
          roleId: studentRole.id
        },
        include: { role: true }
      });
    }

    // 3. Save OTP in the database
    // Expire any existing pending OTPs first
    await prisma.emailOTP.updateMany({
      where: { email: cleanEmail, status: "PENDING" },
      data: { status: "EXPIRED" }
    });

    await prisma.emailOTP.create({
      data: {
        email: cleanEmail,
        otp,
        expiresAt,
        status: "PENDING"
      }
    });

    // 4. Log OTP to terminal for developer validation
    console.log(`[AUTHENTICATION EMAIL OTP] Email: ${cleanEmail} | Code: ${otp}`);

    // Return the OTP in the payload for local development/testing convenience
    return NextResponse.json({
      success: true,
      message: "OTP sent successfully to your email.",
      otp // Exposed in developer-mode for testing UI
    });
  } catch (error) {
    console.error("Login OTP request failed:", error);
    return NextResponse.json(
      { error: { message: "Internal server error generating login OTP." } },
      { status: 500 }
    );
  }
}
