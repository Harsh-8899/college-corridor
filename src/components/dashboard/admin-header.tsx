"use client";

import { signOut } from "next-auth/react";
import { LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

type AdminHeaderProps = {
  email: string;
};

export function AdminHeader({ email }: AdminHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-medium">Admin Panel</p>
          <p className="text-xs text-muted-foreground">{email}</p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => signOut({ callbackUrl: "/internal/login" })}
      >
        <LogOut className="h-3.5 w-3.5" />
        Sign Out
      </Button>
    </div>
  );
}
