import { prisma } from "@/lib/db/prisma";
import { HomePageContent } from "@/components/home/home-page-content";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Check Your Admission Chances Before You Apply - College Corridor",
  description: "Discover universities, check admission chances, evaluate cutoffs, and get alternative recommendations with direct counseling support.",
  keywords: ["college admissions", "check admission chances", "eligibility test", "college comparison", "counseling support"],
  alternates: {
    canonical: "https://www.collegecorridor.com"
  }
};

export default async function HomePage() {
  // 1. Fetch count stats from database
  const [collegesCount, coursesCount, leadsCount, partnersCount] = await Promise.all([
    prisma.institution.count(),
    prisma.institutionCourse.count(),
    prisma.lead.count(),
    prisma.institution.count({ where: { isPartner: true } })
  ]);

  // 2. Fetch lists for dropdowns and slides
  const universitiesList = await prisma.institution.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      city: true,
      state: true,
      logoUrl: true
    },
    orderBy: { name: "asc" }
  });

  const partners = await prisma.institution.findMany({
    where: { isPartner: true, published: true },
    orderBy: { name: "asc" }
  });

  const testimonials = await prisma.testimonial.findMany({
    where: { isPublished: true },
    orderBy: { order: "asc" }
  });

  const faqs = await prisma.fAQ.findMany({
    where: { active: true, pageName: "home" },
    orderBy: { order: "asc" }
  });

  const slides = await prisma.carouselSlide.findMany({
    where: { active: true },
    orderBy: { displayOrder: "asc" }
  });

  const universityLogos = await prisma.logo.findMany({
    where: { active: true, category: "UNIVERSITY" },
    orderBy: { displayOrder: "asc" }
  });

  const recruiterLogos = await prisma.logo.findMany({
    where: { active: true, category: "RECRUITER" },
    orderBy: { displayOrder: "asc" }
  });

  const accreditationLogos = await prisma.logo.findMany({
    where: { active: true, category: "ACCREDITATION" },
    orderBy: { displayOrder: "asc" }
  });

  const courses = await prisma.course.findMany({
    where: { active: true },
    orderBy: { name: "asc" }
  });

  return (
    <>
      {/* Structured Organization Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "College Corridor",
            "url": "https://www.collegecorridor.com",
            "logo": "https://www.collegecorridor.com/logo.png",
            "description": "Admission Intelligence Platform providing real-time eligibility assessment, university discovery, and admissions support."
          })
        }}
      />
      
      <HomePageContent
        stats={{
          collegesCount,
          coursesCount,
          leadsCount,
          partnersCount
        }}
        universitiesList={universitiesList}
        partners={partners}
        testimonials={testimonials}
        faqs={faqs}
        slides={slides}
        universityLogos={universityLogos}
        recruiterLogos={recruiterLogos}
        accreditationLogos={accreditationLogos}
        courses={courses}
      />
    </>
  );
}
