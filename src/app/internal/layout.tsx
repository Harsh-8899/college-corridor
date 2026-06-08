import Link from "next/link";
import {
  BarChart3,
  Building2,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Users
} from "lucide-react";

const sidebarItems = [
  { href: "/internal/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/internal/crm", label: "Leads", icon: Users },
  { href: "/internal/admin", label: "Applications", icon: FileText },
  { href: "/internal/admin", label: "Colleges", icon: Building2 },
  { href: "/internal/admin", label: "Reports", icon: FileText },
  { href: "/internal/admin", label: "Analytics", icon: BarChart3 },
  { href: "/internal/admin", label: "Settings", icon: Settings }
];

export default function InternalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-muted/35 text-foreground lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b bg-card/95 backdrop-blur lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex h-16 items-center gap-2 border-b px-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold">College Corridor</p>
            <p className="text-xs text-muted-foreground">Internal workspace</p>
          </div>
        </div>
        <nav className="flex gap-2 overflow-x-auto p-3 lg:block lg:space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={`${item.label}-${item.href}`}
              href={item.href}
              className="flex min-w-fit items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <section className="min-w-0">
        <header className="sticky top-0 z-30 border-b bg-background/90 px-4 py-3 backdrop-blur lg:px-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium">Internal Team Access</p>
            <p className="text-xs text-muted-foreground">Admin · Counselor · CRM Executive</p>
          </div>
        </header>
        <main>{children}</main>
      </section>
    </div>
  );
}
