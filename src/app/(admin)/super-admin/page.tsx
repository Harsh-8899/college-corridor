import { KeyRound, ShieldCheck, SlidersHorizontal, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const settings = [
  { title: "Role management", text: "Manage Student, Counselor, Admin, and Super Admin permissions.", icon: Users },
  { title: "Security controls", text: "Configure audit logs, session policy, and protected operations.", icon: ShieldCheck },
  { title: "Integrations", text: "Manage Razorpay, AWS S3, notification, and AI provider settings.", icon: KeyRound },
  { title: "Platform rules", text: "Configure lead gates, counselor assignment, fees, and revenue rules.", icon: SlidersHorizontal }
];

export default function SuperAdminPage() {
  return (
    <div className="page-shell space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Super Admin</h1>
          <p className="mt-2 text-muted-foreground">
            Platform-wide controls for users, roles, integrations, security, lead gates, and audit policy.
          </p>
        </div>
        <Button>
          <ShieldCheck className="h-4 w-4" />
          View audit logs
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {settings.map((setting) => (
          <Card key={setting.title}>
            <CardHeader>
              <setting.icon className="h-5 w-5 text-primary" />
              <CardTitle>{setting.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{setting.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

