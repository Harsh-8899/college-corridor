import { prisma } from "@/lib/db/prisma";

export type StudentProfileInput = {
  tenthPercentage: number;
  twelfthPercentage: number;
  graduationPercentage?: number;
  entranceExam?: string;
  entranceExamScore?: string;
  preferredCourse: string;
  preferredSpecialization?: string;
  universityId?: string;
};

export type AdmissionChanceResult = {
  status: "HIGH_CHANCE" | "MODERATE_CHANCE" | "LOW_CHANCE" | "EXPERT_REVIEW_NEEDED";
  message: string;
  reasons: string[];
  eligibilityRules?: string;
  scholarshipRules?: string;
  alternatives: Array<{
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    city: string;
    state: string;
  }>;
};

export async function evaluateAdmissionChances(
  profile: StudentProfileInput,
  universityId?: string
): Promise<AdmissionChanceResult> {
  const reasons: string[] = [];
  let status: AdmissionChanceResult["status"] = "EXPERT_REVIEW_NEEDED";
  let message = "Your profile is under review by our experts.";
  let eligibilityRules = "";
  let scholarshipRules = "";
  let alternativeInstitutions: AdmissionChanceResult["alternatives"] = [];

  // Parse scores safely
  const tenth = Number(profile.tenthPercentage) || 0;
  const twelfth = Number(profile.twelfthPercentage) || 0;
  const grad = Number(profile.graduationPercentage) || 0;
  const score = Number(profile.entranceExamScore) || 0;

  if (!universityId) {
    // If no university is selected, general profile review
    if (tenth >= 60 && twelfth >= 60) {
      status = "MODERATE_CHANCE";
      message = "Based on your general marks, you have moderate chances of admission in multiple colleges. Talk to our expert to get shortlist recommendations.";
    } else {
      status = "EXPERT_REVIEW_NEEDED";
      message = "Expert review is suggested to find options that accept your qualification scores.";
    }

    // Return general active partner universities as alternatives
    const partners = await prisma.institution.findMany({
      where: { isPartner: true, published: true },
      select: { id: true, name: true, slug: true, logoUrl: true, city: true, state: true },
      take: 3
    });
    alternativeInstitutions = partners.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      logoUrl: p.logoUrl || undefined,
      city: p.city,
      state: p.state
    }));

    return {
      status,
      message,
      reasons,
      alternatives: alternativeInstitutions
    };
  }

  // 1. Fetch matching rule for the selected university and course name
  const rule = await prisma.admissionRule.findFirst({
    where: {
      universityId,
      courseName: {
        mode: "insensitive",
        equals: profile.preferredCourse
      }
    }
  });

  if (!rule) {
    // Basic dynamic fallback evaluation
    const university = await prisma.institution.findUnique({ where: { id: universityId } });
    const isHighRank = university?.slug.includes("bits") || university?.slug.includes("iit") || university?.slug.includes("iim");

    if (isHighRank) {
      if (twelfth >= 75 && (score > 80 || score === 0)) {
        status = "MODERATE_CHANCE";
        message = "Admission chances in this premier institution are competitive. An entrance exam score is typically required.";
      } else {
        status = "LOW_CHANCE";
        message = "Your academic scores are below the typical competitive range for this premier university.";
        reasons.push("Premier institutions generally require 75%+ in class 12 and top-tier entrance scores.");
      }
    } else {
      if (twelfth >= 50) {
        status = "HIGH_CHANCE";
        message = "Congratulations! Based on your profile, you appear eligible for admission.";
      } else {
        status = "LOW_CHANCE";
        message = "Your class 12 marks are below the general 50% cutoff.";
        reasons.push("Most courses require at least 50% in 12th standard.");
      }
    }

    // Fetch active partners as alternative suggestions
    const partners = await prisma.institution.findMany({
      where: { isPartner: true, published: true, id: { not: universityId } },
      select: { id: true, name: true, slug: true, logoUrl: true, city: true, state: true },
      take: 3
    });
    alternativeInstitutions = partners.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      logoUrl: p.logoUrl || undefined,
      city: p.city,
      state: p.state
    }));

    return {
      status,
      message,
      reasons,
      alternatives: alternativeInstitutions
    };
  }

  // Set eligibility metadata
  eligibilityRules = rule.eligibilityRules || "";
  scholarshipRules = rule.scholarshipRules || "";

  // 2. Perform score comparisons against the specific rule
  let passed10th = true;
  let passed12th = true;
  let passedGrad = true;
  let passedExam = true;

  if (rule.min10thPercentage && tenth < rule.min10thPercentage) {
    passed10th = false;
    reasons.push(`Class 10th score (${tenth}%) is below the required minimum of ${rule.min10thPercentage}%.`);
  }

  if (rule.min12thPercentage && twelfth < rule.min12thPercentage) {
    passed12th = false;
    reasons.push(`Class 12th score (${twelfth}%) is below the required minimum of ${rule.min12thPercentage}%.`);
  }

  // Grad check for PG courses
  const isPostGrad = profile.preferredCourse.toLowerCase().includes("mba") || 
                     profile.preferredCourse.toLowerCase().includes("mca") || 
                     profile.preferredCourse.toLowerCase().includes("pgdm");
  if (isPostGrad && rule.minGradPercentage && grad < rule.minGradPercentage) {
    passedGrad = false;
    reasons.push(`Graduation score (${grad}%) is below the required minimum of ${rule.minGradPercentage}%.`);
  }

  // Exam check if matching exam matches the rule requirement
  if (rule.entranceExam && rule.minEntranceScore) {
    const examMatches = profile.entranceExam?.toLowerCase().trim() === rule.entranceExam.toLowerCase().trim();
    if (examMatches && score < rule.minEntranceScore) {
      passedExam = false;
      reasons.push(`Entrance Exam score (${score}) is below the required ${rule.entranceExam} cutoff of ${rule.minEntranceScore}.`);
    } else if (!profile.entranceExam && rule.minEntranceScore > 0) {
      // Missing required exam score
      passedExam = false;
      reasons.push(`Preferred university typically requires the ${rule.entranceExam} entrance test.`);
    }
  }

  // 3. Determine output status
  const passedAll = passed10th && passed12th && passedGrad && passedExam;

  if (passedAll) {
    // Check if score is significantly higher than required for high chance
    const isHighChance = (tenth >= (rule.min10thPercentage || 50) + 10) && 
                         (twelfth >= (rule.min12thPercentage || 50) + 10);
    if (isHighChance) {
      status = "HIGH_CHANCE";
      message = "Congratulations! Based on your profile, you appear highly eligible for admission.";
    } else {
      status = "MODERATE_CHANCE";
      message = "Congratulations! Based on your profile, you meet the eligibility criteria for admission.";
    }
  } else {
    status = "LOW_CHANCE";
    message = "Better alternatives may be available. You do not meet the minimum eligibility cutoffs for this program.";
  }

  // 4. Fetch alternative suggestions
  if (rule.alternatives && rule.alternatives.length > 0) {
    const matchedAlts = await prisma.institution.findMany({
      where: {
        OR: [
          { slug: { in: rule.alternatives } },
          { id: { in: rule.alternatives } }
        ]
      },
      select: { id: true, name: true, slug: true, logoUrl: true, city: true, state: true }
    });
    alternativeInstitutions = matchedAlts.map(a => ({
      id: a.id,
      name: a.name,
      slug: a.slug,
      logoUrl: a.logoUrl || undefined,
      city: a.city,
      state: a.state
    }));
  }

  // If no specific alternatives matched, fallback to general partner suggestions
  if (alternativeInstitutions.length === 0) {
    const partners = await prisma.institution.findMany({
      where: { isPartner: true, published: true, id: { not: universityId } },
      select: { id: true, name: true, slug: true, logoUrl: true, city: true, state: true },
      take: 3
    });
    alternativeInstitutions = partners.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      logoUrl: p.logoUrl || undefined,
      city: p.city,
      state: p.state
    }));
  }

  return {
    status,
    message,
    reasons,
    eligibilityRules,
    scholarshipRules,
    alternatives: alternativeInstitutions
  };
}
