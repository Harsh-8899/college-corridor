import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Building2 } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { AdminHeader } from "@/components/dashboard/admin-header";
import { CollegeTable } from "@/components/dashboard/college-table";
import { UserTable } from "@/components/dashboard/user-table";
import { authOptions } from "@/lib/auth/options";
import { getColleges } from "@/lib/data/colleges";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "EDITOR"].includes(session.user?.role as string)) {
    redirect("/login");
  }

  const colleges = getColleges();
  const isAdmin = session.user.role === "ADMIN";

  // Fetch users if admin
  let users: { id: string; name: string; email: string; role: string; status: string }[] = [];
  if (isAdmin) {
    const dbUsers = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, status: true },
      orderBy: { createdAt: "desc" }
    });
    users = dbUsers.map(u => ({
      ...u,
      name: u.name || ""
    }));
  }

  const stats = [
    { label: "Total Colleges", value: String(colleges.length), delta: "Live" },
    { label: "Total Courses", value: String(colleges.reduce((sum, c) => sum + c.courses.length, 0)), delta: "Across all" },
    { label: "Total Seats", value: colleges.reduce((sum, c) => sum + c.seats, 0).toLocaleString("en-IN"), delta: "Combined" },
    { label: "Avg Rating", value: colleges.length > 0 ? (colleges.reduce((sum, c) => sum + c.rating, 0) / colleges.length).toFixed(1) : "0", delta: "Out of 5" }
  ];

  return (
    <div className="page-shell space-y-8">
      <AdminHeader email={session.user.email || "admin"} />

      <div>
        <h1 className="text-3xl font-semibold">
          {isAdmin ? "Admin Dashboard" : "Editor Dashboard"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {isAdmin 
            ? "Manage system users, colleges, and platform settings." 
            : "Update college information, courses, and platform data."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {isAdmin && (
        <div className="border-t pt-8">
          <UserTable initialUsers={users} />
        </div>
      )}

      <div className="border-t pt-8">
        <div className="mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">College Management</h2>
        </div>
        <CollegeTable initialColleges={colleges} />
      </div>
    </div>
  );
}
