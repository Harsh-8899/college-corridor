"use client";

import { useState } from "react";
import { Loader2, UserCheck, ShieldCheck, FileText, PlusCircle, ArrowUpRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Counselor = {
  id: string;
  name: string;
};

type Lead = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
};

type AdminQuickActionsProps = {
  counselors: Counselor[];
  leads: Lead[];
  onRefreshData?: () => void;
};

export function AdminQuickActions({ counselors, leads, onRefreshData }: AdminQuickActionsProps) {
  const [activeSubTab, setActiveSubTab] = useState<"assign" | "status" | "bulk">("assign");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Sub-tab Form States
  const [assignForm, setAssignForm] = useState({ leadId: "", counselorId: "" });
  const [statusForm, setStatusForm] = useState({ leadId: "", status: "", note: "" });
  const [bulkForm, setBulkForm] = useState({ selectedLeadIds: [] as string[], counselorId: "", status: "" });

  const leadStatuses = [
    "NEW",
    "OTP_VERIFIED",
    "CONTACTED",
    "QUALIFIED",
    "HOT",
    "COUNSELING_BOOKED",
    "APPLICATION_STARTED",
    "DOCUMENTS_PENDING",
    "APPLIED",
    "OFFER_RECEIVED",
    "ADMITTED",
    "ENROLLED",
    "LOST"
  ];

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!assignForm.leadId || !assignForm.counselorId) {
      setError("Please select both a lead and a counselor.");
      return;
    }
    await submitUpdate([assignForm.leadId], assignForm.counselorId, undefined, undefined);
  }

  async function handleStatusUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!statusForm.leadId || !statusForm.status) {
      setError("Please select a lead and status.");
      return;
    }
    await submitUpdate([statusForm.leadId], undefined, statusForm.status, statusForm.note);
  }

  async function handleBulkSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (bulkForm.selectedLeadIds.length === 0) {
      setError("Please select at least one lead.");
      return;
    }
    if (!bulkForm.counselorId && !bulkForm.status) {
      setError("Please select a counselor or a status to update.");
      return;
    }
    await submitUpdate(
      bulkForm.selectedLeadIds,
      bulkForm.counselorId || undefined,
      bulkForm.status || undefined,
      undefined
    );
  }

  async function submitUpdate(leadIds: string[], counselorId?: string | null, status?: string, note?: string) {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/v1/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadIds,
          assignedCounselorId: counselorId,
          status,
          note
        })
      });

      const result = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(result?.error?.message || "Failed to update lead data.");
        return;
      }

      setSuccess(`Successfully updated ${leadIds.length} lead(s).`);
      
      // Reset Forms
      setAssignForm({ leadId: "", counselorId: "" });
      setStatusForm({ leadId: "", status: "", note: "" });
      setBulkForm({ selectedLeadIds: [], counselorId: "", status: "" });

      if (onRefreshData) {
        onRefreshData();
      }

      // Auto-refresh the window to show updated dashboard state
      setTimeout(() => {
        setSuccess("");
        window.location.reload();
      }, 1500);
    } catch {
      setLoading(false);
      setError("A network error occurred. Please try again.");
    }
  }

  function handleCheckboxChange(leadId: string, checked: boolean) {
    if (checked) {
      setBulkForm((prev) => ({ ...prev, selectedLeadIds: [...prev.selectedLeadIds, leadId] }));
    } else {
      setBulkForm((prev) => ({ ...prev, selectedLeadIds: prev.selectedLeadIds.filter((id) => id !== leadId) }));
    }
  }

  return (
    <Card className="border-slate-200/80 shadow-sm bg-white col-span-full xl:col-span-1">
      <CardHeader className="border-b border-slate-100 pb-4 flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-base font-semibold text-slate-800">Daily CRM Operations</CardTitle>
          <CardDescription className="text-xs">Quick lead assignments & status registers</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild className="h-8 gap-1 text-slate-700 bg-slate-50 border-slate-200">
          <a href="/api/v1/admin/reports" download>
            <Download className="h-3.5 w-3.5" />
            CSV Export
          </a>
        </Button>
      </CardHeader>
      
      {/* Visual Sub tabs */}
      <div className="flex border-b border-slate-100 p-2 gap-1 bg-slate-50/50">
        {[
          { id: "assign", label: "Assign Lead" },
          { id: "status", label: "Status & Notes" },
          { id: "bulk", label: "Bulk Updates" }
        ].map((subTab) => (
          <button
            key={subTab.id}
            onClick={() => {
              setActiveSubTab(subTab.id as any);
              setError("");
              setSuccess("");
            }}
            className={`flex-1 text-center py-1.5 px-2.5 text-xs font-semibold rounded-md transition-all ${
              activeSubTab === subTab.id
                ? "bg-white text-primary shadow-xs ring-1 ring-black/5"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {subTab.label}
          </button>
        ))}
      </div>

      <CardContent className="pt-5 space-y-4">
        {success && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3 text-xs font-medium text-emerald-600 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
            {success}
          </div>
        )}
        {error && (
          <div className="rounded-lg bg-rose-50 border border-rose-100 p-3 text-xs font-medium text-rose-600 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 shrink-0 text-rose-600" />
            {error}
          </div>
        )}

        {activeSubTab === "assign" && (
          <form onSubmit={handleAssign} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="assignLead" className="text-xs font-bold text-slate-700">Select Student Lead</Label>
              <select
                id="assignLead"
                value={assignForm.leadId}
                onChange={(e) => setAssignForm({ ...assignForm, leadId: e.target.value })}
                className="flex h-9 w-full rounded-md border border-slate-200 bg-background px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary"
                required
              >
                <option value="">-- Choose Lead --</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.fullName} ({l.phone}) · {l.status}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="assignCounselor" className="text-xs font-bold text-slate-700">Assign to Counselor</Label>
              <select
                id="assignCounselor"
                value={assignForm.counselorId}
                onChange={(e) => setAssignForm({ ...assignForm, counselorId: e.target.value })}
                className="flex h-9 w-full rounded-md border border-slate-200 bg-background px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary"
                required
              >
                <option value="">-- Choose Counselor --</option>
                {counselors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit" disabled={loading} className="w-full text-xs font-bold h-9 gap-1.5 mt-2">
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <UserCheck className="h-3.5 w-3.5" />
                  Assign Counselor
                </>
              )}
            </Button>
          </form>
        )}

        {activeSubTab === "status" && (
          <form onSubmit={handleStatusUpdate} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="statusLead" className="text-xs font-bold text-slate-700">Select Student Lead</Label>
              <select
                id="statusLead"
                value={statusForm.leadId}
                onChange={(e) => setStatusForm({ ...statusForm, leadId: e.target.value })}
                className="flex h-9 w-full rounded-md border border-slate-200 bg-background px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary"
                required
              >
                <option value="">-- Choose Lead --</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.fullName} · {l.status}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="statusValue" className="text-xs font-bold text-slate-700">Change Status</Label>
              <select
                id="statusValue"
                value={statusForm.status}
                onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                className="flex h-9 w-full rounded-md border border-slate-200 bg-background px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary"
                required
              >
                <option value="">-- Choose Status --</option>
                {leadStatuses.map((st) => (
                  <option key={st} value={st}>
                    {st.toLowerCase().replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="statusNote" className="text-xs font-bold text-slate-700">Add Lead Note / Comment</Label>
              <Input
                id="statusNote"
                value={statusForm.note}
                onChange={(e) => setStatusForm({ ...statusForm, note: e.target.value })}
                placeholder="e.g. Call connected, student wants Online MBA"
                className="text-xs h-9 bg-white"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full text-xs font-bold h-9 gap-1.5 mt-2">
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <FileText className="h-3.5 w-3.5" />
                  Update Status & Log Note
                </>
              )}
            </Button>
          </form>
        )}

        {activeSubTab === "bulk" && (
          <form onSubmit={handleBulkSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Select Leads to Update ({bulkForm.selectedLeadIds.length} chosen)</Label>
              <div className="max-h-36 overflow-y-auto border rounded-md p-2 bg-slate-50/30 divide-y space-y-1.5">
                {leads.map((l) => (
                  <div key={l.id} className="flex items-center gap-2.5 py-1 text-xs">
                    <input
                      type="checkbox"
                      id={`bulk-check-${l.id}`}
                      checked={bulkForm.selectedLeadIds.includes(l.id)}
                      onChange={(e) => handleCheckboxChange(l.id, e.target.checked)}
                      className="rounded border-slate-300 text-primary focus:ring-primary h-3.5 w-3.5"
                    />
                    <label htmlFor={`bulk-check-${l.id}`} className="font-semibold text-slate-700 select-none">
                      {l.fullName} <span className="text-slate-400 font-normal">({l.status})</span>
                    </label>
                  </div>
                ))}
                {leads.length === 0 && (
                  <p className="text-xxs text-slate-400 text-center py-4">No active leads available.</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bulkCounselor" className="text-xs font-bold text-slate-700">Bulk Assign Counselor (Optional)</Label>
              <select
                id="bulkCounselor"
                value={bulkForm.counselorId}
                onChange={(e) => setBulkForm({ ...bulkForm, counselorId: e.target.value })}
                className="flex h-9 w-full rounded-md border border-slate-200 bg-background px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">-- No Change --</option>
                {counselors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bulkStatus" className="text-xs font-bold text-slate-700">Bulk Change Status (Optional)</Label>
              <select
                id="bulkStatus"
                value={bulkForm.status}
                onChange={(e) => setBulkForm({ ...bulkForm, status: e.target.value })}
                className="flex h-9 w-full rounded-md border border-slate-200 bg-background px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">-- No Change --</option>
                {leadStatuses.map((st) => (
                  <option key={st} value={st}>
                    {st.toLowerCase().replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit" disabled={loading} className="w-full text-xs font-bold h-9 gap-1.5 mt-2">
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Bulk updating...
                </>
              ) : (
                <>
                  <PlusCircle className="h-3.5 w-3.5" />
                  Execute Bulk Action
                </>
              )}
            </Button>
          </form>
        )}

        {/* Quick Directory Redirection links */}
        <div className="border-t pt-4 space-y-2.5">
          <p className="text-xxs font-bold uppercase tracking-wider text-slate-400">Quick links</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <a
              href="/internal/admin/institutions"
              className="flex items-center justify-between p-2 rounded-md bg-slate-50 hover:bg-slate-100 border text-slate-700 hover:text-slate-900 transition-colors font-medium"
            >
              Add College
              <ArrowUpRight className="h-3 w-3 text-slate-400" />
            </a>
            <a
              href="/admin/users"
              className="flex items-center justify-between p-2 rounded-md bg-slate-50 hover:bg-slate-100 border text-slate-700 hover:text-slate-900 transition-colors font-medium"
            >
              Create User
              <ArrowUpRight className="h-3 w-3 text-slate-400" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
