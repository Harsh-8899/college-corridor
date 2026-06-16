import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { CalendarCheck, PhoneCall, Target, UserCheck, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function CounselorDashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !["COUNSELOR", "ADMIN", "SUPER_ADMIN"].includes(session.user?.role as string)) {
    redirect("/login");
  }

  const userEmail = session.user.email || "";

  // 1. Fetch counselor User from DB
  const counselorUser = await prisma.user.findUnique({
    where: { email: userEmail }
  });

  if (!counselorUser) {
    redirect("/login");
  }

  // 2. Fetch assigned leads list
  const leadsList = await prisma.lead.findMany({
    where: {
      assignedCounselorId: counselorUser.id
    },
    include: {
      interestedInstitution: true,
      activities: {
        orderBy: { timestamp: "desc" },
        take: 1
      }
    },
    orderBy: { createdAt: "desc" }
  });

  // Calculate metrics
  const totalAssigned = leadsList.length;
  const pendingCounseling = leadsList.filter(l => l.status === "OTP_VERIFIED" || l.status === "NEW").length;
  const contactedCount = leadsList.filter(l => l.status === "CONTACTED" || l.status === "QUALIFIED").length;
  const enrolledCount = leadsList.filter(l => l.status === "ENROLLED" || l.status === "ADMITTED").length;
  
  const conversionRate = totalAssigned > 0 
    ? Math.round((enrolledCount / totalAssigned) * 100) 
    : 0;

  return (
    <div className="page-shell space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Counselor Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your assigned student pipeline, record call outcomes, and assist college placements.
          </p>
        </div>
        <Button variant="outline">
          <CalendarCheck className="h-4 w-4" />
          Manage Availability
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Assigned Leads" value={String(totalAssigned)} delta="Total Active" />
        <StatCard label="Pending Contact" value={String(pendingCounseling)} delta="Immediate Action" />
        <StatCard label="In Discussion" value={String(contactedCount)} delta="Contacted Stage" />
        <StatCard label="Conversion Rate" value={`${conversionRate}%`} delta="Admitted/Enrolled" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        {/* Pipeline Panel */}
        <Card className="border-slate-200/80 shadow-sm bg-white">
          <CardHeader className="border-b pb-4 flex flex-row items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-bold text-slate-800">Your Assigned Leads Queue</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {leadsList.length === 0 ? (
              <div className="p-12 text-center text-sm text-slate-400">No student leads currently assigned to you.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {leadsList.map((lead) => (
                  <div key={lead.id} className="flex flex-col gap-3 p-4 hover:bg-slate-50/50 transition-colors md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-800">{lead.fullName}</p>
                        <Badge className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold tracking-wider">
                          {lead.preferredCategory}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">
                        {lead.currentCity} · Course: <span className="font-medium text-slate-700">{lead.preferredCourse}</span> · School: <span className="font-medium text-slate-700">{lead.interestedInstitution?.name || "None"}</span>
                      </p>
                      {lead.activities[0] && (
                        <p className="text-xs text-slate-400 italic mt-1.5 flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          Activity: {lead.activities[0].description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className="bg-primary/10 text-primary capitalize font-medium">
                        {lead.status.toLowerCase().replace("_", " ")}
                      </Badge>
                      <Button variant="outline" size="sm" className="gap-1 text-xs">
                        <PhoneCall className="h-3.5 w-3.5" />
                        Call
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Panel */}
        <div className="space-y-4">
          <Card className="border-slate-200/80 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-800">Quick Tools</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Target className="h-4 w-4 text-slate-500" />
                Recommend Courses / Colleges
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <UserCheck className="h-4 w-4 text-slate-500" />
                Update Student Status
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
