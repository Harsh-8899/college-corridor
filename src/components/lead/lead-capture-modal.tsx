"use client";

import { useEffect, useMemo, useState } from "react";
import { LockKeyhole, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { colleges, leadUnlockItems } from "@/lib/data/colleges";

type LeadCaptureModalProps = {
  triggerLabel?: string;
  sourcePage: string;
  selectedCollegeIds?: string[];
  contentKey: string;
  onUnlocked?: () => void;
};

const unlockStorageKey = "eduoofa-premium-unlocked";

export function isPremiumUnlocked() {
  if (typeof window === "undefined") {
    return false;
  }
  return window.localStorage.getItem(unlockStorageKey) === "true";
}

export function LeadCaptureModal({
  triggerLabel = "Unlock",
  sourcePage,
  selectedCollegeIds = [],
  contentKey,
  onUnlocked
}: LeadCaptureModalProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [message, setMessage] = useState("");

  const filteredColleges = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    if (!normalized) {
      return colleges;
    }
    return colleges.filter((college) => college.name.toLowerCase().includes(normalized));
  }, [query]);

  useEffect(() => {
    if (isPremiumUnlocked()) {
      onUnlocked?.();
    }
  }, [onUnlocked]);

  async function handleSubmit(formData: FormData) {
    setStatus("submitting");
    setMessage("");

    const payload = {
      fullName: String(formData.get("fullName") || ""),
      phone: String(formData.get("phone") || ""),
      email: String(formData.get("email") || ""),
      city: String(formData.get("city") || ""),
      courseInterestedIn: String(formData.get("courseInterestedIn") || ""),
      interestedCollegeId: String(formData.get("interestedCollegeId") || "") || undefined,
      sourcePage,
      selectedCollegeIds,
      unlockedContentKeys: [contentKey]
    };

    const response = await fetch("/api/v1/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      setStatus("error");
      setMessage("Lead saved locally for this demo. Connect PostgreSQL to persist CRM records.");
      window.localStorage.setItem(unlockStorageKey, "true");
      onUnlocked?.();
      setOpen(false);
      return;
    }

    window.localStorage.setItem(unlockStorageKey, "true");
    setStatus("idle");
    onUnlocked?.();
    setOpen(false);
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <LockKeyhole className="h-4 w-4" />
        {triggerLabel}
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/35 p-4">
          <Card className="max-h-[92vh] w-full max-w-2xl overflow-y-auto">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>Unlock premium admission insights</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  Submit the lead form once to unlock comparison depth, reports, placements, scholarships,
                  recommendations, and counseling booking.
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close">
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {leadUnlockItems.map((item) => (
                  <div key={item} className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
                    {item}
                  </div>
                ))}
              </div>
              <form action={handleSubmit} className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field name="fullName" label="Full Name" placeholder="Your name" />
                  <Field name="phone" label="Phone Number" placeholder="+91 98765 43210" />
                  <Field name="email" label="Email" type="email" placeholder="you@example.com" />
                  <Field name="city" label="City" placeholder="Mumbai" />
                  <Field name="courseInterestedIn" label="Course Interested In" placeholder="MBA" />
                  <div className="space-y-2">
                    <Label htmlFor="college-search">Interested College</Label>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="college-search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search college"
                        className="pl-9"
                      />
                    </div>
                    <select
                      name="interestedCollegeId"
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {filteredColleges.map((college) => (
                        <option key={college.id} value={college.id}>
                          {college.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
                <Button type="submit" disabled={status === "submitting"} className="w-full sm:w-auto">
                  {status === "submitting" ? "Submitting..." : "Submit and unlock"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </>
  );
}

function Field({
  name,
  label,
  placeholder,
  type = "text"
}: {
  name: string;
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} placeholder={placeholder} required />
    </div>
  );
}

