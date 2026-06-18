import { PrismaClient, UserStatus } from "@prisma/client";
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
    { email: "student@collegecorridor.in", name: "Demo Student", roleId: roles["STUDENT"].id, password: defaultPasswordHash, status: UserStatus.ACTIVE, phoneVerified: true },
    { email: "counselor@collegecorridor.in", name: "Demo Counselor", roleId: roles["COUNSELOR"].id, password: defaultPasswordHash, status: UserStatus.ACTIVE, phoneVerified: true },
    { email: "admin@collegecorridor.in", name: "Demo Admin", roleId: roles["ADMIN"].id, password: defaultPasswordHash, status: UserStatus.ACTIVE, phoneVerified: true },
    { email: "superadmin@collegecorridor.in", name: "Demo Super Admin", roleId: roles["SUPER_ADMIN"].id, password: defaultPasswordHash, status: UserStatus.ACTIVE, phoneVerified: true },
    { email: ADMIN_EMAIL.toLowerCase(), name: "System Admin", roleId: roles["ADMIN"].id, password: bcrypt.hashSync(ADMIN_PASSWORD, 10), status: UserStatus.ACTIVE, phoneVerified: true }
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { 
        name: user.name, 
        roleId: user.roleId, 
        password: user.password,
        status: UserStatus.ACTIVE,
        phoneVerified: true
      },
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

  // Seed WEBSITE_MANAGER & SALES_MANAGER roles
  const websiteManagerRole = await prisma.role.upsert({
    where: { name: "WEBSITE_MANAGER" },
    update: {},
    create: { name: "WEBSITE_MANAGER", description: "Website Tech & Info Manager role" }
  });

  const salesManagerRole = await prisma.role.upsert({
    where: { name: "SALES_MANAGER" },
    update: {},
    create: { name: "SALES_MANAGER", description: "Sales Manager role" }
  });

  // Seed WEBSITE_MANAGER & SALES_MANAGER users
  await prisma.user.upsert({
    where: { email: "websitemanager@collegecorridor.in" },
    update: { roleId: websiteManagerRole.id },
    create: {
      email: "websitemanager@collegecorridor.in",
      name: "Demo Website Manager",
      roleId: websiteManagerRole.id,
      password: defaultPasswordHash
    }
  });

  await prisma.user.upsert({
    where: { email: "salesmanager@collegecorridor.in" },
    update: { roleId: salesManagerRole.id },
    create: {
      email: "salesmanager@collegecorridor.in",
      name: "Demo Sales Manager",
      roleId: salesManagerRole.id,
      password: defaultPasswordHash
    }
  });

  // Seed Carousel Slides
  const slides = [
    { title: "UGC-Approved Online Degrees", subtitle: "Advance your career with online MBA, MCA, & BBA from top universities.", buttonText: "Compare Programs", buttonLink: "/colleges?category=online", category: "ONLINE" as const, displayOrder: 1, image: "/images/hero-online.jpg" },
    { title: "Top India Campus Colleges", subtitle: "Secure placement-assured engineering and management degrees.", buttonText: "Browse Colleges", buttonLink: "/colleges?category=offline", category: "OFFLINE" as const, displayOrder: 2, image: "/images/hero-offline.jpg" },
    { title: "Global Study Abroad Choices", subtitle: "Complete counseling and visa guidance for USA, UK, & Canada.", buttonText: "Explore Countries", buttonLink: "/study-abroad", category: "STUDY_ABROAD" as const, displayOrder: 3, image: "/images/hero-abroad.jpg" },
    { title: "Flexible ODL Programs", subtitle: "Self-paced learning matching standard degrees at lower tuition.", buttonText: "Explore ODL", buttonLink: "/colleges?category=distance", category: "DISTANCE" as const, displayOrder: 4, image: "/images/hero-distance.jpg" }
  ];

  await prisma.carouselSlide.deleteMany({});
  for (const slide of slides) {
    await prisma.carouselSlide.create({ data: slide });
  }

  // Seed Logos
  const logos = [
    { name: "Amity University", image: "/logos/amity.png", website: "https://amity.edu", category: "UNIVERSITY" as const, displayOrder: 1 },
    { name: "Manipal University", image: "/logos/manipal.png", website: "https://manipal.edu", category: "UNIVERSITY" as const, displayOrder: 2 },
    { name: "Jain University", image: "/logos/jain.png", website: "https://jainuniversity.ac.in", category: "UNIVERSITY" as const, displayOrder: 3 },
    { name: "Sharda University", image: "/logos/sharda.png", website: "https://sharda.ac.in", category: "UNIVERSITY" as const, displayOrder: 4 },
    { name: "UGC Approved", image: "/logos/ugc.png", website: "https://ugc.gov.in", category: "ACCREDITATION" as const, displayOrder: 1 },
    { name: "NAAC A+", image: "/logos/naac.png", website: "http://naac.gov.in", category: "ACCREDITATION" as const, displayOrder: 2 },
    { name: "Wipro", image: "/logos/wipro.png", category: "RECRUITER" as const, displayOrder: 1 },
    { name: "TCS", image: "/logos/tcs.png", category: "RECRUITER" as const, displayOrder: 2 }
  ];

  await prisma.logo.deleteMany({});
  for (const logo of logos) {
    await prisma.logo.create({ data: logo });
  }

  // Seed Testimonials
  const testimonials = [
    { studentName: "Rohan Das", text: "Finding an accredited online MBA was smooth. The counselors helped me match programs within my budget.", rating: 5, role: "Online MBA Student" },
    { studentName: "Sanya Sen", text: "I cleared my US student visa because of the detailed country guides and placement reviews on College Corridor.", rating: 5, role: "MS Computer Science Alumna" },
    { studentName: "Preet Singh", text: "The Smart comparison tool saved me days of downloading brochures. Highly recommended counseling service.", rating: 4, role: "B.Tech CSE Student" }
  ];

  await prisma.testimonial.deleteMany({});
  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t });
  }

  // Seed FAQs
  const faqs = [
    { question: "Is the degree validity for ODL programs the same as regular degrees?", answer: "Yes, as per UGC guidelines, online and distance degrees from recognized HEIs are treated on par with traditional offline degrees for government job criteria.", category: "general", pageName: "home", order: 1 },
    { question: "How does the AI College Match work?", answer: "Our system takes your budget, qualification, and preferred mode (online/offline) to recommend colleges with high rating and placement success.", category: "general", pageName: "home", order: 2 },
    { question: "What document checks are required for admission?", answer: "Normally, Class 10/12 marksheets, identity proof (Aadhaar), and passport sized photos. Some courses require graduation certificates.", category: "general", pageName: "home", order: 3 }
  ];

  await prisma.fAQ.deleteMany({});
  for (const faq of faqs) {
    await prisma.fAQ.create({ data: faq });
  }

  // Seed Banners
  const banners = [
    { type: "ANNOUNCEMENT" as const, text: "Admission Open for 2026 Batches! Apply today to secure early-bird scholarships.", buttonText: "Apply Now", buttonLink: "#", active: true, displayOrder: 1 },
    { type: "WHATSAPP" as const, text: "Chat with an Expert Counselor on WhatsApp for Instant Guidance", buttonText: "Chat Now", buttonLink: "https://wa.me/919876543210", active: true, displayOrder: 2 }
  ];

  await prisma.banner.deleteMany({});
  for (const banner of banners) {
    await prisma.banner.create({ data: banner });
  }

  // Seed PageContent
  const pages = [
    { slug: "about-us", title: "About College Corridor", content: "College Corridor is India's leading student-first advisory portal providing verification, analytics, comparison, and enrollment support." },
    { slug: "privacy-policy", title: "Privacy Policy", content: "We respect your data. College Corridor only shares lead information with partner institutions that you explicitly choose." },
    { slug: "terms", title: "Terms of Service", content: "By utilizing the College Corridor counseling portal, you agree to submit valid credentials and abide by code of conduct policies." }
  ];

  await prisma.pageContent.deleteMany({});
  for (const page of pages) {
    await prisma.pageContent.create({ data: page });
  }

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

  console.log("Starting Courses, Specializations, and AdmissionRules seeding...");

  // Seed global Course Catalog
  const coursesData = [
    { name: "B.Tech", category: "Engineering", level: "UG", slug: "btech", duration: "4 Years", eligibility: "10+2 with PCM, minimum 50% marks" },
    { name: "B.Tech CSE", category: "Engineering", level: "UG", slug: "btech-cse", duration: "4 Years", eligibility: "10+2 with PCM, minimum 60% marks" },
    { name: "B.Tech AI & ML", category: "Engineering", level: "UG", slug: "btech-ai-ml", duration: "4 Years", eligibility: "10+2 with PCM, minimum 60% marks" },
    { name: "B.Tech Data Science", category: "Engineering", level: "UG", slug: "btech-data-science", duration: "4 Years", eligibility: "10+2 with PCM, minimum 60% marks" },
    { name: "BBA", category: "Management", level: "UG", slug: "bba", duration: "3 Years", eligibility: "10+2 in any stream, minimum 50% marks" },
    { name: "BCA", category: "Computer Applications", level: "UG", slug: "bca", duration: "3 Years", eligibility: "10+2 in any stream, minimum 50% marks" },
    { name: "MBA", category: "Management", level: "PG", slug: "mba", duration: "2 Years", eligibility: "Graduation with minimum 50% marks" },
    { name: "MCA", category: "Technology", level: "PG", slug: "mca", duration: "2 Years", eligibility: "Graduation with Mathematics, minimum 50% marks" },
    { name: "PGDM", category: "Management", level: "PG", slug: "pgdm", duration: "2 Years", eligibility: "Graduation with minimum 50% marks" },
    { name: "Online MBA", category: "Management", level: "ONLINE_PG", slug: "online-mba", duration: "2 Years", eligibility: "Graduation with minimum 50% marks" },
    { name: "Distance MBA", category: "Management", level: "DISTANCE_PG", slug: "distance-mba", duration: "2 Years", eligibility: "Graduation with minimum 45% marks" }
  ];

  const createdCourses: Record<string, any> = {};
  for (const c of coursesData) {
    createdCourses[c.name] = await prisma.course.upsert({
      where: { slug: c.slug },
      update: {
        category: c.category,
        level: c.level,
        duration: c.duration,
        eligibility: c.eligibility
      },
      create: c
    });
  }

  // Seed Specializations
  const specializationsData = [
    { name: "Computer Science", courseName: "B.Tech" },
    { name: "Artificial Intelligence", courseName: "B.Tech CSE" },
    { name: "Data Science", courseName: "B.Tech CSE" },
    { name: "Finance", courseName: "MBA" },
    { name: "Marketing", courseName: "MBA" },
    { name: "Human Resources", courseName: "MBA" },
    { name: "Business Analytics", courseName: "MBA" },
    { name: "Information Technology", courseName: "MBA" },
    { name: "Digital Marketing", courseName: "Online MBA" }
  ];

  for (const s of specializationsData) {
    const course = createdCourses[s.courseName];
    if (course) {
      await prisma.specialization.upsert({
        where: {
          courseId_name: {
            courseId: course.id,
            name: s.name
          }
        },
        update: {},
        create: {
          name: s.name,
          courseId: course.id
        }
      });
    }
  }

  // Link imported InstitutionCourse to global Course
  const allInstCourses = await prisma.institutionCourse.findMany({});
  for (const ic of allInstCourses) {
    let match = await prisma.course.findFirst({
      where: { name: { mode: "insensitive", equals: ic.courseName } }
    });

    if (!match) {
      match = await prisma.course.findFirst({
        where: { name: { mode: "insensitive", contains: ic.courseName } }
      });
    }

    if (match) {
      await prisma.institutionCourse.update({
        where: { id: ic.id },
        data: { courseId: match.id }
      });
    }
  }

  // Seed partner university configurations & admission rules for a few private universities
  const universities = await prisma.institution.findMany({
    where: {
      slug: {
        in: ["vit-vellore", "bits-pilani", "amity-noida", "lpu", "chandigarh-university", "sharda-university"]
      }
    }
  });

  // Delete previous admission rules
  await prisma.admissionRule.deleteMany({});

  for (const u of universities) {
    await prisma.institution.update({
      where: { id: u.id },
      data: {
        isPartner: true,
        commissionNotes: `10% commission on first-semester fees for ${u.name}.`,
        admissionContact: `admissions@${u.slug}.edu`,
        priorityLevel: "HIGH",
        agreementStatus: "SIGNED"
      }
    });

    const instCourses = await prisma.institutionCourse.findMany({
      where: { institutionId: u.id }
    });

    for (const ic of instCourses) {
      await prisma.admissionRule.create({
        data: {
          universityId: u.id,
          courseName: ic.courseName,
          specialization: ic.specialization || "General",
          min10thPercentage: 60.0,
          min12thPercentage: u.slug === "bits-pilani" ? 75.0 : u.slug === "vit-vellore" ? 65.0 : 60.0,
          minGradPercentage: 50.0,
          entranceExam: ic.courseName.toLowerCase().includes("b.tech") 
            ? (u.slug === "bits-pilani" ? "BITSAT" : u.slug === "vit-vellore" ? "VITEEE" : "JEE Main")
            : "CAT/MAT",
          minEntranceScore: u.slug === "bits-pilani" ? 280.0 : u.slug === "vit-vellore" ? 5000.0 : 60.0,
          eligibilityRules: `Candidates must have passed 10+2 with minimum required marks in Physics, Chemistry, and Mathematics from a recognized board.`,
          scholarshipRules: `Up to 50% tuition fee waiver for top rankers in ${u.slug === "bits-pilani" ? "BITSAT" : "JEE Main"}.`,
          alternatives: [
            u.slug === "vit-vellore" ? "amity-noida" : "vit-vellore",
            u.slug === "bits-pilani" ? "vit-vellore" : "lpu"
          ]
        }
      });
    }
  }
  console.log("Seeding of Courses, Specializations, and AdmissionRules completed!");
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
