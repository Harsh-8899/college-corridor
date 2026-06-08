import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = [
    { email: "student@eduoofa.com", name: "Demo Student", role: "STUDENT" as const },
    { email: "counselor@eduoofa.com", name: "Demo Counselor", role: "COUNSELOR" as const },
    { email: "admin@eduoofa.com", name: "Demo Admin", role: "ADMIN" as const },
    { email: "superadmin@eduoofa.com", name: "Demo Super Admin", role: "SUPER_ADMIN" as const }
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role },
      create: user
    });
  }

  const counselor = await prisma.user.findUniqueOrThrow({
    where: { email: "counselor@eduoofa.com" }
  });

  await prisma.counselorProfile.upsert({
    where: { userId: counselor.id },
    update: {
      specialties: ["MBA", "Engineering", "Scholarships"],
      languages: ["English", "Hindi"]
    },
    create: {
      userId: counselor.id,
      bio: "Admissions counselor focused on shortlisting, applications, and scholarship guidance.",
      specialties: ["MBA", "Engineering", "Scholarships"],
      languages: ["English", "Hindi"],
      experienceYears: 6,
      hourlyRate: 1499
    }
  });

  const college = await prisma.college.upsert({
    where: { slug: "greenwood-institute-of-technology" },
    update: {
      status: "PUBLISHED",
      isPartner: true,
      isFeatured: true
    },
    create: {
      name: "Greenwood Institute of Technology",
      slug: "greenwood-institute-of-technology",
      shortName: "GIT",
      description: "Technology-focused college with strong placement outcomes.",
      ownership: "PRIVATE",
      establishedYear: 2004,
      accreditation: ["NAAC A"],
      approvals: ["AICTE"],
      status: "PUBLISHED",
      isPartner: true,
      isFeatured: true
    }
  });

  await prisma.campus.upsert({
    where: { id: "seed-greenwood-campus" },
    update: {},
    create: {
      id: "seed-greenwood-campus",
      collegeId: college.id,
      name: "Main Campus",
      city: "Bengaluru",
      state: "Karnataka",
      address: "Outer Ring Road",
      hasHostel: true,
      hostelDetails: {
        boys: true,
        girls: true,
        mess: true
      }
    }
  });

  const course = await prisma.course.upsert({
    where: { slug: "btech-computer-science" },
    update: {},
    create: {
      name: "B.Tech Computer Science",
      slug: "btech-computer-science",
      degreeLevel: "Undergraduate",
      stream: "Engineering",
      description: "Computer science undergraduate program."
    }
  });

  const collegeCourse = await prisma.collegeCourse.upsert({
    where: { id: "seed-greenwood-btech-cse" },
    update: {
      status: "PUBLISHED"
    },
    create: {
      id: "seed-greenwood-btech-cse",
      collegeId: college.id,
      courseId: course.id,
      specialization: "Computer Science",
      mode: "OFFLINE",
      durationMonths: 48,
      totalFees: 680000,
      applicationFee: 1500,
      seats: 240,
      eligibility: "10+2 with PCM and valid entrance score.",
      admissionProcess: "Entrance score review, counseling, and seat confirmation.",
      examsAccepted: ["JEE Main", "State CET"],
      status: "PUBLISHED"
    }
  });

  await prisma.placementStat.upsert({
    where: { id: "seed-greenwood-placement-2026" },
    update: {},
    create: {
      id: "seed-greenwood-placement-2026",
      collegeId: college.id,
      collegeCourseId: collegeCourse.id,
      year: 2026,
      placementRate: 91,
      averageSalary: 920000,
      medianSalary: 840000,
      highestSalary: 3800000,
      recruiters: ["TCS", "Infosys", "Accenture", "Amazon"]
    }
  });

  await prisma.lead.create({
    data: {
      fullName: "Aarav Mehta",
      phone: "+919876543210",
      email: "aarav@example.com",
      city: "Mumbai",
      courseInterestedIn: "MBA",
      interestedCollegeId: college.id,
      sourcePage: "/compare",
      selectedCollegeIds: [college.id],
      unlockedContentKeys: ["detailed-comparison"],
      status: "NEW",
      assignedCounselorId: counselor.id
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

