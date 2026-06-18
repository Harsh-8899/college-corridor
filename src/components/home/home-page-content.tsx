"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle,
  HelpCircle,
  Layers,
  Loader2,
  MapPin,
  MessageSquare,
  Sparkles,
  Users,
  Compass,
  X,
  PhoneCall,
  ExternalLink,
  ChevronDown,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type HomePageContentProps = {
  stats: {
    collegesCount: number;
    coursesCount: number;
    leadsCount: number;
    partnersCount: number;
  };
  universitiesList: Array<{ id: string; name: string; slug: string; city: string; state: string; logoUrl?: string | null }>;
  partners: any[];
  testimonials: any[];
  faqs: any[];
  slides: any[];
  universityLogos: any[];
  recruiterLogos: any[];
  accreditationLogos: any[];
  courses: any[];
};

export function HomePageContent({
  stats,
  universitiesList,
  partners,
  testimonials,
  faqs,
  slides,
  universityLogos,
  recruiterLogos,
  accreditationLogos,
  courses
}: HomePageContentProps) {
  // Form State
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    state: "",
    city: "",
    currentQualification: "Class 12",
    tenthPercentage: "",
    twelfthPercentage: "",
    graduationPercentage: "",
    entranceExam: "JEE Main",
    entranceExamScore: "",
    preferredCourse: "B.Tech",
    preferredSpecialization: "Computer Science",
    preferredUniversity: "",
    budgetRange: "2-4 LPA"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const handleCheckChances = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/v1/admissions/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          sourcePage: "/",
          ctaClicked: "Hero Check Chances Form"
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error?.message || "Failed to check admission chances.");
      }

      const data = await res.json();
      setResult(data.evaluation);
      setShowResultModal(true);
    } catch (err: any) {
      setError(err.message || "Failed to connect to eligibility evaluator.");
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 font-sans">
      
      {/* SECTION 1: HERO CONTAINER */}
      <section className="relative overflow-hidden bg-[#0F172A] text-white py-20 lg:py-28 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-900/10 to-slate-950/0 pointer-events-none" />
        <div className="container max-w-7xl mx-auto px-4 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] relative z-10">
          <div className="space-y-6 flex flex-col justify-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-400">
              <Compass className="h-3.5 w-3.5" />
              Admission Intelligence Platform
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-none">
              Will You Get Admission In Your <span className="text-indigo-400">Dream College?</span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-xl">
              Don't guess. Enter your academic profile and target university to evaluate your eligibility, scholarship opportunities, and admission chances instantly.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a href="#checker-section" className="inline-flex h-11 items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-700 px-6 font-semibold text-white transition-colors shadow-lg">
                Check Admission Chances
              </a>
              <a href="#partners-section" className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-700 bg-slate-900/50 hover:bg-slate-900 px-6 font-semibold text-slate-200 transition-colors">
                Explore Partner Universities
              </a>
            </div>

            {/* Trust Badges */}
            <div className="pt-8 border-t border-slate-800 grid grid-cols-3 gap-4 text-center sm:text-left">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white">{stats.collegesCount}+</p>
                <p className="text-xs text-slate-400 mt-0.5">Colleges & Universities</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white">{stats.partnersCount}+</p>
                <p className="text-xs text-slate-400 mt-0.5">Official Direct Partners</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white">100%</p>
                <p className="text-xs text-slate-400 mt-0.5">Verified Placement Data</p>
              </div>
            </div>
          </div>

          {/* Section 1 Slide / Carousel Preview */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-md bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl backdrop-blur-xs">
              <div className="absolute top-3 right-3 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Featured Universities</p>
              
              <div className="mt-4 space-y-4">
                {partners.slice(0, 3).map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 hover:border-indigo-500/20 transition-all">
                    <img src={p.logoUrl || "/logos/amity.png"} className="h-10 w-10 object-contain rounded bg-white p-1" alt="" />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm truncate text-white">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.city}, {p.state}</p>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">Active Partner</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: ADMISSION CHANCE CHECKER SECTION */}
      <section id="checker-section" className="py-20 max-w-7xl mx-auto px-4 scroll-mt-10">
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Check Your Admission chances Instantly
          </h2>
          <p className="text-slate-500 max-w-lg mx-auto text-sm sm:text-base">
            Fill out your academic details below. Our Admissions Intelligence engine will evaluate your profile against cutoff rules in real-time.
          </p>
        </div>

        <Card className="max-w-3xl mx-auto border-slate-200/80 shadow-lg bg-white overflow-hidden">
          <CardHeader className="bg-slate-950 text-white p-6">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
              Academic Evaluation Profile Form
            </CardTitle>
            <p className="text-slate-400 text-xs mt-1">Provide correct information to ensure accurate evaluation.</p>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            {error && (
              <div className="mb-6 rounded-lg bg-rose-50 border border-rose-100 p-4 text-sm font-semibold text-rose-600 flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="h-5 w-5 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleCheckChances} className="space-y-6">
              <div className="grid gap-5 sm:grid-cols-2">
                {/* Academic Profile Details */}
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-slate-700 font-semibold">Student Full Name</Label>
                  <Input id="name" placeholder="e.g. Priyan Sharma" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-slate-700 font-semibold">Mobile Number</Label>
                  <Input id="phone" placeholder="e.g. 9876543210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-slate-700 font-semibold">Email Address</Label>
                  <Input id="email" type="email" placeholder="e.g. priyan@gmail.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="state" className="text-slate-700 font-semibold">State</Label>
                  <Input id="state" placeholder="e.g. Uttar Pradesh" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-slate-700 font-semibold">City</Label>
                  <Input id="city" placeholder="e.g. Noida" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="currentQualification" className="text-slate-700 font-semibold">Current Qualification</Label>
                  <select
                    id="currentQualification"
                    value={form.currentQualification}
                    onChange={(e) => setForm({ ...form, currentQualification: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm text-slate-800"
                  >
                    <option value="Class 12">Class 12 / Higher Secondary</option>
                    <option value="Bachelors Degree">Bachelors Degree / Graduation</option>
                    <option value="Masters Degree">Masters Degree</option>
                    <option value="Diploma">Diploma Holder</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tenthPercentage" className="text-slate-700 font-semibold">Class 10th Marks (%)</Label>
                  <Input id="tenthPercentage" type="number" step="0.01" placeholder="e.g. 82.5" value={form.tenthPercentage} onChange={(e) => setForm({ ...form, tenthPercentage: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="twelfthPercentage" className="text-slate-700 font-semibold">Class 12th Marks (%)</Label>
                  <Input id="twelfthPercentage" type="number" step="0.01" placeholder="e.g. 78.0" value={form.twelfthPercentage} onChange={(e) => setForm({ ...form, twelfthPercentage: e.target.value })} required />
                </div>

                {form.currentQualification === "Bachelors Degree" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="graduationPercentage" className="text-slate-700 font-semibold">Graduation Marks (%)</Label>
                    <Input id="graduationPercentage" type="number" step="0.01" placeholder="e.g. 68.4" value={form.graduationPercentage} onChange={(e) => setForm({ ...form, graduationPercentage: e.target.value })} />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="entranceExam" className="text-slate-700 font-semibold">Entrance Exam Attempted</Label>
                  <select
                    id="entranceExam"
                    value={form.entranceExam}
                    onChange={(e) => setForm({ ...form, entranceExam: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm text-slate-800"
                  >
                    <option value="JEE Main">JEE Main</option>
                    <option value="CAT">CAT (Common Admission Test)</option>
                    <option value="MAT">MAT (Management Aptitude Test)</option>
                    <option value="BITSAT">BITSAT</option>
                    <option value="VITEEE">VITEEE</option>
                    <option value="CUET">CUET</option>
                    <option value="None">None / Board Merits Only</option>
                  </select>
                </div>

                {form.entranceExam !== "None" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="entranceExamScore" className="text-slate-700 font-semibold">Exam Score / Rank</Label>
                    <Input id="entranceExamScore" placeholder="e.g. 85.6 percentile or Rank 1200" value={form.entranceExamScore} onChange={(e) => setForm({ ...form, entranceExamScore: e.target.value })} />
                  </div>
                )}

                {/* Course Interests */}
                <div className="space-y-1.5">
                  <Label htmlFor="preferredCourse" className="text-slate-700 font-semibold">Preferred Course</Label>
                  <select
                    id="preferredCourse"
                    value={form.preferredCourse}
                    onChange={(e) => setForm({ ...form, preferredCourse: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm text-slate-800"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="preferredSpecialization" className="text-slate-700 font-semibold">Preferred Specialization</Label>
                  <Input id="preferredSpecialization" placeholder="e.g. Computer Science, Finance" value={form.preferredSpecialization} onChange={(e) => setForm({ ...form, preferredSpecialization: e.target.value })} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="preferredUniversity" className="text-slate-700 font-semibold">Preferred University</Label>
                  <select
                    id="preferredUniversity"
                    value={form.preferredUniversity}
                    onChange={(e) => setForm({ ...form, preferredUniversity: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm text-slate-800"
                  >
                    <option value="">-- Let System Recommend --</option>
                    {universitiesList.map((uni) => (
                      <option key={uni.id} value={uni.id}>{uni.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="budgetRange" className="text-slate-700 font-semibold">Budget Range (Annual)</Label>
                  <select
                    id="budgetRange"
                    value={form.budgetRange}
                    onChange={(e) => setForm({ ...form, budgetRange: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm text-slate-800"
                  >
                    <option value="Under 1 LPA">Under 1 Lakh / Year</option>
                    <option value="1-2 LPA">1 - 2 Lakhs / Year</option>
                    <option value="2-4 LPA">2 - 4 Lakhs / Year</option>
                    <option value="4-8 LPA">4 - 8 Lakhs / Year</option>
                    <option value="Above 8 LPA">Above 8 Lakhs / Year</option>
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" disabled={loading} className="w-full bg-[#2563EB] hover:bg-indigo-700 text-white font-bold h-12 text-base shadow-md">
                  {loading ? (
                    <span className="flex items-center gap-2 justify-center">
                      <Loader2 className="h-5 w-5 animate-spin" /> Evaluating Admission Chances...
                    </span>
                  ) : (
                    "Check Admission Chances"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* CHANCES RESULT POPUP MODAL */}
      {showResultModal && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-slate-200/80 shadow-2xl bg-white rounded-xl">
            <div className="border-b p-5 flex justify-between items-center bg-slate-950 text-white">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                Your Admission Evaluation Result
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setShowResultModal(false)} className="rounded-full text-slate-300 hover:text-white">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="text-center p-6 border rounded-xl bg-slate-50 space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Admission Probability</p>
                <div className="inline-block">
                  <Badge className={`text-base font-extrabold uppercase px-4 py-1.5 shadow ${
                    result.status === "HIGH_CHANCE" ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border border-emerald-300" :
                    result.status === "MODERATE_CHANCE" ? "bg-amber-100 text-amber-800 hover:bg-amber-100 border border-amber-300" :
                    result.status === "LOW_CHANCE" ? "bg-rose-100 text-rose-800 hover:bg-rose-100 border border-rose-300" :
                    "bg-slate-100 text-slate-800 hover:bg-slate-100 border border-slate-300"
                  }`}>
                    {result.status.replace("_", " ")}
                  </Badge>
                </div>
                
                <p className="font-semibold text-slate-800 text-base leading-relaxed mt-2">{result.message}</p>
                
                {result.reasons && result.reasons.length > 0 && (
                  <div className="text-left text-xs bg-rose-50 text-rose-700 p-3 rounded-lg border border-rose-100/50 mt-3 space-y-1">
                    <p className="font-bold">Evaluation Criteria Checklist:</p>
                    <ul className="list-disc list-inside space-y-0.5 font-medium">
                      {result.reasons.map((r: string, idx: number) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {result.status !== "LOW_CHANCE" ? (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-5 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    Congratulations. Based on your profile, you appear eligible for admission.
                  </div>
                  {result.eligibilityRules && (
                    <p className="text-xs text-slate-600 leading-relaxed">
                      <strong>Requirement Details:</strong> {result.eligibilityRules}
                    </p>
                  )}
                  {result.scholarshipRules && (
                    <p className="text-xs text-emerald-700 leading-relaxed font-semibold">
                      <strong>Scholarships Alert:</strong> {result.scholarshipRules}
                    </p>
                  )}
                  <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                    <Button onClick={() => setShowResultModal(false)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                      Apply Now
                    </Button>
                    <Button variant="outline" onClick={() => setShowResultModal(false)} className="flex-1 border-slate-300 font-bold">
                      Talk To Expert
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-5 space-y-3">
                    <p className="font-bold text-slate-800 text-sm">Alternative Recommendations suggested by AI:</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {result.alternatives && result.alternatives.map((alt: any) => (
                        <div key={alt.id} className="p-3 bg-white border border-slate-100 rounded-lg flex items-center gap-3">
                          <img src={alt.logoUrl || "/logos/amity.png"} className="h-8 w-8 object-contain rounded border bg-slate-50 p-0.5" alt="" />
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-xs truncate text-slate-900">{alt.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{alt.city}, {alt.state}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <Button onClick={() => setShowResultModal(false)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                      Get Alternative Colleges
                    </Button>
                    <Button variant="outline" onClick={() => setShowResultModal(false)} className="flex-1 border-slate-300 font-bold">
                      Talk To Expert
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* SECTION 3: POPULAR CATEGORIES */}
      <section className="bg-white border-y py-16 border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">Popular Course Verticals</h2>
            <p className="text-slate-500 text-sm max-w-lg mx-auto">
              Browse top undergraduate, postgraduate, and distance learning courses offering strong career scopes.
            </p>
          </div>

          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 lg:grid-cols-8">
            {[
              { name: "B.Tech", slug: "btech" },
              { name: "MBA", slug: "mba" },
              { name: "Online MBA", slug: "online-mba" },
              { name: "Distance MBA", slug: "distance-mba" },
              { name: "BBA", slug: "bba" },
              { name: "BCA", slug: "bca" },
              { name: "MCA", slug: "mca" },
              { name: "PGDM", slug: "pgdm" }
            ].map((cat) => (
              <Link
                key={cat.slug}
                href={`/courses/${cat.slug}`}
                className="p-5 text-center bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 rounded-xl transition-all hover:-translate-y-0.5 shadow-xs"
              >
                <BookOpen className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
                <p className="font-bold text-xs text-slate-900 tracking-tight truncate">{cat.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: PARTNER UNIVERSITIES */}
      <section id="partners-section" className="py-20 max-w-7xl mx-auto px-4 space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">Our Partner Universities</h2>
          <p className="text-slate-500 text-sm max-w-lg mx-auto">
            Apply securely to verified partner institutions with 100% admission consulting support.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((p) => (
            <Card key={p.id} className="border-slate-200 hover:border-indigo-600/30 transition-all hover:shadow-md bg-white flex flex-col justify-between">
              <CardHeader className="flex flex-row items-center gap-4 border-b pb-4">
                <img src={p.logoUrl || "/logos/amity.png"} className="h-12 w-12 object-contain bg-white rounded border p-1" alt="" />
                <div className="min-w-0">
                  <CardTitle className="text-base font-bold text-slate-900 truncate leading-snug">{p.name}</CardTitle>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" />
                    {p.city}, {p.state}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-400">Featured Streams</p>
                  <p className="text-xs text-slate-700 font-medium truncate">
                    B.Tech, MBA, MCA, BBA, BCA, Accredited certifications
                  </p>
                </div>
                <div className="flex gap-2">
                  <a href={`/colleges?search=${encodeURIComponent(p.name)}`} className="flex-1 inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 transition-colors">
                    Explore Profile
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, preferredUniversity: p.id }));
                      document.getElementById("checker-section")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="flex-1 inline-flex h-9 items-center justify-center rounded-lg bg-[#2563EB] hover:bg-indigo-700 text-xs font-bold text-white transition-colors shadow-sm"
                  >
                    Apply Now
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* SECTION 5: HOW IT WORKS */}
      <section className="bg-slate-950 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight">How College Corridor Works</h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Follow four simple steps to evaluate your profile and secure admission.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: "01", title: "Choose University", desc: "Select from our directory of 200+ top Indian and global universities." },
              { step: "02", title: "Check Admission Chances", desc: "Submit your academic marks to evaluate cutoffs in real-time." },
              { step: "03", title: "Apply Through Portal", desc: "Securely apply through our integrated one-click lead capture modal." },
              { step: "04", title: "Receive Expert Support", desc: "Get assigned to a counselor who will guide you until final enrollment." }
            ].map((s) => (
              <div key={s.step} className="p-5 border border-slate-800 bg-slate-900/40 rounded-xl space-y-3 relative hover:border-indigo-500/20 transition-all">
                <p className="text-4xl font-black text-indigo-500/20 absolute top-4 right-4">{s.step}</p>
                <h3 className="font-bold text-lg text-white pt-2">{s.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: WHY COLLEGE CORRIDOR */}
      <section className="py-20 max-w-7xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">Why Students Trust College Corridor</h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Our platform provides unbiased, verified evaluation to protect your career decisions.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Admission Intelligence", desc: "Automated real-time algorithm comparing scores against verified cutoffs." },
            { title: "Expert Counselors", desc: "Get matched with professional advisors representing your learning style." },
            { title: "Direct Admission Support", desc: "Fast-tracked application process with accredited partner institutions." },
            { title: "Partner Universities", desc: "Official direct tie-ups with UGC-approved universities across India." },
            { title: "Alternative Recommendations", desc: "Algorithmic alternative recommendations if cutoffs are not met." },
            { title: "End-to-End Guidance", desc: "We support you from documentation checks through fee payment verification." }
          ].map((w, idx) => (
            <div key={idx} className="p-5 bg-white border border-slate-200/80 rounded-xl space-y-2.5 shadow-xs hover:shadow-md hover:border-indigo-500/20 transition-all">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <CheckCircle className="h-5 w-5" />
              </span>
              <h3 className="font-bold text-base text-slate-900">{w.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 7: TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="bg-white border-y py-16 border-slate-200/50">
          <div className="max-w-7xl mx-auto px-4 space-y-10">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">Student Success Stories</h2>
              <p className="text-slate-500 text-sm max-w-md mx-auto">
                Read how students evaluated their chances and found their dream programs.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {testimonials.map((t) => (
                <Card key={t.id} className="border-slate-200 shadow-xs bg-slate-50/50">
                  <CardContent className="p-6 space-y-4">
                    <p className="text-xs text-slate-600 italic leading-relaxed">"{t.text}"</p>
                    <div className="flex items-center gap-3 border-t pt-4">
                      <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs uppercase border">
                        {t.studentName[0]}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-900">{t.studentName}</p>
                        <p className="text-[10px] text-slate-400">{t.role || "Verified Student"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 8: FAQ */}
      {faqs.length > 0 && (
        <section className="py-20 max-w-4xl mx-auto px-4 space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Find answers to standard enrollment and eligibility assessment inquiries.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={faq.id} className="border border-slate-200/80 rounded-xl bg-white overflow-hidden shadow-xs">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between font-bold text-slate-800 hover:text-slate-950 gap-4"
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`h-4.5 w-4.5 text-slate-400 transition-transform shrink-0 ${openFaqIndex === idx ? "rotate-185 text-indigo-600" : ""}`} />
                </button>
                {openFaqIndex === idx && (
                  <div className="px-5 pb-5 pt-0 text-slate-600 text-sm leading-relaxed border-t border-slate-50">
                    <p className="pt-4">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Structured FAQ Schema */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": faqs.map((faq) => ({
                  "@type": "Question",
                  "name": faq.question,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer
                  }
                }))
              })
            }}
          />
        </section>
      )}
    </div>
  );
}
