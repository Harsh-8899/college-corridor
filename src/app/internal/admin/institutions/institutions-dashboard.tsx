"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Search, 
  Download, 
  Plus, 
  MapPin, 
  Trophy, 
  Star, 
  SlidersHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Pencil,
  Building
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { College } from "@/lib/data/colleges";

type InstitutionsDashboardProps = {
  initialColleges: College[];
};

export function InstitutionsDashboard({ initialColleges }: InstitutionsDashboardProps) {
  const [colleges, setColleges] = useState<College[]>(initialColleges);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedOwnership, setSelectedOwnership] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Extract filter options dynamically
  const uniqueStates = useMemo(() => {
    const states = colleges.map(c => c.state).filter(Boolean);
    return Array.from(new Set(states)).sort();
  }, [colleges]);

  const uniqueOwnerships = useMemo(() => {
    const ownerships = colleges.map(c => c.ownership).filter(Boolean);
    return Array.from(new Set(ownerships)).sort();
  }, [colleges]);

  // Filtering logic
  const filteredColleges = useMemo(() => {
    return colleges.filter(college => {
      const matchesSearch = 
        college.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        college.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        college.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (college.slug && college.slug.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesState = !selectedState || college.state === selectedState;
      const matchesOwnership = !selectedOwnership || college.ownership === selectedOwnership;

      return matchesSearch && matchesState && matchesOwnership;
    });
  }, [colleges, searchQuery, selectedState, selectedOwnership]);

  // Paginated records
  const totalPages = Math.ceil(filteredColleges.length / itemsPerPage);
  const paginatedColleges = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredColleges.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredColleges, currentPage]);

  // Handle deletion
  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this college? This will permanently remove it and all its courses, rankings, placements, and facilities from the database.")) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await fetch(`/api/v1/admin/colleges/${id}`, { method: "DELETE" });
      if (res.ok) {
        setColleges(prev => prev.filter(c => c.id !== id));
      } else {
        alert("Failed to delete college.");
      }
    } catch {
      alert("Network error. Please try again.");
    }
    setDeletingId(null);
  }

  // Client-side CSV export
  function handleCsvExport() {
    if (filteredColleges.length === 0) {
      alert("No data to export.");
      return;
    }

    const headers = [
      "ID", "Slug", "Name", "City", "State", "Ownership", 
      "NIRF Ranking", "Average Rating", "Fees", "Average Salary", 
      "Highest Salary", "Placement Rate", "Seats", "Hostel", 
      "Scholarships", "Eligibility", "Admission Process", "Description"
    ];

    const rows = filteredColleges.map(c => [
      c.id,
      c.slug,
      `"${c.name.replace(/"/g, '""')}"`,
      c.city,
      c.state,
      c.ownership,
      c.ranking,
      c.rating,
      `"${c.fees.replace(/"/g, '""')}"`,
      `"${c.averageSalary.replace(/"/g, '""')}"`,
      `"${c.highestSalary.replace(/"/g, '""')}"`,
      c.placementRate,
      c.seats,
      `"${c.hostel.replace(/"/g, '""')}"`,
      `"${c.scholarships.replace(/"/g, '""')}"`,
      `"${c.eligibility.replace(/"/g, '""')}"`,
      `"${c.admission.replace(/"/g, '""')}"`,
      `"${(c.description || "").replace(/"/g, '""').replace(/\r?\n/g, " ")}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `college_corridor_institutions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search institutions by name, city, state, or slug..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 bg-card"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleCsvExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV ({filteredColleges.length})
          </Button>
          <Link href="/internal/admin/institutions/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Institution
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters Sidebar/Header Row */}
      <Card className="bg-card/50 backdrop-blur-sm border border-muted-foreground/10">
        <CardContent className="p-4 flex flex-wrap gap-4 items-center">
          <span className="flex items-center gap-2 text-sm font-semibold text-muted-foreground shrink-0">
            <SlidersHorizontal className="h-4 w-4" />
            Filters:
          </span>

          {/* State Filter */}
          <div className="w-48">
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">All States</option>
              {uniqueStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          {/* Ownership Filter */}
          <div className="w-48">
            <select
              value={selectedOwnership}
              onChange={(e) => {
                setSelectedOwnership(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">All Ownership Types</option>
              {uniqueOwnerships.map(own => (
                <option key={own} value={own}>{own}</option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          {(selectedState || selectedOwnership || searchQuery) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setSelectedState("");
                setSelectedOwnership("");
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800"
            >
              Clear Filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Institutions Grid / List */}
      {paginatedColleges.length === 0 ? (
        <Card className="border border-dashed py-16 text-center">
          <CardContent className="space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <Building className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold">No institutions found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              No institutions matched your search or filters. Try adjusting your settings or add a new record.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {paginatedColleges.map((college) => (
            <Card key={college.id} className="overflow-hidden hover:shadow-md transition-shadow border-muted-foreground/15">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  {/* Left Section: Core Details */}
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="text-lg font-bold text-card-foreground truncate">
                        {college.name}
                      </h2>
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                        {college.ownership}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {college.city}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 shrink-0" />
                        {college.city}, {college.state}
                      </span>
                      <span className="flex items-center gap-1">
                        <Trophy className="h-4 w-4 shrink-0 text-amber-500" />
                        NIRF #{college.ranking || "N/A"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 shrink-0 text-yellow-500 fill-yellow-500" />
                        {college.rating || "N/A"}/5
                      </span>
                      <span className="font-semibold text-indigo-600">
                        {college.fees}
                      </span>
                      <span>
                        Avg Salary: {college.averageSalary}
                      </span>
                    </div>

                    {/* Courses Tags Preview */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {college.courses.slice(0, 4).map((c, i) => (
                        <Badge key={i} variant="outline" className="bg-card text-xs font-normal border-muted-foreground/20">
                          {c}
                        </Badge>
                      ))}
                      {college.courses.length > 4 && (
                        <span className="text-xs text-muted-foreground py-0.5 px-1.5">
                          +{college.courses.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Section: Actions */}
                  <div className="flex shrink-0 gap-2.5 md:self-center">
                    <Link href={`/internal/admin/institutions/${college.id}`}>
                      <Button variant="outline" size="sm" className="gap-2 border-muted-foreground/30">
                        <Pencil className="h-4 w-4" />
                        Edit / Manage
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDelete(college.id)}
                      disabled={deletingId === college.id}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      {deletingId === college.id ? "Deleting" : "Delete"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, filteredColleges.length)}
            </span>{" "}
            of <span className="font-medium">{filteredColleges.length}</span> institutions
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
