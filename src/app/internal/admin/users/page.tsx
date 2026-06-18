import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { UsersManagerClient } from "./users-manager-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Users Workstation | College Corridor",
  description: "Search, filter, manage status, and export student and administrative accounts."
};

export const dynamic = "force-dynamic";

export default async function UsersManagerPage() {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user?.role || "")) {
    redirect("/login");
  }

  // 1. Fetch initial user records
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      fullName: true,
      email: true,
      phone: true,
      phoneVerified: true,
      city: true,
      state: true,
      status: true,
      role: {
        select: {
          name: true
        }
      },
      createdAt: true
    },
    orderBy: { createdAt: "desc" }
  });

  // Convert Date objects to strings for Client Component props
  const serializedUsers = users.map(user => ({
    ...user,
    createdAt: user.createdAt.toISOString()
  }));

  // 2. Fetch system roles
  const roles = await prisma.role.findMany({
    select: { name: true }
  });

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Users Workstation</h1>
          <p className="mt-2 text-sm text-slate-500">
            Search, filter, suspend, and audit all user accounts across the College Corridor ecosystem.
          </p>
        </div>

        <UsersManagerClient 
          initialUsers={serializedUsers} 
          availableRoles={roles.map(r => r.name)}
          currentUserEmail={session.user.email!}
        />
      </div>
    </div>
  );
}
