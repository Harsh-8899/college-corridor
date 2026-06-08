"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const roles = [
  ["STUDENT", "student@eduoofa.com"],
  ["COUNSELOR", "counselor@eduoofa.com"],
  ["ADMIN", "admin@eduoofa.com"],
  ["SUPER_ADMIN", "superadmin@eduoofa.com"]
];

export default function LoginPage() {
  return (
    <div className="page-shell flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Demo login</CardTitle>
          <p className="text-sm text-muted-foreground">Use a role to test role-aware dashboards in Phase 2.</p>
        </CardHeader>
        <CardContent className="grid gap-3">
          {roles.map(([role, email]) => (
            <Button
              key={role}
              variant="outline"
              onClick={() => signIn("credentials", { email, role, callbackUrl: "/" })}
            >
              Continue as {role.replace("_", " ")}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

