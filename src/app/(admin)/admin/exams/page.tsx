import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { authOptions } from "@/lib/auth/options";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, Award, FileQuestion } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminExamsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user?.role as string)) {
    redirect("/login");
  }

  const exams = await prisma.exam.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Exams Directory</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage national entrance exams, eligibility patterns, critical dates, and cutoffs.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/75 text-left text-slate-500 font-semibold">
              <tr>
                <th className="p-4">Exam Details</th>
                <th className="p-4">Category</th>
                <th className="p-4">Key Dates</th>
                <th className="p-4">Cutoff Indicators</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {exams.map((exam) => {
                const cutoffs = exam.cutoffDetails as Record<string, string> | null;
                return (
                  <tr key={exam.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-emerald-600" />
                        <p className="font-semibold text-slate-800">{exam.name}</p>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm truncate">{exam.pattern || "No pattern specified"}</p>
                    </td>
                    <td className="p-4">
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 capitalize">
                        {exam.category.toLowerCase()}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          Exam: {exam.examDate ? new Date(exam.examDate).toLocaleDateString() : "Not scheduled"}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Award className="h-3 w-3 text-slate-400" />
                          Results: {exam.resultDate ? new Date(exam.resultDate).toLocaleDateString() : "Not declared"}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      {cutoffs ? (
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(cutoffs).map(([category, score]) => (
                            <span key={category} className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                              <span className="font-medium capitalize">{category}:</span> {score}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">No cutoffs mapped</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        Active Database
                      </span>
                    </td>
                  </tr>
                );
              })}
              {exams.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    <FileQuestion className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                    No entrance exams defined in directory.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
