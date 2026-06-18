import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { DashboardClient } from "./dashboard-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Dashboard | College Corridor",
  description: "Manage your profile, tracked colleges, and check your admission chances history."
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect("/login?callbackUrl=/dashboard");
  }

  // 1. Fetch user profile
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      fullName: true,
      email: true,
      phone: true,
      phoneVerified: true,
      emailVerified: true,
      city: true,
      state: true,
      status: true,
      createdAt: true
    }
  });

  if (!user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  // 2. Fetch saved universities
  const savedInstitutions = await prisma.savedInstitution.findMany({
    where: { userId: user.id },
    include: {
      institution: {
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          city: true,
          state: true,
          ownership: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  // 3. Fetch admission chances check history
  const admissionChances = await prisma.admissionChanceResult.findMany({
    where: { userId: user.id },
    include: {
      institution: {
        select: {
          name: true,
          logoUrl: true,
          slug: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="min-h-screen bg-slate-50/50 py-10">
      <div className="container max-w-7xl px-4 sm:px-6 lg:px-8">
        <DashboardClient 
          initialUser={user} 
          initialShortlist={savedInstitutions} 
          initialChances={admissionChances} 
        />
      </div>
    </div>
  );
}
