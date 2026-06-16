/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

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

// Helper: parse custom field JSON value
function getFieldValueString(val: any): string {
  if (val === null || val === undefined) return "N/A";
  if (Array.isArray(val)) return val.join(", ");
  return String(val);
}

// Convert dynamic Institution and Programs to flat College model
export async function mapInstitutionToCollege(inst: any): Promise<College> {
  // Extract custom fields values
  const valuesMap: Record<string, any> = {};
  if (inst.customValues) {
    for (const cv of inst.customValues) {
      if (cv.fieldDefinition) {
        valuesMap[cv.fieldDefinition.key] = cv.value;
      }
    }
  }

  // Parse courses & modes from Programs
  const coursesList: string[] = [];
  const modesSet = new Set<"Online" | "Offline" | "Distance">();
  
  if (inst.programs) {
    for (const prog of inst.programs) {
      coursesList.push(prog.name);
      
      // Map category relations to modes
      if (prog.categories) {
        for (const cat of prog.categories) {
          if (cat.slug.includes("online")) modesSet.add("Online");
          else if (cat.slug.includes("offline")) modesSet.add("Offline");
          else if (cat.slug.includes("distance")) modesSet.add("Distance");
        }
      }
    }
  }

  // Fallback modes if empty
  if (modesSet.size === 0) {
    modesSet.add("Offline");
  }

  // Extract ranking
  let rankingVal = 0;
  if (inst.ranking && typeof inst.ranking === "object") {
    rankingVal = Number((inst.ranking as any).nirf || (inst.ranking as any).rank || 0);
  }

  // Map fees string
  let feesStr = "N/A";
  if (inst.programs && inst.programs.length > 0) {
    const firstProg = inst.programs[0];
    if (firstProg.fees && typeof firstProg.fees === "object") {
      const total = (firstProg.fees as any).total || (firstProg.fees as any).tuition;
      if (total) {
        feesStr = `INR ${(Number(total) / 100000).toFixed(1)}L`;
      }
    }
  }

  return {
    id: inst.id,
    slug: inst.slug,
    name: inst.name,
    city: inst.city || "",
    state: inst.state || "",
    ownership: inst.type === "UNIVERSITY" ? "Deemed" : "Private", // fallback classification
    ranking: rankingVal,
    rating: 4.5, // Seed rating
    courses: coursesList.length > 0 ? coursesList : ["B.Tech Computer Science"],
    modes: Array.from(modesSet),
    fees: feesStr,
    averageSalary: getFieldValueString(valuesMap["avg_package"] ? `INR ${(Number(valuesMap["avg_package"]) / 100000).toFixed(1)} LPA` : "N/A"),
    highestSalary: getFieldValueString(valuesMap["highest_package"] ? `INR ${(Number(valuesMap["highest_package"]) / 100000).toFixed(1)} LPA` : "N/A"),
    placementRate: getFieldValueString(valuesMap["placement_rate"] ? `${valuesMap["placement_rate"]}%` : "91%"),
    seats: 240,
    hostel: getFieldValueString(valuesMap["hostel_available"] || "Yes"),
    scholarships: inst.scholarships || "Scholarships available",
    eligibility: inst.eligibility || "Contact admissions",
    admission: inst.admissionProcess || "Entrance based",
    description: inst.fullDescription || inst.shortDescription || ""
  };
}

export async function getColleges(): Promise<College[]> {
  const dbInstitutions = await prisma.institution.findMany({
    where: { status: "PUBLISHED" },
    include: {
      categories: true,
      programs: {
        include: {
          categories: true
        }
      },
      customValues: {
        include: {
          fieldDefinition: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const collegesList: College[] = [];
  for (const inst of dbInstitutions) {
    collegesList.push(await mapInstitutionToCollege(inst));
  }
  return collegesList;
}

export async function getCollege(slug: string): Promise<College | undefined> {
  const inst = await prisma.institution.findUnique({
    where: { slug },
    include: {
      categories: true,
      programs: {
        include: {
          categories: true
        }
      },
      customValues: {
        include: {
          fieldDefinition: true
        }
      }
    }
  });

  if (!inst) return undefined;
  return mapInstitutionToCollege(inst);
}

export async function getCollegeById(id: string): Promise<College | undefined> {
  const inst = await prisma.institution.findUnique({
    where: { id },
    include: {
      categories: true,
      programs: {
        include: {
          categories: true
        }
      },
      customValues: {
        include: {
          fieldDefinition: true
        }
      }
    }
  });

  if (!inst) return undefined;
  return mapInstitutionToCollege(inst);
}

export async function addCollege(college: College): Promise<College> {
  const categorySlug = college.modes.includes("Online") 
    ? "online-programs" 
    : "offline-colleges";
  
  // Find Category in DB
  let category = await prisma.category.findUnique({ where: { slug: categorySlug } });
  if (!category) {
    category = await prisma.category.create({
      data: {
        name: categorySlug === "online-programs" ? "Online Programs" : "Offline Colleges",
        slug: categorySlug
      }
    });
  }

  // 1. Create/Update Institution
  const inst = await prisma.institution.upsert({
    where: { id: college.id },
    update: {
      name: college.name,
      slug: college.slug,
      fullDescription: college.description,
      city: college.city,
      state: college.state,
      admissionProcess: college.admission,
      eligibility: college.eligibility,
      scholarships: college.scholarships,
      ranking: { nirf: college.ranking },
      status: "PUBLISHED",
      categories: {
        connect: [{ id: category.id }]
      }
    },
    create: {
      id: college.id,
      name: college.name,
      slug: college.slug,
      type: college.ownership === "Deemed" ? "UNIVERSITY" : "COLLEGE",
      fullDescription: college.description,
      city: college.city,
      state: college.state,
      admissionProcess: college.admission,
      eligibility: college.eligibility,
      scholarships: college.scholarships,
      ranking: { nirf: college.ranking },
      status: "PUBLISHED",
      categories: {
        connect: [{ id: category.id }]
      }
    }
  });

  // 2. Create/Update Related Programs
  if (college.courses && college.courses.length > 0) {
    for (const courseName of college.courses) {
      const courseSlug = `${college.slug}-${courseName.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-")}`;
      await prisma.program.upsert({
        where: { slug: courseSlug },
        update: {
          name: courseName,
          status: "PUBLISHED"
        },
        create: {
          name: courseName,
          slug: courseSlug,
          institutionId: inst.id,
          status: "PUBLISHED",
          categories: {
            connect: [{ id: category.id }]
          }
        }
      });
    }
  }

  // 3. Save Custom Dynamic Fields Values
  const fields = [
    { key: "hostel_available", value: college.hostel },
    { key: "avg_package", value: parseInt(college.averageSalary.replace(/[^0-9]/g, "")) || 400000 },
    { key: "highest_package", value: parseInt(college.highestSalary.replace(/[^0-9]/g, "")) || 1200000 }
  ];

  for (const f of fields) {
    const fieldDef = await prisma.customFieldDefinition.findFirst({
      where: { key: f.key }
    });

    if (fieldDef) {
      await prisma.customFieldValue.upsert({
        where: {
          institutionId_fieldDefinitionId: {
            institutionId: inst.id,
            fieldDefinitionId: fieldDef.id
          }
        },
        update: {
          value: f.value as Prisma.InputJsonValue
        },
        create: {
          institutionId: inst.id,
          fieldDefinitionId: fieldDef.id,
          value: f.value as Prisma.InputJsonValue
        }
      });
    }
  }

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
    await prisma.program.deleteMany({ where: { institutionId: id } });
    await prisma.customFieldValue.deleteMany({ where: { institutionId: id } });
    await prisma.institution.delete({ where: { id } });
    return true;
  } catch (error) {
    console.error("Prisma delete failed:", error);
    return false;
  }
}

export const colleges: College[] = [];
