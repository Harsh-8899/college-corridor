import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { authOptions } from "@/lib/auth/options";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, ShieldAlert, Sparkles, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCrmConsole() {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user?.role as string)) {
    redirect("/login");
  }

  // Fetch counselors and leads summary
  const [counselors, totalLeads, unassignedCount, assignedLeads] = await Promise.all([
    prisma.user.findMany({
      where: { role: { name: "COUNSELOR" } },
      select: {
        id: true,
        name: true,
        email: true,
        leadsAssigned: {
          select: { id: true }
        }
      }
    }),
    prisma.lead.count(),
    prisma.lead.count({ where: { assignedCounselorId: null } }),
    prisma.lead.findMany({
      where: { NOT: { assignedCounselorId: null } },
      include: {
        assignedCounselor: {
          select: { name: true, email: true }
        }
      },
      orderBy: { updatedAt: "desc" },
      take: 8
    })
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">CRM Operations Console</h1>
        <p className="mt-1 text-sm text-slate-500">
          Supervise counselor workflows, track active assignments, and review unallocated leads.
        </p>
      </div>

      {/* Overview stats cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <User className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Counselors</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{counselors.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <ShieldAlert className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Unassigned Leads</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{unassignedCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Sparkles className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total CRM Pipeline</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{totalLeads}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Counselors Load */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-semibold text-slate-800">Counselor Workload Allocation</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {counselors.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">No counselors registered in system.</div>
            ) : (
              <div className="space-y-4">
                {counselors.map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-4">
                    <div>
                      <p className="font-semibold text-slate-800">{c.name || "Unnamed Counselor"}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{c.email}</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100">
                        {c.leadsAssigned.length} leads
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assigned Leads Activity */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-semibold text-slate-800">Active Allocations & Assignments</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {assignedLeads.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">No assigned activities.</div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
                {assignedLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{lead.fullName}</p>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <BookOpen className="h-3 w-3 text-slate-400" />
                        Interested in {lead.preferredCourse}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Assigned To</p>
                      <p className="text-sm font-medium text-slate-700 mt-0.5">
                        {lead.assignedCounselor?.name || "System Staff"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
