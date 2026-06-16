import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import {
  Building2,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Users,
  Settings
} from "lucide-react";
import { authOptions } from "@/lib/auth/options";

export default async function InternalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "EDITOR", "COUNSELOR"].includes(session.user?.role as string)) {
    redirect("/login");
  }

  const role = session.user.role as string;

  // Build sidebar items based on role
  const sidebarItems = [];

  if (role === "ADMIN" || role === "EDITOR") {
    sidebarItems.push({ href: "/internal/admin", label: "Dashboard", icon: LayoutDashboard });
    sidebarItems.push({ href: "/internal/admin/institutions", label: "Institutions", icon: Building2 });
  }

  if (role === "ADMIN" || role === "COUNSELOR") {
    sidebarItems.push({ href: "/internal/crm", label: "Leads", icon: Users });
    sidebarItems.push({ href: "/internal/counselor", label: "Counselor", icon: FileText });
  }

  // Everyone internal gets settings
  sidebarItems.push({ href: "/internal/settings", label: "Settings", icon: Settings });

  return (
    <div className="min-h-screen bg-muted/35 text-foreground lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b bg-card/95 backdrop-blur lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex h-16 items-center gap-2 border-b px-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold">College Corridor</p>
            <p className="text-xs text-muted-foreground capitalize">{role.toLowerCase()} Panel</p>
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
        <div className="mt-auto border-t p-3 lg:absolute lg:bottom-0 lg:left-0 lg:right-0">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Building2 className="h-4 w-4" />
            View Public Site
          </Link>
        </div>
      </aside>
      <section className="min-w-0">
        <main>{children}</main>
      </section>
    </div>
  );
}
