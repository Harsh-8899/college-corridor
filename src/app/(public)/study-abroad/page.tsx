import Link from "next/link";
import { prisma } from "@/lib/db/prisma";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, DollarSign, FileCheck, Briefcase, ChevronRight } from "lucide-react";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Study Abroad Guide - Overseas Admissions | College Corridor",
  description: "Explore overseas education opportunities. Compare costs, visa procedures, scholarships, and post-study work options for top study destinations.",
};

export default async function StudyAbroadPage() {
  const countries = await prisma.studyAbroadCountry.findMany({
    orderBy: { name: "asc" }
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": countries.map((country, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://collegecorridor.com/study-abroad/${country.slug}`,
      "name": country.name,
      "description": `Study in ${country.name} - Tuition fees, visa process, and job opportunities.`
    }))
  };

  return (
    <div className="page-shell space-y-8">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-normal text-primary">Global Education Guide</p>
        <h1 className="text-4xl font-bold tracking-tight md:text-6xl">Study Abroad Destinations</h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Get complete and transparent insights into tuition fees, living expenses, student visa guidelines, part-time work limits, and career avenues in top international hubs.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {countries.map((country) => (
          <Card key={country.id} className="flex flex-col justify-between border-muted-foreground/10 hover:shadow-md transition-all hover:border-primary/20">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Globe className="h-5 w-5" />
                </span>
                <div>
                  <CardTitle className="text-xl font-semibold">{country.name}</CardTitle>
                  <CardDescription>Overseas Admission Portal</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="space-y-3 text-sm text-muted-foreground border-t pt-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary shrink-0" />
                  <span>Cost: <strong>{country.averageCost}</strong></span>
                </div>
                <div className="flex items-start gap-2">
                  <FileCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span className="line-clamp-2">Visa: {country.visaProcess}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Briefcase className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span className="line-clamp-2">Jobs: {country.jobProspects}</span>
                </div>
              </div>
              <Button asChild className="w-full mt-2">
                <Link href={`/study-abroad/${country.slug}`}>
                  Explore {country.name}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}

        {countries.length === 0 && (
          <Card className="col-span-full p-12 text-center border-dashed">
            <CardContent className="space-y-3 pt-6">
              <Globe className="h-10 w-10 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-medium">No Destinations Mapped</h3>
              <p className="text-sm text-muted-foreground">
                We are currently indexing overseas countries. Check back soon for detailed study abroad metrics.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
