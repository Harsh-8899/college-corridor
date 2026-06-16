/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/db/prisma";

export type College = {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
  ownership: string;
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

  // Expanded Fields
  aisheCode?: string;
  shortName?: string;
  type?: string;
  approval?: string;
  affiliation?: string;
  establishedYear?: number;
  campusSize?: string;
  genderAccepted?: string;
  address?: string;
  pincode?: string;
  website?: string;
  email?: string;
  phone?: string;
  logoUrl?: string;
  imageUrl?: string;
  brochureUrl?: string;
  verificationStatus?: string;
  sourceName?: string;
  sourceUrl?: string;
  published?: boolean;

  // Related placements / rankings / admissions / SEO
  topRecruiters?: string;
  nirfCategory?: string;
  nirfScore?: string;
  otherRanking?: string;
  rankingSource?: string;
  selectionCriteria?: string;
  entranceExams?: string;
  cutoffInfo?: string;
  applicationMode?: string;
  counsellingProcess?: string;
  metaTitle?: string;
  metaDescription?: string;
  faqJson?: any;
  highlightsJson?: any;
  importantDatesJson?: any;
};

// Convert dynamic Institution and relation models to flat College model
export async function mapInstitutionToCollege(inst: any): Promise<College> {
  // Extract ranking
  let rankingVal = 0;
  let nirfCat = "N/A";
  let nirfSc = "N/A";
  let otherRank = "N/A";
  let rankSrc = "N/A";

  if (inst.rankings && inst.rankings.length > 0) {
    const r = inst.rankings[0];
    if (r.nirfRank && r.nirfRank !== "N/A") {
      rankingVal = Number(r.nirfRank) || 0;
    }
    nirfCat = r.nirfCategory || "N/A";
    nirfSc = r.nirfScore || "N/A";
    otherRank = r.otherRanking || "N/A";
    rankSrc = r.rankingSource || "N/A";
  }

  // Extract rating
  let ratingVal = 4.5;
  if (inst.reviewSummaries && inst.reviewSummaries.length > 0) {
    const ratingStr = inst.reviewSummaries[0].overallRating;
    if (ratingStr && ratingStr !== "N/A") {
      ratingVal = Number(ratingStr) || 4.5;
    }
  }

  // Extract courses & modes
  const coursesList: string[] = [];
  const modesSet = new Set<"Online" | "Offline" | "Distance">();
  
  if (inst.courses) {
    for (const course of inst.courses) {
      coursesList.push(course.courseName);
      const m = course.mode || "Offline";
      if (m.includes("Online")) modesSet.add("Online");
      else if (m.includes("Distance")) modesSet.add("Distance");
      else modesSet.add("Offline");
    }
  }

  if (modesSet.size === 0) {
    modesSet.add("Offline");
  }

  // Extract fees
  let feesStr = "N/A";
  if (inst.courses && inst.courses.length > 0) {
    const firstCourse = inst.courses[0];
    if (firstCourse.totalFees && firstCourse.totalFees !== "N/A") {
      feesStr = firstCourse.totalFees;
    } else if (firstCourse.yearlyFees && firstCourse.yearlyFees !== "N/A") {
      feesStr = `${firstCourse.yearlyFees}/Yr`;
    }
  }

  // Placements
  const placementObj = inst.placements?.[0];
  const avgSal = placementObj?.averagePackage || "N/A";
  const highSal = placementObj?.highestPackage || "N/A";
  const placeRate = placementObj?.placementPercentage || "N/A";
  const recruiters = placementObj?.topRecruiters || "N/A";

  // Seats
  let totalSeats = 0;
  if (inst.courses && inst.courses.length > 0) {
    for (const c of inst.courses) {
      if (c.seats && c.seats !== "N/A") {
        totalSeats += Number(c.seats) || 0;
      }
    }
  }
  if (totalSeats === 0) totalSeats = 180; // fallback

  // Hostel & Facilities
  const facilityObj = inst.facilities?.[0];
  const hostelStr = facilityObj?.hostel || "N/A";

  // Scholarships
  const scholarshipObj = inst.scholarships?.[0];
  const scholarshipStr = scholarshipObj?.scholarshipDetails || "N/A";

  // Eligibility
  const eligibilityStr = inst.courses?.[0]?.eligibility || "N/A";

  // Admission Process
  const admissionObj = inst.admissions?.[0];
  const admissionStr = admissionObj?.admissionProcess || "N/A";
  const selCriteria = admissionObj?.selectionCriteria || "N/A";
  const entExams = admissionObj?.entranceExams || "N/A";
  const cutInfo = admissionObj?.cutoffInfo || "N/A";
  const appMode = admissionObj?.applicationMode || "N/A";
  const counselProc = admissionObj?.counsellingProcess || "N/A";

  // SEO Info
  const seoObj = inst.seo?.[0];
  const mTitle = seoObj?.metaTitle || "N/A";
  const mDesc = seoObj?.metaDescription || "N/A";
  const fJson = seoObj?.faqJson || [];
  const hJson = seoObj?.highlightsJson || [];
  const dJson = seoObj?.importantDatesJson || [];

  return {
    id: inst.id,
    slug: inst.slug,
    name: inst.name,
    city: inst.city || "N/A",
    state: inst.state || "N/A",
    ownership: inst.ownership || "N/A",
    ranking: rankingVal,
    rating: ratingVal,
    courses: coursesList.length > 0 ? coursesList : [],
    modes: Array.from(modesSet),
    fees: feesStr,
    averageSalary: avgSal,
    highestSalary: highSal,
    placementRate: placeRate,
    seats: totalSeats,
    hostel: hostelStr,
    scholarships: scholarshipStr,
    eligibility: eligibilityStr,
    admission: admissionStr,
    description: inst.description || "N/A",

    // Expanded properties mapped
    aisheCode: inst.aisheCode || "N/A",
    shortName: inst.shortName || "N/A",
    type: inst.type || "COLLEGE",
    approval: inst.approval || "N/A",
    affiliation: inst.affiliation || "N/A",
    establishedYear: inst.establishedYear || undefined,
    campusSize: inst.campusSize || "N/A",
    genderAccepted: inst.genderAccepted || "N/A",
    address: inst.address || "N/A",
    pincode: inst.pincode || "N/A",
    website: inst.website || "N/A",
    email: inst.email || "N/A",
    phone: inst.phone || "N/A",
    logoUrl: inst.logoUrl || "N/A",
    imageUrl: inst.imageUrl || "N/A",
    brochureUrl: inst.brochureUrl || "N/A",
    verificationStatus: inst.verificationStatus || "PENDING",
    sourceName: inst.sourceName || "N/A",
    sourceUrl: inst.sourceUrl || "N/A",
    published: inst.published,

    topRecruiters: recruiters,
    nirfCategory: nirfCat,
    nirfScore: nirfSc,
    otherRanking: otherRank,
    rankingSource: rankSrc,
    selectionCriteria: selCriteria,
    entranceExams: entExams,
    cutoffInfo: cutInfo,
    applicationMode: appMode,
    counsellingProcess: counselProc,
    metaTitle: mTitle,
    metaDescription: mDesc,
    faqJson: fJson,
    highlightsJson: hJson,
    importantDatesJson: dJson
  };
}

export async function getColleges(): Promise<College[]> {
  const dbInstitutions = await prisma.institution.findMany({
    include: {
      courses: true,
      placements: true,
      rankings: true,
      admissions: true,
      reviewSummaries: true,
      facilities: true,
      scholarships: true,
      seo: true
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
      courses: true,
      placements: true,
      rankings: true,
      admissions: true,
      reviewSummaries: true,
      facilities: true,
      scholarships: true,
      seo: true
    }
  });

  if (!inst) return undefined;
  return mapInstitutionToCollege(inst);
}

export async function getCollegeById(id: string): Promise<College | undefined> {
  const inst = await prisma.institution.findUnique({
    where: { id },
    include: {
      courses: true,
      placements: true,
      rankings: true,
      admissions: true,
      reviewSummaries: true,
      facilities: true,
      scholarships: true,
      seo: true
    }
  });

  if (!inst) return undefined;
  return mapInstitutionToCollege(inst);
}

export async function addCollege(college: College): Promise<College> {
  const cleanAisheCode = (college.aisheCode === "N/A" || !college.aisheCode) ? null : college.aisheCode;

  // 1. Create/Update Institution
  const inst = await prisma.institution.upsert({
    where: { id: college.id },
    update: {
      name: college.name,
      slug: college.slug,
      city: college.city,
      state: college.state,
      ownership: college.ownership,
      description: college.description,
      aisheCode: cleanAisheCode,
      shortName: college.shortName || "N/A",
      type: college.type || "COLLEGE",
      approval: college.approval || "N/A",
      affiliation: college.affiliation || "N/A",
      establishedYear: college.establishedYear || null,
      campusSize: college.campusSize || "N/A",
      genderAccepted: college.genderAccepted || "N/A",
      address: college.address || "N/A",
      pincode: college.pincode || "N/A",
      website: college.website || "N/A",
      email: college.email || "N/A",
      phone: college.phone || "N/A",
      logoUrl: college.logoUrl || "N/A",
      imageUrl: college.imageUrl || "N/A",
      brochureUrl: college.brochureUrl || "N/A",
      verificationStatus: college.verificationStatus || "PENDING",
      sourceName: college.sourceName || "N/A",
      sourceUrl: college.sourceUrl || "N/A",
      published: college.published !== undefined ? college.published : true
    },
    create: {
      id: college.id,
      name: college.name,
      slug: college.slug,
      city: college.city,
      state: college.state,
      ownership: college.ownership,
      description: college.description,
      aisheCode: cleanAisheCode,
      shortName: college.shortName || "N/A",
      type: college.type || "COLLEGE",
      approval: college.approval || "N/A",
      affiliation: college.affiliation || "N/A",
      establishedYear: college.establishedYear || null,
      campusSize: college.campusSize || "N/A",
      genderAccepted: college.genderAccepted || "N/A",
      address: college.address || "N/A",
      pincode: college.pincode || "N/A",
      website: college.website || "N/A",
      email: college.email || "N/A",
      phone: college.phone || "N/A",
      logoUrl: college.logoUrl || "N/A",
      imageUrl: college.imageUrl || "N/A",
      brochureUrl: college.brochureUrl || "N/A",
      verificationStatus: college.verificationStatus || "PENDING",
      sourceName: college.sourceName || "N/A",
      sourceUrl: college.sourceUrl || "N/A",
      published: college.published !== undefined ? college.published : true
    }
  });

  // 2. Create/Update Courses
  if (college.courses && college.courses.length > 0) {
    await prisma.institutionCourse.deleteMany({ where: { institutionId: inst.id } });
    for (const courseName of college.courses) {
      await prisma.institutionCourse.create({
        data: {
          institutionId: inst.id,
          courseName,
          stream: "Engineering", // default fallback
          level: "UG",
          degree: "B.Tech",
          specialization: "General",
          duration: "4 Years",
          mode: college.modes?.[0] || "Offline",
          totalFees: college.fees,
          eligibility: college.eligibility,
          seats: String(college.seats)
        }
      });
    }
  }

  // 3. Create/Update Placements
  await prisma.institutionPlacement.deleteMany({ where: { institutionId: inst.id } });
  await prisma.institutionPlacement.create({
    data: {
      institutionId: inst.id,
      placementYear: new Date().getFullYear() - 1,
      averagePackage: college.averageSalary,
      highestPackage: college.highestSalary,
      placementPercentage: college.placementRate,
      topRecruiters: college.topRecruiters || "N/A"
    }
  });

  // 4. Create/Update Rankings
  await prisma.institutionRanking.deleteMany({ where: { institutionId: inst.id } });
  await prisma.institutionRanking.create({
    data: {
      institutionId: inst.id,
      nirfRank: String(college.ranking),
      nirfCategory: college.nirfCategory || "N/A",
      nirfScore: college.nirfScore || "N/A",
      otherRanking: college.otherRanking || "N/A",
      rankingSource: college.rankingSource || "N/A",
      rankingYear: new Date().getFullYear() - 1
    }
  });

  // 5. Create/Update Admissions
  await prisma.institutionAdmission.deleteMany({ where: { institutionId: inst.id } });
  await prisma.institutionAdmission.create({
    data: {
      institutionId: inst.id,
      admissionProcess: college.admission,
      selectionCriteria: college.selectionCriteria || "N/A",
      entranceExams: college.entranceExams || "N/A",
      cutoffInfo: college.cutoffInfo || "N/A",
      applicationMode: college.applicationMode || "N/A",
      counsellingProcess: college.counsellingProcess || "N/A"
    }
  });

  // 6. Create/Update Facilities
  await prisma.institutionFacility.deleteMany({ where: { institutionId: inst.id } });
  await prisma.institutionFacility.create({
    data: {
      institutionId: inst.id,
      hostel: college.hostel,
      library: "Yes",
      sports: "Yes",
      labs: "Yes",
      medical: "Yes",
      cafeteria: "Yes",
      wifi: "Yes"
    }
  });

  // 7. Create/Update Scholarships
  await prisma.institutionScholarship.deleteMany({ where: { institutionId: inst.id } });
  await prisma.institutionScholarship.create({
    data: {
      institutionId: inst.id,
      scholarshipAvailable: "Yes",
      scholarshipDetails: college.scholarships
    }
  });

  // 8. Create/Update SEO details
  await prisma.institutionSeo.deleteMany({ where: { institutionId: inst.id } });
  await prisma.institutionSeo.create({
    data: {
      institutionId: inst.id,
      metaTitle: college.metaTitle || college.name,
      metaDescription: college.metaDescription || college.description,
      faqJson: college.faqJson || [],
      highlightsJson: college.highlightsJson || [],
      importantDatesJson: college.importantDatesJson || []
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
    await prisma.institution.delete({ where: { id } });
    return true;
  } catch (error) {
    console.error("Prisma delete failed:", error);
    return false;
  }
}

export const colleges: College[] = [];
