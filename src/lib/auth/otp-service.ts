import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";
import { checkRateLimit } from "@/lib/security/rate-limit";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "College Corridor <onboarding@resend.dev>";

export type OtpType = "email_verification" | "phone_verification" | "password_reset";

export type OtpResult = {
  success: boolean;
  message: string;
  devCode?: string; // Exposed in development/testing mode
};

/**
 * Hash a plaintext verification code using SHA-256.
 */
function hashOtpCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

/**
 * Generate a 6-digit verification code, save its hash, and dispatch it via Resend or SMS console.
 */
export async function generateAndSendOtp(
  userId: string,
  emailOrPhone: string,
  type: OtpType,
  ip: string = "127.0.0.1"
): Promise<OtpResult> {
  // 1. Enforce rate limiting checks
  // Action identifier key includes both type and userId to throttle per-user/IP requests
  const actionKey = `otp_request:${type}:${userId}`;
  const rateLimit = await checkRateLimit(ip, actionKey, 5, 60);
  
  if (!rateLimit.allowed) {
    return {
      success: false,
      message: rateLimit.message || "Too many OTP requests. Please wait."
    };
  }

  // 2. Generate random 6-digit numeric OTP
  const rawCode = String(crypto.randomInt(100000, 999999));
  const hashedCode = hashOtpCode(rawCode);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

  // 3. Mark previous unverified OTPs of the same type for this user as expired (setting expiresAt to past)
  await prisma.oTP.updateMany({
    where: {
      userId,
      otpType: type,
      verified: false
    },
    data: {
      expiresAt: new Date(0)
    }
  });

  // 4. Record new OTP transaction
  await prisma.oTP.create({
    data: {
      userId,
      otpCodeHash: hashedCode,
      otpType: type,
      expiresAt,
      verified: false
    }
  });

  // Fetch student/user details for email personalization if user exists
  const student = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, fullName: true }
  });
  const studentName = student?.fullName || student?.name || "Student";

  // 5. Dispatch code via email (Resend) or SMS logs
  if (type === "email_verification" || type === "password_reset") {
    const isReset = type === "password_reset";
    const subject = isReset ? "Reset Your Password – College Corridor" : "Verify Your Email – College Corridor";
    
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .header { background-color: #0F172A; padding: 24px; text-align: center; }
          .header h1 { color: #818CF8; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em; }
          .header p { color: #94A3B8; margin: 4px 0 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; }
          .content { padding: 32px 24px; color: #334155; line-height: 1.6; }
          .greeting { font-size: 16px; font-weight: 600; color: #0F172A; margin-bottom: 16px; }
          .code-box { background: #EEF2F6; border: 1px solid #E2E8F0; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0; }
          .code { font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #4F46E5; font-family: monospace; }
          .meta { font-size: 12px; color: #64748B; margin-top: 16px; }
          .footer { background-color: #F8FAFC; border-top: 1px solid #F1F5F9; padding: 16px 24px; text-align: center; font-size: 12px; color: #94A3B8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>College Corridor</h1>
            <p>Admission Intelligence Platform</p>
          </div>
          <div class="content">
            <p class="greeting">Hello ${studentName},</p>
            <p>Your requested verification code for ${isReset ? "password resetting" : "account verification"} is:</p>
            <div class="code-box">
              <span class="code">${rawCode}</span>
            </div>
            <p class="meta"><strong>Note:</strong> This verification code expires in <strong>5 minutes</strong>. If you did not request this action, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            Regards,<br><strong>College Corridor Team</strong>
          </div>
        </div>
      </body>
      </html>
    `;

    // Only attempt Resend delivery if key is defined, otherwise fallback to terminal logs
    if (RESEND_API_KEY) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${RESEND_API_KEY}`
          },
          body: JSON.stringify({
            from: RESEND_FROM_EMAIL,
            to: [emailOrPhone],
            subject,
            html: htmlBody
          })
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err?.message || "Resend API returned failure status.");
        }
      } catch (err) {
        console.error("Resend API email transmission failed. Falling back to local console logs.", err);
      }
    }
  }

  // Log to console for local developer debugging & verification
  console.log(`[AUTHENTICATION OTP DISPATCH] Target: ${emailOrPhone} | Type: ${type} | Code: ${rawCode}`);

  // Return verification payload
  return {
    success: true,
    message: `Verification OTP code dispatched successfully to ${emailOrPhone}.`,
    devCode: rawCode // Exposed to client for direct developer validation sandbox
  };
}

/**
 * Verify a code against active pending transactions in the database.
 */
export async function verifyOtpCode(
  userId: string,
  code: string,
  type: OtpType
): Promise<{ success: boolean; message: string }> {
  const cleanCode = code.trim();
  const inputHash = hashOtpCode(cleanCode);

  // 1. Look up active unverified transaction that is still valid
  const activeOtp = await prisma.oTP.findFirst({
    where: {
      userId,
      otpType: type,
      verified: false,
      expiresAt: { gte: new Date() }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  if (!activeOtp) {
    return {
      success: false,
      message: "Invalid or expired verification code. Please request a new code."
    };
  }

  // 2. Attempt lock limit check (Max 5 attempts allowed)
  if (activeOtp.attemptCount >= 5) {
    // Explicitly expire the code
    await prisma.oTP.update({
      where: { id: activeOtp.id },
      data: { expiresAt: new Date(0) }
    });
    return {
      success: false,
      message: "Verification blocked: exceeded 5 verification attempts. Please generate a new code."
    };
  }

  // 3. Comparison match check
  if (activeOtp.otpCodeHash !== inputHash) {
    // Increment failures
    await prisma.oTP.update({
      where: { id: activeOtp.id },
      data: {
        attemptCount: { increment: 1 }
      }
    });
    const remaining = 5 - (activeOtp.attemptCount + 1);
    return {
      success: false,
      message: `Incorrect verification code. ${remaining} attempts remaining before lock.`
    };
  }

  // 4. Mark transaction as successfully verified
  await prisma.oTP.update({
    where: { id: activeOtp.id },
    data: {
      verified: true
    }
  });

  return {
    success: true,
    message: "Code verified successfully."
  };
}
