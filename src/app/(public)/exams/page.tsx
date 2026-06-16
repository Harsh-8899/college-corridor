import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Calendar, FileText, Search, Award } from "lucide-react";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Entrance Exams Directory - College Corridor",
  description: "Browse national and state-level entrance exams in India. Find syllabus, patterns, cutoffs, dynamic dates, and eligibility info.",
};

type PageProps = {
  searchParams: Promise<{ q?: string; category?: string }>;
};

export default async function ExamsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";
  const selectedCategory = resolvedParams.category || "";

  // Fetch all categories for filter pills
  const allExams = await prisma.exam.findMany({
    select: { category: true },
  });
  const categories = Array.from(new Set(allExams.map((e) => e.category)));

  // Fetch filtered exams
  const exams = await prisma.exam.findMany({
    where: {
      AND: [
        query
          ? {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { pattern: { contains: query, mode: "insensitive" } },
                { syllabus: { contains: query, mode: "insensitive" } },
              ],
            }
          : {},
        selectedCategory ? { category: selectedCategory } : {},
      ],
    },
    orderBy: { examDate: "asc" },
  });

  // Generate ItemList JSON-LD schema for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": exams.map((exam, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://collegecorridor.com/exams/${exam.slug}`,
      "name": exam.name,
      "description": exam.pattern || `${exam.name} Entrance Exam`
    }))
  };

  return (
    <div className="page-shell space-y-8">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div>
        <h1 className="text-4xl font-semibold tracking-normal">Entrance Exams Directory</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Find complete details about key engineering, management, medical, and executive programs entrance exams in India.
        </p>
      </div>

      {/* Search and Category Filters */}
      <form method="GET" action="/exams" className="grid gap-4 rounded-lg border bg-card p-5 md:grid-cols-[1fr_200px_100px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={query}
            placeholder="Search by exam name, pattern, or syllabus..."
            className="pl-9 h-11"
          />
        </div>
        <select
          name="category"
          defaultValue={selectedCategory}
          className="h-11 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <Button type="submit" className="h-11">
          Filter
        </Button>
      </form>

      {/* Filter Category Shortcuts */}
      <div className="flex flex-wrap gap-2">
        <Link href="/exams">
          <Badge variant={!selectedCategory ? "default" : "outline"} className="cursor-pointer px-3 py-1">
            All
          </Badge>
        </Link>
        {categories.map((cat) => (
          <Link key={cat} href={`/exams?category=${encodeURIComponent(cat)}`}>
            <Badge
              variant={selectedCategory === cat ? "default" : "outline"}
              className="cursor-pointer px-3 py-1 capitalize"
            >
              {cat.toLowerCase()}
            </Badge>
          </Link>
        ))}
      </div>

      {/* Exam Cards Grid */}
      {exams.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => {
            const hasPassed = exam.examDate && new Date(exam.examDate) < new Date();
            return (
              <Card key={exam.id} className="flex flex-col justify-between overflow-hidden border-muted-foreground/10 transition-all hover:shadow-md hover:border-primary/20">
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="capitalize">
                      {exam.category.toLowerCase()}
                    </Badge>
                    {exam.examDate && (
                      <Badge variant={hasPassed ? "outline" : "default"} className="text-xs">
                        {hasPassed ? "Concluded" : "Upcoming"}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl font-semibold leading-tight">
                    <Link href={`/exams/${exam.slug}`} className="hover:text-primary transition-colors">
                      {exam.name}
                    </Link>
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-sm">
                    {exam.pattern || "Explore dates, structure, syllabus, and cutoffs."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div className="space-y-2 border-t pt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>
                        Exam Date:{" "}
                        <strong>
                          {exam.examDate
                            ? new Date(exam.examDate).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "TBD"}
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      <span>
                        Results:{" "}
                        <strong>
                          {exam.resultDate
                            ? new Date(exam.resultDate).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "TBD"}
                        </strong>
                      </span>
                    </div>
                  </div>
                  <Button asChild className="w-full mt-2" variant="outline">
                    <Link href={`/exams/${exam.slug}`}>
                      View Full Details
                      <BookOpen className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center border-dashed">
          <CardContent className="space-y-3 pt-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No Exams Found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              We couldn&apos;t find any exams matching your search filters. Try updating your filters or search query.
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/exams">Reset filters</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
