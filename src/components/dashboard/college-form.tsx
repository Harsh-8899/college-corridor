"use client";

import { useState } from "react";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { College } from "@/lib/data/colleges";

type CollegeFormProps = {
  college?: College | null;
  onSaved: (college: College, isNew: boolean) => void;
  onCancel: () => void;
};

const ownershipOptions = ["Government", "Private", "Deemed"] as const;
const modeOptions = ["Online", "Offline", "Distance"] as const;

export function CollegeForm({ college, onSaved, onCancel }: CollegeFormProps) {
  const isNew = !college;

  const [form, setForm] = useState({
    name: college?.name || "",
    city: college?.city || "",
    state: college?.state || "",
    ownership: college?.ownership || "Private",
    ranking: college?.ranking || 0,
    rating: college?.rating || 0,
    courses: college?.courses.join(", ") || "",
    modes: college?.modes || ["Offline"],
    fees: college?.fees || "",
    averageSalary: college?.averageSalary || "",
    highestSalary: college?.highestSalary || "",
    placementRate: college?.placementRate || "",
    seats: college?.seats || 0,
    hostel: college?.hostel || "",
    scholarships: college?.scholarships || "",
    eligibility: college?.eligibility || "",
    admission: college?.admission || "",
    description: college?.description || ""
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateField(field: string, value: string | number | string[]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleMode(mode: string) {
    setForm((prev) => {
      const current = prev.modes as string[];
      if (current.includes(mode)) {
        return { ...prev, modes: current.filter((m) => m !== mode) as ("Online" | "Offline" | "Distance")[] };
      }
      return { ...prev, modes: [...current, mode] as ("Online" | "Offline" | "Distance")[] };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload = {
      ...form,
      courses: form.courses.split(",").map((c) => c.trim()).filter(Boolean),
      ranking: Number(form.ranking),
      rating: Number(form.rating),
      seats: Number(form.seats)
    };

    try {
      let res: Response;

      if (isNew) {
        res = await fetch("/api/v1/admin/colleges", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`/api/v1/admin/colleges/${college.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error?.message || "Failed to save college.");
        setSaving(false);
        return;
      }

      const data = await res.json();
      onSaved(data.data, isNew);
    } catch {
      setError("Network error. Please try again.");
    }

    setSaving(false);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onCancel} aria-label="Go back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle>{isNew ? "Add New College" : `Edit: ${college?.name}`}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <fieldset className="space-y-4 rounded-lg border p-4">
            <legend className="px-2 text-sm font-semibold">Basic Information</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="name">College Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g., Indian Institute of Technology Delhi"
                  required
                />
              </div>
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
                <Label htmlFor="ownership">Ownership *</Label>
                <select
                  id="ownership"
                  value={form.ownership}
                  onChange={(e) => updateField("ownership", e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  required
                >
                  {ownershipOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Brief description of the college..."
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
          </fieldset>

          {/* Academics */}
          <fieldset className="space-y-4 rounded-lg border p-4">
            <legend className="px-2 text-sm font-semibold">Academics & Rankings</legend>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="ranking">Ranking</Label>
                <Input
                  id="ranking"
                  type="number"
                  value={form.ranking}
                  onChange={(e) => updateField("ranking", e.target.value)}
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating">Rating (out of 5)</Label>
                <Input
                  id="rating"
                  type="number"
                  value={form.rating}
                  onChange={(e) => updateField("rating", e.target.value)}
                  min={0}
                  max={5}
                  step={0.1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seats">Total Seats</Label>
                <Input
                  id="seats"
                  type="number"
                  value={form.seats}
                  onChange={(e) => updateField("seats", e.target.value)}
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <Label>Modes</Label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {modeOptions.map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => toggleMode(mode)}
                      className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                        (form.modes as string[]).includes(mode)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-input text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="courses">Courses (comma-separated) *</Label>
              <Input
                id="courses"
                value={form.courses}
                onChange={(e) => updateField("courses", e.target.value)}
                placeholder="e.g., B.Tech Computer Science, MBA, M.Tech Data Science"
                required
              />
            </div>
          </fieldset>

          {/* Fees & Placements */}
          <fieldset className="space-y-4 rounded-lg border p-4">
            <legend className="px-2 text-sm font-semibold">Fees & Placements</legend>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="fees">Fee Range *</Label>
                <Input
                  id="fees"
                  value={form.fees}
                  onChange={(e) => updateField("fees", e.target.value)}
                  placeholder="e.g., INR 2.4L - 6.8L"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="averageSalary">Average Salary</Label>
                <Input
                  id="averageSalary"
                  value={form.averageSalary}
                  onChange={(e) => updateField("averageSalary", e.target.value)}
                  placeholder="e.g., INR 9.2 LPA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="highestSalary">Highest Salary</Label>
                <Input
                  id="highestSalary"
                  value={form.highestSalary}
                  onChange={(e) => updateField("highestSalary", e.target.value)}
                  placeholder="e.g., INR 38 LPA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="placementRate">Placement Rate</Label>
                <Input
                  id="placementRate"
                  value={form.placementRate}
                  onChange={(e) => updateField("placementRate", e.target.value)}
                  placeholder="e.g., 91%"
                />
              </div>
            </div>
          </fieldset>

          {/* Facilities & Admission */}
          <fieldset className="space-y-4 rounded-lg border p-4">
            <legend className="px-2 text-sm font-semibold">Facilities & Admission</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hostel">Hostel Details</Label>
                <Input
                  id="hostel"
                  value={form.hostel}
                  onChange={(e) => updateField("hostel", e.target.value)}
                  placeholder="Hostel facilities description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scholarships">Scholarships</Label>
                <Input
                  id="scholarships"
                  value={form.scholarships}
                  onChange={(e) => updateField("scholarships", e.target.value)}
                  placeholder="Scholarship options available"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eligibility">Eligibility</Label>
                <Input
                  id="eligibility"
                  value={form.eligibility}
                  onChange={(e) => updateField("eligibility", e.target.value)}
                  placeholder="Eligibility criteria"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admission">Admission Process</Label>
                <Input
                  id="admission"
                  value={form.admission}
                  onChange={(e) => updateField("admission", e.target.value)}
                  placeholder="Steps for admission"
                />
              </div>
            </div>
          </fieldset>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
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
                  {isNew ? "Add College" : "Save Changes"}
                </span>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
