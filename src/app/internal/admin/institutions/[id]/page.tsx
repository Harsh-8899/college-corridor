import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import { InstitutionEditForm } from "./institution-edit-form";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function InstitutionPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "EDITOR"].includes(session.user?.role as string)) {
    redirect("/login");
  }

  const { id } = await params;
  const isNew = id === "new";

  let institutionData = null;

  if (!isNew) {
    const inst = await prisma.institution.findUnique({
      where: { id },
      include: {
        courses: true,
        placements: true,
        rankings: true,
        admissions: true,
        facilities: true,
        scholarships: true,
        seo: true
      }
    });

    if (!inst) {
      notFound();
    }
    
    // Serialize data cleanly for client use
    institutionData = JSON.parse(JSON.stringify(inst));
  }

  return (
    <div className="page-shell space-y-8 p-6 lg:p-8">
      <InstitutionEditForm initialData={institutionData} isNew={isNew} />
    </div>
  );
}
