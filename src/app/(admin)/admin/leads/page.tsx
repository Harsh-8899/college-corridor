import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { authOptions } from "@/lib/auth/options";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user?.role as string)) {
    redirect("/login");
  }

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      interestedCollege: {
        select: { name: true }
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Captured Leads</h1>
          <p className="mt-1 text-sm text-slate-500">
            View captured student leads, interested programs, and tracking contexts.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/75 text-left text-slate-500 font-semibold">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Interests</th>
                <th className="p-4">Location</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <p className="font-semibold text-slate-800">{lead.fullName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Source: {lead.sourcePage}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-slate-700">{lead.email}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{lead.phone}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                      <span>{lead.courseInterestedIn}</span>
                    </div>
                    {lead.interestedCollege && (
                      <p className="text-xs text-slate-400 mt-1 truncate max-w-[200px]">
                        At: {lead.interestedCollege.name}
                      </p>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-slate-500">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>{lead.city}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge className="bg-slate-100 text-slate-700 capitalize border-slate-200">
                      {lead.status.toLowerCase()}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-slate-500">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No leads captured yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
