"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="page-shell flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Student Login</CardTitle>
          <p className="text-sm text-muted-foreground">
            Access saved colleges, reports, applications, and counseling updates.
          </p>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Button
            variant="outline"
            onClick={() => signIn("credentials", { email: "student@collegecorridor.com", callbackUrl: "/" })}
          >
            Continue as Student
          </Button>
          <Button asChild>
            <Link href="/register">Create student account</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
