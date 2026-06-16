/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  BarChart3, 
  Bed, 
  BookOpen, 
  CalendarCheck, 
  IndianRupee, 
  Trophy, 
  MapPin, 
  Star, 
  ShieldCheck,
  Building,
  Layers,
  Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PremiumGate } from "@/components/lead/premium-gate";
import { LeadCaptureModal } from "@/components/lead/lead-capture-modal";
import { getCollege } from "@/lib/data/colleges";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const college = await getCollege(slug);
  if (!college) {
    return {};
  }
  
  const titleText = college.metaTitle && college.metaTitle !== "N/A" 
    ? college.metaTitle 
    : `${college.name} - Admission, Fees, Placements & Course Details | College Corridor`;

  const descText = college.metaDescription && college.metaDescription !== "N/A"
    ? college.metaDescription
    : `Discover and compare ${college.name} in ${college.city}, ${college.state}. Find detailed tuition fees range ${college.fees}, average salary ${college.averageSalary}, placement statistics, eligibility criteria, and hostel facilities.`;

  return {
    title: titleText,
    description: descText,
    alternates: {
      canonical: `https://www.collegecorridor.com/colleges/${college.slug}`
    },
    openGraph: {
      title: titleText,
      description: descText,
      type: "website"
    }
  };
}

export default async function CollegeDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const college = await getCollege(slug);

  if (!college) {
    notFound();
  }

  // Schema Org
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": college.name,
    "description": college.description,
    "url": college.website !== "N/A" ? college.website : `https://www.collegecorridor.com/colleges/${college.slug}`,
    "logo": college.logoUrl !== "N/A" ? college.logoUrl : undefined,
    "image": college.imageUrl !== "N/A" ? college.imageUrl : undefined,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": college.address !== "N/A" ? college.address : undefined,
      "postalCode": college.pincode !== "N/A" ? college.pincode : undefined,
      "addressLocality": college.city,
      "addressRegion": college.state,
      "addressCountry": "IN"
    }
  };

  // Schema FAQs
  const schemaFaqs = (college.faqJson && Array.isArray(college.faqJson) && college.faqJson.length > 0)
    ? college.faqJson.map((f: any) => ({
        "@type": "Question",
        "name": f.q || "",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": f.a || ""
        }
      }))
    : [
      {
        "@type": "Question",
        "name": `What is the fee structure for courses at ${college.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `The fees range for listed programs is approximately ${college.fees}.`
        }
      },
      {
        "@type": "Question",
        "name": `How are the placement records at ${college.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${college.name} reports a placement rate of ${college.placementRate} with an average package of ${college.averageSalary} and highest salary of ${college.highestSalary}.`
        }
      }
    ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": schemaFaqs
  };

  return (
    <div className="page-shell space-y-8 max-w-7xl mx-auto px-4 py-8">
      {/* Dynamic SEO JSON-LD scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Modern Glassmorphic Hero Banner Header */}
      <section className="relative rounded-2xl overflow-hidden border border-muted-foreground/15 bg-card/60 backdrop-blur-md p-6 md:p-8 shadow-sm">
        <div className="absolute top-0 right-0 h-48 w-48 bg-primary/5 rounded-full blur-3xl -z-10"></div>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                {college.ownership}
              </Badge>
              {college.modes.map((mode) => (
                <Badge key={mode} variant="secondary">
                  {mode}
                </Badge>
              ))}
              {college.aisheCode && college.aisheCode !== "N/A" && (
                <Badge variant="outline" className="text-muted-foreground">
                  AISHE: {college.aisheCode}
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl text-card-foreground">
              {college.name}
            </h1>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-muted-foreground text-sm">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-indigo-500" />
                {college.city}, {college.state}
              </span>
              <span className="flex items-center gap-1">
                <Trophy className="h-4 w-4 text-amber-500" />
                NIRF Ranking: #{college.ranking || "N/A"}
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                {college.rating || "N/A"}/5 Overall Rating
              </span>
              {college.establishedYear && (
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Estd: {college.establishedYear}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <LeadCaptureModal
              triggerLabel="Apply Now"
              sourcePage={`/colleges/${college.slug}`}
              contentKey="apply-now"
              selectedCollegeIds={[college.id]}
            />
            <LeadCaptureModal
              triggerLabel="Download Brochure"
              sourcePage={`/colleges/${college.slug}`}
              contentKey="download-brochure"
              selectedCollegeIds={[college.id]}
            />
          </div>
        </div>
      </section>

      {/* Summary KPI Badges Grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <InfoCard icon={IndianRupee} title="Tuition Fees" value={college.fees} />
        <InfoCard icon={BarChart3} title="Placement Rate" value={college.placementRate} />
        <InfoCard icon={Trophy} title="Highest Salary" value={college.highestSalary} />
        <InfoCard icon={BookOpen} title="Total Seats Capacity" value={`${college.seats} Seats`} />
      </div>

      {/* Main content grid */}
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Left column details */}
        <div className="space-y-8">
          {/* About Section */}
          <Card className="border-muted-foreground/10">
            <CardHeader>
              <CardTitle>About the Institution</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                {college.description}
              </p>
            </CardContent>
          </Card>

          {/* Courses Offered */}
          <Card className="border-muted-foreground/10">
            <CardHeader>
              <CardTitle>Programs & Specializations</CardTitle>
              <CardDescription>Browse courses and eligibility requirements below.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {college.courses && college.courses.length > 0 ? (
                college.courses.map((course) => (
                  <div key={course} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-4 bg-muted/10 gap-3">
                    <span className="font-semibold text-sm">{course}</span>
                    <Badge variant="outline" className="w-fit">
                      {college.modes.join(" / ")}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm italic text-muted-foreground">No courses listed currently.</p>
              )}
            </CardContent>
          </Card>

          {/* Admission & cutoffs */}
          <Card className="border-muted-foreground/10">
            <CardHeader>
              <CardTitle>Admission, Eligibility & Cutoff Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground flex items-center gap-1.5">
                    <Building className="h-4 w-4 text-indigo-500" />
                    Admission Process
                  </h4>
                  <p>{college.admission}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-indigo-500" />
                    Eligibility Criteria
                  </h4>
                  <p>{college.eligibility}</p>
                </div>
              </div>

              {college.selectionCriteria && college.selectionCriteria !== "N/A" && (
                <div className="border-t pt-4 space-y-2">
                  <h4 className="font-semibold text-foreground">Selection Criteria</h4>
                  <p>{college.selectionCriteria}</p>
                </div>
              )}

              {college.entranceExams && college.entranceExams !== "N/A" && (
                <div className="border-t pt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <span className="font-semibold text-foreground">Exams Accepted: </span>
                    <span className="font-medium text-primary">{college.entranceExams}</span>
                  </div>
                  {college.cutoffInfo && college.cutoffInfo !== "N/A" && (
                    <div>
                      <span className="font-semibold text-foreground">Cutoff Index: </span>
                      <span>{college.cutoffInfo}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Placement insights (Lead gated) */}
          <PremiumGate
            title="Placement insights are lead-gated"
            description="Submit the lead form to unlock average package details, recruiter profiles, and hiring trends."
            sourcePage={`/colleges/${college.slug}`}
            contentKey="placement-insights"
            selectedCollegeIds={[college.id]}
          >
            <Card className="border-muted-foreground/10">
              <CardHeader>
                <CardTitle>Placements Stats & Recruiters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-3 sm:grid-cols-3">
                  <InfoBlock label="Average salary package" value={college.averageSalary} />
                  <InfoBlock label="Highest salary package" value={college.highestSalary} />
                  <InfoBlock label="Placement rate" value={college.placementRate} />
                </div>

                {college.topRecruiters && college.topRecruiters !== "N/A" && (
                  <div className="border-t pt-4 space-y-2">
                    <h4 className="font-semibold text-foreground text-sm">Top Hiring Companies</h4>
                    <div className="flex flex-wrap gap-2">
                      {college.topRecruiters.split(";").map((rec, i) => (
                        <Badge key={i} variant="secondary" className="px-3 py-1 font-normal text-xs">
                          {rec.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </PremiumGate>

          {/* Frequently Asked Questions */}
          <Card className="border-muted-foreground/10">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {schemaFaqs.map((faq: any, idx: number) => (
                <div key={idx} className="border-b pb-4 last:border-0 last:pb-0 space-y-2">
                  <h4 className="font-bold text-sm text-foreground flex items-start gap-2">
                    <span className="text-primary font-extrabold">Q.</span>
                    {faq.name}
                  </h4>
                  <p className="text-sm text-muted-foreground pl-6 leading-relaxed">
                    {faq.acceptedAnswer.text}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right column sidebar */}
        <aside className="space-y-6">
          
          {/* Fact Sheet (Highlights) */}
          {college.highlightsJson && Array.isArray(college.highlightsJson) && college.highlightsJson.length > 0 && (
            <Card className="border-muted-foreground/10">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                  Fact Sheet Highlights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {college.highlightsJson.map((h: any, idx: number) => (
                  <div key={idx} className="flex justify-between border-b pb-2 last:border-0 last:pb-0 text-sm">
                    <span className="text-muted-foreground">{h.title}</span>
                    <span className="font-semibold text-foreground">{h.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Important Dates */}
          {college.importantDatesJson && Array.isArray(college.importantDatesJson) && college.importantDatesJson.length > 0 && (
            <Card className="border-muted-foreground/10">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-1.5">
                  <CalendarCheck className="h-4 w-4 text-indigo-500" />
                  Important Admission Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {college.importantDatesJson.map((d: any, idx: number) => (
                  <div key={idx} className="flex justify-between border-b pb-2 last:border-0 last:pb-0 text-sm">
                    <span className="text-muted-foreground">{d.event}</span>
                    <span className="font-semibold text-primary">{d.date}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Facilities */}
          <Card className="border-muted-foreground/10">
            <CardHeader>
              <CardTitle className="text-base">Campus Facilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p className="flex gap-2.5 items-start">
                <Bed className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span><strong className="text-foreground">Hostel:</strong> {college.hostel}</span>
              </p>
              <p className="flex gap-2.5 items-start">
                <BookOpen className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span><strong className="text-foreground">Capacity:</strong> {college.seats} seats across listed degrees</span>
              </p>
            </CardContent>
          </Card>

          {/* Scholarship gate */}
          <PremiumGate
            title="Scholarship policies"
            description="Scholarship application steps unlock after lead capture and details will be sent to the counselor desks."
            sourcePage={`/colleges/${college.slug}`}
            contentKey="scholarship-details"
            selectedCollegeIds={[college.id]}
          >
            <Card className="border-muted-foreground/10">
              <CardHeader>
                <CardTitle className="text-base">Scholarships Available</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{college.scholarships}</p>
              </CardContent>
            </Card>
          </PremiumGate>

          {/* Free Counselling Call gate */}
          <PremiumGate
            title="Free Counselling Session"
            description="Submit the lead details to book a 1-on-1 counseling call with specialized mentors."
            sourcePage={`/colleges/${college.slug}`}
            contentKey="counseling-booking"
            selectedCollegeIds={[college.id]}
          >
            <Card className="border-muted-foreground/10 bg-indigo-50/10">
              <CardHeader>
                <CardTitle className="text-base">Mentorship Counseling</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Get guided support on admission cuts, placement trends, and loans from specialized counselors.
                </p>
                <Link href="/internal/settings" className="block w-full">
                  <Button className="w-full gap-2">
                    <CalendarCheck className="h-4 w-4" />
                    Book Free Counseling Session
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </PremiumGate>
        </aside>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, value }: { icon: any; title: string; value: string }) {
  return (
    <Card className="border-muted-foreground/10 bg-card shadow-xs">
      <CardContent className="flex items-center gap-4 p-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{title}</p>
          <p className="font-bold text-lg text-card-foreground truncate">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4 bg-card">
      <p className="text-xs text-muted-foreground font-semibold uppercase">{label}</p>
      <p className="mt-1 font-bold text-base text-foreground">{value}</p>
    </div>
  );
}
