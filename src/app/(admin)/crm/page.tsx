import { Clock, MessageSquareText, PhoneCall, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <div>
        <h1 className="text-3xl font-semibold">CRM dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Every gated action creates a lead, stores source page and selected colleges, and notifies Admin and Counselor dashboards.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-6">
        {stages.map((stage, index) => (
          <Card key={stage}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{stage}</p>
              <p className="mt-2 text-2xl font-semibold">{[28, 14, 22, 19, 11, 8][index]}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Lead workspace</CardTitle>
            <Button>
              <UserPlus className="h-4 w-4" />
              Create lead
            </Button>
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
                  <Badge>Source saved</Badge>
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
                  <Button variant="outline" size="sm">
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

