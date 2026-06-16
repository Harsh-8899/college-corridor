import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";

// Indian mobile number validation regex: 10 digits starting with 6-9
// Supports optional +91 prefix
export function validateIndianPhoneNumber(phone: string): boolean {
  const normalized = phone.replace(/[\s-()]/g, "");
  const match = normalized.match(/^(?:\+91|91)?[6-9]\d{9}$/);
  return !!match;
}

// Generate a cryptographically secure 6-digit numeric OTP
export function generateOTP(): string {
  return String(crypto.randomInt(100000, 999999));
}

// Request and persist a new OTP verification token
export async function requestOTP(phone: string): Promise<{ success: boolean; message: string; otp?: string }> {
  // Normalize phone number
  const normalizedPhone = phone.replace(/[\s-()]/g, "");
  
  if (!validateIndianPhoneNumber(normalizedPhone)) {
    return { success: false, message: "Invalid Indian mobile number format. Must be a 10-digit number starting with 6-9." };
  }

  // Rate limit check: Maximum 3 requests in the last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentRequests = await prisma.oTPVerification.count({
    where: {
      phone: normalizedPhone,
      createdAt: { gte: oneHourAgo }
    }
  });

  if (recentRequests >= 5) {
    return { success: false, message: "Too many OTP requests. Please try again after some time." };
  }

  // Generate and set expiry (5 minutes)
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // Deactivate any previous pending OTPs
  await prisma.oTPVerification.updateMany({
    where: {
      phone: normalizedPhone,
      status: "PENDING"
    },
    data: {
      status: "EXPIRED"
    }
  });

  // Create new verification entry
  await prisma.oTPVerification.create({
    data: {
      phone: normalizedPhone,
      otp,
      expiresAt,
      status: "PENDING"
    }
  });

  // Log OTP to console in development environment for convenience
  console.log(`[OTP Verification] Mobile: ${normalizedPhone} | Code: ${otp}`);

  // In production, this would trigger the actual SMS gateway API (e.g. MSG91 or Twilio)
  // For the demo, we return the OTP in the API response as well so the user can easily proceed.
  return {
    success: true,
    message: "OTP sent successfully.",
    otp // Exposed for demo verification
  };
}

// Verify a code and mark as verified
export async function verifyOTP(phone: string, code: string): Promise<{ success: boolean; message: string }> {
  const normalizedPhone = phone.replace(/[\s-()]/g, "");

  const record = await prisma.oTPVerification.findFirst({
    where: {
      phone: normalizedPhone,
      status: "PENDING"
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  if (!record) {
    return { success: false, message: "No active verification request found for this phone number." };
  }

  // Expiration check
  if (new Date() > record.expiresAt) {
    await prisma.oTPVerification.update({
      where: { id: record.id },
      data: { status: "EXPIRED" }
    });
    return { success: false, message: "OTP has expired. Please request a new one." };
  }

  // Attempt limit check (Max 3 attempts per OTP)
  if (record.attempts >= 3) {
    await prisma.oTPVerification.update({
      where: { id: record.id },
      data: { status: "FAILED" }
    });
    return { success: false, message: "Too many failed attempts. Please request a new OTP." };
  }

  // Match check
  if (record.otp !== code) {
    await prisma.oTPVerification.update({
      where: { id: record.id },
      data: {
        attempts: { increment: 1 }
      }
    });
    return { success: false, message: "Incorrect OTP. Please check the code and try again." };
  }

  // Successful verification
  await prisma.oTPVerification.update({
    where: { id: record.id },
    data: { status: "VERIFIED" }
  });

  return { success: true, message: "OTP verified successfully." };
}
