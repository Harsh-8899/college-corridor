import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Award, BookOpen, GraduationCap, MapPin, Search, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

// Renders dynamic metadata for course slugs
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const course = await prisma.course.findUnique({
    where: { slug: params.slug }
  });

  if (!course) {
    return {
      title: "Course Catalog - College Corridor"
    };
  }

  return {
    title: `${course.name} Admissions, Fees, Cutoffs & Scope - College Corridor`,
    description: `Learn about ${course.name} average salary, eligibility rules, career outcomes, and compare leading partner universities offering it.`,
    keywords: [course.name.toLowerCase(), `${course.name.toLowerCase()} admissions`, `${course.name.toLowerCase()} cutoffs`]
  };
}

export default async function CourseDetailPage(props: Props) {
  const params = await props.params;
  const course = await prisma.course.findUnique({
    where: { slug: params.slug },
    include: { specializations: true }
  });

  if (!course) {
    return notFound();
  }

  // Fetch all universities offering this course
  const offeringColleges = await prisma.institutionCourse.findMany({
    where: {
      OR: [
        { courseId: course.id },
        { courseName: { mode: "insensitive", equals: course.name } }
      ],
      institution: { published: true }
    },
    include: {
      institution: {
        include: {
          placements: true,
          reviewSummaries: true
        }
      }
    }
  });

  return (
    <div className="bg-slate-50 min-h-screen py-12 text-slate-900">
      
      {/* Structured Course Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            "name": course.name,
            "description": course.description || `Admissions details for ${course.name}`,
            "provider": {
              "@type": "Organization",
              "name": "College Corridor",
              "sameAs": "https://www.collegecorridor.com"
            }
          })
        }}
      />

      <div className="max-w-7xl mx-auto px-4 space-y-10">
        
        {/* Course Overview Banner */}
        <div className="bg-[#0F172A] text-white p-8 sm:p-12 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-64 w-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-3xl space-y-4 relative z-10">
            <span className="inline-flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-indigo-400">
              <BookOpen className="h-3.5 w-3.5" />
              {course.category}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">{course.name}</h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {course.description || `Find detailed eligibility cutoffs, scholarship rules, placement statistics, and explore top universities offering the ${course.name} degree program.`}
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-slate-300 text-xs">
              <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800">
                <p className="text-slate-500 font-bold uppercase">Duration</p>
                <p className="font-bold text-white text-sm mt-0.5">{course.duration || "N/A"}</p>
              </div>
              <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800">
                <p className="text-slate-500 font-bold uppercase">Program Level</p>
                <p className="font-bold text-white text-sm mt-0.5">{course.level}</p>
              </div>
              <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800">
                <p className="text-slate-500 font-bold uppercase">Avg Salary</p>
                <p className="font-bold text-white text-sm mt-0.5">{course.averageSalary || "N/A"}</p>
              </div>
              <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800">
                <p className="text-slate-500 font-bold uppercase">Specializations</p>
                <p className="font-bold text-white text-sm mt-0.5 truncate">{course.specializations.length || "General"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Specializations and career outcomes */}
        <div className="grid gap-6 md:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            <Card className="border-slate-200/80 shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-900">Eligibility Criteria & Scope</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-600 leading-relaxed">
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Standard Cutoff Eligibility:</h4>
                  <p>{course.eligibility || "Standard qualification check requires minimum 50% in preceding qualification."}</p>
                </div>
                {course.careerOutcomes && (
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Career Opportunities:</h4>
                    <p>{course.careerOutcomes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* List of universities offering this course */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="h-5.5 w-5.5 text-indigo-600" />
                Universities Offering {course.name}
              </h2>

              {offeringColleges.length === 0 ? (
                <Card className="border border-dashed py-12 text-center">
                  <CardContent className="text-slate-400 text-sm">
                    No active universities found offering this course currently. Check back soon.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {offeringColleges.map((ic) => (
                    <Card key={ic.id} className="border-slate-200 hover:border-indigo-600/20 transition-all shadow-xs bg-white">
                      <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                        <div className="flex items-start gap-4">
                          <img src={ic.institution.logoUrl || "/logos/amity.png"} className="h-12 w-12 object-contain rounded border p-1 bg-white" alt="" />
                          <div>
                            <h3 className="font-bold text-base text-slate-900">{ic.institution.name}</h3>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3.5 w-3.5" />
                              {ic.institution.city}, {ic.institution.state}
                            </p>
                            <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-600">
                              <p>
                                <strong>Fees:</strong> {ic.totalFees || "N/A"}
                              </p>
                              <p>
                                <strong>Mode:</strong> {ic.mode || "Offline"}
                              </p>
                              {ic.institution.placements?.[0] && (
                                <p className="text-emerald-700 font-semibold">
                                  <strong>Avg Package:</strong> {ic.institution.placements[0].averagePackage || "N/A"}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                          <Link href="/check-admission-chances" className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 px-4 transition-colors">
                            Check Admission Chances
                          </Link>
                          <Link href="/check-admission-chances" className="inline-flex h-9 items-center justify-center rounded-lg bg-[#2563EB] hover:bg-indigo-700 text-xs font-bold text-white px-4 transition-colors shadow-sm">
                            Apply Now
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            {/* Specializations list */}
            {course.specializations.length > 0 && (
              <Card className="border-slate-200/80 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Popular Specializations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {course.specializations.map((spec) => (
                    <div key={spec.id} className="flex items-center gap-2 p-2 bg-slate-50 border rounded-lg text-xs font-semibold text-slate-700">
                      <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full" />
                      {spec.name}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
