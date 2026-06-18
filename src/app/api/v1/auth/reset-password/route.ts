import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { verifyOtpCode } from "@/lib/auth/otp-service";

const resetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  code: z.string().length(6, "Verification code must be exactly 6 digits."),
  newPassword: z.string().min(6, "New password must be at least 6 characters.")
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    
    // 1. Validate input params
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: parsed.error.errors[0].message } },
        { status: 400 }
      );
    }

    const { email, code, newPassword } = parsed.data;
    const cleanEmail = email.toLowerCase().trim();

    // 2. Fetch User
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (!user) {
      return NextResponse.json(
        { error: { message: "Account user not found." } },
        { status: 404 }
      );
    }

    // 3. Verify OTP
    const verifyRes = await verifyOtpCode(user.id, code, "password_reset");
    if (!verifyRes.success) {
      return NextResponse.json(
        { error: { message: verifyRes.message } },
        { status: 400 }
      );
    }

    // 4. Update password
    const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword
      }
    });

    return NextResponse.json({
      success: true,
      message: "Password reset complete! Please login with your new credentials."
    });

  } catch (error) {
    console.error("Failed to reset password:", error);
    return NextResponse.json(
      { error: { message: "Internal server error during password reset." } },
      { status: 500 }
    );
  }
}
