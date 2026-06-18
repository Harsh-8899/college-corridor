import { prisma } from "@/lib/db/prisma";
import { HomePageContent } from "@/components/home/home-page-content";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Check Your Admission Chances - College Corridor",
  description: "Evaluate your eligibility, BITSAT / JEE Main cutoff prospects, and receive direct university alternatives recommendation.",
  keywords: ["admission checkers", "evaluate marks", "cutoffs test", "engineering admissions"],
  alternates: {
    canonical: "https://www.collegecorridor.com/check-admission-chances"
  }
};

export default async function CheckAdmissionChancesPage() {
  const [collegesCount, coursesCount, leadsCount, partnersCount] = await Promise.all([
    prisma.institution.count(),
    prisma.institutionCourse.count(),
    prisma.lead.count(),
    prisma.institution.count({ where: { isPartner: true } })
  ]);

  const universitiesList = await prisma.institution.findMany({
    select: { id: true, name: true, slug: true, city: true, state: true, logoUrl: true },
    orderBy: { name: "asc" }
  });

  const partners = await prisma.institution.findMany({
    where: { isPartner: true, published: true },
    orderBy: { name: "asc" }
  });

  const testimonials = await prisma.testimonial.findMany({
    where: { isPublished: true },
    orderBy: { order: "asc" },
    take: 3
  });

  const faqs = await prisma.fAQ.findMany({
    where: { active: true, pageName: "home" },
    orderBy: { order: "asc" },
    take: 3
  });

  const courses = await prisma.course.findMany({
    where: { active: true },
    orderBy: { name: "asc" }
  });

  return (
    <>
      {/* Breadcrumb Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://www.collegecorridor.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Check Admission Chances",
                "item": "https://www.collegecorridor.com/check-admission-chances"
              }
            ]
          })
        }}
      />

      <HomePageContent
        stats={{ collegesCount, coursesCount, leadsCount, partnersCount }}
        universitiesList={universitiesList}
        partners={partners}
        testimonials={testimonials}
        faqs={faqs}
        slides={[]}
        universityLogos={[]}
        recruiterLogos={[]}
        accreditationLogos={[]}
        courses={courses}
      />
    </>
  );
}
