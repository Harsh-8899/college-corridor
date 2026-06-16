import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, BookOpen, FileText, ChevronRight, HelpCircle, GraduationCap } from "lucide-react";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const exam = await prisma.exam.findUnique({
    where: { slug }
  });

  if (!exam) {
    return {
      title: "Exam Details - College Corridor",
      description: "Entrance exam details on College Corridor"
    };
  }

  return {
    title: `${exam.name} Exam - Syllabus, Pattern, Cutoffs & Dates | College Corridor`,
    description: `Complete details for ${exam.name} entrance exam. Check syllabus, paper pattern, important exam and result dates, cutoff criteria, and FAQs.`
  };
}

export default async function ExamDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const exam = await prisma.exam.findUnique({
    where: { slug }
  });

  if (!exam) {
    notFound();
  }

  // Cast JSON-typed objects safely
  const cutoffs = exam.cutoffDetails as Record<string, string> | null;
  const faqs = exam.faqs as Array<{ q: string; a: string }> | null;

  // Generate FAQPage JSON-LD schema if FAQs are defined
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
        "name": "Exams",
        "item": "https://collegecorridor.com/exams"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": exam.name,
        "item": `https://collegecorridor.com/exams/${exam.slug}`
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

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/exams" className="hover:text-foreground">Exams</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-semibold">{exam.name}</span>
      </nav>

      {/* Hero Header */}
      <section className="rounded-lg border bg-gradient-to-br from-primary/5 via-muted/40 to-background p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="capitalize">{exam.category.toLowerCase()}</Badge>
              <Badge variant="outline">National Exam</Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl">{exam.name} Entrance Exam</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Latest syllabus, exam structure, important registration dates, and expected cutoffs.
            </p>
          </div>
          <div className="flex flex-col gap-3 min-w-[200px]">
            <Button size="lg" className="w-full">
              Download Syllabus PDF
            </Button>
            <Button variant="outline" size="lg" asChild className="w-full">
              <Link href="/colleges">
                Explore Accepted Colleges
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column - Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Syllabus Section */}
          <Card id="syllabus">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                <BookOpen className="h-5 w-5 text-primary" />
                Exam Syllabus
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {exam.syllabus ? (
                <div className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {exam.syllabus}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">Syllabus is being updated. Contact administration for details.</p>
              )}
            </CardContent>
          </Card>

          {/* Pattern Section */}
          <Card id="pattern">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                <FileText className="h-5 w-5 text-primary" />
                Exam Pattern
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {exam.pattern ? (
                <div className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {exam.pattern}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">Exam pattern is being finalized by testing authorities.</p>
              )}
            </CardContent>
          </Card>

          {/* FAQs Section */}
          {faqs && faqs.length > 0 && (
            <Card id="faqs">
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

        {/* Right column - Quick metadata cards */}
        <div className="space-y-6">
          {/* Important Dates */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Calendar className="h-5 w-5 text-primary" />
                Important Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <div className="flex justify-between items-center text-sm border-b pb-3">
                <span className="text-muted-foreground">Registration Starts</span>
                <span className="font-semibold">TBA</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b pb-3">
                <span className="text-muted-foreground">Exam Date</span>
                <span className="font-semibold text-primary">
                  {exam.examDate
                    ? new Date(exam.examDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })
                    : "Not scheduled"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm pb-1">
                <span className="text-muted-foreground">Result Announcement</span>
                <span className="font-semibold text-primary">
                  {exam.resultDate
                    ? new Date(exam.resultDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })
                    : "Not declared"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Cutoffs Info */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <GraduationCap className="h-5 w-5 text-primary" />
                Category Cutoffs
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              {cutoffs ? (
                <div className="space-y-3">
                  {Object.entries(cutoffs).map(([category, score]) => (
                    <div key={category} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                      <span className="capitalize text-muted-foreground">{category}</span>
                      <Badge variant="secondary" className="font-semibold">{score}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">Cutoff trends will be populated upon exam completion.</p>
              )}
            </CardContent>
          </Card>

          {/* Call to action */}
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-lg">Need Counseling Assistance?</h3>
              <p className="text-xs text-primary-foreground/80 leading-relaxed">
                Connect with our certified admissions counselors. We help match your entrance exam score to optimal college choices, eligibility guidelines, and seat openings.
              </p>
              <Button asChild className="w-full bg-white text-primary hover:bg-white/95">
                <Link href="/colleges">
                  Find Target Colleges
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
