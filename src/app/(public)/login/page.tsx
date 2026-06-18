"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LogIn, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const registered = searchParams.get("registered");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loginMode, setLoginMode] = useState<"password" | "otp">("password");
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSendOtp() {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address first.");
      return;
    }
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/login-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
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
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <p className="text-sm text-muted-foreground">
          Access your profile, saved colleges, or dashboard.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toggle Mode */}
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
            }}
          >
            OTP Mode
          </button>
        </div>

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
        {loginMode === "otp" && devOtp && (
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs text-indigo-700 font-mono">
            <strong>Dev Mode OTP:</strong> {devOtp} (Use this code to verify)
          </div>
        )}

        {loginMode === "password" ? (
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
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
        ) : (
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
              <Button type="button" onClick={handleSendOtp} disabled={loading} className="w-full bg-[#2563EB] hover:bg-indigo-700 text-white">
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <Loader2 className="h-4 w-4 animate-spin" /> Generating OTP...
                  </span>
                ) : (
                  "Request Login OTP"
                )}
              </Button>
            )}
          </form>
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
          className="w-full"
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

        <Button asChild variant="ghost" className="w-full">
          <Link href="/register">Don&apos;t have an account? Register</Link>
        </Button>
      </CardContent>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="page-shell flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <Suspense fallback={<div className="p-8 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div>}>
          <LoginForm />
        </Suspense>
      </Card>
    </div>
  );
}
