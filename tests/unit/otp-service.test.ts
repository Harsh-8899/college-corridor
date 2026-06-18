import { generateAndSendOtp, verifyOtpCode } from "@/lib/auth/otp-service";
import { prisma } from "@/lib/db/prisma";
import crypto from "crypto";

// Mock prisma and rate limiter
jest.mock("@/lib/db/prisma", () => ({
  prisma: {
    oTP: {
      updateMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("@/lib/security/rate-limit", () => ({
  checkRateLimit: jest.fn().mockResolvedValue({ allowed: true }),
}));

describe("OTP Service Unit Tests", () => {
  const userId = "test-user-123";
  const email = "test@example.com";
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("generateAndSendOtp generates code and stores its SHA-256 hash in DB", async () => {
    (prisma.oTP.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
    (prisma.oTP.create as jest.Mock).mockResolvedValue({ id: "otp-id" });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ name: "Test User" });

    const res = await generateAndSendOtp(userId, email, "email_verification");

    expect(res.success).toBe(true);
    expect(res.devCode).toBeDefined();
    expect(res.devCode).toHaveLength(6);

    // Verify hashed code matches input hash
    const expectedHash = crypto.createHash("sha256").update(res.devCode!).digest("hex");
    
    expect(prisma.oTP.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId,
          otpCodeHash: expectedHash,
          otpType: "email_verification",
          verified: false,
        }),
      })
    );
  });

  test("verifyOtpCode returns success on correct code match", async () => {
    const rawCode = "123456";
    const hashedCode = crypto.createHash("sha256").update(rawCode).digest("hex");

    (prisma.oTP.findFirst as jest.Mock).mockResolvedValue({
      id: "active-otp",
      otpCodeHash: hashedCode,
      attemptCount: 0,
      expiresAt: new Date(Date.now() + 60000),
    });

    (prisma.oTP.update as jest.Mock).mockResolvedValue({ id: "active-otp" });

    const res = await verifyOtpCode(userId, rawCode, "email_verification");

    expect(res.success).toBe(true);
    expect(res.message).toBe("Code verified successfully.");
    expect(prisma.oTP.update).toHaveBeenCalledWith({
      where: { id: "active-otp" },
      data: { verified: true },
    });
  });

  test("verifyOtpCode increments attemptCount on mismatch", async () => {
    const rawCode = "123456";
    const hashedCode = crypto.createHash("sha256").update(rawCode).digest("hex");

    (prisma.oTP.findFirst as jest.Mock).mockResolvedValue({
      id: "active-otp",
      otpCodeHash: hashedCode,
      attemptCount: 1,
      expiresAt: new Date(Date.now() + 60000),
    });

    (prisma.oTP.update as jest.Mock).mockResolvedValue({ id: "active-otp" });

    const res = await verifyOtpCode(userId, "wrongcode", "email_verification");

    expect(res.success).toBe(false);
    expect(res.message).toContain("Incorrect verification code");
    expect(prisma.oTP.update).toHaveBeenCalledWith({
      where: { id: "active-otp" },
      data: { attemptCount: { increment: 1 } },
    });
  });

  test("verifyOtpCode locks and expires the OTP after 5 attempts", async () => {
    const rawCode = "123456";
    const hashedCode = crypto.createHash("sha256").update(rawCode).digest("hex");

    // attemptCount is 5
    (prisma.oTP.findFirst as jest.Mock).mockResolvedValue({
      id: "active-otp",
      otpCodeHash: hashedCode,
      attemptCount: 5,
      expiresAt: new Date(Date.now() + 60000),
    });

    (prisma.oTP.update as jest.Mock).mockResolvedValue({ id: "active-otp" });

    const res = await verifyOtpCode(userId, rawCode, "email_verification");

    expect(res.success).toBe(false);
    expect(res.message).toContain("Verification blocked: exceeded 5 verification attempts");
    expect(prisma.oTP.update).toHaveBeenCalledWith({
      where: { id: "active-otp" },
      data: { expiresAt: new Date(0) },
    });
  });
});
