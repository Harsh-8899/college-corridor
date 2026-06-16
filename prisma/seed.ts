import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@collegecorridor.com";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
  const defaultPasswordHash = bcrypt.hashSync("password123", 10);

  const users = [
    { email: "student@collegecorridor.in", name: "Demo Student", role: "STUDENT" as const, password: defaultPasswordHash },
    { email: "counselor@collegecorridor.in", name: "Demo Counselor", role: "COUNSELOR" as const, password: defaultPasswordHash },
    { email: "admin@collegecorridor.in", name: "Demo Admin", role: "ADMIN" as const, password: defaultPasswordHash },
    { email: "superadmin@collegecorridor.in", name: "Demo Super Admin", role: "SUPER_ADMIN" as const, password: defaultPasswordHash },
    { email: ADMIN_EMAIL.toLowerCase(), name: "System Admin", role: "ADMIN" as const, password: bcrypt.hashSync(ADMIN_PASSWORD, 10) }
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role, password: user.password },
      create: user
    });
  }

  const counselor = await prisma.user.findUniqueOrThrow({
    where: { email: "counselor@collegecorridor.in" }
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

  // Seed University
  const university = await prisma.university.upsert({
    where: { slug: "greenwood-university" },
    update: {},
    create: {
      name: "Greenwood University",
      slug: "greenwood-university",
      description: "Governing university affiliate for Greenwood Institute.",
      logoUrl: "/static/university-logo.png",
      websiteUrl: "https://greenwood.edu"
    }
  });

  // Connect seed college to university
  await prisma.college.update({
    where: { id: college.id },
    data: { universityId: university.id }
  });

  // Seed Exam
  await prisma.exam.upsert({
    where: { slug: "jee-main" },
    update: {},
    create: {
      name: "JEE Main",
      slug: "jee-main",
      category: "Engineering",
      syllabus: "Physics, Chemistry, Mathematics syllabus.",
      pattern: "Computer Based Test (CBT), 90 questions, 300 marks.",
      cutoffDetails: { general: "90 percentile", obc: "75 percentile" },
      faqs: [{ q: "What is the fee?", a: "Approx. 1000 INR." }]
    }
  });

  // Seed Study Abroad Country
  await prisma.studyAbroadCountry.upsert({
    where: { slug: "usa" },
    update: {},
    create: {
      name: "USA",
      slug: "usa",
      averageCost: "$30,000 - $50,000 per year",
      visaProcess: "F1 student visa interview process.",
      jobProspects: "OPT/CPT options, strong tech industry placement.",
      scholarships: "Fulbright, university specific scholarships.",
      faqs: [{ q: "Can I work part-time?", a: "Yes, up to 20 hours on-campus." }]
    }
  });

  // Fetch admin for authoring blog
  const adminUser = await prisma.user.findFirst({
    where: { role: "ADMIN" }
  });

  if (adminUser) {
    // Seed Blog Post
    await prisma.blogPost.upsert({
      where: { slug: "top-5-btech-specializations-2026" },
      update: {},
      create: {
        authorId: adminUser.id,
        title: "Top 5 B.Tech Specializations in 2026",
        slug: "top-5-btech-specializations-2026",
        category: "Admissions",
        content: "Artificial Intelligence, Data Science, Cyber Security...",
        metaTitle: "Top 5 B.Tech Specializations in 2026",
        metaDescription: "Read the top 5 engineering specializations for 2026 admissions.",
        isPublished: true
      }
    });
  }

  // Fetch student for asking question
  const studentUser = await prisma.user.findFirst({
    where: { role: "STUDENT" }
  });

  if (studentUser && counselor) {
    // Seed Question
    const question = await prisma.question.create({
      data: {
        userId: studentUser.id,
        title: "What is the average placement package for CSE?",
        body: "I am planning to join Greenwood and want to know details about CSE placements.",
        category: "Placements",
        isApproved: true
      }
    });

    // Seed Answer
    await prisma.answer.create({
      data: {
        questionId: question.id,
        userId: counselor.id,
        body: "The average package for CSE is 9.2 LPA, with top companies like Amazon and TCS recruiting.",
        isApproved: true
      }
    });
  }
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

