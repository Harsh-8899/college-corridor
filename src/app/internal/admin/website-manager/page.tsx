"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  BookOpen,
  HelpCircle,
  MessageSquare,
  Image as ImageIcon,
  Settings,
  Users,
  Award,
  Layers,
  Sparkles,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  FileText,
  AlertCircle,
  FileSpreadsheet,
  Globe,
  Loader2,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TabId =
  | "university"
  | "course"
  | "rules"
  | "lead"
  | "partner"
  | "seo"
  | "homepage"
  | "carousel"
  | "logos"
  | "pages"
  | "faqs"
  | "testimonials"
  | "settings";

export default function WebsiteManagerPage() {
  const [activeTab, setActiveTab] = useState<TabId>("university");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Lists state
  const [universities, setUniversities] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [carousels, setCarousels] = useState<any[]>([]);
  const [logos, setLogos] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);

  // Search state
  const [search, setSearch] = useState("");

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"create" | "edit">("create");
  const [currentItem, setCurrentItem] = useState<any>(null);

  // Loaders helper
  const triggerToast = (msg: string, type: "success" | "error") => {
    if (type === "success") {
      setSuccess(msg);
      setTimeout(() => setSuccess(""), 4000);
    } else {
      setError(msg);
      setTimeout(() => setError(""), 4000);
    }
  };

  // Fetch data dynamically on tab change
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      let endpoint = `/api/v1/admin/website-manager/${activeTab}`;
      if (activeTab === "partner") {
        endpoint = `/api/v1/admin/website-manager/universities`;
      }
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error("Failed to fetch module data.");
      const data = await res.json();

      if (activeTab === "university") {
        setUniversities(data);
      } else if (activeTab === "partner") {
        setUniversities(data.filter((u: any) => u.isPartner));
      } else if (activeTab === "course") {
        setCourses(data);
      } else if (activeTab === "rules") {
        setRules(data);
      } else if (activeTab === "lead") {
        setLeads(data);
      } else if (activeTab === "carousel") {
        setCarousels(data);
      } else if (activeTab === "logos") {
        setLogos(data);
      } else if (activeTab === "pages") {
        setPages(data);
      } else if (activeTab === "faqs") {
        setFaqs(data);
      } else if (activeTab === "testimonials") {
        setTestimonials(data);
      } else if (activeTab === "settings") {
        setSettings(data);
      }
      
      // Secondary fetches needed for dropdown lists
      if (["rules", "logos", "faqs", "testimonials"].includes(activeTab)) {
        const uRes = await fetch(`/api/v1/admin/website-manager/universities`);
        if (uRes.ok) {
          const uData = await uRes.json();
          setUniversities(uData);
        }
      }
    } catch (err: any) {
      triggerToast(err.message || "Could not fetch data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // CRUD Operations
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = `/api/v1/admin/website-manager/${activeTab === "partner" ? "universities" : activeTab}`;
      const method = modalType === "create" ? "POST" : "PUT";
      
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentItem)
      });

      if (!res.ok) throw new Error("Could not save changes.");

      triggerToast(`Successfully saved item in ${activeTab}!`, "success");
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      triggerToast(err.message || "Failed to save.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    setLoading(true);
    try {
      const endpoint = `/api/v1/admin/website-manager/${activeTab}?id=${id}`;
      const res = await fetch(endpoint, { method: "DELETE" });

      if (!res.ok) throw new Error("Could not delete item.");

      triggerToast("Deleted item successfully.", "success");
      fetchData();
    } catch (err: any) {
      triggerToast(err.message || "Failed to delete.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (item: any) => {
    setModalType("edit");
    setCurrentItem({ ...item });
    setShowModal(true);
  };

  const handleCreateClick = () => {
    setModalType("create");
    // Default initial schema mapping per dynamic model
    let initial: any = {};
    if (activeTab === "carousel") {
      initial = { title: "", subtitle: "", image: "", buttonText: "Apply Now", buttonLink: "", category: "ONLINE", displayOrder: 0, active: true };
    } else if (activeTab === "logos") {
      initial = { name: "", image: "", website: "", category: "UNIVERSITY", displayOrder: 0, active: true, collegeId: "" };
    } else if (activeTab === "pages") {
      initial = { slug: "", title: "", content: "", metaTitle: "", metaDescription: "", isPublished: true };
    } else if (activeTab === "faqs") {
      initial = { question: "", answer: "", category: "general", pageName: "home", order: 0, active: true, collegeId: "", courseId: "" };
    } else if (activeTab === "testimonials") {
      initial = { studentName: "", text: "", rating: 5, role: "", isPublished: true, order: 0, collegeId: "" };
    } else if (activeTab === "rules") {
      initial = { universityId: "", courseName: "B.Tech", specialization: "General", min10thPercentage: 60, min12thPercentage: 60, minGradPercentage: 50, entranceExam: "JEE Main", minEntranceScore: 70, eligibilityRules: "", scholarshipRules: "", alternatives: [] };
    } else if (activeTab === "course") {
      initial = { name: "", category: "Engineering", level: "UG", slug: "", duration: "4 Years", eligibility: "", description: "", averageSalary: "", careerOutcomes: "", active: true, specializations: [] };
    }
    setCurrentItem(initial);
    setShowModal(true);
  };

  // Image Upload handler within create forms
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const res = await fetch("/api/v1/upload", {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error("Image upload failed.");
      const data = await res.json();
      setCurrentItem((prev: any) => ({ ...prev, [fieldName]: data.url }));
      triggerToast("Image uploaded successfully!", "success");
    } catch (err: any) {
      triggerToast(err.message || "Failed to upload image.", "error");
    } finally {
      setLoading(false);
    }
  };

  // CSV Lead Export helper
  const handleExportCSV = () => {
    if (leads.length === 0) return;
    const headers = ["Name", "Phone", "Email", "State", "City", "Course", "10th %", "12th %", "Graduation %", "Entrance Exam", "Score", "Result", "Status", "Date"];
    const rows = leads.map(l => [
      l.fullName,
      l.phone,
      l.email,
      l.state || "N/A",
      l.currentCity || "N/A",
      l.preferredCourse,
      l.tenthPercentage || "N/A",
      l.twelfthPercentage || "N/A",
      l.graduationPercentage || "N/A",
      l.entranceExam || "N/A",
      l.entranceExamScore || "N/A",
      l.admissionResult || "N/A",
      l.status,
      new Date(l.createdAt).toLocaleDateString()
    ]);

    const csvContent = [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `college_corridor_leads_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-shell space-y-6 max-w-7xl mx-auto px-4 py-8">
      {/* Header and status alerts */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-indigo-600 animate-pulse" />
            Website Tech & Info Manager
          </h1>
          <p className="mt-1.5 text-slate-500 text-sm">
            Control center to configure homepage elements, admission evaluator checker rules, partner properties, global courses, and leads.
          </p>
        </div>
        {activeTab === "lead" && (
          <Button onClick={handleExportCSV} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-1.5">
            <FileSpreadsheet className="h-4.5 w-4.5" />
            Export Leads to CSV
          </Button>
        )}
        {activeTab !== "lead" && activeTab !== "settings" && (
          <Button onClick={handleCreateClick} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center gap-1.5 shadow-md">
            <Plus className="h-5 w-5" />
            Add New Item
          </Button>
        )}
      </div>

      {success && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-4 text-emerald-700 text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="h-5 w-5 shrink-0" />
          {success}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-rose-50 border border-rose-100 p-4 text-rose-700 text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Control Tabs Panel Layout */}
      <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
        <aside className="space-y-1 bg-white border border-slate-100 p-3 rounded-xl shadow-sm h-fit">
          {[
            { id: "university", label: "University Manager", icon: Building2 },
            { id: "course", label: "Course Manager", icon: BookOpen },
            { id: "rules", label: "Admission Chance", icon: Sparkles },
            { id: "lead", label: "Lead Manager", icon: Users },
            { id: "partner", label: "Partner Manager", icon: Award },
            { id: "seo", label: "SEO Manager", icon: Globe },
            { id: "homepage", label: "Homepage Editor", icon: Layers },
            { id: "carousel", label: "Hero Carousel", icon: ImageIcon },
            { id: "logos", label: "Brand Logos", icon: Award },
            { id: "pages", label: "Page Content", icon: FileText },
            { id: "faqs", label: "FAQs Manager", icon: HelpCircle },
            { id: "testimonials", label: "Testimonials", icon: MessageSquare },
            { id: "settings", label: "Settings", icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as TabId);
                setSearch("");
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
              }`}
            >
              <tab.icon className={`h-4.5 w-4.5 shrink-0 ${activeTab === tab.id ? "text-indigo-400" : "text-slate-400"}`} />
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Tab Workstation Area */}
        <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden min-h-[500px] flex flex-col">
          {/* Internal search */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2 justify-between">
            <h2 className="text-base font-bold text-slate-800 uppercase tracking-wider">
              {activeTab} Workstation
            </h2>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search listings..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="p-6 flex-1 relative">
            {loading && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-xs z-10 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                  <p className="text-xs font-semibold text-slate-500">Loading dynamic configurations...</p>
                </div>
              </div>
            )}

            {/* Render tab table listings dynamically */}
            {activeTab === "university" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b text-slate-500 font-semibold bg-slate-50/20">
                      <th className="py-3 px-4">University</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Type / Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700">
                    {universities
                      .filter((u) => u.name.toLowerCase().includes(search.toLowerCase()))
                      .map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900">{u.name}</td>
                          <td className="py-3 px-4">{u.city}, {u.state}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1.5">
                              {u.isPartner && <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Partner</Badge>}
                              <Badge className={u.published ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-600"}>
                                {u.published ? "Live" : "Draft"}
                              </Badge>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button onClick={() => handleEditClick(u)} variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "course" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b text-slate-500 font-semibold bg-slate-50/20">
                      <th className="py-3 px-4">Course Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Level</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700">
                    {courses
                      .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
                      .map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900">{c.name}</td>
                          <td className="py-3 px-4">{c.category}</td>
                          <td className="py-3 px-4">{c.level}</td>
                          <td className="py-3 px-4">{c.duration}</td>
                          <td className="py-3 px-4 text-right">
                            <Button onClick={() => handleEditClick(c)} variant="ghost" size="icon">
                              <Edit className="h-4 w-4 text-slate-500" />
                            </Button>
                            <Button onClick={() => handleDelete(c.id)} variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-rose-500" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "rules" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b text-slate-500 font-semibold bg-slate-50/20">
                      <th className="py-3 px-4">University</th>
                      <th className="py-3 px-4">Course</th>
                      <th className="py-3 px-4">Cutoff (10th/12th)</th>
                      <th className="py-3 px-4">Exam / Cutoff</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700">
                    {rules
                      .filter((r) => r.university?.name.toLowerCase().includes(search.toLowerCase()) || r.courseName.toLowerCase().includes(search.toLowerCase()))
                      .map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900">{r.university?.name}</td>
                          <td className="py-3 px-4">{r.courseName} ({r.specialization})</td>
                          <td className="py-3 px-4">{r.min10thPercentage}% / {r.min12thPercentage}%</td>
                          <td className="py-3 px-4">{r.entranceExam || "N/A"} ({r.minEntranceScore || "N/A"})</td>
                          <td className="py-3 px-4 text-right">
                            <Button onClick={() => handleEditClick(r)} variant="ghost" size="icon">
                              <Edit className="h-4 w-4 text-slate-500" />
                            </Button>
                            <Button onClick={() => handleDelete(r.id)} variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-rose-500" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "lead" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b text-slate-500 font-semibold bg-slate-50/20">
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Interests</th>
                      <th className="py-3 px-4">Scores</th>
                      <th className="py-3 px-4">Result</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700">
                    {leads
                      .filter((l) => l.fullName.toLowerCase().includes(search.toLowerCase()) || l.email.toLowerCase().includes(search.toLowerCase()))
                      .map((l) => (
                        <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900">{l.fullName}</td>
                          <td className="py-3 px-4">
                            <p>{l.email}</p>
                            <p className="text-slate-400 text-xs mt-0.5">{l.phone}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-semibold">{l.preferredCourse}</p>
                            <p className="text-slate-400 text-xs mt-0.5">{l.interestedInstitution?.name || "None"}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p>12th: {l.twelfthPercentage || "N/A"}%</p>
                            <p className="text-slate-400 text-xs mt-0.5">Exam: {l.entranceExam || "N/A"}</p>
                          </td>
                          <td className="py-3 px-4">
                            {l.admissionResult && (
                              <Badge className={`uppercase text-[10px] ${
                                l.admissionResult === "HIGH_CHANCE" ? "bg-emerald-50 text-emerald-700" :
                                l.admissionResult === "MODERATE_CHANCE" ? "bg-amber-50 text-amber-700" :
                                "bg-rose-50 text-rose-700"
                              }`}>
                                {l.admissionResult.replace("_", " ")}
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <Badge className="bg-slate-100 text-slate-700 border capitalize">{l.status.toLowerCase().replace("_", " ")}</Badge>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "partner" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b text-slate-500 font-semibold bg-slate-50/20">
                      <th className="py-3 px-4">Partner University</th>
                      <th className="py-3 px-4">Contact Person</th>
                      <th className="py-3 px-4">Priority Level</th>
                      <th className="py-3 px-4">Agreement Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700">
                    {universities
                      .filter((u) => u.name.toLowerCase().includes(search.toLowerCase()))
                      .map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900">{u.name}</td>
                          <td className="py-3 px-4">{u.admissionContact || "N/A"}</td>
                          <td className="py-3 px-4">
                            <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">{u.priorityLevel || "HIGH"}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">{u.agreementStatus || "SIGNED"}</Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button onClick={() => handleEditClick(u)} variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Render other module tables (carousel, logos, pages, etc.) */}
            {activeTab === "carousel" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b text-slate-500 font-semibold bg-slate-50/20">
                      <th className="py-3 px-4">Slide Image</th>
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Order / Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700">
                    {carousels
                      .filter((s) => s.title.toLowerCase().includes(search.toLowerCase()))
                      .map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4">
                            <img src={s.image || "/images/placeholder.jpg"} className="h-10 w-16 object-cover rounded border" alt="" />
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">{s.title}</td>
                          <td className="py-3 px-4">{s.category}</td>
                          <td className="py-3 px-4">
                            Order: {s.displayOrder} · {s.active ? "Active" : "Disabled"}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button onClick={() => handleEditClick(s)} variant="ghost" size="icon">
                              <Edit className="h-4 w-4 text-slate-500" />
                            </Button>
                            <Button onClick={() => handleDelete(s.id)} variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-rose-500" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "logos" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b text-slate-500 font-semibold bg-slate-50/20">
                      <th className="py-3 px-4">Logo Image</th>
                      <th className="py-3 px-4">Brand Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Link</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700">
                    {logos
                      .filter((l) => l.name.toLowerCase().includes(search.toLowerCase()))
                      .map((l) => (
                        <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4">
                            <img src={l.image} className="h-9 w-16 object-contain rounded border p-0.5 bg-slate-50" alt="" />
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">{l.name}</td>
                          <td className="py-3 px-4">{l.category}</td>
                          <td className="py-3 px-4">{l.website || "None"}</td>
                          <td className="py-3 px-4 text-right">
                            <Button onClick={() => handleEditClick(l)} variant="ghost" size="icon">
                              <Edit className="h-4 w-4 text-slate-500" />
                            </Button>
                            <Button onClick={() => handleDelete(l.id)} variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-rose-500" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "pages" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b text-slate-500 font-semibold bg-slate-50/20">
                      <th className="py-3 px-4">Slug</th>
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700">
                    {pages
                      .filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
                      .map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4 font-mono text-xs">/{p.slug}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">{p.title}</td>
                          <td className="py-3 px-4">
                            <Badge className={p.isPublished ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-slate-100 text-slate-600"}>
                              {p.isPublished ? "Published" : "Draft"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button onClick={() => handleEditClick(p)} variant="ghost" size="icon">
                              <Edit className="h-4 w-4 text-slate-500" />
                            </Button>
                            <Button onClick={() => handleDelete(p.id)} variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-rose-500" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Standard CRUD fallbacks for settings / testimonials / faqs */}
            {activeTab === "faqs" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b text-slate-500 font-semibold bg-slate-50/20">
                      <th className="py-3 px-4">Question</th>
                      <th className="py-3 px-4">Page / University</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700">
                    {faqs
                      .filter((f) => f.question.toLowerCase().includes(search.toLowerCase()))
                      .map((f) => (
                        <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900">{f.question}</td>
                          <td className="py-3 px-4">{f.college?.name || `Page: ${f.pageName}`}</td>
                          <td className="py-3 px-4">{f.active ? "Active" : "Disabled"}</td>
                          <td className="py-3 px-4 text-right">
                            <Button onClick={() => handleEditClick(f)} variant="ghost" size="icon">
                              <Edit className="h-4 w-4 text-slate-500" />
                            </Button>
                            <Button onClick={() => handleDelete(f.id)} variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-rose-500" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "testimonials" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b text-slate-500 font-semibold bg-slate-50/20">
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Text Quote</th>
                      <th className="py-3 px-4">Rating</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700">
                    {testimonials
                      .filter((t) => t.studentName.toLowerCase().includes(search.toLowerCase()))
                      .map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900">{t.studentName}</td>
                          <td className="py-3 px-4 italic max-w-sm truncate">"{t.text}"</td>
                          <td className="py-3 px-4 text-amber-500 font-bold">{"★".repeat(t.rating)}</td>
                          <td className="py-3 px-4 text-right">
                            <Button onClick={() => handleEditClick(t)} variant="ghost" size="icon">
                              <Edit className="h-4 w-4 text-slate-500" />
                            </Button>
                            <Button onClick={() => handleDelete(t.id)} variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-rose-500" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="grid gap-4">
                <p className="text-slate-500 text-sm">System parameters used globally across SEO and API routes.</p>
                <div className="border rounded-xl divide-y">
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">Email Gateway Status</p>
                      <p className="text-xs text-slate-500">Currently mocks email dispatcher in console log.</p>
                    </div>
                    <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">DEVELOPMENT</Badge>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">Minimum Admission checker requirements</p>
                      <p className="text-xs text-slate-500">Requires 10th and 12th GPA parameters.</p>
                    </div>
                    <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">ACTIVE</Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Popups/Forms Modals */}
      {showModal && currentItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto border-slate-200 shadow-2xl animate-in fade-in zoom-in bg-white rounded-xl">
            <div className="flex items-center justify-between border-b p-5">
              <h3 className="text-lg font-bold text-slate-900 capitalize">
                {modalType} {activeTab === "partner" ? "Partner Details" : activeTab} Item
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)} className="rounded-full">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {activeTab === "university" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="name">University Name</Label>
                    <Input id="name" value={currentItem.name || ""} onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug</Label>
                    <Input id="slug" value={currentItem.slug || ""} onChange={(e) => setCurrentItem({ ...currentItem, slug: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={currentItem.city || ""} onChange={(e) => setCurrentItem({ ...currentItem, city: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input id="state" value={currentItem.state || ""} onChange={(e) => setCurrentItem({ ...currentItem, state: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="isPartner">Partner University Status</Label>
                    <select
                      id="isPartner"
                      value={currentItem.isPartner ? "true" : "false"}
                      onChange={(e) => setCurrentItem({ ...currentItem, isPartner: e.target.value === "true" })}
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm text-slate-800"
                    >
                      <option value="false">No (Standard College)</option>
                      <option value="true">Yes (Partner College)</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="published">Publish Status</Label>
                    <select
                      id="published"
                      value={currentItem.published ? "true" : "false"}
                      onChange={(e) => setCurrentItem({ ...currentItem, published: e.target.value === "true" })}
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm text-slate-800"
                    >
                      <option value="true">Live (Published)</option>
                      <option value="false">Draft (Hidden)</option>
                    </select>
                  </div>
                  {currentItem.isPartner && (
                    <>
                      <div className="sm:col-span-2">
                        <Label htmlFor="commissionNotes">Commission Notes</Label>
                        <Input id="commissionNotes" value={currentItem.commissionNotes || ""} onChange={(e) => setCurrentItem({ ...currentItem, commissionNotes: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="admissionContact">Admission Contact Email</Label>
                        <Input id="admissionContact" value={currentItem.admissionContact || ""} onChange={(e) => setCurrentItem({ ...currentItem, admissionContact: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="priorityLevel">Priority Level</Label>
                        <Input id="priorityLevel" value={currentItem.priorityLevel || ""} onChange={(e) => setCurrentItem({ ...currentItem, priorityLevel: e.target.value })} />
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === "partner" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>University Name (Read Only)</Label>
                    <Input value={currentItem.name} disabled />
                  </div>
                  <div>
                    <Label htmlFor="admissionContact">Admission Contact Email</Label>
                    <Input id="admissionContact" value={currentItem.admissionContact || ""} onChange={(e) => setCurrentItem({ ...currentItem, admissionContact: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="priorityLevel">Priority Level</Label>
                    <Input id="priorityLevel" value={currentItem.priorityLevel || "HIGH"} onChange={(e) => setCurrentItem({ ...currentItem, priorityLevel: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="agreementStatus">Agreement Status</Label>
                    <select
                      id="agreementStatus"
                      value={currentItem.agreementStatus || "SIGNED"}
                      onChange={(e) => setCurrentItem({ ...currentItem, agreementStatus: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm text-slate-800"
                    >
                      <option value="SIGNED">SIGNED</option>
                      <option value="PENDING">PENDING</option>
                      <option value="EXPIRED">EXPIRED</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="commissionNotes">Commission Agreement Notes</Label>
                    <textarea
                      id="commissionNotes"
                      value={currentItem.commissionNotes || ""}
                      onChange={(e) => setCurrentItem({ ...currentItem, commissionNotes: e.target.value })}
                      className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm text-slate-800"
                    />
                  </div>
                </div>
              )}

              {activeTab === "course" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="courseName">Course Name</Label>
                    <Input id="courseName" value={currentItem.name || ""} onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="courseSlug">Slug</Label>
                    <Input id="courseSlug" value={currentItem.slug || ""} onChange={(e) => setCurrentItem({ ...currentItem, slug: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="courseCategory">Category</Label>
                    <Input id="courseCategory" value={currentItem.category || ""} onChange={(e) => setCurrentItem({ ...currentItem, category: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="courseLevel">Level</Label>
                    <Input id="courseLevel" value={currentItem.level || "UG"} onChange={(e) => setCurrentItem({ ...currentItem, level: e.target.value })} />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="courseEligibility">Eligibility Description</Label>
                    <Input id="courseEligibility" value={currentItem.eligibility || ""} onChange={(e) => setCurrentItem({ ...currentItem, eligibility: e.target.value })} />
                  </div>
                </div>
              )}

              {activeTab === "rules" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="ruleUniversity">Select University</Label>
                    <select
                      id="ruleUniversity"
                      value={currentItem.universityId || ""}
                      onChange={(e) => setCurrentItem({ ...currentItem, universityId: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm text-slate-800"
                      required
                    >
                      <option value="">-- Choose University --</option>
                      {universities.map((u) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="ruleCourse">Course Name</Label>
                    <Input id="ruleCourse" value={currentItem.courseName || ""} onChange={(e) => setCurrentItem({ ...currentItem, courseName: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="rule10th">Min 10th Percentage</Label>
                    <Input id="rule10th" type="number" step="0.1" value={currentItem.min10thPercentage ?? ""} onChange={(e) => setCurrentItem({ ...currentItem, min10thPercentage: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="rule12th">Min 12th Percentage</Label>
                    <Input id="rule12th" type="number" step="0.1" value={currentItem.min12thPercentage ?? ""} onChange={(e) => setCurrentItem({ ...currentItem, min12thPercentage: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="ruleExam">Entrance Exam Requirement</Label>
                    <Input id="ruleExam" value={currentItem.entranceExam || ""} onChange={(e) => setCurrentItem({ ...currentItem, entranceExam: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="ruleScore">Min Entrance score/rank</Label>
                    <Input id="ruleScore" type="number" value={currentItem.minEntranceScore ?? ""} onChange={(e) => setCurrentItem({ ...currentItem, minEntranceScore: e.target.value })} />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="ruleEligibility">General eligibility notes</Label>
                    <textarea
                      id="ruleEligibility"
                      value={currentItem.eligibilityRules || ""}
                      onChange={(e) => setCurrentItem({ ...currentItem, eligibilityRules: e.target.value })}
                      className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm text-slate-800"
                    />
                  </div>
                </div>
              )}

              {activeTab === "carousel" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="slideTitle">Slide Title</Label>
                    <Input id="slideTitle" value={currentItem.title || ""} onChange={(e) => setCurrentItem({ ...currentItem, title: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="slideSubtitle">Subtitle</Label>
                    <Input id="slideSubtitle" value={currentItem.subtitle || ""} onChange={(e) => setCurrentItem({ ...currentItem, subtitle: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="slideCategory">Category Vertical</Label>
                    <select
                      id="slideCategory"
                      value={currentItem.category || "ONLINE"}
                      onChange={(e) => setCurrentItem({ ...currentItem, category: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm text-slate-800"
                    >
                      <option value="ONLINE">ONLINE</option>
                      <option value="OFFLINE">OFFLINE</option>
                      <option value="STUDY_ABROAD">STUDY ABROAD</option>
                      <option value="DISTANCE">DISTANCE</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="slideOrder">Display Order</Label>
                    <Input id="slideOrder" type="number" value={currentItem.displayOrder ?? 0} onChange={(e) => setCurrentItem({ ...currentItem, displayOrder: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="slideImage">Upload Image File</Label>
                    <Input id="slideImage" type="file" onChange={(e) => handleImageUpload(e, "image")} accept="image/*" />
                    {currentItem.image && <p className="text-xs text-slate-400 mt-1 truncate">Current: {currentItem.image}</p>}
                  </div>
                  <div>
                    <Label htmlFor="slideLink">Button Link URL</Label>
                    <Input id="slideLink" value={currentItem.buttonLink || ""} onChange={(e) => setCurrentItem({ ...currentItem, buttonLink: e.target.value })} />
                  </div>
                </div>
              )}

              {/* General CRUD subfields for FAQS and testimonials */}
              {activeTab === "faqs" && (
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="faqQuestion">Question</Label>
                    <Input id="faqQuestion" value={currentItem.question || ""} onChange={(e) => setCurrentItem({ ...currentItem, question: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="faqAnswer">Answer Text</Label>
                    <textarea
                      id="faqAnswer"
                      value={currentItem.answer || ""}
                      onChange={(e) => setCurrentItem({ ...currentItem, answer: e.target.value })}
                      className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm text-slate-800"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="faqCollege">Optional College Reference</Label>
                    <select
                      id="faqCollege"
                      value={currentItem.collegeId || ""}
                      onChange={(e) => setCurrentItem({ ...currentItem, collegeId: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm text-slate-800"
                    >
                      <option value="">-- No College --</option>
                      {universities.map((u) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {activeTab === "testimonials" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="tName">Student Name</Label>
                    <Input id="tName" value={currentItem.studentName || ""} onChange={(e) => setCurrentItem({ ...currentItem, studentName: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="tRole">Designation / Role</Label>
                    <Input id="tRole" value={currentItem.role || ""} onChange={(e) => setCurrentItem({ ...currentItem, role: e.target.value })} />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="tText">Testimonial Quote</Label>
                    <textarea
                      id="tText"
                      value={currentItem.text || ""}
                      onChange={(e) => setCurrentItem({ ...currentItem, text: e.target.value })}
                      className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm text-slate-800"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 border-t pt-4">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-semibold">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
