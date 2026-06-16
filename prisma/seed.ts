import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { execSync } from "child_process";

const prisma = new PrismaClient();

async function main() {
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@collegecorridor.com";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
  const defaultPasswordHash = bcrypt.hashSync("password123", 10);

  // 1. Seed Roles & Permissions
  const rolesList = ["SUPER_ADMIN", "ADMIN", "MANAGEMENT", "EDITOR", "COUNSELOR", "STUDENT"];
  const roles: Record<string, any> = {};

  for (const roleName of rolesList) {
    roles[roleName] = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: {
        name: roleName,
        description: `${roleName.replace("_", " ")} role`
      }
    });
  }

  // 2. Seed Users linked to Roles
  const users = [
    { email: "student@collegecorridor.in", name: "Demo Student", roleId: roles["STUDENT"].id, password: defaultPasswordHash },
    { email: "counselor@collegecorridor.in", name: "Demo Counselor", roleId: roles["COUNSELOR"].id, password: defaultPasswordHash },
    { email: "admin@collegecorridor.in", name: "Demo Admin", roleId: roles["ADMIN"].id, password: defaultPasswordHash },
    { email: "superadmin@collegecorridor.in", name: "Demo Super Admin", roleId: roles["SUPER_ADMIN"].id, password: defaultPasswordHash },
    { email: ADMIN_EMAIL.toLowerCase(), name: "System Admin", roleId: roles["ADMIN"].id, password: bcrypt.hashSync(ADMIN_PASSWORD, 10) }
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, roleId: user.roleId, password: user.password },
      create: user
    });
  }

  const counselor = await prisma.user.findUniqueOrThrow({
    where: { email: "counselor@collegecorridor.in" }
  });

  // 3. Seed Counselor/Staff Profile
  await prisma.staffProfile.upsert({
    where: { userId: counselor.id },
    update: {
      specialties: ["OFFLINE", "ONLINE"],
      languages: ["English", "Hindi"]
    },
    create: {
      userId: counselor.id,
      bio: "Admissions counselor focused on offline college placement shortlisting and online MBA counseling.",
      specialties: ["OFFLINE", "ONLINE"],
      languages: ["English", "Hindi"],
      experienceYears: 6
    }
  });

  // 4. Seed Education Categories
  const categoriesData = [
    { name: "Offline Colleges", slug: "offline-colleges", description: "Traditional campus-based universities and institutes" },
    { name: "Online Programs", slug: "online-programs", description: "UGC-approved online degree programs and certifications" },
    { name: "Study Abroad", slug: "study-abroad", description: "Global universities, visa guides, and international courses" },
    { name: "Distance Learning", slug: "distance-learning", description: "Flexible open and distance learning (ODL) programs" }
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    categories[cat.slug] = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: cat
    });
  }

  // 5. Seed Custom Field Groups and Definitions per Category
  await prisma.fieldGroup.deleteMany({});

  // Offline Category Fields
  const offlineGroup = await prisma.fieldGroup.create({
    data: {
      name: "Campus & Placement Metrics",
      categoryId: categories["offline-colleges"].id,
      order: 1
    }
  });

  const offlineFields = [
    { name: "Hostel Availability", key: "hostel_available", type: "DROPDOWN", options: ["Yes", "No", "Only Boys", "Only Girls"], fieldGroupId: offlineGroup.id },
    { name: "Average Package (INR)", key: "avg_package", type: "NUMBER", fieldGroupId: offlineGroup.id },
    { name: "Highest Package (INR)", key: "highest_package", type: "NUMBER", fieldGroupId: offlineGroup.id },
    { name: "Entrance Exam Accepted", key: "exams_accepted", type: "MULTI_SELECT", options: ["JEE Main", "CAT", "GATE", "CLAT", "NEET"], fieldGroupId: offlineGroup.id }
  ];

  for (const f of offlineFields) {
    await prisma.customFieldDefinition.create({ data: f });
  }

  // Online Category Fields
  const onlineGroup = await prisma.fieldGroup.create({
    data: {
      name: "Online Delivery Details",
      categoryId: categories["online-programs"].id,
      order: 1
    }
  });

  const onlineFields = [
    { name: "Learning Platform", key: "lms_platform", type: "TEXT", fieldGroupId: onlineGroup.id },
    { name: "Live Classes Weekly (Hours)", key: "live_hours", type: "NUMBER", fieldGroupId: onlineGroup.id },
    { name: "EMI Options", key: "emi_options", type: "DROPDOWN", options: ["Yes", "No"], fieldGroupId: onlineGroup.id },
    { name: "UGC/DEB Approved", key: "ugc_approved", type: "DROPDOWN", options: ["Yes", "No"], fieldGroupId: onlineGroup.id }
  ];

  for (const f of onlineFields) {
    await prisma.customFieldDefinition.create({ data: f });
  }

  // 6. Seed Institution (Greenwood Institute of Technology)
  const institution = await prisma.institution.upsert({
    where: { slug: "greenwood-institute-of-technology" },
    update: {
      published: true,
      categories: { connect: [{ id: categories["offline-colleges"].id }] }
    },
    create: {
      name: "Greenwood Institute of Technology",
      slug: "greenwood-institute-of-technology",
      type: "COLLEGE",
      ownership: "Private",
      description: "Greenwood Institute is a premier technology institution located in Bengaluru offering state-of-the-art engineering degrees.",
      state: "Karnataka",
      city: "Bengaluru",
      address: "Outer Ring Road, Marathahalli",
      website: "https://greenwood.edu",
      approval: "AICTE Approved",
      establishedYear: 2012,
      campusSize: "45 Acres",
      genderAccepted: "Co-Ed",
      published: true,
      categories: { connect: [{ id: categories["offline-colleges"].id }] }
    }
  });

  // 7. Seed Program (B.Tech Computer Science)
  const program = await prisma.program.upsert({
    where: { slug: "btech-computer-science-cse" },
    update: {},
    create: {
      name: "B.Tech Computer Science & Engineering",
      slug: "btech-computer-science-cse",
      degreeLevel: "Undergraduate",
      stream: "Engineering",
      duration: "4 Years",
      fees: { tuition: 150000, exam: 5000, total: 620000 },
      status: "PUBLISHED",
      institutionId: institution.id,
      categories: { connect: [{ id: categories["offline-colleges"].id }] }
    }
  });

  // Seed Institution Custom Field Values
  const hostelDef = await prisma.customFieldDefinition.findFirstOrThrow({ where: { key: "hostel_available" } });
  const avgPackDef = await prisma.customFieldDefinition.findFirstOrThrow({ where: { key: "avg_package" } });
  const examDef = await prisma.customFieldDefinition.findFirstOrThrow({ where: { key: "exams_accepted" } });

  await prisma.customFieldValue.create({
    data: {
      institutionId: institution.id,
      fieldDefinitionId: hostelDef.id,
      value: "Yes"
    }
  });

  await prisma.customFieldValue.create({
    data: {
      institutionId: institution.id,
      fieldDefinitionId: avgPackDef.id,
      value: 920000
    }
  });

  await prisma.customFieldValue.create({
    data: {
      institutionId: institution.id,
      fieldDefinitionId: examDef.id,
      value: ["JEE Main"]
    }
  });

  // 8. Seed Demo Lead and Activity Log
  await prisma.lead.deleteMany({});
  const lead = await prisma.lead.create({
    data: {
      fullName: "Aarav Mehta",
      phone: "9876543210",
      email: "aarav@example.com",
      currentCity: "Mumbai",
      preferredCourse: "B.Tech CSE",
      preferredCategory: "OFFLINE",
      preferredLocation: "Bengaluru",
      budget: "6-8 Lakhs total",
      highestQualification: "Class 12",
      status: "OTP_VERIFIED",
      assignedCounselorId: counselor.id,
      interestedInstitutionId: institution.id,
      interestedProgramId: program.id
    }
  });

  await prisma.leadActivity.create({
    data: {
      leadId: lead.id,
      activityType: "LEAD_CAPTURE",
      description: "Submitted lead details at Greenwich Institute of Technology Page",
      pageUrl: "/colleges/greenwood-institute-of-technology",
      ctaClicked: "Apply Now",
      utmSource: "google_search",
      device: "Desktop"
    }
  });

  // 9. Seed Questions, Answers, Blogs
  const adminUser = await prisma.user.findFirstOrThrow({ where: { roleId: roles["ADMIN"].id } });
  const studentUser = await prisma.user.findFirstOrThrow({ where: { roleId: roles["STUDENT"].id } });

  await prisma.blogPost.deleteMany({});
  await prisma.blogPost.create({
    data: {
      authorId: adminUser.id,
      title: "How to Choose Between Online MBA and Regular MBA in 2026",
      slug: "online-mba-vs-regular-mba-2026",
      category: "Admissions Guide",
      content: "An extensive comparative analysis of fees, learning modes, placement parameters, and ODL credibility.",
      metaTitle: "Online MBA vs Regular MBA - College Corridor Guide",
      metaDescription: "Read the comprehensive choice framework for online degrees vs offline courses.",
      isPublished: true
    }
  });

  await prisma.question.deleteMany({});
  const question = await prisma.question.create({
    data: {
      userId: studentUser.id,
      title: "Is the degree validity for ODL programs the same as regular degrees?",
      body: "I want to register for a Distance/Online degree and want to ensure it is valid for government job exams.",
      category: "Accreditation",
      isApproved: true
    }
  });

  await prisma.answer.create({
    data: {
      questionId: question.id,
      userId: counselor.id,
      body: "Yes. As per UGC rules, online and distance degrees from recognized HEIs are treated on par with traditional offline degrees for government job criteria.",
      isApproved: true
    }
  });

  // 10. Seed Study Abroad Countries
  const studyAbroadCountries = [
    {
      name: "United States",
      slug: "united-states",
      averageCost: "USD 35,000 - 55,000 / Year",
      visaProcess: "1. Obtain Form I-20 from a SEVP-certified institution.\n2. Pay SEVIS I-901 fee.\n3. Complete online visa application Form DS-160.\n4. Schedule and attend visa interview at US Embassy/Consulate.",
      jobProspects: "F-1 students can work up to 20 hours/week on-campus during sessions. Graduates can apply for 12 months of standard OPT, plus an additional 24 months STEM extension for eligible technical majors.",
      scholarships: "Includes Fulbright-Nehru fellowships, Hubert H. Humphrey fellowships, university-specific teaching and research assistantships, and merit-based tuition discounts.",
      faqs: [
        { q: "Is IELTS mandatory for US study?", a: "Many universities accept Duolingo English Test (DET) or TOEFL as alternatives, and some offer English waivers based on high school medium of instruction." },
        { q: "What is STEM OPT extension?", a: "It is an extra 24-month work permit for students who graduate with a qualified Science, Technology, Engineering, or Mathematics degree." }
      ]
    },
    {
      name: "United Kingdom",
      slug: "united-kingdom",
      averageCost: "GBP 20,000 - 32,000 / Year",
      visaProcess: "1. Obtain Confirmation of Acceptance for Studies (CAS) from licensed sponsor.\n2. Apply for student visa online via UK Gov portal.\n3. Pay healthcare surcharge (IHS).\n4. Provide biometric details at visa application center.",
      jobProspects: "Students can work up to 20 hours/week part-time. The UK Graduate Route allows bachelor's and master's graduates to live and work in the UK for up to 2 years (3 years for doctoral degree holders).",
      scholarships: "Chevening Scholarships (fully funded), Commonwealth Scholarships, Great Scholarships, and individual university bursaries/grants.",
      faqs: [
        { q: "How long does a student visa take?", a: "Usually processed within 3 weeks when applied from outside the UK, but priority options are available." },
        { q: "Can I bring dependants?", a: "Starting January 2024, only students on postgraduate research courses (PhD/MRes) can bring dependants on their visa." }
      ]
    }
  ];

  for (const country of studyAbroadCountries) {
    await prisma.studyAbroadCountry.upsert({
      where: { slug: country.slug },
      update: {
        name: country.name,
        averageCost: country.averageCost,
        visaProcess: country.visaProcess,
        jobProspects: country.jobProspects,
        scholarships: country.scholarships,
        faqs: country.faqs
      },
      create: country
    });
  }

  console.log("Triggering CSV import pipeline inside seed script...");
  execSync("npx tsx scripts/import-all-institution-data.ts", { stdio: "inherit" });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seeding completed successfully! 🎉");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
