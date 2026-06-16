/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Building2, 
  GraduationCap, 
  Trophy, 
  Globe, 
  FileText,
  Plus,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type InstitutionEditFormProps = {
  initialData: any;
  isNew: boolean;
};

type TabType = "general" | "academics" | "rankings_placements" | "admission_facilities" | "seo";

export function InstitutionEditForm({ initialData, isNew }: InstitutionEditFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Initializing state fields
  const [form, setForm] = useState({
    id: initialData?.id || `clg_${Date.now().toString(36)}`,
    slug: initialData?.slug || "",
    name: initialData?.name || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    ownership: initialData?.ownership || "Private",
    ranking: initialData?.ranking || 0,
    rating: initialData?.rating || 4.5,
    fees: initialData?.fees || "",
    averageSalary: initialData?.averageSalary || "",
    highestSalary: initialData?.highestSalary || "",
    placementRate: initialData?.placementRate || "",
    seats: initialData?.seats || 180,
    hostel: initialData?.hostel || "",
    scholarships: initialData?.scholarships || "",
    eligibility: initialData?.eligibility || "",
    admission: initialData?.admission || "",
    description: initialData?.description || "",

    // Expanded base fields
    aisheCode: initialData?.aisheCode || "",
    shortName: initialData?.shortName || "",
    type: initialData?.type || "COLLEGE",
    approval: initialData?.approval || "",
    affiliation: initialData?.affiliation || "",
    establishedYear: initialData?.establishedYear || "",
    campusSize: initialData?.campusSize || "",
    genderAccepted: initialData?.genderAccepted || "Co-Ed",
    address: initialData?.address || "",
    pincode: initialData?.pincode || "",
    website: initialData?.website || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    logoUrl: initialData?.logoUrl || "",
    imageUrl: initialData?.imageUrl || "",
    brochureUrl: initialData?.brochureUrl || "",
    verificationStatus: initialData?.verificationStatus || "VERIFIED",
    sourceName: initialData?.sourceName || "Official Website",
    sourceUrl: initialData?.sourceUrl || "",
    published: initialData?.published !== undefined ? initialData?.published : true,

    // Placements / rankings / admissions / SEO
    topRecruiters: initialData?.topRecruiters || "",
    nirfCategory: initialData?.nirfCategory || "",
    nirfScore: initialData?.nirfScore || "",
    otherRanking: initialData?.otherRanking || "",
    rankingSource: initialData?.rankingSource || "",
    selectionCriteria: initialData?.selectionCriteria || "",
    entranceExams: initialData?.entranceExams || "",
    cutoffInfo: initialData?.cutoffInfo || "",
    applicationMode: initialData?.applicationMode || "",
    counsellingProcess: initialData?.counsellingProcess || "",
    metaTitle: initialData?.metaTitle || "",
    metaDescription: initialData?.metaDescription || ""
  });

  // Dynamic lists fields
  const [courses, setCourses] = useState<string[]>(initialData?.courses || []);
  const [newCourse, setNewCourse] = useState("");
  const [modes, setModes] = useState<string[]>(initialData?.modes || ["Offline"]);

  const [faqs, setFaqs] = useState<Array<{ q: string; a: string }>>(
    (initialData?.faqJson && Array.isArray(initialData.faqJson)) ? initialData.faqJson : []
  );
  const [highlights, setHighlights] = useState<Array<{ title: string; value: string }>>(
    (initialData?.highlightsJson && Array.isArray(initialData.highlightsJson)) ? initialData.highlightsJson : []
  );
  const [importantDates, setImportantDates] = useState<Array<{ event: string; date: string }>>(
    (initialData?.importantDatesJson && Array.isArray(initialData.importantDatesJson)) ? initialData.importantDatesJson : []
  );

  const updateField = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const addCourse = () => {
    if (newCourse.trim() && !courses.includes(newCourse.trim())) {
      setCourses(prev => [...prev, newCourse.trim()]);
      setNewCourse("");
    }
  };

  const removeCourse = (index: number) => {
    setCourses(prev => prev.filter((_, idx) => idx !== index));
  };

  const toggleMode = (m: string) => {
    setModes(prev => {
      if (prev.includes(m)) {
        return prev.filter(item => item !== m);
      }
      return [...prev, m];
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    // Form validation
    if (!form.name || !form.city || !form.state) {
      setError("Please fill out Name, City, and State.");
      setSaving(false);
      return;
    }

    const payload = {
      ...form,
      establishedYear: form.establishedYear ? Number(form.establishedYear) : undefined,
      courses,
      modes,
      faqJson: faqs,
      highlightsJson: highlights,
      importantDatesJson: importantDates
    };

    try {
      const endpoint = isNew 
        ? "/api/v1/admin/colleges" 
        : `/api/v1/admin/colleges/${form.id}`;
      
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const responseData = await res.json();
      if (!res.ok) {
        setError(responseData?.error?.message || "Failed to save college details.");
      } else {
        setSuccess("Institution saved successfully!");
        if (isNew) {
          router.push("/internal/admin/institutions");
        } else {
          router.refresh();
        }
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => router.push("/internal/admin/institutions")} className="shrink-0 h-9 w-9 border-muted-foreground/30">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-card-foreground">
              {isNew ? "Create New Institution" : `Edit: ${form.name}`}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isNew ? "Fill in the basic info to initialize the institution record." : "Update data nodes and preview relations."}
            </p>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isNew ? "Create Institution" : "Save Changes"}
        </Button>
      </div>

      {/* Tabs Switcher Navigation */}
      <div className="flex border-b border-muted-foreground/20 overflow-x-auto pb-px">
        {[
          { id: "general", label: "General Info", icon: Building2 },
          { id: "academics", label: "Academics & Courses", icon: GraduationCap },
          { id: "rankings_placements", label: "Rankings & Placements", icon: Trophy },
          { id: "admission_facilities", label: "Admission & Facilities", icon: FileText },
          { id: "seo", label: "SEO & Highlights", icon: Globe }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Feedback messages */}
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive font-medium">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 font-medium">
          {success}
        </div>
      )}

      {/* Tab Panels */}
      <Card className="border border-muted-foreground/15 shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* 1. GENERAL TAB */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                  <div className="sm:col-span-2 space-y-2">
                    <Label htmlFor="name">Institution Name *</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="e.g., Indian Institute of Technology Delhi"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug (Unique URL Part) *</Label>
                    <Input
                      id="slug"
                      value={form.slug}
                      onChange={(e) => updateField("slug", e.target.value)}
                      placeholder="e.g., iit-delhi"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shortName">Short Name</Label>
                    <Input
                      id="shortName"
                      value={form.shortName}
                      onChange={(e) => updateField("shortName", e.target.value)}
                      placeholder="e.g., IITD"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aisheCode">AISHE Code</Label>
                    <Input
                      id="aisheCode"
                      value={form.aisheCode}
                      onChange={(e) => updateField("aisheCode", e.target.value)}
                      placeholder="e.g., C-41235"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Institution Type</Label>
                    <select
                      id="type"
                      value={form.type}
                      onChange={(e) => updateField("type", e.target.value)}
                      className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
                    >
                      <option value="COLLEGE">COLLEGE</option>
                      <option value="UNIVERSITY">UNIVERSITY</option>
                      <option value="INSTITUTE">INSTITUTE</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ownership">Ownership</Label>
                    <select
                      id="ownership"
                      value={form.ownership}
                      onChange={(e) => updateField("ownership", e.target.value)}
                      className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
                    >
                      <option value="Government">Government</option>
                      <option value="Private">Private</option>
                      <option value="Deemed">Deemed</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="establishedYear">Established Year</Label>
                    <Input
                      id="establishedYear"
                      type="number"
                      value={form.establishedYear}
                      onChange={(e) => updateField("establishedYear", e.target.value)}
                      placeholder="e.g., 1961"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="campusSize">Campus Size</Label>
                    <Input
                      id="campusSize"
                      value={form.campusSize}
                      onChange={(e) => updateField("campusSize", e.target.value)}
                      placeholder="e.g., 320 Acres"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="genderAccepted">Gender Accepted</Label>
                    <select
                      id="genderAccepted"
                      value={form.genderAccepted}
                      onChange={(e) => updateField("genderAccepted", e.target.value)}
                      className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
                    >
                      <option value="Co-Ed">Co-Ed</option>
                      <option value="Boys Only">Boys Only</option>
                      <option value="Girls Only">Girls Only</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="approval">Approval (UGC/AICTE/MCI)</Label>
                    <Input
                      id="approval"
                      value={form.approval}
                      onChange={(e) => updateField("approval", e.target.value)}
                      placeholder="e.g., UGC, AICTE"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="affiliation">Affiliated University</Label>
                    <Input
                      id="affiliation"
                      value={form.affiliation}
                      onChange={(e) => updateField("affiliation", e.target.value)}
                      placeholder="e.g., N/A"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="published">Publish Status</Label>
                    <select
                      id="published"
                      value={form.published ? "true" : "false"}
                      onChange={(e) => updateField("published", e.target.value === "true")}
                      className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
                    >
                      <option value="true">Published (Live)</option>
                      <option value="false">Draft (Hidden)</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-muted/20 my-6"></div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website Link</Label>
                    <Input
                      id="website"
                      value={form.website}
                      onChange={(e) => updateField("website", e.target.value)}
                      placeholder="e.g., https://iitd.ac.in"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Official Email</Label>
                    <Input
                      id="email"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="e.g., info@iitd.ac.in"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Contact</Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="e.g., 011-26591000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brochureUrl">Brochure Link</Label>
                    <Input
                      id="brochureUrl"
                      value={form.brochureUrl}
                      onChange={(e) => updateField("brochureUrl", e.target.value)}
                      placeholder="Brochure PDF URL"
                    />
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={form.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      placeholder="e.g., New Delhi"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={form.state}
                      onChange={(e) => updateField("state", e.target.value)}
                      placeholder="e.g., Delhi"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      value={form.pincode}
                      onChange={(e) => updateField("pincode", e.target.value)}
                      placeholder="e.g., 110016"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Full Street Address</Label>
                  <Input
                    id="address"
                    value={form.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    placeholder="e.g., Hauz Khas, New Delhi"
                  />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <Input
                      id="logoUrl"
                      value={form.logoUrl}
                      onChange={(e) => updateField("logoUrl", e.target.value)}
                      placeholder="e.g., https://example.com/logo.png"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Campus Cover Image URL</Label>
                    <Input
                      id="imageUrl"
                      value={form.imageUrl}
                      onChange={(e) => updateField("imageUrl", e.target.value)}
                      placeholder="e.g., https://example.com/cover.jpg"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">About Description (Public View)</Label>
                  <textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="Detailed history and description about the university..."
                    rows={6}
                    className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              </div>
            )}

            {/* 2. ACADEMICS TAB */}
            {activeTab === "academics" && (
              <div className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-3">
                    <Label>Learning Modes Supported</Label>
                    <div className="flex gap-4">
                      {["Online", "Offline", "Distance"].map((m) => (
                        <label key={m} className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={modes.includes(m)}
                            onChange={() => toggleMode(m)}
                            className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                          />
                          {m}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fees">General Fee Range</Label>
                    <Input
                      id="fees"
                      value={form.fees}
                      onChange={(e) => updateField("fees", e.target.value)}
                      placeholder="e.g., INR 8,00,000"
                    />
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="seats">Total Capacity Seats</Label>
                    <Input
                      id="seats"
                      type="number"
                      value={form.seats}
                      onChange={(e) => updateField("seats", Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eligibility">Basic Eligibility Criteria</Label>
                    <Input
                      id="eligibility"
                      value={form.eligibility}
                      onChange={(e) => updateField("eligibility", e.target.value)}
                      placeholder="e.g., 10+2 with 75% aggregate"
                    />
                  </div>
                </div>

                {/* Courses Admin list */}
                <div className="space-y-4 border rounded-lg p-5 bg-card/50">
                  <div>
                    <h3 className="font-bold text-base text-card-foreground">Courses List</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Add, delete, or manage standard degree programs run by the institution.
                    </p>
                  </div>

                  <div className="flex gap-3 max-w-md">
                    <Input
                      placeholder="Add course name (e.g., B.Tech in CSE)"
                      value={newCourse}
                      onChange={(e) => setNewCourse(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCourse();
                        }
                      }}
                    />
                    <Button type="button" onClick={addCourse}>
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>

                  {courses.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No courses added. Standard courses list is empty.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {courses.map((course, idx) => (
                        <Badge key={idx} variant="secondary" className="pl-3 pr-1.5 py-1 flex items-center gap-1.5 font-normal text-sm">
                          {course}
                          <button
                            type="button"
                            onClick={() => removeCourse(idx)}
                            className="rounded-full hover:bg-muted p-0.5 text-muted-foreground hover:text-destructive shrink-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. RANKINGS & PLACEMENTS TAB */}
            {activeTab === "rankings_placements" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-base text-card-foreground">Placements Stats</h3>
                  <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4 mt-3">
                    <div className="space-y-2">
                      <Label htmlFor="averageSalary">Average Salary Package</Label>
                      <Input
                        id="averageSalary"
                        value={form.averageSalary}
                        onChange={(e) => updateField("averageSalary", e.target.value)}
                        placeholder="e.g., 25.8 LPA"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="highestSalary">Highest Salary Package</Label>
                      <Input
                        id="highestSalary"
                        value={form.highestSalary}
                        onChange={(e) => updateField("highestSalary", e.target.value)}
                        placeholder="e.g., 1.2 Crore PA"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="placementRate">Placement Percentage</Label>
                      <Input
                        id="placementRate"
                        value={form.placementRate}
                        onChange={(e) => updateField("placementRate", e.target.value)}
                        placeholder="e.g., 92%"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topRecruiters">Top Hiring Recruiters (Semicolon separated)</Label>
                  <textarea
                    id="topRecruiters"
                    value={form.topRecruiters}
                    onChange={(e) => updateField("topRecruiters", e.target.value)}
                    placeholder="e.g., Microsoft; Google; Amazon; Goldman Sachs"
                    rows={3}
                    className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>

                <div className="border-t border-muted/20 my-6"></div>

                <div>
                  <h3 className="font-bold text-base text-card-foreground">National & International Rankings</h3>
                  <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 mt-3">
                    <div className="space-y-2">
                      <Label htmlFor="ranking">NIRF Engineering/Overall Rank</Label>
                      <Input
                        id="ranking"
                        type="number"
                        value={form.ranking}
                        onChange={(e) => updateField("ranking", Number(e.target.value))}
                        placeholder="e.g., 2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nirfCategory">NIRF Rank Category</Label>
                      <Input
                        id="nirfCategory"
                        value={form.nirfCategory}
                        onChange={(e) => updateField("nirfCategory", e.target.value)}
                        placeholder="e.g., Engineering"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nirfScore">NIRF Score</Label>
                      <Input
                        id="nirfScore"
                        value={form.nirfScore}
                        onChange={(e) => updateField("nirfScore", e.target.value)}
                        placeholder="e.g., 82.5"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="otherRanking">Other Category Rankings (QS World, Times Higher Ed)</Label>
                    <Input
                      id="otherRanking"
                      value={form.otherRanking}
                      onChange={(e) => updateField("otherRanking", e.target.value)}
                      placeholder="e.g., QS World Rank #197"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rankingSource">Ranking Citation Source</Label>
                    <Input
                      id="rankingSource"
                      value={form.rankingSource}
                      onChange={(e) => updateField("rankingSource", e.target.value)}
                      placeholder="e.g., NIRF / QS World Rankings"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. ADMISSIONS & FACILITIES TAB */}
            {activeTab === "admission_facilities" && (
              <div className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="admission">Admission Overview Description</Label>
                    <textarea
                      id="admission"
                      value={form.admission}
                      onChange={(e) => updateField("admission", e.target.value)}
                      placeholder="Summary steps on how to register and enroll..."
                      rows={4}
                      className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="selectionCriteria">Selection Criteria details</Label>
                    <textarea
                      id="selectionCriteria"
                      value={form.selectionCriteria}
                      onChange={(e) => updateField("selectionCriteria", e.target.value)}
                      placeholder="Detailed weightages (e.g., Entrance Exam + AWT + PI)..."
                      rows={4}
                      className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="entranceExams">Entrance Exams Accepted</Label>
                    <Input
                      id="entranceExams"
                      value={form.entranceExams}
                      onChange={(e) => updateField("entranceExams", e.target.value)}
                      placeholder="e.g., JEE Advanced; GATE"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="applicationMode">Application Submission Mode</Label>
                    <Input
                      id="applicationMode"
                      value={form.applicationMode}
                      onChange={(e) => updateField("applicationMode", e.target.value)}
                      placeholder="e.g., Online"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cutoffInfo">Branch Cutoffs Info</Label>
                    <Input
                      id="cutoffInfo"
                      value={form.cutoffInfo}
                      onChange={(e) => updateField("cutoffInfo", e.target.value)}
                      placeholder="e.g., CS Closing Rank ~60"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="counsellingProcess">Counselling & Seat Allocation Process</Label>
                  <textarea
                    id="counsellingProcess"
                    value={form.counsellingProcess}
                    onChange={(e) => updateField("counsellingProcess", e.target.value)}
                    placeholder="Centralized counseling bodies (e.g., JoSAA/CSAB)..."
                    rows={3}
                    className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>

                <div className="border-t border-muted/20 my-6"></div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="hostel">Hostel Accommodation details</Label>
                    <textarea
                      id="hostel"
                      value={form.hostel}
                      onChange={(e) => updateField("hostel", e.target.value)}
                      placeholder="Hostel blocks, mess description, and seat availability..."
                      rows={3}
                      className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scholarships">Scholarship details</Label>
                    <textarea
                      id="scholarships"
                      value={form.scholarships}
                      onChange={(e) => updateField("scholarships", e.target.value)}
                      placeholder="Merit-cum-means assistance, corporate grants, fee waivers..."
                      rows={3}
                      className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 5. SEO & JSON TAB */}
            {activeTab === "seo" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-base text-card-foreground">Search Engine Optimization (SEO)</h3>
                  <div className="grid gap-6 sm:grid-cols-2 mt-3">
                    <div className="space-y-2">
                      <Label htmlFor="metaTitle">Custom Meta Title</Label>
                      <Input
                        id="metaTitle"
                        value={form.metaTitle}
                        onChange={(e) => updateField("metaTitle", e.target.value)}
                        placeholder="Title for Google Search (keep under 60 chars)"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="metaDescription">Custom Meta Description</Label>
                      <textarea
                        id="metaDescription"
                        value={form.metaDescription}
                        onChange={(e) => updateField("metaDescription", e.target.value)}
                        placeholder="Brief summary matching search results (keep under 160 chars)"
                        rows={3}
                        className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-muted/20 my-6"></div>

                {/* FAQs JSON Management */}
                <div className="space-y-4 border rounded-lg p-5 bg-card/50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-base">FAQ Schema JSON-LD Data</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        These Q&As will be injected as Google FAQ Schema for richer search results.
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setFaqs(prev => [...prev, { q: "", a: "" }])}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add FAQ
                    </Button>
                  </div>

                  {faqs.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No FAQs configured.</p>
                  ) : (
                    <div className="space-y-3">
                      {faqs.map((faq, index) => (
                        <div key={index} className="flex gap-4 items-start border-b pb-3 border-dashed">
                          <div className="flex-1 space-y-2">
                            <Input
                              placeholder="Question"
                              value={faq.q}
                              onChange={(e) => {
                                const newF = [...faqs];
                                newF[index].q = e.target.value;
                                setFaqs(newF);
                              }}
                            />
                            <Input
                              placeholder="Answer"
                              value={faq.a}
                              onChange={(e) => {
                                const newF = [...faqs];
                                newF[index].a = e.target.value;
                                setFaqs(newF);
                              }}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setFaqs(prev => prev.filter((_, i) => i !== index))}
                            className="text-destructive hover:bg-destructive/10 shrink-0 mt-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Highlights JSON Management */}
                <div className="space-y-4 border rounded-lg p-5 bg-card/50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-base">Fact Sheet Highlights</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Add key statistics (e.g. Student-Faculty Ratio: 1:10) for summary widgets.
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setHighlights(prev => [...prev, { title: "", value: "" }])}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Highlight
                    </Button>
                  </div>

                  {highlights.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No highlights configured.</p>
                  ) : (
                    <div className="space-y-3">
                      {highlights.map((item, index) => (
                        <div key={index} className="flex gap-4 items-center">
                          <Input
                            placeholder="Title (e.g., Campus Area)"
                            value={item.title}
                            onChange={(e) => {
                              const newH = [...highlights];
                              newH[index].title = e.target.value;
                              setHighlights(newH);
                            }}
                          />
                          <Input
                            placeholder="Value (e.g., 320 Acres)"
                            value={item.value}
                            onChange={(e) => {
                              const newH = [...highlights];
                              newH[index].value = e.target.value;
                              setHighlights(newH);
                            }}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setHighlights(prev => prev.filter((_, i) => i !== index))}
                            className="text-destructive hover:bg-destructive/10 shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Important Dates JSON */}
                <div className="space-y-4 border rounded-lg p-5 bg-card/50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-base">Admission & Exam Dates</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Important dates regarding applications or counseling schedules.
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setImportantDates(prev => [...prev, { event: "", date: "" }])}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Date
                    </Button>
                  </div>

                  {importantDates.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No dates configured.</p>
                  ) : (
                    <div className="space-y-3">
                      {importantDates.map((item, index) => (
                        <div key={index} className="flex gap-4 items-center">
                          <Input
                            placeholder="Event description (e.g. JEE Main Exam)"
                            value={item.event}
                            onChange={(e) => {
                              const newD = [...importantDates];
                              newD[index].event = e.target.value;
                              setImportantDates(newD);
                            }}
                          />
                          <Input
                            placeholder="Date text (e.g. May 24, 2026)"
                            value={item.date}
                            onChange={(e) => {
                              const newD = [...importantDates];
                              newD[index].date = e.target.value;
                              setImportantDates(newD);
                            }}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setImportantDates(prev => prev.filter((_, i) => i !== index))}
                            className="text-destructive hover:bg-destructive/10 shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Form actions footer */}
            <div className="flex items-center justify-end gap-3 border-t border-muted/20 pt-6">
              <Button type="button" variant="outline" onClick={() => router.push("/internal/admin/institutions")}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Details
                  </span>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
