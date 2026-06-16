import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyOTP } from "@/lib/auth/otp";

const verifyOtpSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  code: z.string().length(6, "OTP code must be exactly 6 digits")
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = verifyOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.errors[0].message
          }
        },
        { status: 400 }
      );
    }

    const result = await verifyOTP(parsed.data.phone, parsed.data.code);

    if (!result.success) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "VERIFICATION_FAILED",
            message: result.message
          }
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      data: {
        verified: true,
        message: result.message
      },
      error: null
    });
  } catch (error) {
    console.error("OTP verification endpoint failed:", error);
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error during OTP verification."
        }
      },
      { status: 500 }
    );
  }
}
