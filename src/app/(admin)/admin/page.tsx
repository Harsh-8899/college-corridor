import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, FileText, Activity, Users2, ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLanding() {
  // Fetch database metrics
  const [totalUsers, totalColleges, totalLeads, totalLogs, recentLeads, recentLogs] = await Promise.all([
    prisma.user.count(),
    prisma.college.count(),
    prisma.lead.count(),
    prisma.auditLog.count(),
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 5
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        actor: {
          select: { email: true }
        }
      }
    })
  ]);

  const stats = [
    { label: "Total Platform Users", value: totalUsers, icon: Users2, color: "text-blue-600 bg-blue-50" },
    { label: "Colleges in Directory", value: totalColleges, icon: Building2, color: "text-emerald-600 bg-emerald-50" },
    { label: "Leads Captured", value: totalLeads, icon: FileText, color: "text-amber-600 bg-amber-50" },
    { label: "Security & Audit Logs", value: totalLogs, icon: Activity, color: "text-violet-600 bg-violet-50" }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Real-time metrics, captured leads activity, and security audit registers.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-slate-200/80 shadow-sm bg-white">
            <CardContent className="flex items-center gap-4 p-6">
              <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color} shadow-sm`}>
                <stat.icon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="mt-1 text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content split */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Leads */}
        <Card className="border-slate-200/80 shadow-sm bg-white">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-semibold text-slate-800">Recent CRM Leads</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentLeads.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">No leads captured yet.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{lead.fullName}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {lead.city} · Interested in <span className="font-medium">{lead.courseInterestedIn}</span>
                      </p>
                    </div>
                    <Badge className="bg-slate-100 text-slate-700 capitalize">
                      {lead.status.toLowerCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security / Audit Logs */}
        <Card className="border-slate-200/80 shadow-sm bg-white">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-semibold text-slate-800">System Activity Logs</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentLogs.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">No system activities recorded.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentLogs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-slate-50/50 transition-colors flex items-start gap-3">
                    <ShieldAlert className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {log.action} on <span className="font-semibold text-slate-700">{log.entityType}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        By: {log.actor?.email || "System"} · {new Date(log.createdAt).toLocaleDateString()}
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
