"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle,
  Compass,
  MapPin,
  Sparkles,
  X,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdmissionMatchingWizard } from "./admission-matching-wizard";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  courses
}: HomePageContentProps) {
  const [result, setResult] = useState<any>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [preSelectedUniversityId, setPreSelectedUniversityId] = useState<string>("");

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);


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

        <div className="max-w-3xl mx-auto">
          <AdmissionMatchingWizard
            courses={courses}
            universitiesList={universitiesList}
            initialUniversityId={preSelectedUniversityId}
            onSubmitSuccess={(evaluationResult) => {
              setResult(evaluationResult);
              setShowResultModal(true);
            }}
          />
        </div>

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
                      setPreSelectedUniversityId(p.id);
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
