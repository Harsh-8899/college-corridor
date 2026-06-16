"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, GraduationCap, Menu, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/colleges", label: "Colleges" },
  { href: "/exams", label: "Exams" },
  { href: "/study-abroad", label: "Study Abroad" },
  { href: "/community", label: "Community" },
  { href: "/compare", label: "Compare" }
];

export function SiteNav() {
  const pathname = usePathname();
  const [isAdminSubdomain, setIsAdminSubdomain] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsAdminSubdomain(window.location.hostname.startsWith("admin."));
    }
  }, []);

  if (pathname.startsWith("/internal") || pathname.startsWith("/admin") || isAdminSubdomain) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span>College Corridor</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
                pathname === link.href && "bg-muted text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="hidden sm:inline-flex">
            <Link href="/login">
              <Users className="h-4 w-4" />
              Student Login
            </Link>
          </Button>
          <Button asChild variant="ghost" className="hidden lg:inline-flex">
            <Link href="/register">
              <UserPlus className="h-4 w-4" />
              Student Registration
            </Link>
          </Button>
          <Button asChild>
            <Link href="/colleges">
              <BarChart3 className="h-4 w-4" />
              Find Colleges
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
