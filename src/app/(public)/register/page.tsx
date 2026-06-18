"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, AlertCircle, Loader2, CheckCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [devCode, setDevCode] = useState(""); // Developer mode helpers for OTP bypass
  
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    city: "",
    state: "",
    captchaToken: ""
  });

  const [otpCode, setOtpCode] = useState("");

  // Dynamically load Cloudflare Turnstile Verification API
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    (window as any).onTurnstileSuccess = (token: string) => {
      setForm((prev) => ({ ...prev, captchaToken: token }));
      setError("");
    };

    return () => {
      document.head.removeChild(script);
      delete (window as any).onTurnstileSuccess;
    };
  }, []);

  async function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    // If local dev, we don't strictly require Turnstile token if it didn't render
    if (!form.captchaToken && process.env.NODE_ENV === "production") {
      setError("Please complete the security captcha verification check.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data?.error?.message || "Registration failed. Try again.");
        return;
      }

      setMessage(data.message || "OTP code sent to email successfully!");
      if (data.devCode) {
        setDevCode(data.devCode); // Dev fallback display
      }
      setStep(2);
    } catch {
      setError("Connection error during registration. Please try again.");
      setLoading(false);
    }
  }

  async function handleVerifySubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (otpCode.length !== 6) {
      setError("Verification code must be exactly 6 digits.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/v1/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOrPhone: form.email,
          code: otpCode,
          type: "email_verification"
        })
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data?.error?.message || "Verification failed. Check the code.");
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setError("Connection error verifying code. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="page-shell flex min-h-[80vh] items-center justify-center py-10 bg-slate-50 text-slate-900">
      <Card className="w-full max-w-xl shadow-lg border-slate-200 bg-white">
        <CardHeader className="bg-slate-950 text-white p-6 rounded-t-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-indigo-500/20 text-indigo-400">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <CardTitle className="text-xl font-bold">Student Account Sign Up</CardTitle>
          </div>
          <CardDescription className="text-slate-400 text-xs">
            Create your account to save choices, evaluate admission chances, and apply.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          {error && (
            <div className="mb-6 rounded-lg bg-rose-50 border border-rose-100 p-4 text-sm font-semibold text-rose-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 shrink-0" />
              {error}
            </div>
          )}

          {message && (
            <div className="mb-6 rounded-lg bg-emerald-50 border border-emerald-100 p-4 text-sm font-semibold text-emerald-700 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 shrink-0" />
              {message}
            </div>
          )}

          {/* Dev Mode Verification Sandbox Display */}
          {step === 2 && devCode && (
            <div className="mb-6 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-xs text-indigo-700 font-mono">
              <strong>Dev Mode OTP Code:</strong> {devCode} (Use this to verify)
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-slate-700 font-semibold">Full Name</Label>
                  <Input
                    id="fullName"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    placeholder="e.g. Priyan Sharma"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-slate-700 font-semibold">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-slate-700 font-semibold">Mobile Number</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-slate-700 font-semibold">Password (Optional)</Label>
                  <Input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    minLength={6}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-slate-700 font-semibold">City</Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="e.g. Noida"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="state" className="text-slate-700 font-semibold">State</Label>
                  <Input
                    id="state"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    placeholder="e.g. Uttar Pradesh"
                    required
                  />
                </div>
              </div>

              {/* Cloudflare Turnstile Captcha Section */}
              <div className="pt-2 flex justify-center">
                <div
                  className="cf-turnstile"
                  data-sitekey="1x00000000000000000000AA"
                  data-callback="onTurnstileSuccess"
                  data-theme="light"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-[#2563EB] hover:bg-indigo-700 text-white font-bold h-11">
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending OTP Code...
                  </span>
                ) : (
                  <span className="flex items-center gap-2 justify-center">
                    <UserPlus className="h-4 w-4" /> Register & Verify
                  </span>
                )}
              </Button>

              <div className="text-center pt-2">
                <Link href="/login" className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition-colors">
                  Already have an account? Login here
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifySubmit} className="space-y-5">
              <div className="text-center p-4 border rounded-xl bg-slate-50 space-y-2 mb-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account Pending Verification</p>
                <p className="text-sm font-semibold text-slate-800">
                  Please check your inbox at <span className="text-indigo-600 font-bold">{form.email}</span> for a 6-digit activation code.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="otpCode" className="text-slate-700 font-semibold">Enter 6-Digit Email OTP</Label>
                <Input
                  id="otpCode"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="e.g. 123456"
                  maxLength={6}
                  required
                  className="text-center text-lg font-mono tracking-widest h-12"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={loading} className="flex-1 bg-[#2563EB] hover:bg-indigo-700 text-white font-bold h-11">
                  {loading ? (
                    <span className="flex items-center gap-2 justify-center">
                      <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                    </span>
                  ) : (
                    "Verify Email & Create Account"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 font-bold h-11"
                >
                  Change Email
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

