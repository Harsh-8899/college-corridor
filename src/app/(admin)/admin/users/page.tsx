import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { UserTable } from "@/components/dashboard/user-table";
import { authOptions } from "@/lib/auth/options";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user?.role as string)) {
    redirect("/login");
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, status: true },
    orderBy: { createdAt: "desc" }
  });

  const formattedUsers = users.map(u => ({
    id: u.id,
    name: u.name || "Anonymous",
    email: u.email,
    role: u.role?.name || "STUDENT",
    status: u.status || "ACTIVE"
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">User Administration</h1>
        <p className="mt-1 text-sm text-slate-500">
          Create platform staff and update security roles.
        </p>
      </div>
      <div className="border-t border-slate-200 pt-6">
        <UserTable initialUsers={formattedUsers} />
      </div>
    </div>
  );
}
