"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, MessageSquare, HelpCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type PendingQuestion = {
  id: string;
  title: string;
  body: string;
  category: string;
  createdAt: Date;
  user: { name: string | null; email: string };
};

type PendingAnswer = {
  id: string;
  body: string;
  createdAt: Date;
  user: { name: string | null; email: string };
  question: { title: string };
};

type QaModeratorProps = {
  questions: PendingQuestion[];
  answers: PendingAnswer[];
};

export function QaModerator({ questions, answers }: QaModeratorProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAction = async (id: string, type: "question" | "answer", action: "approve" | "reject") => {
    setLoadingId(id);
    try {
      const res = await fetch("/api/v1/admin/qa", {
        method: action === "approve" ? "PUT" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error?.message || "Failed to process request");
      }
    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Pending Questions */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-800">
            <HelpCircle className="h-5 w-5 text-amber-500" />
            Pending Questions ({questions.length})
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Student questions requiring validation before they are visible in `/community`.
          </p>
        </div>

        {questions.map((q) => (
          <Card key={q.id} className="border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  <span className="font-semibold text-slate-700">{q.user.name || "Anonymous student"}</span>
                  <span className="text-[10px]">({q.user.email})</span>
                </div>
                <Badge variant="outline" className="capitalize">
                  {q.category.toLowerCase()}
                </Badge>
              </div>
              <CardTitle className="text-base font-semibold mt-2">{q.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded border">
                {q.body}
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  disabled={loadingId === q.id}
                  onClick={() => handleAction(q.id, "question", "reject")}
                >
                  <X className="h-4 w-4" />
                  Reject & Delete
                </Button>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={loadingId === q.id}
                  onClick={() => handleAction(q.id, "question", "approve")}
                >
                  <Check className="h-4 w-4" />
                  Approve Question
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {questions.length === 0 && (
          <Card className="border-dashed p-8 text-center text-slate-400">
            <HelpCircle className="h-8 w-8 mx-auto text-slate-300 mb-2" />
            No pending questions.
          </Card>
        )}
      </div>

      {/* Pending Answers */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-800">
            <MessageSquare className="h-5 w-5 text-amber-500" />
            Pending Answers ({answers.length})
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Student replies requiring review before going live.
          </p>
        </div>

        {answers.map((a) => (
          <Card key={a.id} className="border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                <span className="font-semibold text-slate-700">{a.user.name || "Anonymous student"}</span>
                <span className="text-[10px]">({a.user.email})</span>
              </div>
              <CardDescription className="text-xs mt-2 text-slate-700">
                Reply to question: <strong className="text-slate-800">&quot;{a.question.title}&quot;</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded border">
                {a.body}
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  disabled={loadingId === a.id}
                  onClick={() => handleAction(a.id, "answer", "reject")}
                >
                  <X className="h-4 w-4" />
                  Reject & Delete
                </Button>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={loadingId === a.id}
                  onClick={() => handleAction(a.id, "answer", "approve")}
                >
                  <Check className="h-4 w-4" />
                  Approve Answer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {answers.length === 0 && (
          <Card className="border-dashed p-8 text-center text-slate-400">
            <MessageSquare className="h-8 w-8 mx-auto text-slate-300 mb-2" />
            No pending answers.
          </Card>
        )}
      </div>
    </div>
  );
}
