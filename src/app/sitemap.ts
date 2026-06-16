import { MetadataRoute } from "next";
import { prisma } from "@/lib/db/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.collegecorridor.com";

  // Fetch all published colleges
  const colleges = await prisma.institution.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true }
  });

  const collegeUrls = colleges.map((college) => ({
    url: `${baseUrl}/colleges/${college.slug}`,
    lastModified: new Date(college.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.7
  }));

  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0
    },
    {
      url: `${baseUrl}/colleges`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8
    },
    {
      url: `${baseUrl}/study-abroad`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8
    }
  ];

  return [...staticUrls, ...collegeUrls];
}
