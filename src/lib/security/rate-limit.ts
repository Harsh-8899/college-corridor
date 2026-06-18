import { prisma } from "@/lib/db/prisma";

export type RateLimitResult = {
  allowed: boolean;
  code?: "COOLDOWN" | "HOURLY_LIMIT";
  message?: string;
};

/**
 * Throttles API requests based on IP address and action identifier.
 * Enforces cooldown timers (1 minute resend) and hourly request quotas (5 per hour).
 */
export async function checkRateLimit(
  ip: string,
  action: string,
  limitPerHour: number = 5,
  cooldownSeconds: number = 60
): Promise<RateLimitResult> {
  const cleanIp = ip.trim();
  
  // 1. Cooldown checking (resend throttling)
  const cooldownLimitTime = new Date(Date.now() - cooldownSeconds * 1000);
  const recentLogs = await prisma.rateLimitLog.findFirst({
    where: {
      ip: cleanIp,
      action: action,
      createdAt: { gte: cooldownLimitTime }
    }
  });

  if (recentLogs) {
    const elapsedSeconds = Math.floor((Date.now() - recentLogs.createdAt.getTime()) / 1000);
    const waitSeconds = cooldownSeconds - elapsedSeconds;
    return {
      allowed: false,
      code: "COOLDOWN",
      message: `Please wait ${waitSeconds}s before requesting again.`
    };
  }

  // 2. Hourly check throttling
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const hourlyCount = await prisma.rateLimitLog.count({
    where: {
      ip: cleanIp,
      action: action,
      createdAt: { gte: oneHourAgo }
    }
  });

  if (hourlyCount >= limitPerHour) {
    return {
      allowed: false,
      code: "HOURLY_LIMIT",
      message: "Security limit exceeded: maximum 5 requests per hour. Please try again later."
    };
  }

  // 3. Register log entry
  await prisma.rateLimitLog.create({
    data: {
      ip: cleanIp,
      action: action
    }
  });

  return { allowed: true };
}
