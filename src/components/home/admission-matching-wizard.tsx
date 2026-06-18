"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  Coins,
  GraduationCap,
  HeartHandshake,
  LineChart,
  Loader2,
  Mail,
  MapPin,
  Percent,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
  Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type AdmissionMatchingWizardProps = {
  courses: any[];
  universitiesList: any[];
  initialUniversityId?: string;
  onSubmitSuccess: (evaluationResult: any) => void;
};

export function AdmissionMatchingWizard({
  universitiesList,
  initialUniversityId,
  onSubmitSuccess
}: AdmissionMatchingWizardProps) {
  const { data: session } = useSession();
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    degreeType: "UG", // UG, PG, DIPLOMA
    preferredCourse: "B.Tech",
    preferredSpecialization: "",
    budgetRange: "2-4 LPA",
    salaryExpectation: "3-5 LPA",
    currentQualification: "Class 12",
    marksRange: "60-70%",
    exactMarks: "",
    workExperience: "None",
    placementInterest: "Job Assistance",
    scholarshipCategory: "General",
    name: "",
    phone: "",
    email: "",
    state: "",
    city: "",
    preferredUniversity: ""
  });

  // Handle OTP resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Dynamically load Cloudflare Turnstile script if required
  useEffect(() => {
    if (step !== 11 || session?.user?.phoneVerified) return;

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
      } catch {
        // ignore
      }
      delete (window as any).onTurnstileSuccess;
    };
  }, [step, session?.user?.phoneVerified]);

  // Pre-fill user data from session if logged in
  useEffect(() => {
    if (session?.user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || session.user.fullName || session.user.name || "",
        email: prev.email || session.user.email || "",
        phone: prev.phone || session.user.phone || "",
        city: prev.city || (session.user as any).city || "",
        state: prev.state || (session.user as any).state || ""
      }));
    }
  }, [session, step]);

  // Sync initial university preselection from parent (e.g. Apply Now clicks)
  useEffect(() => {
    if (initialUniversityId) {
      setForm((prev) => ({ ...prev, preferredUniversity: initialUniversityId }));
    }
  }, [initialUniversityId]);


  // Filter courses dynamically based on degreeType
  const filteredCourses = useMemo(() => {
    if (form.degreeType === "UG") {
      return ["B.Tech", "BBA", "BCA", "B.Sc", "B.Com", "BA"];
    } else if (form.degreeType === "PG") {
      return ["MBA", "MCA", "PGDM", "M.Tech", "M.Sc", "M.Com", "MA"];
    } else {
      return ["Diploma", "PG Diploma", "Executive MBA", "Certification"];
    }
  }, [form.degreeType]);

  // Specialization recommendations based on chosen course
  const recommendedSpecializations = useMemo(() => {
    const courseLower = form.preferredCourse.toLowerCase();
    if (courseLower.includes("tech") || courseLower.includes("bca") || courseLower.includes("mca")) {
      return ["Computer Science", "Data Science", "Artificial Intelligence", "Information Technology", "Cyber Security", "Software Engineering"];
    }
    if (courseLower.includes("mba") || courseLower.includes("bba") || courseLower.includes("pgdm")) {
      return ["Finance", "Marketing", "Human Resource", "Operations", "Business Analytics", "Healthcare Management"];
    }
    return ["General", "Finance", "Human Resource", "International Business", "Operations"];
  }, [form.preferredCourse]);

  // Percentage values mapper for admissions evaluation API
  const calculatedPercentage = useMemo(() => {
    if (form.exactMarks) {
      return parseFloat(form.exactMarks) || 65;
    }
    switch (form.marksRange) {
      case "Below 50%":
        return 45;
      case "50-60%":
        return 55;
      case "60-70%":
        return 65;
      case "70-80%":
        return 75;
      case "Above 80%":
        return 85;
      default:
        return 65;
    }
  }, [form.marksRange, form.exactMarks]);

  // Qualification mapper based on degreeType
  useEffect(() => {
    if (form.degreeType === "UG") {
      setForm((prev) => ({ ...prev, currentQualification: "Class 12" }));
    } else if (form.degreeType === "PG") {
      setForm((prev) => ({ ...prev, currentQualification: "Bachelors Degree" }));
    } else {
      setForm((prev) => ({ ...prev, currentQualification: "Diploma" }));
    }
  }, [form.degreeType]);

  // Auto-advance to next step
  const handleSelectOption = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
    setStep((prev) => prev + 1);
  };

  const handleNextStep = () => {
    // Validations per step if necessary
    if (step === 3 && !form.preferredSpecialization.trim()) {
      setError("Please specify a specialization.");
      return;
    }
    if (step === 7 && form.exactMarks) {
      const val = parseFloat(form.exactMarks);
      if (isNaN(val) || val < 0 || val > 100) {
        setError("Percentage must be a valid number between 0 and 100.");
        return;
      }
    }
    setError("");
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setError("");
    setStep((prev) => prev - 1);
  };

  // Indian Phone Validation: 10 digits starting with 6-9
  const isValidPhone = useMemo(() => {
    const clean = form.phone.replace(/[\s-()]/g, "");
    return /^[6-9]\d{9}$/.test(clean);
  }, [form.phone]);

  const validateLeadInputs = () => {
    if (!form.name.trim() || form.name.trim().length < 2) {
      return "Name must be at least 2 characters.";
    }
    if (!isValidPhone) {
      return "Please enter a valid 10-digit Indian mobile number.";
    }
    if (!form.email.trim() || !form.email.includes("@")) {
      return "Please enter a valid email address.";
    }
    if (!form.city.trim()) {
      return "City is required.";
    }
    return "";
  };

  // Trigger Send OTP for guest registration
  const handleSendOtp = async () => {
    const err = validateLeadInputs();
    if (err) {
      setError(err);
      return;
    }

    if (session?.user?.phoneVerified) {
      await submitAdmissionEvaluation();
      return;
    }

    if (!captchaToken && process.env.NODE_ENV === "production") {
      setError("Please complete the security CAPTCHA check.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOrPhone: form.phone,
          type: "phone_verification",
          captchaToken: captchaToken
        })
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data?.error?.message || "Failed to send OTP code. Please try again.");
        return;
      }

      if (data?.devCode) {
        console.log(`[DEVELOPER MODE ONLY] Phone OTP Code: ${data.devCode}`);
      }

      setOtpSent(true);
      setResendCooldown(60);
    } catch {
      setLoading(false);
      setError("A connection error occurred. Please verify your connection and try again.");
    }
  };

  // Submit profile to emissions evaluation API
  const submitAdmissionEvaluation = async () => {
    setLoading(true);
    setError("");

    try {
      const submissionPayload = {
        name: form.name,
        phone: form.phone,
        email: form.email,
        state: form.state || form.city,
        city: form.city,
        currentQualification: form.currentQualification,
        tenthPercentage: calculatedPercentage - 5, // Approximate 10th
        twelfthPercentage: calculatedPercentage,
        graduationPercentage: form.degreeType === "PG" ? calculatedPercentage : undefined,
        entranceExam: "None",
        entranceExamScore: "",
        preferredCourse: form.preferredCourse,
        preferredSpecialization: form.preferredSpecialization,
        preferredUniversity: form.preferredUniversity || undefined,
        budgetRange: form.budgetRange,
        sourcePage: window.location.pathname,
        ctaClicked: "AI Matching Wizard"
      };

      const checkRes = await fetch("/api/v1/admissions/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionPayload)
      });

      const checkData = await checkRes.json();
      setLoading(false);

      if (!checkRes.ok) {
        setError(checkData?.error?.message || "Failed to submit evaluation details.");
        return;
      }

      onSubmitSuccess(checkData.evaluation);
    } catch {
      setLoading(false);
      setError("Failed to execute admission chance checker API.");
    }
  };

  // Verify OTP and complete submission
  const handleVerifyOtpAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      setError("OTP code must be exactly 6 digits.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const verifyRes = await fetch("/api/v1/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: form.phone,
          code: otpCode,
          type: "phone_verification"
        })
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        setLoading(false);
        setError(verifyData?.error?.message || "Invalid verification code. Please check and try again.");
        return;
      }

      // Successful OTP validation -> complete evaluation lead
      await submitAdmissionEvaluation();
    } catch {
      setLoading(false);
      setError("OTP verification check failed.");
    }
  };

  // Completion percentage
  const progressPercent = Math.min(100, Math.round(((step - 1) / 10) * 100));

  return (
    <Card className="w-full border-slate-200/80 shadow-2xl bg-white overflow-hidden rounded-2xl transition-all duration-300">
      {/* Wizard Progress Header */}
      <div className="bg-[#0F172A] text-white px-6 py-4 flex flex-col justify-between border-b border-slate-800">
        <div className="flex justify-between items-center mb-2">
          <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase">
            <Sparkles className="h-3 w-3 inline mr-1 animate-pulse" />
            AI Admission Intelligence Matching Wizard
          </Badge>
          <span className="text-xs font-semibold text-slate-400">Step {step} of 11</span>
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-1 relative">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-400 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <CardContent className="p-6 sm:p-8 min-h-[360px] flex flex-col justify-between">
        {error && (
          <div className="mb-6 rounded-xl bg-rose-50 border border-rose-100 p-4 text-sm font-semibold text-rose-600 flex items-center gap-2 animate-in fade-in duration-250">
            <span className="h-2 w-2 rounded-full bg-rose-600 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex-1 flex flex-col justify-center">
          {/* STEP 1: Degree Level */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Select desired Degree Level</h3>
                <p className="text-xs text-slate-500">Pick standard category of course you want to explore</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3 max-w-2xl mx-auto pt-2">
                {[
                  { value: "UG", title: "Undergraduate (UG)", desc: "B.Tech, BBA, BCA, B.Sc, BA", icon: GraduationCap },
                  { value: "PG", title: "Postgraduate (PG)", desc: "MBA, MCA, PGDM, M.Tech", icon: Award },
                  { value: "DIPLOMA", title: "Diploma / Certifications", desc: "Short-term specialized courses", icon: BookOpen }
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => handleSelectOption("degreeType", item.value)}
                    className={`p-5 text-left rounded-xl border-2 transition-all group flex flex-col justify-between min-h-[140px] hover:border-indigo-600 hover:shadow-lg hover:-translate-y-1 ${
                      form.degreeType === item.value
                        ? "border-indigo-600 bg-indigo-50/40 shadow-xs"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <item.icon className={`h-8 w-8 transition-colors ${form.degreeType === item.value ? "text-indigo-600 animate-bounce" : "text-slate-400 group-hover:text-indigo-500"}`} />
                    <div className="space-y-1 mt-3">
                      <p className="font-extrabold text-sm text-slate-800">{item.title}</p>
                      <p className="text-[11px] text-slate-400 group-hover:text-slate-500 transition-colors leading-snug">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Preferred Course */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Select Preferred Course</h3>
                <p className="text-xs text-slate-500">Showing courses matching your {form.degreeType} selection</p>
              </div>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 max-w-xl mx-auto pt-2">
                {filteredCourses.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleSelectOption("preferredCourse", c)}
                    className={`p-4 text-center rounded-xl border-2 transition-all font-bold text-sm hover:border-indigo-600 hover:shadow-md ${
                      form.preferredCourse === c
                        ? "border-indigo-600 bg-indigo-50/40 text-indigo-700"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="max-w-xs mx-auto text-center space-y-2 pt-2">
                <p className="text-xs text-slate-400 font-semibold">Other course option?</p>
                <Input
                  value={form.preferredCourse}
                  onChange={(e) => setForm({ ...form, preferredCourse: e.target.value })}
                  placeholder="Or enter course name..."
                  className="text-center font-semibold"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Preferred Specialization */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Choose Specialization</h3>
                <p className="text-xs text-slate-500">Pick from popular streams or specify custom stream</p>
              </div>
              <div className="flex flex-wrap gap-2.5 justify-center max-w-2xl mx-auto pt-2">
                {recommendedSpecializations.map((spec) => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => setForm({ ...form, preferredSpecialization: spec })}
                    className={`px-4 py-2 rounded-full border text-xs font-bold transition-all ${
                      form.preferredSpecialization === spec
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
              <div className="max-w-md mx-auto space-y-1.5 pt-4 border-t border-slate-100">
                <Label htmlFor="specializationInput" className="text-slate-700 font-bold text-xs">Custom Specialization</Label>
                <Input
                  id="specializationInput"
                  value={form.preferredSpecialization}
                  onChange={(e) => setForm({ ...form, preferredSpecialization: e.target.value })}
                  placeholder="e.g. Artificial Intelligence, Marketing Analytics..."
                  className="font-semibold text-sm"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Budget Range */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Estimated Annual Budget</h3>
                <p className="text-xs text-slate-500">What is your tuition fee budget limit per academic year?</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-5 max-w-3xl mx-auto pt-2">
                {[
                  { range: "Under 1 LPA", desc: "Budget friendly", icon: Coins },
                  { range: "1-2 LPA", desc: "Moderate", icon: Wallet },
                  { range: "2-4 LPA", desc: "Standard Private", icon: Wallet },
                  { range: "4-8 LPA", desc: "Premium / Engg", icon: Wallet },
                  { range: "Above 8 LPA", desc: "International / Top B-school", icon: Wallet }
                ].map((b) => (
                  <button
                    key={b.range}
                    type="button"
                    onClick={() => handleSelectOption("budgetRange", b.range)}
                    className={`p-4 text-center rounded-xl border-2 transition-all flex flex-col justify-between items-center group min-h-[120px] hover:border-indigo-600 hover:shadow-md ${
                      form.budgetRange === b.range
                        ? "border-indigo-600 bg-indigo-50/40 text-indigo-700"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    <b.icon className={`h-6 w-6 ${form.budgetRange === b.range ? "text-indigo-600 animate-pulse" : "text-slate-400 group-hover:text-indigo-500"}`} />
                    <div className="mt-2 space-y-0.5">
                      <p className="font-extrabold text-xs">{b.range}</p>
                      <p className="text-[10px] text-slate-400 group-hover:text-slate-500 transition-colors leading-tight">{b.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Salary Expectation */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="text-center space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Expected Salary Package</h3>
                <p className="text-xs text-slate-500">What are your placement salary expectations after completion?</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-4 max-w-2xl mx-auto pt-2">
                {[
                  { value: "Under 3 LPA", label: "< 3 LPA", desc: "Entry-level jobs", icon: LineChart },
                  { value: "3-5 LPA", label: "3 - 5 LPA", desc: "Average starting packages", icon: LineChart },
                  { value: "5-8 LPA", label: "5 - 8 LPA", desc: "Top tech / B-school starts", icon: LineChart },
                  { value: "Above 8 LPA", label: "> 8 LPA", desc: "High-paying roles", icon: Sparkles }
                ].map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => handleSelectOption("salaryExpectation", s.value)}
                    className={`p-4 text-center rounded-xl border-2 transition-all flex flex-col justify-between items-center group min-h-[130px] hover:border-indigo-600 hover:shadow-md ${
                      form.salaryExpectation === s.value
                        ? "border-indigo-600 bg-indigo-50/40 text-indigo-700"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    <s.icon className={`h-6 w-6 ${form.salaryExpectation === s.value ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-500"}`} />
                    <div className="mt-3 space-y-0.5">
                      <p className="font-extrabold text-sm">{s.label}</p>
                      <p className="text-[10px] text-slate-400 group-hover:text-slate-500 transition-colors leading-tight">{s.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: Highest Qualification */}
          {step === 6 && (
            <div className="space-y-6">
              <div className="text-center space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Your Highest Qualification</h3>
                <p className="text-xs text-slate-500">Pick your recently completed or ongoing academic status</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-4 max-w-2xl mx-auto pt-2">
                {[
                  { value: "Class 12", label: "Class 12 / HSE", desc: "10+2 standard completed" },
                  { value: "Bachelors Degree", label: "Graduation", desc: "Completed Bachelor's course" },
                  { value: "Masters Degree", label: "Masters", desc: "Post-graduate completed" },
                  { value: "Diploma", label: "Diploma Holder", desc: "3-year vocational diploma" }
                ].map((q) => (
                  <button
                    key={q.value}
                    type="button"
                    onClick={() => handleSelectOption("currentQualification", q.value)}
                    className={`p-4 text-center rounded-xl border-2 transition-all flex flex-col justify-center items-center min-h-[110px] hover:border-indigo-600 hover:shadow-md ${
                      form.currentQualification === q.value
                        ? "border-indigo-600 bg-indigo-50/40 text-indigo-700"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    <p className="font-extrabold text-sm">{q.label}</p>
                    <p className="text-[10px] text-slate-400 mt-1 leading-tight">{q.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 7: Marks Range / Percentage */}
          {step === 7 && (
            <div className="space-y-6">
              <div className="text-center space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Qualification Score Marks (%)</h3>
                <p className="text-xs text-slate-500">Select percentage range achieved in your highest qualification</p>
              </div>
              <div className="flex flex-wrap justify-center gap-3 max-w-xl mx-auto pt-2">
                {["Below 50%", "50-60%", "60-70%", "70-80%", "Above 80%"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setForm({ ...form, marksRange: m })}
                    className={`px-5 py-3 rounded-xl border-2 transition-all font-bold text-sm hover:border-indigo-600 hover:shadow-sm ${
                      form.marksRange === m
                        ? "border-indigo-600 bg-indigo-50/40 text-indigo-700"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <div className="max-w-xs mx-auto space-y-1.5 pt-4 border-t border-slate-100 text-center">
                <Label htmlFor="exactPercentageInput" className="text-slate-500 font-semibold text-xs">Or specify exact percentage (optional)</Label>
                <div className="relative">
                  <Input
                    id="exactPercentageInput"
                    type="number"
                    step="0.01"
                    placeholder="e.g. 78.5"
                    value={form.exactMarks}
                    onChange={(e) => setForm({ ...form, exactMarks: e.target.value })}
                    className="text-center font-bold pl-8 text-lg"
                  />
                  <Percent className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: Work Experience */}
          {step === 8 && (
            <div className="space-y-6">
              <div className="text-center space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Work Experience</h3>
                <p className="text-xs text-slate-500">Do you have any formal full-time professional experience?</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-4 max-w-2xl mx-auto pt-2">
                {[
                  { value: "None", label: "Fresh Graduate", desc: "No professional experience" },
                  { value: "1-2 Years", label: "1 - 2 Years", desc: "Junior level experience" },
                  { value: "2-5 Years", label: "2 - 5 Years", desc: "Mid level experience" },
                  { value: "5+ Years", label: "5+ Years", desc: "Senior level experience" }
                ].map((exp) => (
                  <button
                    key={exp.value}
                    type="button"
                    onClick={() => handleSelectOption("workExperience", exp.value)}
                    className={`p-4 text-center rounded-xl border-2 transition-all flex flex-col justify-center items-center min-h-[110px] hover:border-indigo-600 hover:shadow-md ${
                      form.workExperience === exp.value
                        ? "border-indigo-600 bg-indigo-50/40 text-indigo-700"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    <p className="font-extrabold text-sm">{exp.label}</p>
                    <p className="text-[10px] text-slate-400 mt-1 leading-tight">{exp.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 9: Placement Interest */}
          {step === 9 && (
            <div className="space-y-6">
              <div className="text-center space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Post-studies Placement Goal</h3>
                <p className="text-xs text-slate-500">What is your primary career goal after finishing the program?</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3 max-w-2xl mx-auto pt-2">
                {[
                  { value: "Job Assistance", label: "Corporate Placement", desc: "Get placed in top companies via campus placement assistance", icon: Briefcase },
                  { value: "Self-Employed", label: "Startup / Business", desc: "Build own startup, freelance, or scale family business", icon: Sparkles },
                  { value: "Higher Studies", label: "Higher Education", desc: "Go for academic research, PhD, or top global university masters", icon: GraduationCap }
                ].map((goal) => (
                  <button
                    key={goal.value}
                    type="button"
                    onClick={() => handleSelectOption("placementInterest", goal.value)}
                    className={`p-5 text-left rounded-xl border-2 transition-all flex flex-col justify-between group min-h-[150px] hover:border-indigo-600 hover:shadow-lg hover:-translate-y-1 ${
                      form.placementInterest === goal.value
                        ? "border-indigo-600 bg-indigo-50/40 shadow-xs"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <goal.icon className={`h-7 w-7 ${form.placementInterest === goal.value ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-500"}`} />
                    <div className="space-y-1 mt-3">
                      <p className="font-extrabold text-sm text-slate-800">{goal.label}</p>
                      <p className="text-[11px] text-slate-400 leading-snug group-hover:text-slate-500 transition-colors">{goal.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 10: Scholarship Category */}
          {step === 10 && (
            <div className="space-y-6">
              <div className="text-center space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Select Scholarship Category</h3>
                <p className="text-xs text-slate-500">Pick applicable category to assess fee concession eligibility</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-5 max-w-3xl mx-auto pt-2">
                {[
                  { value: "General", label: "General", desc: "No specific reserve claim", icon: User },
                  { value: "Merit", label: "Merit-Based", desc: "Based on qualification marks", icon: Award },
                  { value: "SC_ST_OBC", label: "Reserved", desc: "Govt category concessions", icon: HeartHandshake },
                  { value: "NeedBased", label: "Need-Based", desc: "Concession for low income", icon: Wallet },
                  { value: "None", label: "None", desc: "Proceed with standard fees", icon: User }
                ].map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => handleSelectOption("scholarshipCategory", s.value)}
                    className={`p-4 text-center rounded-xl border-2 transition-all flex flex-col justify-between items-center group min-h-[120px] hover:border-indigo-600 hover:shadow-md ${
                      form.scholarshipCategory === s.value
                        ? "border-indigo-600 bg-indigo-50/40 text-indigo-700"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    <s.icon className={`h-5 w-5 ${form.scholarshipCategory === s.value ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-500"}`} />
                    <div className="mt-2 space-y-0.5">
                      <p className="font-extrabold text-xs">{s.label}</p>
                      <p className="text-[10px] text-slate-400 leading-tight group-hover:text-slate-500 transition-colors">{s.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              {/* Preferred University Choice */}
              <div className="max-w-md mx-auto space-y-1.5 pt-4 border-t border-slate-100">
                <Label htmlFor="preferredUniversity" className="text-slate-700 font-bold text-xs">Target University (Optional)</Label>
                <select
                  id="preferredUniversity"
                  value={form.preferredUniversity}
                  onChange={(e) => setForm({ ...form, preferredUniversity: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm text-slate-800 font-semibold"
                >
                  <option value="">-- Let AI Recommend Best Fit --</option>
                  {universitiesList.map((uni) => (
                    <option key={uni.id} value={uni.id}>{uni.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* STEP 11: Final Lead Form & OTP verification */}
          {step === 11 && (
            <div className="space-y-6 max-w-xl mx-auto">
              <div className="text-center space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Verify Admissions Profile</h3>
                <p className="text-xs text-slate-500">Provide details to unlock your AI match & download brochure</p>
              </div>

              {!otpSent ? (
                <div className="space-y-4 pt-2">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="fullName" className="font-semibold text-slate-700">Full Name</Label>
                      <div className="relative">
                        <Input
                          id="fullName"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="e.g. Priyan Sharma"
                          className="pl-9 font-semibold text-sm"
                        />
                        <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="font-semibold text-slate-700">Indian Mobile Number</Label>
                      <div className="relative">
                        <Input
                          id="phone"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="e.g. 9876543210"
                          className="pl-9 font-semibold text-sm"
                        />
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="font-semibold text-slate-700">Email Address</Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="e.g. priyan@gmail.com"
                          className="pl-9 font-semibold text-sm"
                        />
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="city" className="font-semibold text-slate-700">Current City</Label>
                      <div className="relative">
                        <Input
                          id="city"
                          value={form.city}
                          onChange={(e) => setForm({ ...form, city: e.target.value })}
                          placeholder="e.g. New Delhi"
                          className="pl-9 font-semibold text-sm"
                        />
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  {/* Cloudflare Turnstile Section for guests */}
                  {!session?.user?.phoneVerified && (
                    <div className="pt-2 flex justify-center">
                      <div
                        className="cf-turnstile"
                        data-sitekey="1x00000000000000000000AA"
                        data-callback="onTurnstileSuccess"
                        data-theme="light"
                      />
                    </div>
                  )}

                  {session?.user?.phoneVerified ? (
                    <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 px-4 py-3 flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-emerald-600" />
                      <p className="text-xs text-emerald-800 font-bold">Verified Account: {form.phone || session.user.phone || session.user.email} (Bypassing OTP)</p>
                    </div>
                  ) : null}

                  <Button
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="w-full h-11 text-base bg-[#2563EB] hover:bg-indigo-700 text-white font-bold"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2 justify-center">
                        <Loader2 className="h-5 w-5 animate-spin" /> Submitting...
                      </span>
                    ) : session?.user?.phoneVerified ? (
                      "Submit & Check Admission Chances"
                    ) : (
                      "Verify Mobile & See Results"
                    )}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleVerifyOtpAndSubmit} className="space-y-6 pt-2">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
                    <p className="text-xs text-slate-600">
                      We have sent a 6-digit verification code to <span className="font-semibold text-slate-800">{form.phone}</span>.
                    </p>
                  </div>

                  <div className="space-y-1.5 max-w-xs mx-auto text-center">
                    <Label htmlFor="otpCode" className="text-xs font-semibold text-slate-500">Enter OTP Verification Code</Label>
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

                  <div className="flex flex-col gap-2 max-w-xs mx-auto">
                    <Button type="submit" disabled={loading || otpCode.length !== 6} className="w-full h-11 text-base bg-[#2563EB] hover:bg-indigo-700 text-white font-bold">
                      {loading ? (
                        <span className="flex items-center gap-2 justify-center">
                          <Loader2 className="h-5 w-5 animate-spin" /> Verifying Profile...
                        </span>
                      ) : (
                        "Verify and Submit Profile"
                      )}
                    </Button>

                    <div className="text-center mt-2">
                      {resendCooldown > 0 ? (
                        <p className="text-xs text-slate-400">
                          Resend code in <span className="font-semibold text-slate-600">{resendCooldown}s</span>
                        </p>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={handleSendOtp}
                          disabled={loading}
                          className="text-xs text-primary font-bold hover:underline p-0 h-auto"
                        >
                          Didn't receive code? Resend OTP
                        </Button>
                      )}
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Wizard Footer Navigation Controls */}
        {step > 1 && (
          <div className="pt-6 border-t border-slate-100 flex justify-between items-center mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevStep}
              className="gap-2 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            {/* If we aren't auto-advancing, we provide a Next button.
                Steps 3, 7, 10 don't auto-advance instantly because they have options for custom inputs, selection, etc. */}
            {(step === 3 || step === 7 || step === 10) && (
              <Button
                type="button"
                onClick={handleNextStep}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
