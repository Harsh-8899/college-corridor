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

  // Fetch users with related leads, student profile, staff profile, etc.
  const users = await prisma.user.findMany({
    where: {
      status: { not: "DELETED" }
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      role: {
        select: {
          name: true
        }
      },
      staffProfile: {
        select: {
          specialties: true
        }
      },
      studentProfile: {
        select: {
          preferredCategory: true,
          currentCity: true
        }
      },
      leadsCreated: {
        select: {
          id: true,
          status: true,
          preferredCategory: true,
          preferredCourse: true,
          interestedInstitution: {
            select: {
              name: true
            }
          },
          assignedCounselor: {
            select: {
              name: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 1
      },
      leadsAssigned: {
        where: {
          status: { notIn: ["ENROLLED", "LOST"] }
        },
        select: {
          id: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const formattedUsers = users.map(u => {
    const roleName = u.role?.name || "STUDENT";
    
    // Student fields
    const latestLead = u.leadsCreated?.[0] || null;
    const phoneVal = u.phone || "N/A";
    const categoryVal = latestLead?.preferredCategory || u.studentProfile?.preferredCategory || "N/A";
    const appliedCollegeVal = latestLead?.interestedInstitution?.name || "N/A";
    const leadStatusVal = latestLead?.status || "N/A";
    const assignedCounselorVal = latestLead?.assignedCounselor?.name || "N/A";
    
    // Counselor/Management fields
    const activeLeadsCount = u.leadsAssigned?.length || 0;
    
    return {
      id: u.id,
      name: u.name || "Anonymous",
      email: u.email,
      phone: phoneVal,
      role: roleName,
      status: u.status || "ACTIVE",
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
      
      // Student specific
      interestedCategory: categoryVal,
      appliedCollege: appliedCollegeVal,
      leadStatus: leadStatusVal,
      assignedCounselor: assignedCounselorVal,
      
      // Management specific
      assignedLeadsCount: activeLeadsCount
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">User Administration</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage system administrators, education counselors, university partners, and registered student databases.
        </p>
      </div>
      <div className="border-t border-slate-200 pt-6">
        <UserTable initialUsers={formattedUsers} currentUserRole={session.user?.role as string} currentUserEmail={session.user?.email || ""} />
      </div>
    </div>
  );
}
