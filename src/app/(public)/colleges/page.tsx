import { Search } from "lucide-react";
import { CollegeCard } from "@/components/college/college-card";
import { Input } from "@/components/ui/input";
import { getColleges } from "@/lib/data/colleges";

export const dynamic = "force-dynamic";

export default async function CollegesPage() {
  const collegesList = await getColleges();

  return (
    <div className="page-shell space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">College listing</h1>
        <p className="mt-2 text-muted-foreground">
          Browse colleges freely. Lead capture is required only for premium insights and counseling actions.
        </p>
      </div>
      <div className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[1fr_180px_180px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by college, course, city, or mode" className="pl-9" />
        </div>
        <select className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option>All modes</option>
          <option>Online</option>
          <option>Offline</option>
          <option>Distance</option>
        </select>
        <select className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option>Sort by ranking</option>
          <option>Fees low to high</option>
          <option>Placement rate</option>
          <option>Rating</option>
        </select>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {collegesList.map((college) => (
          <CollegeCard key={college.id} college={college} />
        ))}
      </div>
    </div>
  );
}

