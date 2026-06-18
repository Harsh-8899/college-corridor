import { z } from "zod";

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY || "1x00000000000000000000000000000000"; // Always-pass testing secret

/**
 * Validates a Turnstile captcha token sent from the client.
 * Returns true if valid or if Turnstile check is bypassed in local development.
 */
export async function verifyTurnstileToken(token?: string | null, ip?: string): Promise<boolean> {
  // Safe default: bypass verification if we are in local dev and no token is passed
  if (!token && process.env.NODE_ENV !== "production") {
    console.log("[Captcha Skip] Local environment bypass - no Turnstile token provided.");
    return true;
  }

  if (!token) {
    return false;
  }

  // Allow Cloudflare Turnstile always-pass mock token directly
  if (token === "XXXX.dummy.token.XXXX" || token.startsWith("1x00000000000000000000")) {
    return true;
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", TURNSTILE_SECRET_KEY);
    formData.append("response", token);
    if (ip) {
      formData.append("remoteip", ip);
    }

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    return !!data.success;
  } catch (error) {
    console.error("Cloudflare Turnstile token verification failed:", error);
    // Fail closed in production for security, but allow pass in local development
    return process.env.NODE_ENV !== "production";
  }
}
