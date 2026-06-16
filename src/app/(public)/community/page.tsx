import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, User, HelpCircle, ArrowRight } from "lucide-react";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Q&A Community Forum - College Corridor",
  description: "Ask questions and get answers from alumni, counselors, and university partners about college admissions, placements, and campus life.",
};

type PageProps = {
  searchParams: Promise<{ category?: string }>;
};

const CATEGORIES = ["Admissions", "Placements", "Fees", "Campus Life", "Scholarships", "Exams"];

export default async function CommunityPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const selectedCategory = resolvedParams.category || "";
  const session = await getServerSession(authOptions);

  // Fetch approved questions and their approved answers
  const questions = await prisma.question.findMany({
    where: {
      isApproved: true,
      ...(selectedCategory ? { category: selectedCategory } : {}),
    },
    include: {
      user: {
        select: {
          name: true,
          role: {
            select: { name: true }
          }
        }
      },
      answers: {
        where: { isApproved: true },
        include: {
          user: {
            select: {
              name: true,
              role: {
                select: { name: true }
              }
            }
          }
        },
        orderBy: { createdAt: "asc" }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="page-shell space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Q&A Community</h1>
          <p className="mt-2 text-muted-foreground text-lg max-w-2xl">
            Get answers directly from admissions experts, university partners, and verified alumni.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Left column: Questions list */}
        <div className="space-y-6">
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 pb-2">
            <Link href="/community">
              <Badge variant={!selectedCategory ? "default" : "outline"} className="cursor-pointer px-3 py-1">
                All Discussions
              </Badge>
            </Link>
            {CATEGORIES.map((cat) => (
              <Link key={cat} href={`/community?category=${encodeURIComponent(cat)}`}>
                <Badge
                  variant={selectedCategory === cat ? "default" : "outline"}
                  className="cursor-pointer px-3 py-1"
                >
                  {cat}
                </Badge>
              </Link>
            ))}
          </div>

          {/* Questions Grid */}
          <div className="space-y-4">
            {questions.map((q) => (
              <Card key={q.id} className="border-muted-foreground/10">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3.5 w-3.5" />
                      <span className="font-semibold text-foreground">{q.user.name || "Anonymous student"}</span>
                      <span>·</span>
                      <span className="capitalize">{(q.user.role?.name || "STUDENT").toLowerCase().replace("_", " ")}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {q.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-semibold mt-2 leading-snug">
                    {q.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground whitespace-pre-line mt-2">
                    {q.body}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4 border-t pt-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                    <MessageSquare className="h-4 w-4" />
                    <span>{q.answers.length} Answers</span>
                  </div>

                  {q.answers.length > 0 && (
                    <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                      {q.answers.map((ans) => (
                        <div key={ans.id} className="text-sm space-y-1 bg-muted/20 p-3 rounded-md">
                          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">{ans.user.name}</span>
                            <Badge variant="outline" className="text-[10px] capitalize bg-white">
                              {(ans.user.role?.name || "STUDENT").toLowerCase().replace("_", " ")}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground leading-relaxed">
                            {ans.body}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick Answer Form */}
                  {session ? (
                    <form action="/api/v1/qa/answer" method="POST" className="flex gap-2 items-center mt-2">
                      <input type="hidden" name="questionId" value={q.id} />
                      <Input
                        name="body"
                        placeholder="Write a reply..."
                        required
                        className="h-9 text-sm"
                      />
                      <Button type="submit" size="sm" variant="secondary">
                        Reply
                      </Button>
                    </form>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      <Link href="/login" className="text-primary font-semibold hover:underline">Log in</Link> to post a reply.
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}

            {questions.length === 0 && (
              <Card className="p-12 text-center border-dashed">
                <CardContent className="space-y-3 pt-6">
                  <HelpCircle className="h-10 w-10 mx-auto text-muted-foreground" />
                  <h3 className="text-lg font-medium">No Questions Yet</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedCategory
                      ? `Be the first to ask a question under the ${selectedCategory} category.`
                      : "Be the first to ask a question in the community forum."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Right column: Ask Question Form */}
        <aside className="space-y-6">
          <Card className="sticky top-20 border-primary/20 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                Ask the Community
              </CardTitle>
              <CardDescription>
                Got queries about fees, campus, or placements? Ask our counselors and partners.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {session ? (
                <form action="/api/v1/qa/question" method="POST" className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Topic Category</label>
                    <select
                      name="category"
                      required
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Title</label>
                    <Input
                      name="title"
                      placeholder="e.g. Greenwood CSE highest placement package?"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Details</label>
                    <Textarea
                      name="body"
                      placeholder="Explain your question in detail to get better responses."
                      rows={4}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full mt-2">
                    Submit Question
                  </Button>
                  <p className="text-[10px] text-muted-foreground text-center">
                    Questions are moderated and appear publicly once approved by administrators.
                  </p>
                </form>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    You must be logged in to participate in the community discussions.
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/login">
                      Login to Ask Questions
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
