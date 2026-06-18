import { evaluateAdmissionChances } from "@/lib/admissions/checker";
import { prisma } from "@/lib/db/prisma";

// Mock the Prisma DB module
jest.mock("@/lib/db/prisma", () => ({
  prisma: {
    institution: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    admissionRule: {
      findFirst: jest.fn(),
    },
  },
}));

describe("evaluateAdmissionChances Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. General checker (no universityId provided)
  test("returns MODERATE_CHANCE for high qualification scores when no university is selected", async () => {
    (prisma.institution.findMany as jest.Mock).mockResolvedValue([
      { id: "inst1", name: "Partner 1", slug: "partner-1", logoUrl: null, city: "Delhi", state: "Delhi" }
    ]);

    const res = await evaluateAdmissionChances({
      tenthPercentage: 75,
      twelfthPercentage: 80,
      preferredCourse: "B.Tech",
    });

    expect(res.status).toBe("MODERATE_CHANCE");
    expect(res.alternatives).toHaveLength(1);
    expect(res.alternatives[0].name).toBe("Partner 1");
  });

  test("returns EXPERT_REVIEW_NEEDED for lower scores when no university is selected", async () => {
    (prisma.institution.findMany as jest.Mock).mockResolvedValue([]);

    const res = await evaluateAdmissionChances({
      tenthPercentage: 55,
      twelfthPercentage: 58,
      preferredCourse: "B.Tech",
    });

    expect(res.status).toBe("EXPERT_REVIEW_NEEDED");
    expect(res.reasons).toHaveLength(0);
  });

  // 2. Custom basic evaluation checks when no specific AdmissionRule exists
  test("evaluates competitive chances for premier institutions without rules", async () => {
    (prisma.institution.findUnique as jest.Mock).mockResolvedValue({
      id: "bits-pilani",
      name: "BITS Pilani",
      slug: "bits-pilani",
    });
    (prisma.institution.findMany as jest.Mock).mockResolvedValue([]);

    // Student has below 75% twelfth marks
    const resLow = await evaluateAdmissionChances({
      tenthPercentage: 90,
      twelfthPercentage: 70,
      preferredCourse: "B.Tech CSE",
    }, "bits-pilani");

    expect(resLow.status).toBe("LOW_CHANCE");
    expect(resLow.reasons[0]).toContain("Premier institutions generally require 75%+");

    // Student has high marks and exam score
    const resHigh = await evaluateAdmissionChances({
      tenthPercentage: 90,
      twelfthPercentage: 85,
      entranceExamScore: "290",
      preferredCourse: "B.Tech CSE",
    }, "bits-pilani");

    expect(resHigh.status).toBe("MODERATE_CHANCE");
  });

  test("evaluates basic 50% cutoff for standard institutions without rules", async () => {
    (prisma.institution.findUnique as jest.Mock).mockResolvedValue({
      id: "std-univ",
      name: "Standard University",
      slug: "std-univ",
    });
    (prisma.institution.findMany as jest.Mock).mockResolvedValue([]);

    const resEligible = await evaluateAdmissionChances({
      tenthPercentage: 65,
      twelfthPercentage: 55,
      preferredCourse: "BBA",
    }, "std-univ");

    expect(resEligible.status).toBe("HIGH_CHANCE");

    const resIneligible = await evaluateAdmissionChances({
      tenthPercentage: 65,
      twelfthPercentage: 45,
      preferredCourse: "BBA",
    }, "std-univ");

    expect(resIneligible.status).toBe("LOW_CHANCE");
    expect(resIneligible.reasons[0]).toContain("require at least 50% in 12th standard");
  });

  // 3. Strict rule checks (when matching AdmissionRule exists)
  test("evaluates correctly against specific matching AdmissionRules", async () => {
    (prisma.admissionRule.findFirst as jest.Mock).mockResolvedValue({
      id: "rule-1",
      universityId: "univ-1",
      courseName: "MBA",
      min10thPercentage: 60,
      min12thPercentage: 60,
      minGradPercentage: 50,
      entranceExam: "CAT",
      minEntranceScore: 75,
      eligibilityRules: "Requires graduation with min 50% and valid CAT score",
      alternatives: ["univ-alt-1"]
    });

    (prisma.institution.findMany as jest.Mock).mockResolvedValue([
      { id: "univ-alt-1", name: "Alternative College", slug: "alt-college", logoUrl: null, city: "Pune", state: "Maharashtra" }
    ]);

    // Student misses 12th cutoff
    const resFail12 = await evaluateAdmissionChances({
      tenthPercentage: 70,
      twelfthPercentage: 55,
      graduationPercentage: 65,
      entranceExam: "CAT",
      entranceExamScore: "80",
      preferredCourse: "MBA",
    }, "univ-1");

    expect(resFail12.status).toBe("LOW_CHANCE");
    expect(resFail12.reasons[0]).toContain("Class 12th score");
    expect(resFail12.alternatives[0].name).toBe("Alternative College");

    // Student passes all cutoffs
    const resPass = await evaluateAdmissionChances({
      tenthPercentage: 75,
      twelfthPercentage: 78,
      graduationPercentage: 65,
      entranceExam: "CAT",
      entranceExamScore: "80",
      preferredCourse: "MBA",
    }, "univ-1");

    expect(resPass.status).toBe("HIGH_CHANCE");
    expect(resPass.reasons).toHaveLength(0);
  });
});
