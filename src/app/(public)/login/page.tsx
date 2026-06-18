"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LogIn, AlertCircle, Loader2, KeyRound, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const registered = searchParams.get("registered");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [loginMode, setLoginMode] = useState<"password" | "otp" | "forgot_password">("password");
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");

  // Load Turnstile Script dynamically
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    (window as any).onTurnstileSuccess = (token: string) => {
      setCaptchaToken(token);
      setError("");
    };

    return () => {
      try {
        document.head.removeChild(script);
      } catch (e) {
        // Safe catch
      }
      delete (window as any).onTurnstileSuccess;
    };
  }, [loginMode]);

  async function handleSendOtp() {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address first.");
      return;
    }
    if (!captchaToken && process.env.NODE_ENV === "production") {
      setError("Please complete the security verification captcha.");
      return;
    }
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/login-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, captchaToken })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || "Failed to send OTP.");
      }
      setOtpSent(true);
      setMessage(data.message || "OTP sent successfully!");
      if (data.otp) {
        setDevOtp(data.otp);
      }
    } catch (err: any) {
      setError(err.message || "Error sending OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestReset() {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address first.");
      return;
    }
    if (!captchaToken && process.env.NODE_ENV === "production") {
      setError("Please complete the security verification captcha.");
      return;
    }
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOrPhone: email,
          type: "password_reset",
          captchaToken
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || "Failed to request reset code.");
      }
      setOtpSent(true);
      setMessage(data.message || "Reset verification OTP code sent to your email.");
      if (data.devCode) {
        setDevOtp(data.devCode);
      }
    } catch (err: any) {
      setError(err.message || "Error requesting reset code.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (otp.length !== 6) {
      setError("Verification code must be exactly 6 digits.");
      setLoading(false);
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code: otp,
          newPassword
        })
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        throw new Error(data?.error?.message || "Password reset failed.");
      }

      setMessage("Password updated successfully! Please login with your new password.");
      setLoginMode("password");
      setPassword("");
      setOtp("");
      setNewPassword("");
      setOtpSent(false);
      setDevOtp("");
    } catch (err: any) {
      setError(err.message || "Error resetting password.");
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (loginMode === "password") {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl
      });

      if (result?.error) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }

      if (result?.ok) {
        window.location.href = callbackUrl;
      }
    } else {
      const result = await signIn("credentials", {
        email,
        otp,
        redirect: false,
        callbackUrl
      });

      if (result?.error) {
        setError("Invalid or expired OTP code.");
        setLoading(false);
        return;
      }

      if (result?.ok) {
        window.location.href = callbackUrl;
      }
    }
  }

  return (
    <>
      <CardHeader className="bg-slate-950 text-white p-6 rounded-t-lg">
        <div className="flex items-center gap-2 mb-1">
          <span className="flex h-7 w-7 items-center justify-center rounded bg-indigo-500/20 text-indigo-400">
            <KeyRound className="h-4 w-4" />
          </span>
          <CardTitle className="text-xl font-bold">
            {loginMode === "forgot_password" ? "Reset Password" : "Student Sign In"}
          </CardTitle>
        </div>
        <CardDescription className="text-slate-400 text-xs">
          {loginMode === "forgot_password" 
            ? "Verify your identity using email OTP to set a new password." 
            : "Access your dashboard, shortlisted universities, and leads details."}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 p-6 sm:p-8">
        {/* Toggle Mode (only visible when not resetting password) */}
        {loginMode !== "forgot_password" && (
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg text-sm mb-4">
            <button
              type="button"
              className={`py-1.5 rounded-md font-medium transition-all ${
                loginMode === "password"
                  ? "bg-white text-slate-950 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              onClick={() => {
                setLoginMode("password");
                setError("");
                setMessage("");
                setOtpSent(false);
              }}
            >
              Password Mode
            </button>
            <button
              type="button"
              className={`py-1.5 rounded-md font-medium transition-all ${
                loginMode === "otp"
                  ? "bg-white text-slate-950 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              onClick={() => {
                setLoginMode("otp");
                setError("");
                setMessage("");
                setOtpSent(false);
              }}
            >
              OTP Mode
            </button>
          </div>
        )}

        {registered && (
          <div className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary">
            Registration successful! Please sign in.
          </div>
        )}
        {message && (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 font-medium">
            {message}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-500">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* Developer Sandbox/Mode Helper */}
        {devOtp && (
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs text-indigo-700 font-mono">
            <strong>Dev Mode OTP Code:</strong> {devOtp} (Use this code to verify)
          </div>
        )}

        {loginMode === "password" && (
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode("forgot_password");
                    setError("");
                    setMessage("");
                    setOtpSent(false);
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  Forgot Password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-[#2563EB] hover:bg-indigo-700 text-white font-bold">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" /> Continue
                </span>
              )}
            </Button>
          </form>
        )}

        {loginMode === "otp" && (
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={otpSent}
                required
              />
            </div>

            {otpSent ? (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="otp">Enter Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="6-digit OTP code"
                    maxLength={6}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center gap-2 justify-center">
                        <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                      </span>
                    ) : (
                      "Verify & Login"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp("");
                    }}
                  >
                    Change Email
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Cloudflare Turnstile Captcha Section for OTP requests */}
                <div className="pt-1 flex justify-center">
                  <div
                    className="cf-turnstile"
                    data-sitekey="1x00000000000000000000AA"
                    data-callback="onTurnstileSuccess"
                    data-theme="light"
                  />
                </div>
                
                <Button type="button" onClick={handleSendOtp} disabled={loading} className="w-full bg-[#2563EB] hover:bg-indigo-700 text-white">
                  {loading ? (
                    <span className="flex items-center gap-2 justify-center">
                      <Loader2 className="h-4 w-4 animate-spin" /> Generating OTP...
                    </span>
                  ) : (
                    "Request Login OTP"
                  )}
                </Button>
              </>
            )}
          </form>
        )}

        {loginMode === "forgot_password" && (
          <div className="space-y-4">
            {!otpSent ? (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Registered Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                
                {/* Cloudflare Turnstile Captcha Section for Resets */}
                <div className="pt-1 flex justify-center">
                  <div
                    className="cf-turnstile"
                    data-sitekey="1x00000000000000000000AA"
                    data-callback="onTurnstileSuccess"
                    data-theme="light"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="button" onClick={handleRequestReset} disabled={loading} className="flex-1 bg-[#2563EB] hover:bg-indigo-700 text-white">
                    {loading ? "Generating OTP..." : "Send Verification Code"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setLoginMode("password");
                      setError("");
                      setMessage("");
                    }}
                  >
                    Back to Sign In
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="otp">Enter 6-Digit Email OTP</Label>
                  <Input
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="e.g. 123456"
                    maxLength={6}
                    required
                    className="text-center font-mono tracking-widest text-lg"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                    {loading ? "Resetting Password..." : "Update Password"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp("");
                      setNewPassword("");
                    }}
                  >
                    Change Email
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full font-bold"
          onClick={() => signIn("google", { callbackUrl })}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
            <path d="M1 1h22v22H1z" fill="none" />
          </svg>
          Sign in with Google
        </Button>

        <Button asChild variant="ghost" className="w-full font-semibold">
          <Link href="/register">Don&apos;t have an account? Register</Link>
        </Button>
      </CardContent>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="page-shell flex min-h-[70vh] items-center justify-center bg-slate-50 py-10 text-slate-900">
      <Card className="w-full max-w-md shadow-md border-slate-200 bg-white">
        <Suspense fallback={<div className="p-8 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div>}>
          <LoginForm />
        </Suspense>
      </Card>
    </div>
  );
}
