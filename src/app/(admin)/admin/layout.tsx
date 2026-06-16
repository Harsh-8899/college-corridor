import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import {
  Building2,
  Users,
  LayoutDashboard,
  FileText,
  Settings,
  Shield,
  LogOut,
  GraduationCap
} from "lucide-react";
import { authOptions } from "@/lib/auth/options";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user?.role as string)) {
    redirect("/login");
  }

  const role = session.user.role as string;

  const sidebarItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/users", label: "Users", icon: Users },
    { href: "/colleges", label: "Colleges", icon: Building2 },
    { href: "/leads", label: "Leads", icon: FileText },
    { href: "/crm", label: "CRM Console", icon: Shield },
    { href: "/settings", label: "Settings", icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 lg:grid lg:grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <aside className="border-r bg-white flex flex-col justify-between lg:sticky lg:top-0 lg:h-screen">
        <div>
          {/* Brand Logo */}
          <div className="flex h-16 items-center gap-3 border-b px-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
              <GraduationCap className="h-6 w-6" />
            </span>
            <div>
              <p className="font-bold tracking-tight text-slate-900">College Corridor</p>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                {role.replace("_", " ")}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={`${item.label}-${item.href}`}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <item.icon className="h-5 w-5 text-slate-400" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer info / Logout */}
        <div className="border-t p-4 bg-slate-50">
          <div className="mb-3 px-2">
            <p className="text-xs font-medium text-slate-400">Signed in as</p>
            <p className="text-sm font-semibold text-slate-700 truncate">{session.user?.email}</p>
          </div>
          <Link
            href="/api/auth/signout"
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col min-h-screen">
        <header className="flex h-16 items-center justify-between border-b bg-white px-8 lg:sticky lg:top-0 lg:z-10 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Admin Control Center</h2>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Systems
            </span>
          </div>
        </header>
        <main className="flex-1 bg-slate-50 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
