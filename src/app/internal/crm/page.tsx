import { Clock, Download, MessageSquareText, PhoneCall, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/db/prisma";
import { LeadStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const stages = [
  { label: "New Leads", key: "NEW" },
  { label: "OTP Verified", key: "OTP_VERIFIED" },
  { label: "Contacted", key: "CONTACTED" },
  { label: "Qualified", key: "QUALIFIED" },
  { label: "Hot", key: "HOT" },
  { label: "Applied", key: "APPLIED" },
  { label: "Enrolled", key: "ENROLLED" }
];

export default async function CrmDashboardPage() {
  // 1. Fetch count of leads per stage from PostgreSQL
  const stageCounts = await Promise.all(
    stages.map(async (stage) => {
      const count = await prisma.lead.count({
        where: { status: stage.key as LeadStatus }
      });
      return { label: stage.label, count };
    })
  );

  // 2. Fetch live leads list
  const leadsList = await prisma.lead.findMany({
    include: {
      interestedInstitution: true,
      assignedCounselor: true,
      activities: {
        orderBy: { timestamp: "desc" },
        take: 1
      }
    },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  // 3. Aggregate lead capture sources dynamically from activities
  const activities = await prisma.leadActivity.findMany({
    select: { pageUrl: true },
    take: 100
  });

  const sourceCounts: Record<string, number> = {};
  for (const act of activities) {
    const key = act.pageUrl || "/";
    sourceCounts[key] = (sourceCounts[key] || 0) + 1;
  }

  const topSources = Object.entries(sourceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="page-shell space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">CRM Executive Console</h1>
          <p className="mt-2 text-muted-foreground">
            Manage student leads, follow-ups, and track counselor workflow assignments.
          </p>
        </div>
        <Button variant="outline" asChild>
          <a href="/api/v1/admin/reports" download>
            <Download className="h-4 w-4" />
            Export Leads (PDF/Excel)
          </a>
        </Button>
      </div>

      {/* Stage Grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-7">
        {stageCounts.map((stage) => (
          <Card key={stage.label} className="border-slate-200/80 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stage.label}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{stage.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
        {/* Source Cards */}
        <Card className="border-slate-200/80 shadow-sm bg-white h-fit">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800">Top Capture Sources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topSources.length === 0 ? (
              <p className="text-sm text-slate-400">No source activity logged.</p>
            ) : (
              topSources.map(([source, count]) => (
                <div key={source} className="flex items-center justify-between rounded-md border border-slate-100 p-3 text-sm bg-slate-50/50">
                  <span className="font-mono text-xs truncate max-w-[200px]">{source}</span>
                  <Badge className="bg-slate-100 text-slate-700">{count} leads</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Lead Table Work area */}
        <Card className="border-slate-200/80 shadow-sm bg-white">
          <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between border-b pb-4">
            <CardTitle className="text-base font-bold text-slate-800">Lead Pipeline Records</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search lead..." className="pl-9" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {leadsList.length === 0 ? (
              <div className="p-12 text-center text-sm text-slate-400">No lead submissions in database.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {leadsList.map((lead) => (
                  <div key={lead.id} className="p-4 hover:bg-slate-50/50 transition-colors flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-800 text-base">{lead.fullName}</p>
                        <Badge className="bg-primary/10 text-primary uppercase text-[10px] font-bold">
                          {lead.preferredCategory}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">
                        {lead.currentCity} · Course: <span className="font-medium text-slate-700">{lead.preferredCourse}</span> · Institution: <span className="font-medium text-slate-700">{lead.interestedInstitution?.name || "None"}</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Phone: {lead.phone} | Email: {lead.email}
                      </p>
                      {lead.activities[0] && (
                        <p className="text-xs text-slate-400 italic mt-1.5 flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          Last action: {lead.activities[0].description} ({new Date(lead.activities[0].timestamp).toLocaleTimeString()})
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0 mt-3 lg:mt-0">
                      <div className="text-right">
                        <Badge className="bg-slate-100 text-slate-700 capitalize font-medium mb-1.5 block w-fit ml-auto">
                          Stage: {lead.status.toLowerCase().replace("_", " ")}
                        </Badge>
                        <p className="text-xs text-slate-400">
                          Assigned: <span className="font-medium text-slate-600">{lead.assignedCounselor?.name || "Unassigned"}</span>
                        </p>
                      </div>
                      <div className="flex gap-1.5">
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                          <PhoneCall className="h-3.5 w-3.5" />
                          Call
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                          <MessageSquareText className="h-3.5 w-3.5" />
                          Notes
                        </Button>
                      </div>
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
