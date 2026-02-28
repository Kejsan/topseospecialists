import type { MetadataRoute } from "next";
import { initialSpecialistData } from "@/lib/data";

const BASE_URL = "https://topseospecialists.com";

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
  ];

  // Specialist profile pages
  const specialistPages: MetadataRoute.Sitemap = initialSpecialistData.map((s) => ({
    url: `${BASE_URL}/specialist/${slugify(s.name)}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...specialistPages];
}
