import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import { QaModerator } from "@/components/dashboard/qa-moderator";
import { AdminHeader } from "@/components/dashboard/admin-header";

export const dynamic = "force-dynamic";

export default async function AdminQaPage() {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user?.role as string)) {
    redirect("/login");
  }

  // Query pending questions
  const pendingQuestions = await prisma.question.findMany({
    where: { isApproved: false },
    select: {
      id: true,
      title: true,
      body: true,
      category: true,
      createdAt: true,
      user: {
        select: {
          name: true,
          email: true,
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  // Query pending answers
  const pendingAnswers = await prisma.answer.findMany({
    where: { isApproved: false },
    select: {
      id: true,
      body: true,
      createdAt: true,
      user: {
        select: {
          name: true,
          email: true,
        }
      },
      question: {
        select: {
          title: true,
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <AdminHeader email={session.user.email || ""} />

      <div>
        <h1 className="text-3xl font-bold text-slate-900">Q&A Moderation Queue</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review student questions and answers before they are posted to the public forum.
        </p>
      </div>

      <QaModerator questions={pendingQuestions} answers={pendingAnswers} />
    </div>
  );
}
