import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { Building2, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Top MBA Colleges & Business Schools - College Corridor",
  description: "Browse top MBA colleges and Business Schools in India. Compare CAT/MAT cutoffs, fee structures, and campus placements average salary.",
  keywords: ["mba colleges", "business schools", "best mba programs"]
};

export default async function MbaCollegesPage() {
  // Query institutions that offer MBA courses
  const list = await prisma.institution.findMany({
    where: {
      published: true,
      courses: {
        some: {
          courseName: {
            mode: "insensitive",
            contains: "MBA"
          }
        }
      }
    },
    include: { placements: true },
    orderBy: { name: "asc" }
  });

  return (
    <div className="bg-slate-50 min-h-screen py-16 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 space-y-10">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight flex items-center justify-center gap-2">
            <Building2 className="h-8 w-8 text-indigo-600" />
            Top MBA Colleges & B-Schools
          </h1>
          <p className="text-slate-500 text-sm">
            Evaluate CAT/MAT cutoff marks, fee structure, and average packages for top business schools in India.
          </p>
        </div>

        {list.length === 0 ? (
          <Card className="border border-dashed py-12 text-center max-w-md mx-auto">
            <CardContent className="text-slate-400 text-sm">
              No business schools offering MBA found in the database.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((u) => (
              <Card key={u.id} className="border-slate-200 hover:border-indigo-600/30 transition-all hover:shadow-md bg-white flex flex-col justify-between">
                <CardHeader className="flex flex-row items-center gap-4 border-b pb-4">
                  <img src={u.logoUrl || "/logos/amity.png"} className="h-12 w-12 object-contain bg-white rounded border p-1" alt="" />
                  <div className="min-w-0">
                    <CardTitle className="text-base font-bold text-slate-900 truncate leading-snug">{u.name}</CardTitle>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {u.city}, {u.state}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="flex gap-2">
                    <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">{u.ownership}</Badge>
                    {u.isPartner && <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">Official Partner</Badge>}
                  </div>
                  {u.placements?.[0] && (
                    <p className="text-xs font-semibold text-emerald-700">
                      Average Placement Package: {u.placements[0].averagePackage || "N/A"}
                    </p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Link href={`/colleges?search=${encodeURIComponent(u.name)}`} className="flex-1 inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 transition-colors">
                      Compare B-School
                    </Link>
                    <Link href="/check-admission-chances" className="flex-1 inline-flex h-9 items-center justify-center rounded-lg bg-[#2563EB] hover:bg-indigo-700 text-xs font-bold text-white transition-colors shadow-sm">
                      Check chances
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
