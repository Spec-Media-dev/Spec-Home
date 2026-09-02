import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/queries/projects";
import { getProperties } from "@/lib/queries/properties";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/+$/, "");

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // 1. Static Canonical Pages (English & Arabic)
  const staticRoutes = [
    { path: "", priority: 1.0, changeFrequency: "daily" as const },
    { path: "/properties", priority: 0.95, changeFrequency: "daily" as const },
    { path: "/projects", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.8, changeFrequency: "monthly" as const },
  ];

  const staticEntries: MetadataRoute.Sitemap = [];

  for (const route of staticRoutes) {
    for (const locale of ["en", "ar"]) {
      const url = `${SITE_URL}/${locale}${route.path}`;
      staticEntries.push({
        url,
        lastModified: now,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: {
          languages: {
            en: `${SITE_URL}/en${route.path}`,
            ar: `${SITE_URL}/ar${route.path}`,
          },
        },
      });
    }
  }

  // 2. Dynamic Projects
  let projectEntries: MetadataRoute.Sitemap = [];
  try {
    const projects = await getProjects();
    projectEntries = projects.flatMap((project) => {
      const lastMod = project.updated_at ? new Date(project.updated_at) : now;
      return ["en", "ar"].map((locale) => ({
        url: `${SITE_URL}/${locale}/projects/${project.slug}`,
        lastModified: lastMod,
        changeFrequency: "weekly" as const,
        priority: 0.85,
        alternates: {
          languages: {
            en: `${SITE_URL}/en/projects/${project.slug}`,
            ar: `${SITE_URL}/ar/projects/${project.slug}`,
          },
        },
      }));
    });
  } catch (err) {
    console.error("[sitemap] Error fetching projects:", err);
  }

  // 3. Dynamic Properties
  let propertyEntries: MetadataRoute.Sitemap = [];
  try {
    const properties = await getProperties();
    propertyEntries = properties.flatMap((property) => {
      const lastMod = property.updated_at ? new Date(property.updated_at) : now;
      return ["en", "ar"].map((locale) => ({
        url: `${SITE_URL}/${locale}/properties/${property.slug}`,
        lastModified: lastMod,
        changeFrequency: "daily" as const,
        priority: 0.9,
        alternates: {
          languages: {
            en: `${SITE_URL}/en/properties/${property.slug}`,
            ar: `${SITE_URL}/ar/properties/${property.slug}`,
          },
        },
      }));
    });
  } catch (err) {
    console.error("[sitemap] Error fetching properties:", err);
  }

  return [...staticEntries, ...projectEntries, ...propertyEntries];
}
