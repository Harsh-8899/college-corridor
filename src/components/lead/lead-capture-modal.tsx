"use client";

import { useEffect, useMemo, useState } from "react";
import { LockKeyhole, Loader2, Phone, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LeadCaptureModalProps = {
  triggerLabel?: string;
  sourcePage: string;
  selectedCollegeIds?: string[];
  contentKey: string;
  onUnlocked?: () => void;
};

const unlockStorageKey = "college-corridor-premium-unlocked";
const cachedLeadKey = "college-corridor-lead-data";

export function isPremiumUnlocked() {
  if (typeof window === "undefined") {
    return false;
  }
  return window.localStorage.getItem(unlockStorageKey) === "true";
}

export function LeadCaptureModal({
  triggerLabel = "Unlock Premium",
  sourcePage,
  selectedCollegeIds = [],
  contentKey,
  onUnlocked
}: LeadCaptureModalProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Form State
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    currentCity: "",
    preferredCourse: "",
    preferredCategory: "OFFLINE",
    preferredLocation: "",
    budget: "",
    highestQualification: ""
  });

  // Pre-fill cache if exists
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = window.localStorage.getItem(cachedLeadKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setForm((prev) => ({ ...prev, ...parsed }));
        } catch (e) {
          console.error("Failed to parse cached lead", e);
        }
      }
    }
  }, []);

  // Sync unlock status
  useEffect(() => {
    if (isPremiumUnlocked()) {
      onUnlocked?.();
    }
  }, [onUnlocked]);

  // Handle OTP resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Indian Phone Validation: 10 digits starting with 6-9
  const isValidPhone = useMemo(() => {
    const clean = form.phone.replace(/[\s-()]/g, "");
    return /^[6-9]\d{9}$/.test(clean);
  }, [form.phone]);

  // Validate form step 1
  function validateStep1() {
    if (!form.fullName.trim() || form.fullName.trim().length < 2) {
      return "Name must be at least 2 characters.";
    }
    if (!isValidPhone) {
      return "Please enter a valid 10-digit Indian mobile number.";
    }
    if (!form.email.trim() || !form.email.includes("@")) {
      return "Please enter a valid email address.";
    }
    if (!form.currentCity.trim()) {
      return "Current city is required.";
    }
    if (!form.preferredCourse.trim()) {
      return "Preferred course is required.";
    }
    if (!form.highestQualification.trim()) {
      return "Highest qualification is required.";
    }
    return "";
  }

  // Request OTP (Send SMS logic)
  async function handleSendOtp() {
    const err = validateStep1();
    if (err) {
      setError(err);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone })
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data?.error?.message || "Failed to send OTP. Please try again.");
        return;
      }

      // If OTP was returned in data (dev bypass), print it for convenience
      if (data?.data?.otp) {
        console.log(`[DEV ONLY] OTP received from server: ${data.data.otp}`);
      }

      setStep(2);
      setResendCooldown(30); // 30s resend cooldown
    } catch {
      setLoading(false);
      setError("Network connection issue. Try again.");
    }
  }

  // Verify OTP and Submit Lead
  async function handleVerifyAndSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (otpCode.length !== 6) {
      setError("OTP must be exactly 6 digits.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // 1. Verify OTP code
      const verifyRes = await fetch("/api/v1/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone, code: otpCode })
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        setLoading(false);
        setError(verifyData?.error?.message || "Invalid OTP code. Please check and try again.");
        return;
      }

      // 2. Submit lead details
      const payload = {
        ...form,
        interestedInstitutionId: selectedCollegeIds[0] || undefined,
        pageUrl: sourcePage || (typeof window !== "undefined" ? window.location.pathname : "/"),
        ctaClicked: triggerLabel,
        unlockedContentKeys: [contentKey]
      };

      const leadRes = await fetch("/api/v1/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const leadData = await leadRes.json();
      setLoading(false);

      if (!leadRes.ok) {
        setError(leadData?.error?.message || "Failed to submit lead details.");
        return;
      }

      // 3. Cache lead details and set unlocked status
      window.localStorage.setItem(cachedLeadKey, JSON.stringify(form));
      window.localStorage.setItem(unlockStorageKey, "true");
      
      onUnlocked?.();
      setOpen(false);
      // Reset Modal
      setStep(1);
      setOtpCode("");
    } catch {
      setLoading(false);
      setError("An error occurred during submission. Please try again.");
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2 shadow-lg hover:shadow-primary/20 transition-all font-medium">
        <LockKeyhole className="h-4 w-4" />
        {triggerLabel}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <Card className="max-h-[92vh] w-full max-w-2xl overflow-y-auto border-slate-200/80 shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200 bg-white">
            <CardHeader className="flex flex-row items-start justify-between gap-4 border-b pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded bg-primary/10 text-primary">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <CardTitle className="text-xl font-bold text-slate-900">Verify Admissions Profile</CardTitle>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Verify your mobile number to unlock brochures, comparisons, and counseling support.
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => { setOpen(false); setStep(1); setError(""); }} aria-label="Close" className="rounded-full text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              {error && (
                <div className="mb-4 rounded-lg bg-rose-50 border border-rose-100 p-3.5 text-sm font-medium text-rose-600">
                  {error}
                </div>
              )}

              {step === 1 ? (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                        placeholder="e.g. Rahul Sharma"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone">Indian Mobile Number</Label>
                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                        <Input
                          id="phone"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="e.g. 98765 43210"
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="e.g. rahul@gmail.com"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="highestQualification">Highest Qualification</Label>
                      <Input
                        id="highestQualification"
                        value={form.highestQualification}
                        onChange={(e) => setForm({ ...form, highestQualification: e.target.value })}
                        placeholder="e.g. B.Tech, Class 12"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="currentCity">Current City</Label>
                      <Input
                        id="currentCity"
                        value={form.currentCity}
                        onChange={(e) => setForm({ ...form, currentCity: e.target.value })}
                        placeholder="e.g. New Delhi"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="preferredCourse">Preferred Course</Label>
                      <Input
                        id="preferredCourse"
                        value={form.preferredCourse}
                        onChange={(e) => setForm({ ...form, preferredCourse: e.target.value })}
                        placeholder="e.g. MBA, B.Tech CSE"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="preferredCategory">Education Category</Label>
                      <select
                        id="preferredCategory"
                        value={form.preferredCategory}
                        onChange={(e) => setForm({ ...form, preferredCategory: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm text-slate-800"
                      >
                        <option value="OFFLINE">Offline Colleges</option>
                        <option value="ONLINE">Online Programs</option>
                        <option value="STUDY_ABROAD">Study Abroad</option>
                        <option value="DISTANCE">Distance Learning</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="preferredLocation">Preferred Country / States</Label>
                      <Input
                        id="preferredLocation"
                        value={form.preferredLocation}
                        onChange={(e) => setForm({ ...form, preferredLocation: e.target.value })}
                        placeholder="e.g. Bengaluru, Canada"
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="budget">Estimated Annual Budget (INR/USD)</Label>
                      <Input
                        id="budget"
                        value={form.budget}
                        onChange={(e) => setForm({ ...form, budget: e.target.value })}
                        placeholder="e.g. 2-4 LPA, $20,000"
                      />
                    </div>
                  </div>

                  <Button onClick={handleSendOtp} disabled={loading} className="w-full mt-4 h-11 text-base">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" /> Requesting OTP...
                      </span>
                    ) : (
                      "Verify Mobile & Continue"
                    )}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleVerifyAndSubmit} className="space-y-6">
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-center">
                    <p className="text-sm text-slate-600">
                      We have sent a verification code to <span className="font-semibold text-slate-800">{form.phone}</span>.
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Enter the 6-digit code below to confirm your mobile number.
                    </p>
                  </div>

                  <div className="space-y-2 max-w-xs mx-auto text-center">
                    <Label htmlFor="otpCode" className="text-base font-semibold">Enter 6-Digit OTP</Label>
                    <Input
                      id="otpCode"
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ""))}
                      className="text-center text-2xl font-bold tracking-widest h-12"
                      placeholder="000000"
                      autoFocus
                    />
                  </div>

                  <div className="flex flex-col gap-3 max-w-xs mx-auto">
                    <Button type="submit" disabled={loading || otpCode.length !== 6} className="w-full h-11 text-base">
                      {loading ? (
                        <span className="flex items-center gap-2 justify-center">
                          <Loader2 className="h-5 w-5 animate-spin" /> Verifying Profile...
                        </span>
                      ) : (
                        "Verify and Submit Profile"
                      )}
                    </Button>

                    <div className="text-center">
                      {resendCooldown > 0 ? (
                        <p className="text-xs text-slate-400">
                          Resend OTP in <span className="font-semibold text-slate-600">{resendCooldown}s</span>
                        </p>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={handleSendOtp}
                          disabled={loading}
                          className="text-xs text-primary font-medium hover:underline p-0 h-auto"
                        >
                          Didn&apos;t receive code? Resend OTP
                        </Button>
                      )}
                    </div>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
