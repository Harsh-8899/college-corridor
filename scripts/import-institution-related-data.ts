import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import { parseCsvFile } from "./utils";

const prisma = new PrismaClient();

function safeParseJson(val: string): any {
  if (!val || val === "N/A" || val.trim() === "") return null;
  try {
    return JSON.parse(val);
  } catch (e) {
    // If it fails, try replacing single quotes with double quotes (in case user formatted with single quotes)
    try {
      const fixed = val.replace(/'/g, '"');
      return JSON.parse(fixed);
    } catch {
      console.warn(`Failed to parse JSON string: "${val}".`);
      return null;
    }
  }
}

// Zod schemas for validation
const courseSchema = z.object({
  institution_slug: z.string().min(1),
  course_name: z.string().min(1),
  stream: z.string().min(1),
  level: z.string().min(1),
  degree: z.string().min(1),
  specialization: z.string().nullable().optional(),
  duration: z.string().nullable().optional(),
  mode: z.string().nullable().optional(),
  total_fees: z.string().nullable().optional(),
  yearly_fees: z.string().nullable().optional(),
  eligibility: z.string().nullable().optional(),
  exams_accepted: z.string().nullable().optional(),
  seats: z.string().nullable().optional(),
  application_deadline: z.string().nullable().optional()
});

const placementSchema = z.object({
  institution_slug: z.string().min(1),
  placement_year: z.preprocess((val) => val ? Number(val) : null, z.number().nullable().optional()),
  highest_package: z.string().nullable().optional(),
  average_package: z.string().nullable().optional(),
  median_package: z.string().nullable().optional(),
  placement_percentage: z.string().nullable().optional(),
  top_recruiters: z.string().nullable().optional(),
  internship_offered: z.string().nullable().optional()
});

const rankingSchema = z.object({
  institution_slug: z.string().min(1),
  nirf_rank: z.string().nullable().optional(),
  nirf_category: z.string().nullable().optional(),
  nirf_score: z.string().nullable().optional(),
  ranking_year: z.preprocess((val) => val ? Number(val) : null, z.number().nullable().optional()),
  other_ranking: z.string().nullable().optional(),
  ranking_source: z.string().nullable().optional()
});

const admissionSchema = z.object({
  institution_slug: z.string().min(1),
  admission_process: z.string().nullable().optional(),
  selection_criteria: z.string().nullable().optional(),
  entrance_exams: z.string().nullable().optional(),
  cutoff_info: z.string().nullable().optional(),
  application_mode: z.string().nullable().optional(),
  counselling_process: z.string().nullable().optional()
});

const reviewSummarySchema = z.object({
  institution_slug: z.string().min(1),
  overall_rating: z.string().nullable().optional(),
  academic_rating: z.string().nullable().optional(),
  placement_rating: z.string().nullable().optional(),
  infrastructure_rating: z.string().nullable().optional(),
  faculty_rating: z.string().nullable().optional(),
  hostel_rating: z.string().nullable().optional(),
  review_count: z.string().nullable().optional()
});

const facilitySchema = z.object({
  institution_slug: z.string().min(1),
  hostel: z.string().nullable().optional(),
  library: z.string().nullable().optional(),
  sports: z.string().nullable().optional(),
  labs: z.string().nullable().optional(),
  medical: z.string().nullable().optional(),
  cafeteria: z.string().nullable().optional(),
  wifi: z.string().nullable().optional(),
  transport: z.string().nullable().optional(),
  auditorium: z.string().nullable().optional(),
  gym: z.string().nullable().optional()
});

const scholarshipSchema = z.object({
  institution_slug: z.string().min(1),
  scholarship_available: z.string().nullable().optional(),
  scholarship_details: z.string().nullable().optional()
});

const seoSchema = z.object({
  institution_slug: z.string().min(1),
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
  faq_json: z.string().nullable().optional(),
  highlights_json: z.string().nullable().optional(),
  important_dates_json: z.string().nullable().optional()
});

async function main() {
  console.log("Starting import of related data...");

  // Cache institutions by slug
  const institutions = await prisma.institution.findMany({
    select: { id: true, slug: true }
  });
  const slugToIdMap = new Map(institutions.map(inst => [inst.slug, inst.id]));
  console.log(`Cached ${slugToIdMap.size} institutions.`);

  const dataDir = path.join(process.cwd(), "data");

  // 1. IMPORT COURSES
  const coursesPath = path.join(dataDir, "institution_courses.csv");
  if (fs.existsSync(coursesPath)) {
    console.log("Importing courses...");
    const records = parseCsvFile(coursesPath);
    let imported = 0;
    
    // Group courses by slug to clean up existing courses for those institutions first
    const slugsInCsv = new Set(records.map(r => r.institution_slug).filter(Boolean));
    for (const slug of slugsInCsv) {
      const instId = slugToIdMap.get(slug);
      if (instId) {
        await prisma.institutionCourse.deleteMany({ where: { institutionId: instId } });
      }
    }

    for (const record of records) {
      try {
        const parsed = courseSchema.parse(record);
        const instId = slugToIdMap.get(parsed.institution_slug);
        if (!instId) {
          console.warn(`Skipping course: institution slug "${parsed.institution_slug}" not found.`);
          continue;
        }
        await prisma.institutionCourse.create({
          data: {
            institutionId: instId,
            courseName: parsed.course_name,
            stream: parsed.stream,
            level: parsed.level,
            degree: parsed.degree,
            specialization: parsed.specialization || "N/A",
            duration: parsed.duration || "N/A",
            mode: parsed.mode || "N/A",
            totalFees: parsed.total_fees || "N/A",
            yearlyFees: parsed.yearly_fees || "N/A",
            eligibility: parsed.eligibility || "N/A",
            examsAccepted: parsed.exams_accepted || "N/A",
            seats: parsed.seats || "N/A",
            applicationDeadline: parsed.application_deadline || "N/A"
          }
        });
        imported++;
      } catch (err) {
        console.error(`Error importing course row:`, err);
      }
    }
    console.log(`Courses import complete: ${imported} imported.`);
  }

  // 2. IMPORT PLACEMENTS
  const placementsPath = path.join(dataDir, "institution_placements.csv");
  if (fs.existsSync(placementsPath)) {
    console.log("Importing placements...");
    const records = parseCsvFile(placementsPath);
    let imported = 0;

    for (const record of records) {
      try {
        const parsed = placementSchema.parse(record);
        const instId = slugToIdMap.get(parsed.institution_slug);
        if (!instId) continue;
        
        await prisma.institutionPlacement.deleteMany({ where: { institutionId: instId } });
        await prisma.institutionPlacement.create({
          data: {
            institutionId: instId,
            placementYear: parsed.placement_year,
            highestPackage: parsed.highest_package || "N/A",
            averagePackage: parsed.average_package || "N/A",
            medianPackage: parsed.median_package || "N/A",
            placementPercentage: parsed.placement_percentage || "N/A",
            topRecruiters: parsed.top_recruiters || "N/A",
            internshipOffered: parsed.internship_offered || "N/A"
          }
        });
        imported++;
      } catch (err) {
        console.error(`Error importing placement row:`, err);
      }
    }
    console.log(`Placements import complete: ${imported} imported.`);
  }

  // 3. IMPORT RANKINGS
  const rankingsPath = path.join(dataDir, "institution_rankings.csv");
  if (fs.existsSync(rankingsPath)) {
    console.log("Importing rankings...");
    const records = parseCsvFile(rankingsPath);
    let imported = 0;

    for (const record of records) {
      try {
        const parsed = rankingSchema.parse(record);
        const instId = slugToIdMap.get(parsed.institution_slug);
        if (!instId) continue;

        await prisma.institutionRanking.deleteMany({ where: { institutionId: instId } });
        await prisma.institutionRanking.create({
          data: {
            institutionId: instId,
            nirfRank: parsed.nirf_rank || "N/A",
            nirfCategory: parsed.nirf_category || "N/A",
            nirfScore: parsed.nirf_score || "N/A",
            rankingYear: parsed.ranking_year,
            otherRanking: parsed.other_ranking || "N/A",
            rankingSource: parsed.ranking_source || "N/A"
          }
        });
        imported++;
      } catch (err) {
        console.error(`Error importing ranking row:`, err);
      }
    }
    console.log(`Rankings import complete: ${imported} imported.`);
  }

  // 4. IMPORT ADMISSIONS
  const admissionsPath = path.join(dataDir, "institution_admissions.csv");
  if (fs.existsSync(admissionsPath)) {
    console.log("Importing admissions...");
    const records = parseCsvFile(admissionsPath);
    let imported = 0;

    for (const record of records) {
      try {
        const parsed = admissionSchema.parse(record);
        const instId = slugToIdMap.get(parsed.institution_slug);
        if (!instId) continue;

        await prisma.institutionAdmission.deleteMany({ where: { institutionId: instId } });
        await prisma.institutionAdmission.create({
          data: {
            institutionId: instId,
            admissionProcess: parsed.admission_process || "N/A",
            selectionCriteria: parsed.selection_criteria || "N/A",
            entranceExams: parsed.entrance_exams || "N/A",
            cutoffInfo: parsed.cutoff_info || "N/A",
            applicationMode: parsed.application_mode || "N/A",
            counsellingProcess: parsed.counselling_process || "N/A"
          }
        });
        imported++;
      } catch (err) {
        console.error(`Error importing admission row:`, err);
      }
    }
    console.log(`Admissions import complete: ${imported} imported.`);
  }

  // 5. IMPORT REVIEW SUMMARIES
  const reviewsPath = path.join(dataDir, "institution_review_summaries.csv");
  if (fs.existsSync(reviewsPath)) {
    console.log("Importing review summaries...");
    const records = parseCsvFile(reviewsPath);
    let imported = 0;

    for (const record of records) {
      try {
        const parsed = reviewSummarySchema.parse(record);
        const instId = slugToIdMap.get(parsed.institution_slug);
        if (!instId) continue;

        await prisma.institutionReviewSummary.deleteMany({ where: { institutionId: instId } });
        await prisma.institutionReviewSummary.create({
          data: {
            institutionId: instId,
            overallRating: parsed.overall_rating || "N/A",
            academicRating: parsed.academic_rating || "N/A",
            placementRating: parsed.placement_rating || "N/A",
            infrastructureRating: parsed.infrastructure_rating || "N/A",
            facultyRating: parsed.faculty_rating || "N/A",
            hostelRating: parsed.hostel_rating || "N/A",
            reviewCount: parsed.review_count || "N/A"
          }
        });
        imported++;
      } catch (err) {
        console.error(`Error importing review summary row:`, err);
      }
    }
    console.log(`Review summaries import complete: ${imported} imported.`);
  }

  // 6. IMPORT FACILITIES
  const facilitiesPath = path.join(dataDir, "institution_facilities.csv");
  if (fs.existsSync(facilitiesPath)) {
    console.log("Importing facilities...");
    const records = parseCsvFile(facilitiesPath);
    let imported = 0;

    for (const record of records) {
      try {
        const parsed = facilitySchema.parse(record);
        const instId = slugToIdMap.get(parsed.institution_slug);
        if (!instId) continue;

        await prisma.institutionFacility.deleteMany({ where: { institutionId: instId } });
        await prisma.institutionFacility.create({
          data: {
            institutionId: instId,
            hostel: parsed.hostel || "N/A",
            library: parsed.library || "N/A",
            sports: parsed.sports || "N/A",
            labs: parsed.labs || "N/A",
            medical: parsed.medical || "N/A",
            cafeteria: parsed.cafeteria || "N/A",
            wifi: parsed.wifi || "N/A",
            transport: parsed.transport || "N/A",
            auditorium: parsed.auditorium || "N/A",
            gym: parsed.gym || "N/A"
          }
        });
        imported++;
      } catch (err) {
        console.error(`Error importing facility row:`, err);
      }
    }
    console.log(`Facilities import complete: ${imported} imported.`);
  }

  // 7. IMPORT SCHOLARSHIPS
  const scholarshipsPath = path.join(dataDir, "institution_scholarships.csv");
  if (fs.existsSync(scholarshipsPath)) {
    console.log("Importing scholarships...");
    const records = parseCsvFile(scholarshipsPath);
    let imported = 0;

    for (const record of records) {
      try {
        const parsed = scholarshipSchema.parse(record);
        const instId = slugToIdMap.get(parsed.institution_slug);
        if (!instId) continue;

        await prisma.institutionScholarship.deleteMany({ where: { institutionId: instId } });
        await prisma.institutionScholarship.create({
          data: {
            institutionId: instId,
            scholarshipAvailable: parsed.scholarship_available || "N/A",
            scholarshipDetails: parsed.scholarship_details || "N/A"
          }
        });
        imported++;
      } catch (err) {
        console.error(`Error importing scholarship row:`, err);
      }
    }
    console.log(`Scholarships import complete: ${imported} imported.`);
  }

  // 8. IMPORT SEO
  const seoPath = path.join(dataDir, "institution_seo.csv");
  if (fs.existsSync(seoPath)) {
    console.log("Importing SEO metadata...");
    const records = parseCsvFile(seoPath);
    let imported = 0;

    for (const record of records) {
      try {
        const parsed = seoSchema.parse(record);
        const instId = slugToIdMap.get(parsed.institution_slug);
        if (!instId) continue;

        await prisma.institutionSeo.deleteMany({ where: { institutionId: instId } });
        
        const faqParsed = safeParseJson(parsed.faq_json || "");
        const highlightsParsed = safeParseJson(parsed.highlights_json || "");
        const datesParsed = safeParseJson(parsed.important_dates_json || "");

        await prisma.institutionSeo.create({
          data: {
            institutionId: instId,
            metaTitle: parsed.meta_title || "N/A",
            metaDescription: parsed.meta_description || "N/A",
            faqJson: faqParsed || [],
            highlightsJson: highlightsParsed || [],
            importantDatesJson: datesParsed || []
          }
        });
        imported++;
      } catch (err) {
        console.error(`Error importing SEO row:`, err);
      }
    }
    console.log(`SEO import complete: ${imported} imported.`);
  }

  console.log("Related data import successfully completed.");
}

main()
  .catch((e) => {
    console.error("Fatal error during related data import:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
