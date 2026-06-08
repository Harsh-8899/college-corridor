"use client";

import Link from "next/link";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  return (
    <div className="page-shell flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Student Registration</CardTitle>
          <p className="text-sm text-muted-foreground">
            Create a student profile to save colleges, view reports, and track applications.
          </p>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="Your name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" placeholder="+91 98765 43210" />
            </div>
            <Button type="button">
              <UserPlus className="h-4 w-4" />
              Register as Student
            </Button>
            <Button asChild variant="ghost">
              <Link href="/login">Already have an account?</Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
