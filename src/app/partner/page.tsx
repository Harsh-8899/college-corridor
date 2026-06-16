import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/badge";
import { LeadStatus } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Users,
  Building2,
  TrendingUp,
  UserCheck,
  Search,
  Filter,
  ArrowUpRight,
  ShieldAlert,
  UserPlus
} from "lucide-react";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Partner Dashboard - College Corridor",
  description: "University partner dashboard for managing inquiries, counselor-assigned student leads, and enrollment statistics.",
};

type PageProps = {
  searchParams: Promise<{ q?: string; status?: string }>;
};

export default async function PartnerDashboardPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const searchQuery = resolvedParams.q || "";
  const filterStatus = resolvedParams.status || "";

  // Fetch logged in user and partner info
  const user = await prisma.user.findUniqueOrThrow({
    where: { email: session.user.email },
    include: {
      role: true,
      universityPartner: {
        include: {
          university: {
            include: {
              colleges: true
            }
          }
        }
      }
    }
  });

  // Verify authorization
  const isAuthorized = ["UNIVERSITY_PARTNER", "ADMIN", "SUPER_ADMIN"].includes(user.role?.name || "");
  if (!isAuthorized) {
    redirect("/");
  }

  // Handle case where partner profile is not fully configured yet
  const partnerProfile = user.universityPartner;
  let university = partnerProfile?.university;

  // For testing: Admin/Super Admin can view the dashboard of the first university if they don't have a partner profile
  if (!university && ["ADMIN", "SUPER_ADMIN"].includes(user.role?.name || "")) {
    const firstUni = await prisma.university.findFirst({
      include: { colleges: true }
    });
    if (firstUni) {
      university = firstUni;
    }
  }

  if (!university) {
    return (
      <div className="container py-12">
        <Card className="max-w-2xl mx-auto border-dashed">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold">Partner Account Pending Setup</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Hello, {user.name || "Partner"}. Your user profile role is set as a University Partner, but your account is not yet linked to an active University.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              Please contact the site administrator to map your profile to a university in the CRM. Once mapped, you will see real-time lead feeds, conversions, and college analytics.
            </p>
            <Button asChild className="mt-2">
              <Link href="/">Return to Homepage</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const collegeIds = university.colleges.map((c) => c.id);

  // Retrieve leads filtered by query
  const leads = await prisma.lead.findMany({
    where: {
      AND: [
        {
          interestedInstitutionId: { in: collegeIds }
        },
        searchQuery
          ? {
              OR: [
                { fullName: { contains: searchQuery, mode: "insensitive" } },
                { email: { contains: searchQuery, mode: "insensitive" } },
                { phone: { contains: searchQuery, mode: "insensitive" } },
                { preferredCourse: { contains: searchQuery, mode: "insensitive" } },
                { currentCity: { contains: searchQuery, mode: "insensitive" } }
              ]
            }
          : {},
        filterStatus ? { status: filterStatus as LeadStatus } : {}
      ]
    },
    include: {
      interestedInstitution: {
        select: { name: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  // Calculate Metrics
  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === "NEW").length;
  const qualifiedLeads = leads.filter((l) => l.status === "QUALIFIED").length;
  const convertedLeads = leads.filter((l) => l.status === "ENROLLED").length;
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : "0.0";

  return (
    <div className="container py-8 space-y-8">
      {/* Partner Banner Header */}
      <section className="rounded-lg border bg-gradient-to-br from-primary/5 via-muted/40 to-background p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">University Partner Portal</Badge>
              <Badge variant="outline">{partnerProfile?.position || "Representative"}</Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl">{university.name} Dashboard</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Monitor admissions inquiries, counselor qualifying notes, and enrollment metrics for governing colleges.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/colleges">
              Preview College Profiles
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-muted-foreground/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
            <p className="text-xs text-muted-foreground mt-1">Total leads assigned to university colleges</p>
          </CardContent>
        </Card>
        <Card className="border-muted-foreground/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Leads</CardTitle>
            <UserPlus className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{newLeads}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting counselor qualification contact</p>
          </CardContent>
        </Card>
        <Card className="border-muted-foreground/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qualified Leads</CardTitle>
            <UserCheck className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sky-600">{qualifiedLeads}</div>
            <p className="text-xs text-muted-foreground mt-1">Vetted and ready for partner admissions review</p>
          </CardContent>
        </Card>
        <Card className="border-muted-foreground/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">{convertedLeads} students enrolled successfully</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Leads Table Card (Left span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-muted-foreground/10">
            <CardHeader>
              <CardTitle>Admissions Lead Registry</CardTitle>
              <CardDescription>
                Real-time student interest catalog matching this university&apos;s affiliates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search & Filters */}
              <form method="GET" action="/partner" className="grid gap-3 sm:grid-cols-[1fr_180px_90px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    name="q"
                    defaultValue={searchQuery}
                    placeholder="Search by name, city, course..."
                    className="pl-9"
                  />
                </div>
                <select
                  name="status"
                  defaultValue={filterStatus}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="NEW">New</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="QUALIFIED">Qualified</option>
                  <option value="ENROLLED">Converted</option>
                  <option value="LOST">Lost</option>
                </select>
                <Button type="submit">
                  <Filter className="h-4 w-4 mr-1.5" />
                  Filter
                </Button>
              </form>

              {/* Table */}
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm border-collapse text-left">
                  <thead className="bg-muted/50 font-semibold text-muted-foreground border-b text-xs uppercase">
                    <tr>
                      <th className="p-3">Student</th>
                      <th className="p-3">Course / Target</th>
                      <th className="p-3">Location</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Inquired On</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-muted/10 transition-colors">
                        <td className="p-3">
                          <p className="font-semibold text-slate-800">{lead.fullName}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{lead.email}</p>
                        </td>
                        <td className="p-3">
                          <p className="font-medium">{lead.preferredCourse}</p>
                          <p className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                            {lead.interestedInstitution?.name || "Multiple Selection"}
                          </p>
                        </td>
                        <td className="p-3 text-muted-foreground">{lead.currentCity}</td>
                        <td className="p-3">
                          <Badge
                            variant={
                              lead.status === "ENROLLED"
                                ? "default"
                                : lead.status === "QUALIFIED"
                                ? "secondary"
                                : lead.status === "NEW"
                                ? "destructive"
                                : "outline"
                            }
                            className="text-[10px] uppercase font-bold tracking-wide"
                          >
                            {lead.status.toLowerCase()}
                          </Badge>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground">
                          {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                          })}
                        </td>
                      </tr>
                    ))}

                    {leads.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground italic">
                          No inquiries found matching search criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Governed Colleges (Right span 1) */}
        <div className="space-y-6">
          <Card className="border-muted-foreground/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Affiliated Colleges
              </CardTitle>
              <CardDescription>
                Colleges governed by {university.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {university.colleges.map((college) => (
                <div key={college.id} className="p-3 border rounded-lg hover:border-primary/20 transition-all">
                  <h4 className="font-semibold text-sm leading-tight text-slate-800">
                    <Link href={`/colleges/${college.slug}`} className="hover:text-primary transition-colors">
                      {college.name}
                    </Link>
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 capitalize">
                    {college.type?.toLowerCase() || "college"} · {college.city || "India"}
                  </p>
                </div>
              ))}

              {university.colleges.length === 0 && (
                <p className="text-xs text-muted-foreground italic">
                  No colleges currently affiliated with this university.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
