import { NextResponse } from "next/server";
import { z } from "zod";
import { requestOTP } from "@/lib/auth/otp";

const requestOtpSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 characters")
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = requestOtpSchema.safeParse(body);

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

    const result = await requestOTP(parsed.data.phone);

    if (!result.success) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "OTP_REQUEST_FAILED",
            message: result.message
          }
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      data: {
        success: true,
        message: result.message,
        // Send OTP in response for testing/demo purposes as designed in OTP helper
        otp: result.otp
      },
      error: null
    });
  } catch (error) {
    console.error("OTP generation endpoint failed:", error);
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error during OTP generation."
        }
      },
      { status: 500 }
    );
  }
}
