import { getColleges } from "@/lib/data/colleges";
import { CollegesDirectory } from "./colleges-directory";

export const dynamic = "force-dynamic";

export default async function CollegesPage() {
  const collegesList = await getColleges();

  return (
    <div className="page-shell space-y-6 max-w-7xl mx-auto px-4 py-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Education Discovery Hub
        </h1>
        <p className="text-muted-foreground text-base max-w-2xl">
          Search and compare top offline colleges, online courses, and global study options with verified salary stats, fees, and rankings.
        </p>
      </div>

      <CollegesDirectory initialColleges={collegesList} />
    </div>
  );
}
