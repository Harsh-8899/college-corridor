import { Clock, Download, MessageSquareText, PhoneCall, Search, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { recentLeads } from "@/lib/data/dashboard";

const stages = [
  "New Lead",
  "Profile Incomplete",
  "Counseling Pending",
  "Shortlist Created",
  "Application Started",
  "Converted"
];

export default function CrmDashboardPage() {
  return (
    <div className="page-shell space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">CRM Executive Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Manage leads, assignments, tracking, exports, and call logs.
          </p>
        </div>
        <Button>
          <Download className="h-4 w-4" />
          Export leads
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {stages.map((stage, index) => (
          <Card key={stage}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{stage}</p>
              <p className="mt-2 text-2xl font-semibold">{[28, 14, 22, 19, 11, 8][index]}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[340px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Lead capture sources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ["/compare", 38],
              ["/colleges/greenwood-institute-of-technology", 24],
              ["/", 18],
              ["AI recommendations", 12]
            ].map(([source, count]) => (
              <div key={source} className="flex items-center justify-between rounded-md border p-3 text-sm">
                <span>{source}</span>
                <Badge>{count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>Lead workspace</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search leads" className="pl-9" />
              </div>
              <Button>
                <UserPlus className="h-4 w-4" />
                Create lead
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentLeads.map((lead) => (
              <div key={lead.name} className="grid gap-3 rounded-md border p-4 lg:grid-cols-[1fr_220px_190px] lg:items-center">
                <div>
                  <p className="font-medium">{lead.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {lead.city} · {lead.course} · {lead.college}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge>{lead.stage}</Badge>
                  <Badge>Assigned</Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <PhoneCall className="h-4 w-4" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageSquareText className="h-4 w-4" />
                    Note
                  </Button>
                  <Button variant="outline" size="sm" aria-label="Schedule follow-up">
                    <Clock className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
