import { CalendarCheck, PhoneCall, Target, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { counselorTasks, recentLeads } from "@/lib/data/dashboard";

export default function CounselorDashboardPage() {
  return (
    <div className="page-shell space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Counselor dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Work assigned leads, schedule follow-ups, recommend colleges, and manage mentorship sessions.
          </p>
        </div>
        <Button>
          <CalendarCheck className="h-4 w-4" />
          Set availability
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Assigned leads" value="46" delta="+12%" />
        <StatCard label="Due today" value="11" delta="+4" />
        <StatCard label="Bookings" value="19" delta="+8%" />
        <StatCard label="Conversions" value="31%" delta="+5%" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Assigned lead pipeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentLeads.map((lead) => (
              <div key={lead.name} className="flex flex-col gap-3 rounded-md border p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-medium">{lead.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {lead.city} · {lead.course} · {lead.college}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{lead.stage}</Badge>
                  <Button variant="outline" size="sm">
                    <PhoneCall className="h-4 w-4" />
                    Call
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {counselorTasks.map((task) => (
                <div key={task.title} className="rounded-md border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{task.title}</p>
                    <Badge>{task.priority}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{task.due}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button variant="outline">
                <Target className="h-4 w-4" />
                Recommend colleges
              </Button>
              <Button variant="outline">
                <UserCheck className="h-4 w-4" />
                Update pipeline
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

