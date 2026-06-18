import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, DollarSign, FileCheck, Briefcase, Award, ChevronRight, HelpCircle } from "lucide-react";
import { Metadata } from "next";
import { LeadCaptureModal } from "@/components/lead/lead-capture-modal";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const country = await prisma.studyAbroadCountry.findUnique({
    where: { slug }
  });

  if (!country) {
    return {
      title: "Study Abroad Destination - College Corridor",
      description: "Overseas admission details on College Corridor"
    };
  }

  return {
    title: `Study in ${country.name} - Costs, Visa Process, Jobs & Scholarships`,
    description: `Complete guide to studying in ${country.name}. Check tuition costs, student visa process, part-time jobs, scholarship programs, and post-study work rules.`
  };
}

export default async function StudyAbroadDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const country = await prisma.studyAbroadCountry.findUnique({
    where: { slug }
  });

  if (!country) {
    notFound();
  }

  const faqs = country.faqs as Array<{ q: string; a: string }> | null;

  // Generate FAQ page schema for SEO
  const faqSchema = faqs && faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  } : null;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://collegecorridor.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Study Abroad",
        "item": "https://collegecorridor.com/study-abroad"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": country.name,
        "item": `https://collegecorridor.com/study-abroad/${country.slug}`
      }
    ]
  };

  return (
    <div className="page-shell space-y-6">
      {/* Schemas injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/study-abroad" className="hover:text-foreground">Study Abroad</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-semibold">{country.name}</span>
      </nav>

      {/* Hero Header */}
      <section className="rounded-lg border bg-gradient-to-br from-primary/5 via-muted/40 to-background p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge>International Hub</Badge>
              <Badge variant="outline" className="capitalize">
                {country.name.toLowerCase()} Guide
              </Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl">Study in the {country.name}</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              A comprehensive handbook covering expenses, student visas, career scope, and scholarships.
            </p>
          </div>
          <div className="flex flex-col gap-3 min-w-[220px]">
            <LeadCaptureModal
              triggerLabel="Book Study Abroad Counselor"
              sourcePage={`/study-abroad/${country.slug}`}
              contentKey={`study-abroad-${country.slug}`}
              initialCategory="STUDY_ABROAD"
              triggerClassName="w-full h-11 text-base bg-primary text-primary-foreground hover:bg-primary/95 flex items-center justify-center gap-2 rounded-md font-semibold"
              hideIcon={true}
            />
            <Button variant="outline" size="lg" asChild className="w-full">
              <Link href="/colleges">Explore Indian Options</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Country quick stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatMiniCard icon={DollarSign} title="Tuition & Living Cost" value={country.averageCost} />
        <StatMiniCard icon={FileCheck} title="Visa Work Restrictions" value="Yes, 20 hrs/week" />
        <StatMiniCard icon={Briefcase} title="Post-Study Opportunities" value="1-3 Year Extension" />
        <StatMiniCard icon={Award} title="Scholarship Availability" value="Partial to Fully Funded" />
      </div>

      {/* Main Details Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Core content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tuition & Cost detail */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                <DollarSign className="h-5 w-5 text-primary" />
                Cost of Education & Living Expenses
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm leading-relaxed text-muted-foreground">
                In {country.name}, the average cost of educational programs (tuition plus standard living parameters) is estimated around <strong>{country.averageCost}</strong>. Costs vary based on university ownership (public vs. private), program level (undergraduate, postgraduate, or research), and the chosen city.
              </p>
            </CardContent>
          </Card>

          {/* Visa Guidelines */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                <FileCheck className="h-5 w-5 text-primary" />
                Student Visa Application Process
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {country.visaProcess}
              </div>
            </CardContent>
          </Card>

          {/* Jobs & Work Scope */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                <Briefcase className="h-5 w-5 text-primary" />
                Employment & Post-Study Work prospects
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {country.jobProspects}
              </div>
            </CardContent>
          </Card>

          {/* Scholarships */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                <Award className="h-5 w-5 text-primary" />
                International Scholarships
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {country.scholarships}
              </div>
            </CardContent>
          </Card>

          {/* FAQs */}
          {faqs && faqs.length > 0 && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="space-y-1.5 border-b pb-4 last:border-0 last:pb-0">
                    <h3 className="font-semibold text-sm text-foreground flex items-start gap-2">
                      <span className="text-primary font-bold">Q:</span>
                      {faq.q}
                    </h3>
                    <p className="text-sm text-muted-foreground pl-5 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Aside assistance card */}
        <div className="space-y-6">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-lg">Overseas Admissions counseling</h3>
              <p className="text-xs text-primary-foreground/80 leading-relaxed">
                Connect with our international study experts. We offer end-to-end support for University shortlisting, Essay reviews, F1/Student Visa interview preparation, and education loan/scholarship applications.
              </p>
              <LeadCaptureModal
                triggerLabel="Get Free Consultation"
                sourcePage={`/study-abroad/${country.slug}`}
                contentKey={`study-abroad-consult-${country.slug}`}
                initialCategory="STUDY_ABROAD"
                triggerClassName="w-full bg-white text-primary hover:bg-white/95 h-10 flex items-center justify-center font-medium rounded-md"
                hideIcon={true}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Admissions Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span>Standardized Tests (GRE/GMAT)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span>English Proficiency (IELTS/TOEFL)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span>Academic transcripts</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span>Statement of Purpose & LORs</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatMiniCard({ icon: Icon, title, value }: { icon: typeof Globe; title: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <span className="flex h-9 w-9 items-center justify-center rounded bg-primary/10 text-primary shrink-0">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground truncate">{title}</p>
          <p className="text-sm font-semibold text-foreground truncate">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
