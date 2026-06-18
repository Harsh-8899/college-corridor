"use client";

import { useState } from "react";
import { 
  Building2, 
  MapPin, 
  Trash2, 
  User, 
  Bookmark, 
  GraduationCap, 
  History, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowRight,
  ExternalLink,
  Loader2,
  Calendar,
  Layers
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type SavedInstitutionData = {
  id: string;
  institutionId: string;
  status: string;
  createdAt: Date | string;
  institution: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    city: string;
    state: string;
    ownership: string | null;
  };
};

type AdmissionChanceData = {
  id: string;
  course: string;
  admissionChance: string;
  status: string;
  createdAt: Date | string;
  institution: {
    name: string;
    logoUrl: string | null;
    slug: string;
  };
};

type UserData = {
  id: string;
  name: string | null;
  fullName: string | null;
  email: string;
  phone: string | null;
  phoneVerified: boolean;
  emailVerified: Date | string | null;
  city: string | null;
  state: string | null;
  status: string;
  createdAt: Date | string;
};

type DashboardClientProps = {
  initialUser: UserData;
  initialShortlist: SavedInstitutionData[];
  initialChances: AdmissionChanceData[];
};

export function DashboardClient({ initialUser, initialShortlist, initialChances }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"shortlist" | "chances" | "profile">("shortlist");
  const [shortlist, setShortlist] = useState<SavedInstitutionData[]>(initialShortlist);
  const [chances] = useState<AdmissionChanceData[]>(initialChances);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Update shortlist item status
  async function handleStatusChange(institutionId: string, newStatus: string) {
    setUpdatingId(institutionId);
    setError(null);
    try {
      const res = await fetch("/api/v1/user/saved-universities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ institutionId, status: newStatus })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error?.message || "Failed to update status.");
        return;
      }

      setShortlist(prev =>
        prev.map(item =>
          item.institutionId === institutionId
            ? { ...item, status: newStatus }
            : item
        )
      );
    } catch {
      setError("Failed to reach server. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  }

  // Delete shortlist item
  async function handleDelete(institutionId: string) {
    setUpdatingId(institutionId);
    setError(null);
    try {
      const res = await fetch(`/api/v1/user/saved-universities?institutionId=${institutionId}`, {
        method: "DELETE"
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error?.message || "Failed to remove university.");
        return;
      }

      setShortlist(prev => prev.filter(item => item.institutionId !== institutionId));
    } catch {
      setError("Failed to reach server. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  }

  // Color mappings for admission chances
  const getChanceBadgeColor = (chance: string) => {
    switch (chance) {
      case "HIGH_CHANCE":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
      case "MODERATE_CHANCE":
        return "bg-amber-50 text-amber-700 border-amber-200/60";
      case "LOW_CHANCE":
        return "bg-rose-50 text-rose-700 border-rose-200/60";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200/60";
    }
  };

  const getChanceLabel = (chance: string) => {
    switch (chance) {
      case "HIGH_CHANCE":
        return "High Chance";
      case "MODERATE_CHANCE":
        return "Moderate Chance";
      case "LOW_CHANCE":
        return "Low Chance";
      default:
        return "Expert Review Needed";
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner section */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
        <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -z-10" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <User className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Welcome back, {initialUser.fullName || initialUser.name || "Student"}!
              </h1>
              <p className="text-slate-500 text-sm mt-1">{initialUser.email}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <CheckCircle2 className="h-3 w-3" /> Email Verified
                </span>
                {initialUser.phoneVerified ? (
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <CheckCircle2 className="h-3 w-3" /> Phone Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                    <AlertTriangle className="h-3 w-3" /> Phone Unverified
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/colleges">Browse Colleges</Link>
            </Button>
            <Button asChild size="sm" className="bg-[#1D4ED8] hover:bg-blue-700 text-white">
              <Link href="/check-admission-chances">Check Chances Now</Link>
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 border border-rose-100 p-4 text-sm font-medium text-rose-600">
          {error}
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("shortlist")}
            className={`flex items-center gap-2 border-b-2 py-4 px-1 text-sm font-medium transition-all ${
              activeTab === "shortlist"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            <Bookmark className="h-4 w-4" />
            My Shortlist ({shortlist.length})
          </button>
          <button
            onClick={() => setActiveTab("chances")}
            className={`flex items-center gap-2 border-b-2 py-4 px-1 text-sm font-medium transition-all ${
              activeTab === "chances"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            <History className="h-4 w-4" />
            Admission Chance History ({chances.length})
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 border-b-2 py-4 px-1 text-sm font-medium transition-all ${
              activeTab === "profile"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            <User className="h-4 w-4" />
            My Profile
          </button>
        </nav>
      </div>

      {/* Shortlist Tab Content */}
      {activeTab === "shortlist" && (
        <div className="space-y-6">
          {shortlist.length === 0 ? (
            <Card className="text-center py-12 border-slate-200">
              <CardContent className="space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <Bookmark className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-lg">No saved colleges</CardTitle>
                  <CardDescription>
                    Explore institutions and save them to track your interested list, shortlists, or applications.
                  </CardDescription>
                </div>
                <Button asChild className="bg-[#1D4ED8] hover:bg-blue-700 text-white">
                  <Link href="/colleges" className="gap-2">
                    Find Colleges <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {shortlist.map(item => (
                <Card key={item.id} className="group overflow-hidden border-slate-200 bg-white hover:shadow-md transition-all">
                  <CardHeader className="flex flex-row items-start gap-4 border-b pb-4 bg-slate-50/50">
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-white border border-slate-100">
                      {item.institution.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={item.institution.logoUrl} 
                          alt={`${item.institution.name} logo`}
                          className="h-10 w-10 object-contain"
                        />
                      ) : (
                        <Building2 className="h-6 w-6 text-slate-400" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <Link 
                        href={`/colleges/${item.institution.slug}`}
                        className="font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1 flex items-center gap-1.5"
                      >
                        {item.institution.name}
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                      <div className="flex items-center gap-1 text-slate-500 text-xs">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{item.institution.city}, {item.institution.state}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Ownership</span>
                        <p className="text-slate-700 text-xs font-semibold capitalize">
                          {item.institution.ownership?.toLowerCase() || "N/A"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Added On</span>
                        <p className="text-slate-700 text-xs font-medium">
                          {new Date(item.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-4 flex items-center justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <label htmlFor={`status-${item.id}`} className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                          Shortlist Status
                        </label>
                        <select
                          id={`status-${item.id}`}
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.institutionId, e.target.value)}
                          disabled={updatingId === item.institutionId}
                          className="h-8.5 w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700"
                        >
                          <option value="INTERESTED">Interested</option>
                          <option value="SHORTLISTED">Shortlisted</option>
                          <option value="APPLIED">Applied</option>
                        </select>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.institutionId)}
                        disabled={updatingId === item.institutionId}
                        className="mt-5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded"
                        title="Remove from shortlist"
                      >
                        {updatingId === item.institutionId ? (
                          <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
                        ) : (
                          <Trash2 className="h-4.5 w-4.5" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Chance History Tab Content */}
      {activeTab === "chances" && (
        <div className="space-y-6">
          {chances.length === 0 ? (
            <Card className="text-center py-12 border-slate-200">
              <CardContent className="space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <History className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-lg">No chances checked</CardTitle>
                  <CardDescription>
                    You haven&apos;t checked your admission chances for any course or college yet.
                  </CardDescription>
                </div>
                <Button asChild className="bg-[#1D4ED8] hover:bg-blue-700 text-white">
                  <Link href="/check-admission-chances" className="gap-2">
                    Check Chances Now <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden border-slate-200 shadow-sm bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                      <th className="py-4 px-6">University</th>
                      <th className="py-4 px-6">Course</th>
                      <th className="py-4 px-6">Admission Chance</th>
                      <th className="py-4 px-6">Evaluation Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm text-slate-700">
                    {chances.map(chance => (
                      <tr key={chance.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6 font-semibold text-slate-900">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded bg-slate-50 border border-slate-100">
                              {chance.institution.logoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img 
                                  src={chance.institution.logoUrl} 
                                  alt=""
                                  className="h-6 w-6 object-contain"
                                />
                              ) : (
                                <Building2 className="h-4 w-4 text-slate-400" />
                              )}
                            </div>
                            <Link href={`/colleges/${chance.institution.slug}`} className="hover:underline hover:text-primary">
                              {chance.institution.name}
                            </Link>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-medium capitalize">{chance.course}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center border rounded-full px-2.5 py-0.5 text-xs font-semibold ${getChanceBadgeColor(chance.admissionChance)}`}>
                            {getChanceLabel(chance.admissionChance)}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-500 text-xs">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            {new Date(chance.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Profile Tab Content */}
      {activeTab === "profile" && (
        <div className="grid gap-8 md:grid-cols-3">
          {/* Details Card */}
          <Card className="md:col-span-2 border-slate-200 shadow-sm bg-white">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Profile Information
              </CardTitle>
              <CardDescription>Official student registration credentials and locations.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Full Name</span>
                  <p className="text-slate-800 font-semibold text-sm">
                    {initialUser.fullName || initialUser.name || "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Email Address</span>
                  <p className="text-slate-800 font-semibold text-sm">{initialUser.email}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Mobile Number</span>
                  <p className="text-slate-800 font-semibold text-sm">{initialUser.phone || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Account Status</span>
                  <div className="mt-1">
                    <span className="inline-flex items-center rounded bg-blue-50 text-blue-700 px-2 py-0.5 text-xs font-semibold border border-blue-100 capitalize">
                      {initialUser.status.toLowerCase().replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">City</span>
                  <p className="text-slate-800 font-semibold text-sm">{initialUser.city || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">State</span>
                  <p className="text-slate-800 font-semibold text-sm">{initialUser.state || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Status Card */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" /> Verification Status
              </CardTitle>
              <CardDescription>Security and verification settings.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">Email Verification</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Required for dashboard login</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <CheckCircle2 className="h-3 w-3" /> Verified
                  </span>
                </div>

                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">Phone Verification</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Required to apply for admissions</p>
                  </div>
                  {initialUser.phoneVerified ? (
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <CheckCircle2 className="h-3 w-3" /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                      <XCircle className="h-3.5 w-3.5" /> Pending
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">Registered Since</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Account creation timestamp</p>
                  </div>
                  <span className="text-xs font-medium text-slate-600">
                    {new Date(initialUser.createdAt).toLocaleDateString("en-IN", {
                      month: "short",
                      year: "numeric"
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
