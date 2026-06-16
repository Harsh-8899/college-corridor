"use client";

import { useState } from "react";
import { Pencil, Trash2, Plus, MapPin, Star, Trophy, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { College } from "@/lib/data/colleges";
import { CollegeForm } from "./college-form";

type CollegeTableProps = {
  initialColleges: College[];
};

export function CollegeTable({ initialColleges }: CollegeTableProps) {
  const [colleges, setColleges] = useState<College[]>(initialColleges);
  const [editingCollege, setEditingCollege] = useState<College | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = colleges.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.state.toLowerCase().includes(q)
    );
  });

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this college? This action cannot be undone.")) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await fetch(`/api/v1/admin/colleges/${id}`, { method: "DELETE" });
      if (res.ok) {
        setColleges((prev) => prev.filter((c) => c.id !== id));
      } else {
        alert("Failed to delete college.");
      }
    } catch {
      alert("Network error. Please try again.");
    }
    setDeletingId(null);
  }

  function handleSaved(college: College, isNew: boolean) {
    if (isNew) {
      setColleges((prev) => [...prev, college]);
    } else {
      setColleges((prev) => prev.map((c) => (c.id === college.id ? college : c)));
    }
    setShowForm(false);
    setEditingCollege(null);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingCollege(null);
  }

  if (showForm || editingCollege) {
    return (
      <CollegeForm
        college={editingCollege}
        onSaved={handleSaved}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search colleges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Add College
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery ? "No colleges match your search." : "No colleges added yet. Click 'Add College' to get started."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((college) => (
            <Card key={college.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-base font-semibold">{college.name}</h3>
                      <Badge>{college.ownership}</Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {college.city}, {college.state}
                      </span>
                      <span className="flex items-center gap-1">
                        <Trophy className="h-3.5 w-3.5" />
                        Rank #{college.ranking}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5" />
                        {college.rating}/5
                      </span>
                      <span>{college.fees}</span>
                      <span>{college.placementRate} placement</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {college.courses.slice(0, 3).map((course) => (
                        <Badge key={course} className="text-xs font-normal">
                          {course}
                        </Badge>
                      ))}
                      {college.courses.length > 3 && (
                        <Badge className="text-xs font-normal">
                          +{college.courses.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingCollege(college)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(college.id)}
                      disabled={deletingId === college.id}
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {deletingId === college.id ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total: {colleges.length} college{colleges.length !== 1 ? "s" : ""}
            {searchQuery && ` · ${filtered.length} matching`}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
