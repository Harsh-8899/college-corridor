import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

// Helper for admin role protection
async function verifyAdminAccess() {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SUPER_ADMIN", "WEBSITE_MANAGER"].includes(session.user?.role as string)) {
    return false;
  }
  return true;
}

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ module: string }> }
) {
  const params = await props.params;
  try {
    const isAuthorized = await verifyAdminAccess();
    if (!isAuthorized) {
      return NextResponse.json({ error: { message: "Unauthorized." } }, { status: 401 });
    }

    const { module } = params;
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    switch (module) {
      case "carousel":
        if (id) {
          const item = await prisma.carouselSlide.findUnique({ where: { id } });
          return NextResponse.json(item);
        }
        const slides = await prisma.carouselSlide.findMany({ orderBy: { displayOrder: "asc" } });
        return NextResponse.json(slides);

      case "logos":
        if (id) {
          const item = await prisma.logo.findUnique({ where: { id } });
          return NextResponse.json(item);
        }
        const logos = await prisma.logo.findMany({ orderBy: { displayOrder: "asc" } });
        return NextResponse.json(logos);

      case "pages":
        if (id) {
          const item = await prisma.pageContent.findUnique({ where: { id } });
          return NextResponse.json(item);
        }
        const pages = await prisma.pageContent.findMany({ orderBy: { slug: "asc" } });
        return NextResponse.json(pages);

      case "faqs":
        if (id) {
          const item = await prisma.fAQ.findUnique({ where: { id } });
          return NextResponse.json(item);
        }
        const faqs = await prisma.fAQ.findMany({
          orderBy: { order: "asc" },
          include: { college: { select: { name: true } } }
        });
        return NextResponse.json(faqs);

      case "testimonials":
        if (id) {
          const item = await prisma.testimonial.findUnique({ where: { id } });
          return NextResponse.json(item);
        }
        const testimonials = await prisma.testimonial.findMany({
          orderBy: { order: "asc" },
          include: { college: { select: { name: true } } }
        });
        return NextResponse.json(testimonials);

      case "banners":
        if (id) {
          const item = await prisma.banner.findUnique({ where: { id } });
          return NextResponse.json(item);
        }
        const banners = await prisma.banner.findMany({ orderBy: { displayOrder: "asc" } });
        return NextResponse.json(banners);

      case "rules":
        if (id) {
          const item = await prisma.admissionRule.findUnique({ where: { id }, include: { university: true } });
          return NextResponse.json(item);
        }
        const rules = await prisma.admissionRule.findMany({
          include: { university: { select: { name: true, slug: true } } },
          orderBy: { createdAt: "desc" }
        });
        return NextResponse.json(rules);

      case "courses":
        if (id) {
          const item = await prisma.course.findUnique({ where: { id }, include: { specializations: true } });
          return NextResponse.json(item);
        }
        const courses = await prisma.course.findMany({
          include: { specializations: true },
          orderBy: { name: "asc" }
        });
        return NextResponse.json(courses);

      case "universities":
        const universities = await prisma.institution.findMany({
          select: { id: true, name: true, slug: true, logoUrl: true, city: true, state: true, isPartner: true, published: true },
          orderBy: { name: "asc" }
        });
        return NextResponse.json(universities);

      case "settings":
        const settings = await prisma.systemSetting.findMany({ orderBy: { key: "asc" } });
        return NextResponse.json(settings);

      default:
        return NextResponse.json({ error: { message: `Invalid module name: ${module}` } }, { status: 400 });
    }
  } catch (error) {
    console.error(`GET Error in module ${params.module}:`, error);
    return NextResponse.json({ error: { message: "Internal server error." } }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ module: string }> }
) {
  const params = await props.params;
  try {
    const isAuthorized = await verifyAdminAccess();
    if (!isAuthorized) {
      return NextResponse.json({ error: { message: "Unauthorized." } }, { status: 401 });
    }

    const session = await getServerSession(authOptions);
    const { module } = params;
    const body = await request.json();

    switch (module) {
      case "carousel": {
        const slide = await prisma.carouselSlide.create({
          data: {
            title: body.title,
            subtitle: body.subtitle,
            image: body.image,
            buttonText: body.buttonText,
            buttonLink: body.buttonLink,
            category: body.category || "ONLINE",
            displayOrder: Number(body.displayOrder) || 0,
            active: body.active !== undefined ? body.active : true
          }
        });
        return NextResponse.json(slide);
      }

      case "logos": {
        const logo = await prisma.logo.create({
          data: {
            name: body.name,
            image: body.image,
            website: body.website,
            category: body.category || "UNIVERSITY",
            displayOrder: Number(body.displayOrder) || 0,
            active: body.active !== undefined ? body.active : true,
            collegeId: body.collegeId || null
          }
        });
        return NextResponse.json(logo);
      }

      case "pages": {
        const page = await prisma.pageContent.create({
          data: {
            slug: body.slug,
            title: body.title,
            content: body.content,
            metaTitle: body.metaTitle,
            metaDescription: body.metaDescription,
            isPublished: body.isPublished !== undefined ? body.isPublished : true
          }
        });
        return NextResponse.json(page);
      }

      case "faqs": {
        const faq = await prisma.fAQ.create({
          data: {
            question: body.question,
            answer: body.answer,
            category: body.category || "general",
            pageName: body.pageName || "home",
            order: Number(body.order) || 0,
            active: body.active !== undefined ? body.active : true,
            collegeId: body.collegeId || null,
            courseId: body.courseId || null
          }
        });
        return NextResponse.json(faq);
      }

      case "testimonials": {
        const testimonial = await prisma.testimonial.create({
          data: {
            studentName: body.studentName,
            studentImage: body.studentImage || null,
            text: body.text,
            rating: Number(body.rating) || 5,
            role: body.role || null,
            isPublished: body.isPublished !== undefined ? body.isPublished : true,
            order: Number(body.order) || 0,
            collegeId: body.collegeId || null,
            courseId: body.courseId || null
          }
        });
        return NextResponse.json(testimonial);
      }

      case "banners": {
        const banner = await prisma.banner.create({
          data: {
            type: body.type || "ANNOUNCEMENT",
            image: body.image || null,
            text: body.text,
            buttonText: body.buttonText || null,
            buttonLink: body.buttonLink || null,
            displayOrder: Number(body.displayOrder) || 0,
            active: body.active !== undefined ? body.active : true,
            placement: body.placement || null
          }
        });
        return NextResponse.json(banner);
      }

      case "rules": {
        const rule = await prisma.admissionRule.create({
          data: {
            universityId: body.universityId,
            courseName: body.courseName,
            specialization: body.specialization || "General",
            min10thPercentage: body.min10thPercentage ? parseFloat(body.min10thPercentage) : null,
            min12thPercentage: body.min12thPercentage ? parseFloat(body.min12thPercentage) : null,
            minGradPercentage: body.minGradPercentage ? parseFloat(body.minGradPercentage) : null,
            entranceExam: body.entranceExam || null,
            minEntranceScore: body.minEntranceScore ? parseFloat(body.minEntranceScore) : null,
            eligibilityRules: body.eligibilityRules || null,
            scholarshipRules: body.scholarshipRules || null,
            alternatives: body.alternatives || []
          }
        });
        return NextResponse.json(rule);
      }

      case "courses": {
        const course = await prisma.course.create({
          data: {
            name: body.name,
            category: body.category,
            level: body.level,
            duration: body.duration || null,
            eligibility: body.eligibility || null,
            description: body.description || null,
            careerOutcomes: body.careerOutcomes || null,
            averageSalary: body.averageSalary || null,
            slug: body.slug,
            active: body.active !== undefined ? body.active : true
          }
        });

        // Seed specializations if provided
        if (body.specializations && Array.isArray(body.specializations)) {
          for (const specName of body.specializations) {
            if (specName) {
              await prisma.specialization.create({
                data: {
                  name: specName,
                  courseId: course.id
                }
              });
            }
          }
        }

        return NextResponse.json(course);
      }

      case "settings": {
        const setting = await prisma.systemSetting.create({
          data: {
            key: body.key,
            value: body.value,
            updatedBy: session?.user?.email || "system"
          }
        });
        return NextResponse.json(setting);
      }

      default:
        return NextResponse.json({ error: { message: `Invalid module name: ${module}` } }, { status: 400 });
    }
  } catch (error) {
    console.error(`POST Error in module ${params.module}:`, error);
    return NextResponse.json({ error: { message: "Internal server error." } }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ module: string }> }
) {
  const params = await props.params;
  try {
    const isAuthorized = await verifyAdminAccess();
    if (!isAuthorized) {
      return NextResponse.json({ error: { message: "Unauthorized." } }, { status: 401 });
    }

    const session = await getServerSession(authOptions);
    const { module } = params;
    const body = await request.json();
    const id = body.id;

    if (!id) {
      return NextResponse.json({ error: { message: "ID parameter is required for update operations." } }, { status: 400 });
    }

    switch (module) {
      case "carousel": {
        const slide = await prisma.carouselSlide.update({
          where: { id },
          data: {
            title: body.title,
            subtitle: body.subtitle,
            image: body.image,
            buttonText: body.buttonText,
            buttonLink: body.buttonLink,
            category: body.category,
            displayOrder: Number(body.displayOrder),
            active: body.active
          }
        });
        return NextResponse.json(slide);
      }

      case "logos": {
        const logo = await prisma.logo.update({
          where: { id },
          data: {
            name: body.name,
            image: body.image,
            website: body.website,
            category: body.category,
            displayOrder: Number(body.displayOrder),
            active: body.active,
            collegeId: body.collegeId || null
          }
        });
        return NextResponse.json(logo);
      }

      case "pages": {
        const page = await prisma.pageContent.update({
          where: { id },
          data: {
            slug: body.slug,
            title: body.title,
            content: body.content,
            metaTitle: body.metaTitle,
            metaDescription: body.metaDescription,
            isPublished: body.isPublished
          }
        });
        return NextResponse.json(page);
      }

      case "faqs": {
        const faq = await prisma.fAQ.update({
          where: { id },
          data: {
            question: body.question,
            answer: body.answer,
            category: body.category,
            pageName: body.pageName,
            order: Number(body.order),
            active: body.active,
            collegeId: body.collegeId || null,
            courseId: body.courseId || null
          }
        });
        return NextResponse.json(faq);
      }

      case "testimonials": {
        const testimonial = await prisma.testimonial.update({
          where: { id },
          data: {
            studentName: body.studentName,
            studentImage: body.studentImage || null,
            text: body.text,
            rating: Number(body.rating),
            role: body.role || null,
            isPublished: body.isPublished,
            order: Number(body.order),
            collegeId: body.collegeId || null,
            courseId: body.courseId || null
          }
        });
        return NextResponse.json(testimonial);
      }

      case "banners": {
        const banner = await prisma.banner.update({
          where: { id },
          data: {
            type: body.type,
            image: body.image || null,
            text: body.text,
            buttonText: body.buttonText || null,
            buttonLink: body.buttonLink || null,
            displayOrder: Number(body.displayOrder),
            active: body.active,
            placement: body.placement || null
          }
        });
        return NextResponse.json(banner);
      }

      case "rules": {
        const rule = await prisma.admissionRule.update({
          where: { id },
          data: {
            universityId: body.universityId,
            courseName: body.courseName,
            specialization: body.specialization || "General",
            min10thPercentage: body.min10thPercentage ? parseFloat(body.min10thPercentage) : null,
            min12thPercentage: body.min12thPercentage ? parseFloat(body.min12thPercentage) : null,
            minGradPercentage: body.minGradPercentage ? parseFloat(body.minGradPercentage) : null,
            entranceExam: body.entranceExam || null,
            minEntranceScore: body.minEntranceScore ? parseFloat(body.minEntranceScore) : null,
            eligibilityRules: body.eligibilityRules || null,
            scholarshipRules: body.scholarshipRules || null,
            alternatives: body.alternatives || []
          }
        });
        return NextResponse.json(rule);
      }

      case "courses": {
        const course = await prisma.course.update({
          where: { id },
          data: {
            name: body.name,
            category: body.category,
            level: body.level,
            duration: body.duration || null,
            eligibility: body.eligibility || null,
            description: body.description || null,
            careerOutcomes: body.careerOutcomes || null,
            averageSalary: body.averageSalary || null,
            slug: body.slug,
            active: body.active
          }
        });

        // Reseed specializations if requested
        if (body.specializations && Array.isArray(body.specializations)) {
          await prisma.specialization.deleteMany({ where: { courseId: id } });
          for (const specName of body.specializations) {
            if (specName) {
              await prisma.specialization.create({
                data: {
                  name: specName,
                  courseId: id
                }
              });
            }
          }
        }

        return NextResponse.json(course);
      }

      case "universities": {
        // Allow quick partner tags or publication updates
        const university = await prisma.institution.update({
          where: { id },
          data: {
            isPartner: body.isPartner !== undefined ? body.isPartner : undefined,
            commissionNotes: body.commissionNotes || undefined,
            admissionContact: body.admissionContact || undefined,
            priorityLevel: body.priorityLevel || undefined,
            agreementStatus: body.agreementStatus || undefined,
            published: body.published !== undefined ? body.published : undefined
          }
        });
        return NextResponse.json(university);
      }

      case "settings": {
        const setting = await prisma.systemSetting.update({
          where: { id },
          data: {
            value: body.value,
            updatedBy: session?.user?.email || "system"
          }
        });
        return NextResponse.json(setting);
      }

      default:
        return NextResponse.json({ error: { message: `Invalid module name: ${module}` } }, { status: 400 });
    }
  } catch (error) {
    console.error(`PUT Error in module ${params.module}:`, error);
    return NextResponse.json({ error: { message: "Internal server error." } }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ module: string }> }
) {
  const params = await props.params;
  try {
    const isAuthorized = await verifyAdminAccess();
    if (!isAuthorized) {
      return NextResponse.json({ error: { message: "Unauthorized." } }, { status: 401 });
    }

    const { module } = params;
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: { message: "ID parameter is required for delete operations." } }, { status: 400 });
    }

    switch (module) {
      case "carousel":
        await prisma.carouselSlide.delete({ where: { id } });
        return NextResponse.json({ success: true });

      case "logos":
        await prisma.logo.delete({ where: { id } });
        return NextResponse.json({ success: true });

      case "pages":
        await prisma.pageContent.delete({ where: { id } });
        return NextResponse.json({ success: true });

      case "faqs":
        await prisma.fAQ.delete({ where: { id } });
        return NextResponse.json({ success: true });

      case "testimonials":
        await prisma.testimonial.delete({ where: { id } });
        return NextResponse.json({ success: true });

      case "banners":
        await prisma.banner.delete({ where: { id } });
        return NextResponse.json({ success: true });

      case "rules":
        await prisma.admissionRule.delete({ where: { id } });
        return NextResponse.json({ success: true });

      case "courses":
        await prisma.course.delete({ where: { id } });
        return NextResponse.json({ success: true });

      case "settings":
        await prisma.systemSetting.delete({ where: { id } });
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: { message: `Invalid module name: ${module}` } }, { status: 400 });
    }
  } catch (error) {
    console.error(`DELETE Error in module ${params.module}:`, error);
    return NextResponse.json({ error: { message: "Internal server error." } }, { status: 500 });
  }
}
