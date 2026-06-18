import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  FileText, 
  Activity, 
  Layers, 
  PhoneCall, 
  FolderEdit, 
  Clock, 
  TrendingUp, 
  UserCheck 
} from "lucide-react";
import { AdminQuickActions } from "@/components/dashboard/admin-quick-actions";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLanding() {
  // Query comprehensive platform data
  const [
    _totalUsers,
    totalColleges,
    totalLeads,
    totalLogs,
    leads,
    counselors,
    newApplications,
    recentActivities,
    pendingFollowupsCount,
    _applicationStatusCounts
  ] = await Promise.all([
    prisma.user.count(),
    prisma.institution.count(),
    prisma.lead.count(),
    prisma.auditLog.count(),
    
    // Fetch active leads for quick actions
    prisma.lead.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        status: true,
        preferredCategory: true,
        currentCity: true,
        preferredCourse: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" }
    }),

    // Fetch counselors & workload counts
    prisma.user.findMany({
      where: {
        role: { name: "COUNSELOR" },
        status: "ACTIVE"
      },
      select: {
        id: true,
        name: true,
        email: true,
        leadsAssigned: {
          where: { status: { notIn: ["ENROLLED", "LOST"] } },
          select: { id: true }
        }
      }
    }),

    // Fetch recent new applications
    prisma.application.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        student: { select: { name: true, email: true } },
        institution: { select: { name: true } },
        program: { select: { name: true } }
      }
    }),

    // Fetch recent student activities
    prisma.leadActivity.findMany({
      take: 6,
      orderBy: { timestamp: "desc" },
      include: {
        lead: { select: { fullName: true, id: true } }
      }
    }),

    // Count pending follow-ups (Leads not enrolled or lost, but contacted or verified)
    prisma.lead.count({
      where: {
        status: { in: ["OTP_VERIFIED", "CONTACTED", "COUNSELING_BOOKED", "APPLICATION_STARTED", "DOCUMENTS_PENDING"] }
      }
    }),

    // Count applications grouped by status
    prisma.application.groupBy({
      by: ["status"],
      _count: true
    })
  ]);

  // Aggregate Category Wise Leads
  const categoryCounts = leads.reduce((acc, lead) => {
    const cat = lead.preferredCategory || "OFFLINE";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stats = [
    { label: "Colleges Index", value: totalColleges, icon: Building2, color: "text-emerald-600 bg-emerald-50" },
    { label: "Counseling Leads", value: totalLeads, icon: FileText, color: "text-indigo-600 bg-indigo-50" },
    { label: "Follow-Up Pending", value: pendingFollowupsCount, icon: PhoneCall, color: "text-amber-600 bg-amber-50" },
    { label: "Security Registries", value: totalLogs, icon: Activity, color: "text-rose-600 bg-rose-50" }
  ];

  // Helper lists
  const quickLeads = leads.slice(0, 15);
  const formattedCounselors = counselors.map(c => ({ id: c.id, name: c.name || "Unnamed Counselor" }));

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-1 py-2">
      {/* Dashboard Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Platform Operations Control</h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor real-time counseling status, student applications, counselor workloads, and lead lifecycles.
          </p>
        </div>
        <div className="text-xs text-slate-500 font-bold bg-slate-100 py-1.5 px-3 rounded-md border flex items-center gap-1.5 self-start md:self-center">
          <Clock className="h-3.5 w-3.5" />
          Last Synced: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Grid: 4 Metric Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-slate-200/80 shadow-xs hover:shadow-sm transition-all bg-white">
            <CardContent className="flex items-center gap-4 p-6">
              <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color} shadow-inner`}>
                <stat.icon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="mt-1 text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid: Split actions/charts and feeds */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2/3 width) - Leads overview & workloads */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Leads Breakdown & Workloads split */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Category Wise Leads breakdown */}
            <Card className="border-slate-200/80 shadow-sm bg-white">
              <CardHeader className="border-b border-slate-100 pb-3">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <Layers className="h-4.5 w-4.5 text-indigo-500" />
                  Category-wise leads
                </CardTitle>
                <CardDescription className="text-xxs">Distribution across business verticals</CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                {[
                  { key: "OFFLINE", label: "Offline Colleges", color: "bg-emerald-500" },
                  { key: "ONLINE", label: "Online Programs", color: "bg-indigo-500" },
                  { key: "STUDY_ABROAD", label: "Study Abroad", color: "bg-purple-500" },
                  { key: "DISTANCE", label: "Distance Learning", color: "bg-amber-500" }
                ].map((item) => {
                  const val = categoryCounts[item.key] || 0;
                  const percent = totalLeads > 0 ? ((val / totalLeads) * 100).toFixed(0) : 0;
                  return (
                    <div key={item.key} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-700">{item.label}</span>
                        <span className="text-slate-900">{val} leads ({percent}%)</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color}`} style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Counselor Workloads list */}
            <Card className="border-slate-200/80 shadow-sm bg-white">
              <CardHeader className="border-b border-slate-100 pb-3">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <UserCheck className="h-4.5 w-4.5 text-emerald-500" />
                  Counselor workload
                </CardTitle>
                <CardDescription className="text-xxs">Active leads assigned per specialist</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {counselors.length === 0 ? (
                  <p className="p-8 text-center text-xs text-slate-400">No active counselors in system.</p>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-[265px] overflow-y-auto">
                    {counselors.map((c) => {
                      const count = c.leadsAssigned.length;
                      return (
                        <div key={c.id} className="flex items-center justify-between p-3.5 text-xs hover:bg-slate-50/35">
                          <div>
                            <p className="font-semibold text-slate-800">{c.name}</p>
                            <p className="text-xxs text-slate-400 mt-0.5">{c.email}</p>
                          </div>
                          <Badge className={count > 5 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}>
                            {count} Active Leads
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* New Applications Widget */}
          <Card className="border-slate-200/80 shadow-sm bg-white">
            <CardHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <FolderEdit className="h-4.5 w-4.5 text-purple-500" />
                  New admissions applications
                </CardTitle>
                <CardDescription className="text-xxs">Recent submissions awaiting partner review</CardDescription>
              </div>
              <Badge variant="outline" className="text-xxs font-semibold">
                Total Queue: {newApplications.length}
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              {newApplications.length === 0 ? (
                <p className="p-10 text-center text-xs text-slate-400">No applications filed yet.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {newApplications.map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-4 text-xs hover:bg-slate-50/30">
                      <div>
                        <p className="font-semibold text-slate-800">
                          {app.student.name || "Anonymous Student"} (<em>{app.student.email}</em>)
                        </p>
                        <p className="text-xxs text-slate-500 mt-1">
                          Applied to: <strong>{app.institution.name}</strong> · Course: {app.program?.name || "N/A"}
                        </p>
                      </div>
                      <Badge className="bg-purple-100 text-purple-800 capitalize">
                        {app.status.toLowerCase().replace(/_/g, " ")}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Student Activity feed */}
          <Card className="border-slate-200/80 shadow-sm bg-white">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <TrendingUp className="h-4.5 w-4.5 text-rose-500" />
                Recent student activity
              </CardTitle>
              <CardDescription className="text-xxs">Live interaction trace across search directory</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {recentActivities.length === 0 ? (
                <p className="p-10 text-center text-xs text-slate-400">No student activities recorded yet.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentActivities.map((act) => (
                    <div key={act.id} className="p-3.5 text-xs hover:bg-slate-50/30 flex items-start gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-slate-500 text-xxs font-bold uppercase mt-0.5 shrink-0">
                        {act.activityType.slice(0, 2)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-slate-800 font-semibold truncate">
                          {act.lead?.fullName || "A student"} {act.description}
                        </p>
                        <p className="text-xxs text-slate-400 mt-0.5">
                          Source: {act.pageUrl || "/"} · {new Date(act.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Column (1/3 width) - Daily Actions Panel */}
        <AdminQuickActions counselors={formattedCounselors} leads={quickLeads} />

      </div>
    </div>
  );
}
