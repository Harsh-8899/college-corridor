import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/options";
import { getColleges } from "@/lib/data/colleges";
import { InstitutionsDashboard } from "./institutions-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminInstitutionsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "EDITOR"].includes(session.user?.role as string)) {
    redirect("/login");
  }

  const colleges = await getColleges();

  return (
    <div className="page-shell space-y-8 p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
          Institutions Directory
        </h1>
        <p className="mt-2 text-muted-foreground">
          View, search, filter, and edit the complete database of education institutes.
        </p>
      </div>

      <InstitutionsDashboard initialColleges={colleges} />
    </div>
  );
}
