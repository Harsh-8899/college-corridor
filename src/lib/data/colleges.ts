import { prisma } from "@/lib/db/prisma";
import { CollegeOwnership, CourseMode, Prisma, College as PrismaCollege, Campus, CollegeCourse, Course, PlacementStat, Ranking, Review, Scholarship } from "@prisma/client";

export type College = {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
  ownership: "Government" | "Private" | "Deemed";
  ranking: number;
  rating: number;
  courses: string[];
  modes: Array<"Online" | "Offline" | "Distance">;
  fees: string;
  averageSalary: string;
  highestSalary: string;
  placementRate: string;
  seats: number;
  hostel: string;
  scholarships: string;
  eligibility: string;
  admission: string;
  description: string;
};

export type CompleteDbCollege = PrismaCollege & {
  campuses?: Campus[];
  courses?: (CollegeCourse & { course?: Course })[];
  placements?: PlacementStat[];
  rankings?: Ranking[];
  reviews?: Review[];
  scholarships?: Scholarship[];
};

// Map database records into flat frontend model
export function mapDbCollegeToCollege(db: CompleteDbCollege): College {
  const campus = db.campuses?.[0];
  const ranking = db.rankings?.[0]?.rank || 0;
  const placement = db.placements?.[0];
  const firstCourse = db.courses?.[0];
  const scholarship = db.scholarships?.[0];

  // Retrieve raw strings saved in campus.hostelDetails JSON, or reconstruct from columns
  let meta: Record<string, unknown> = {};
  if (campus?.hostelDetails && typeof campus.hostelDetails === "object") {
    meta = campus.hostelDetails as Record<string, unknown>;
  }

  const fees = (meta.feesRaw as string) || (firstCourse?.totalFees ? `INR ${(firstCourse.totalFees / 100000).toFixed(1)}L` : "N/A");
  const averageSalary = (meta.avgSalaryRaw as string) || (placement?.averageSalary ? `INR ${(placement.averageSalary / 100000).toFixed(1)} LPA` : "N/A");
  const highestSalary = (meta.highestSalaryRaw as string) || (placement?.highestSalary ? `INR ${(placement.highestSalary / 100000).toFixed(1)} LPA` : "N/A");
  const placementRate = (meta.placementRateRaw as string) || (placement?.placementRate ? `${placement.placementRate}%` : "N/A");
  const hostel = (meta.hostelRaw as string) || (campus?.hasHostel ? "Hostel accommodation available" : "No hostel details");
  const scholarships = (meta.scholarshipsRaw as string) || (scholarship?.description || "Scholarships available");
  const eligibility = (meta.eligibilityRaw as string) || (firstCourse?.eligibility || "Contact admissions");
  const admission = (meta.admissionRaw as string) || (firstCourse?.admissionProcess || "Entrance based");
  const rating = (meta.ratingRaw as number) || (db.reviews && db.reviews.length > 0
    ? Number((db.reviews.reduce((sum: number, r) => sum + r.ratingOverall, 0) / db.reviews.length).toFixed(1))
    : 4.5);

  const coursesList = db.courses?.map((c) => c.course?.name || c.specialization || "").filter(Boolean) || [];
  const modesList = Array.from(new Set(db.courses?.map((c) => {
    const m = c.mode;
    return m === "ONLINE" ? "Online" : m === "OFFLINE" ? "Offline" : "Distance";
  }) || [])) as ("Online" | "Offline" | "Distance")[];

  return {
    id: db.id,
    slug: db.slug,
    name: db.name,
    city: campus?.city || "",
    state: campus?.state || "",
    ownership: db.ownership ? (db.ownership === "GOVERNMENT" ? "Government" : db.ownership === "DEEMED" ? "Deemed" : "Private") : "Private",
    ranking,
    rating,
    courses: coursesList.length > 0 ? coursesList : ((meta.coursesRaw as string[]) || []),
    modes: modesList.length > 0 ? modesList : ["Offline"],
    fees,
    averageSalary,
    highestSalary,
    placementRate,
    seats: firstCourse?.seats || (meta.seatsRaw as number) || 0,
    hostel,
    scholarships,
    eligibility,
    admission,
    description: db.description || ""
  };
}

export async function getColleges(): Promise<College[]> {
  const dbColleges = await prisma.college.findMany({
    include: {
      campuses: true,
      courses: {
        include: {
          course: true
        }
      },
      placements: true,
      rankings: true,
      reviews: true,
      scholarships: true
    },
    orderBy: { createdAt: "desc" }
  });

  return dbColleges.map(mapDbCollegeToCollege);
}

export async function getCollege(slug: string): Promise<College | undefined> {
  const dbCollege = await prisma.college.findUnique({
    where: { slug },
    include: {
      campuses: true,
      courses: {
        include: {
          course: true
        }
      },
      placements: true,
      rankings: true,
      reviews: true,
      scholarships: true
    }
  });

  if (!dbCollege) return undefined;
  return mapDbCollegeToCollege(dbCollege);
}

export async function getCollegeById(id: string): Promise<College | undefined> {
  const dbCollege = await prisma.college.findUnique({
    where: { id },
    include: {
      campuses: true,
      courses: {
        include: {
          course: true
        }
      },
      placements: true,
      rankings: true,
      reviews: true,
      scholarships: true
    }
  });

  if (!dbCollege) return undefined;
  return mapDbCollegeToCollege(dbCollege);
}

export async function addCollege(college: College): Promise<College> {
  // Normalize ownership
  const normalizedOwnership = college.ownership.toUpperCase();
  const dbOwnership = ["GOVERNMENT", "PRIVATE", "DEEMED"].includes(normalizedOwnership)
    ? (normalizedOwnership as CollegeOwnership)
    : CollegeOwnership.OTHER;

  // Parse numbers
  const parsedFees = parseInt(college.fees.replace(/[^0-9]/g, "")) || 0;
  const parsedAvgSalary = parseInt(college.averageSalary.replace(/[^0-9]/g, "")) || 0;
  const parsedHighestSalary = parseInt(college.highestSalary.replace(/[^0-9]/g, "")) || 0;
  const parsedPlacementRate = parseFloat(college.placementRate.replace(/[^0-9.]/g, "")) || 0;

  // 1. Create/Update College
  await prisma.college.upsert({
    where: { id: college.id },
    update: {
      name: college.name,
      slug: college.slug,
      description: college.description,
      ownership: dbOwnership,
      status: "PUBLISHED"
    },
    create: {
      id: college.id,
      name: college.name,
      slug: college.slug,
      description: college.description,
      ownership: dbOwnership,
      status: "PUBLISHED"
    }
  });

  // Extra metadata serialized in campus.hostelDetails
  const hostelDetails = {
    hostelRaw: college.hostel,
    feesRaw: college.fees,
    avgSalaryRaw: college.averageSalary,
    highestSalaryRaw: college.highestSalary,
    placementRateRaw: college.placementRate,
    scholarshipsRaw: college.scholarships,
    eligibilityRaw: college.eligibility,
    admissionRaw: college.admission,
    ratingRaw: college.rating,
    seatsRaw: college.seats,
    coursesRaw: college.courses
  };

  // 2. Create/Update Campus
  await prisma.campus.upsert({
    where: { id: `camp_${college.id}` },
    update: {
      name: "Main Campus",
      city: college.city,
      state: college.state,
      hasHostel: college.hostel.toLowerCase().includes("yes") || college.hostel.toLowerCase().includes("available"),
      hostelDetails: hostelDetails as Prisma.InputJsonValue
    },
    create: {
      id: `camp_${college.id}`,
      collegeId: college.id,
      name: "Main Campus",
      city: college.city,
      state: college.state,
      hasHostel: college.hostel.toLowerCase().includes("yes") || college.hostel.toLowerCase().includes("available"),
      hostelDetails: hostelDetails as Prisma.InputJsonValue
    }
  });

  // 3. Create Courses and CollegeCourses
  if (college.courses && college.courses.length > 0) {
    for (const courseName of college.courses) {
      const courseSlug = courseName.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
      const dbCourse = await prisma.course.upsert({
        where: { slug: courseSlug },
        update: { name: courseName },
        create: { name: courseName, slug: courseSlug }
      });

      const mode = college.modes.includes("Online")
        ? CourseMode.ONLINE
        : college.modes.includes("Distance")
        ? CourseMode.DISTANCE
        : CourseMode.OFFLINE;

      await prisma.collegeCourse.upsert({
        where: { id: `cc_${college.id}_${dbCourse.id}` },
        update: {
          mode: mode,
          totalFees: parsedFees,
          seats: college.seats,
          eligibility: college.eligibility,
          admissionProcess: college.admission,
          status: "PUBLISHED"
        },
        create: {
          id: `cc_${college.id}_${dbCourse.id}`,
          collegeId: college.id,
          courseId: dbCourse.id,
          mode: mode,
          totalFees: parsedFees,
          seats: college.seats,
          eligibility: college.eligibility,
          admissionProcess: college.admission,
          status: "PUBLISHED"
        }
      });
    }
  }

  // 4. Create/Update PlacementStat
  await prisma.placementStat.upsert({
    where: { id: `place_${college.id}` },
    update: {
      year: 2026,
      placementRate: parsedPlacementRate,
      averageSalary: parsedAvgSalary,
      highestSalary: parsedHighestSalary
    },
    create: {
      id: `place_${college.id}`,
      collegeId: college.id,
      year: 2026,
      placementRate: parsedPlacementRate,
      averageSalary: parsedAvgSalary,
      highestSalary: parsedHighestSalary
    }
  });

  // 5. Create/Update Ranking
  await prisma.ranking.upsert({
    where: { id: `rank_${college.id}` },
    update: {
      source: "NIRF",
      rank: college.ranking,
      year: 2026
    },
    create: {
      id: `rank_${college.id}`,
      collegeId: college.id,
      source: "NIRF",
      rank: college.ranking,
      year: 2026
    }
  });

  // 6. Create/Update Scholarship
  await prisma.scholarship.upsert({
    where: { id: `schol_${college.id}` },
    update: {
      name: "College Scholarship",
      description: college.scholarships,
      isActive: true
    },
    create: {
      id: `schol_${college.id}`,
      collegeId: college.id,
      name: "College Scholarship",
      description: college.scholarships,
      isActive: true
    }
  });

  return college;
}

export async function updateCollege(id: string, updates: Partial<College>): Promise<College | null> {
  const current = await getCollegeById(id);
  if (!current) return null;

  const merged = { ...current, ...updates };
  await addCollege(merged);

  return merged;
}

export async function deleteCollege(id: string): Promise<boolean> {
  try {
    await prisma.campus.deleteMany({ where: { collegeId: id } });
    await prisma.collegeCourse.deleteMany({ where: { collegeId: id } });
    await prisma.placementStat.deleteMany({ where: { collegeId: id } });
    await prisma.ranking.deleteMany({ where: { collegeId: id } });
    await prisma.scholarship.deleteMany({ where: { collegeId: id } });
    await prisma.college.delete({ where: { id } });
    return true;
  } catch (error) {
    console.error("Prisma delete failed:", error);
    return false;
  }
}

// Backwards compatibility export - will be empty since we query dynamically
export const colleges: College[] = [];
