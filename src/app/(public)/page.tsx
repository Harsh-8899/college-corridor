import Link from "next/link";
import { ArrowRight, BarChart3, FileText, GraduationCap, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CollegeCard } from "@/components/college/college-card";
import { LeadCaptureModal } from "@/components/lead/lead-capture-modal";
import { colleges } from "@/lib/data/colleges";

const features = [
  { title: "College search", icon: GraduationCap, text: "Browse colleges, courses, fees, seats, reviews, and admission details." },
  { title: "Comparison", icon: BarChart3, text: "Compare colleges across fees, placements, rankings, salary, and facilities." },
  { title: "PDF reports", icon: FileText, text: "Generate admission-ready reports after submitting the lead form." },
  { title: "AI recommendations", icon: Sparkles, text: "Unlock profile-based college recommendations and next actions." },
  { title: "Counseling", icon: Users, text: "Book mentorship sessions after lead capture and CRM assignment." }
];

export default function HomePage() {
  return (
    <>
      <section className="border-b bg-muted/35">
        <div className="container grid gap-8 py-12 md:grid-cols-[1.2fr_0.8fr] md:py-16">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-normal text-primary">EduOofa admissions</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-normal md:text-6xl">
              Find the right college and move faster from research to admission.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Students browse freely. Premium insights, reports, AI recommendations, and counseling unlock
              after one lead form, so every high-intent action flows into CRM.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/colleges">
                  Explore colleges
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <LeadCaptureModal
                triggerLabel="Unlock premium"
                sourcePage="/"
                contentKey="homepage-premium"
              />
            </div>
          </div>
          <div className="grid gap-3 self-end">
            {[
              ["4.2K+", "monthly leads"],
              ["850+", "college profiles"],
              ["76%", "counseling follow-up rate"]
            ].map(([value, label]) => (
              <Card key={label}>
                <CardContent className="p-5">
                  <p className="text-3xl font-semibold">{value}</p>
                  <p className="text-sm text-muted-foreground">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell space-y-8">
        <div className="grid gap-4 md:grid-cols-5">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <feature.icon className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Popular colleges</h2>
            <p className="mt-1 text-muted-foreground">A sample catalog ready for PostgreSQL-backed content.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/colleges">View all</Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {colleges.slice(0, 2).map((college) => (
            <CollegeCard key={college.id} college={college} />
          ))}
        </div>
      </section>
    </>
  );
}

