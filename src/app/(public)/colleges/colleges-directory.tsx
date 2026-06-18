"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Search, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Globe2,
  Building2,
  ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CollegeCard } from "@/components/college/college-card";
import type { College } from "@/lib/data/colleges";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

type CollegesDirectoryProps = {
  initialColleges: College[];
};

type EducationCategory = "offline" | "online" | "distance" | "study-abroad";

export function CollegesDirectory({ initialColleges }: CollegesDirectoryProps) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  
  const [activeCategory, setActiveCategory] = useState<EducationCategory>("offline");

  useEffect(() => {
    if (categoryParam) {
      const normalized = categoryParam.toLowerCase();
      if (["offline", "online", "distance", "study-abroad"].includes(normalized)) {
        setActiveCategory(normalized as EducationCategory);
      }
    }
  }, [categoryParam]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedOwnership, setSelectedOwnership] = useState("");
  const [sortBy, setSortBy] = useState("ranking"); // ranking, fees_asc, fees_desc, salary_desc, rating_desc
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter options dynamically
  const uniqueStates = useMemo(() => {
    const states = initialColleges.map(c => c.state).filter(Boolean);
    return Array.from(new Set(states)).sort();
  }, [initialColleges]);

  const uniqueOwnerships = useMemo(() => {
    const ownerships = initialColleges.map(c => c.ownership).filter(Boolean);
    return Array.from(new Set(ownerships)).sort();
  }, [initialColleges]);

  // Parsing values helper for sorting
  const parseFees = (feesStr: string) => {
    const clean = feesStr.replace(/[^0-9]/g, "");
    return Number(clean) || 0;
  };

  const parseSalary = (salStr: string) => {
    const clean = salStr.toLowerCase();
    let multiplier = 1;
    if (clean.includes("lpa") || clean.includes("l")) {
      multiplier = 100000;
    } else if (clean.includes("crore") || clean.includes("cr") || clean.includes("c")) {
      multiplier = 10000000;
    }
    const num = Number(clean.replace(/[^0-9.]/g, "")) || 0;
    return num * multiplier;
  };

  // Main Filter and Sort logic
  const filteredAndSortedColleges = useMemo(() => {
    // 1. Category filter
    let list = initialColleges.filter(c => {
      if (activeCategory === "offline") return c.modes.includes("Offline");
      if (activeCategory === "online") return c.modes.includes("Online");
      if (activeCategory === "distance") return c.modes.includes("Distance");
      return false; // Study abroad handled separately below
    });

    // 2. Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c => 
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q) ||
        c.courses.some(course => course.toLowerCase().includes(q))
      );
    }

    // 3. State filter
    if (selectedState) {
      list = list.filter(c => c.state === selectedState);
    }

    // 4. Ownership filter
    if (selectedOwnership) {
      list = list.filter(c => c.ownership === selectedOwnership);
    }

    // 5. Sort
    list.sort((a, b) => {
      if (sortBy === "ranking") {
        // Lower number rank is better (IIT #1 better than private #20). N/A rank put at the bottom.
        const rankA = a.ranking || 999999;
        const rankB = b.ranking || 999999;
        return rankA - rankB;
      }
      if (sortBy === "rating_desc") {
        return (b.rating || 0) - (a.rating || 0);
      }
      if (sortBy === "fees_asc") {
        return parseFees(a.fees) - parseFees(b.fees);
      }
      if (sortBy === "fees_desc") {
        return parseFees(b.fees) - parseFees(a.fees);
      }
      if (sortBy === "salary_desc") {
        return parseSalary(b.averageSalary) - parseSalary(a.averageSalary);
      }
      return 0;
    });

    return list;
  }, [initialColleges, activeCategory, searchQuery, selectedState, selectedOwnership, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedColleges.length / itemsPerPage);
  const paginatedColleges = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedColleges.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredAndSortedColleges, currentPage]);

  return (
    <div className="space-y-8">
      {/* Category Selection Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-muted/30 p-2 rounded-xl border border-muted-foreground/10">
        {[
          { id: "offline", label: "Offline Colleges", desc: "Campus Degrees" },
          { id: "online", label: "Online Programs", desc: "Flexi-Learning" },
          { id: "distance", label: "Distance Learning", desc: "Correspondent" },
          { id: "study-abroad", label: "Study Abroad", desc: "Global Education" }
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveCategory(cat.id as EducationCategory);
              setCurrentPage(1);
            }}
            className={`flex flex-col items-center justify-center py-3 px-4 rounded-lg text-center transition-all ${
              activeCategory === cat.id
                ? "bg-card text-primary shadow-sm ring-1 ring-black/5"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            <span className="font-bold text-sm">{cat.label}</span>
            <span className="text-xxs text-muted-foreground/85 mt-0.5">{cat.desc}</span>
          </button>
        ))}
      </div>

      {/* Handle Study Abroad separately */}
      {activeCategory === "study-abroad" ? (
        <Card className="border border-indigo-600/20 bg-gradient-to-r from-indigo-50/20 to-purple-50/20 backdrop-blur-sm shadow-sm">
          <CardContent className="p-8 text-center space-y-5 max-w-2xl mx-auto">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 shadow-inner">
              <Globe2 className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Global Discovery & Study Abroad Portal
              </h2>
              <p className="text-muted-foreground">
                College Corridor connects students with top universities across USA, UK, Canada, Australia, Germany, and more. 
                Explore custom visa processes, average costs, scholarship schemes, and apply directly.
              </p>
            </div>
            <div className="pt-2">
              <Link href="/study-abroad">
                <Button size="lg" className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all">
                  Browse Countries & Global Programs
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Search, Filter & Sort inputs */}
          <div className="grid gap-4 md:grid-cols-[1fr_200px_200px_200px] items-center">
            {/* Search Input */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by college name, course, city..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 bg-card"
              />
            </div>

            {/* State Filter */}
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 rounded-md border border-input bg-card px-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">All States</option>
              {uniqueStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>

            {/* Ownership Filter */}
            <select
              value={selectedOwnership}
              onChange={(e) => {
                setSelectedOwnership(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 rounded-md border border-input bg-card px-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">All Ownership Types</option>
              {uniqueOwnerships.map(own => (
                <option key={own} value={own}>{own}</option>
              ))}
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 rounded-md border border-input bg-card px-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="ranking">Sort by NIRF Rank</option>
              <option value="rating_desc">Sort by Rating</option>
              <option value="salary_desc">Sort by Avg Salary</option>
              <option value="fees_asc">Fees: Low to High</option>
              <option value="fees_desc">Fees: High to Low</option>
            </select>
          </div>

          {/* Advanced Filter Status */}
          {(searchQuery || selectedState || selectedOwnership) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/10 p-2 rounded-md border border-dashed">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Found {filteredAndSortedColleges.length} results.</span>
              <button 
                onClick={() => {
                  setSearchQuery("");
                  setSelectedState("");
                  setSelectedOwnership("");
                  setCurrentPage(1);
                }} 
                className="text-primary hover:underline ml-auto font-medium"
              >
                Reset filters
              </button>
            </div>
          )}

          {/* Colleges Cards Grid */}
          {paginatedColleges.length === 0 ? (
            <Card className="border border-dashed py-16 text-center bg-card/50">
              <CardContent className="space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                  <Building2 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">No results found</h3>
                <p className="text-muted-foreground max-w-sm mx-auto text-sm">
                  We couldn&apos;t find any institutions in this category matching your search. Try resetting filters.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedColleges.map((college) => (
                <div key={college.id} className="transform transition-transform hover:-translate-y-1 duration-200">
                  <CollegeCard college={college} />
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-muted-foreground/10 pt-6">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, filteredAndSortedColleges.length)}
                </span>{" "}
                of <span className="font-medium">{filteredAndSortedColleges.length}</span> institutions
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-9 w-9 p-0"
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
                  className="h-9 w-9 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
