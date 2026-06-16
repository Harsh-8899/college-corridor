import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getColleges } from "@/lib/data/colleges";
import { CollegeTable } from "@/components/dashboard/college-table";
import { authOptions } from "@/lib/auth/options";

export const dynamic = "force-dynamic";

export default async function AdminCollegesPage() {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user?.role as string)) {
    redirect("/login");
  }

  const collegesList = getColleges();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">College Catalog</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage institution details, eligibility requirements, fees, rankings, and placements.
        </p>
      </div>
      <div className="border-t border-slate-200 pt-6">
        <CollegeTable initialColleges={collegesList} />
      </div>
    </div>
  );
}
