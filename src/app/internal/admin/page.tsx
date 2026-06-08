import { BarChart3, Bell, Building2, IndianRupee, MessageSquareText, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { dashboardStats, recentLeads } from "@/lib/data/dashboard";

const queues = [
  { label: "Applications needing action", value: 42, icon: Building2 },
  { label: "Reviews awaiting moderation", value: 18, icon: MessageSquareText },
  { label: "New lead notifications", value: 27, icon: Bell },
  { label: "Counselor workload alerts", value: 6, icon: Users }
];

export default function AdminDashboardPage() {
  return (
    <div className="page-shell space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Full platform management for colleges, applications, analytics, revenue, and users.
          </p>
        </div>
        <Button>
          <Building2 className="h-4 w-4" />
          Add college
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader>
            <CardTitle>Lead and application queue</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="text-left text-muted-foreground">
                <tr>
                  <th className="border-b py-3 font-medium">Student</th>
                  <th className="border-b py-3 font-medium">City</th>
                  <th className="border-b py-3 font-medium">Course</th>
                  <th className="border-b py-3 font-medium">College</th>
                  <th className="border-b py-3 font-medium">Stage</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead) => (
                  <tr key={lead.name}>
                    <td className="border-b py-3 font-medium">{lead.name}</td>
                    <td className="border-b py-3">{lead.city}</td>
                    <td className="border-b py-3">{lead.course}</td>
                    <td className="border-b py-3">{lead.college}</td>
                    <td className="border-b py-3">
                      <Badge>{lead.stage}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {queues.map((queue) => (
            <Card key={queue.label}>
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <queue.icon className="h-5 w-5" />
                  </span>
                  <p className="text-sm font-medium">{queue.label}</p>
                </div>
                <p className="text-2xl font-semibold">{queue.value}</p>
              </CardContent>
            </Card>
          ))}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-primary" />
                Revenue tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Mentorship bookings: INR 2.1L</p>
              <p>Application fees: INR 3.4L</p>
              <p>Partner leads: INR 2.9L</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Analytics overview
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          {["Searches", "Shortlists", "Comparisons", "AI unlocks"].map((metric, index) => (
            <div key={metric} className="rounded-md border p-4">
              <p className="text-sm text-muted-foreground">{metric}</p>
              <p className="mt-1 text-xl font-semibold">{[12400, 3280, 930, 418][index].toLocaleString("en-IN")}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
