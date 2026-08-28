import type { MetadataRoute } from "next";

import { locales, type Locale } from "@/i18n/routing";
import { getPublishedProjectSlugs } from "@/lib/data/projects";
import { getPublishedPropertySlugs } from "@/lib/data/properties";
import { absoluteUrl } from "@/lib/seo/metadata";

export const revalidate = 300;

/**
 * Only 200, indexable, self-canonical, published pages.
 * Admin routes, /search, drafts and filter permutations are all excluded.
 */
function entries(
  path: string,
  options: { lastModified?: string | Date; priority?: number; changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"] } = {},
): MetadataRoute.Sitemap {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = absoluteUrl(path, locale);
  }
  languages["x-default"] = absoluteUrl(path, "en");

  return locales.map((locale: Locale) => ({
    url: absoluteUrl(path, locale),
    lastModified: options.lastModified,
    changeFrequency: options.changeFrequency ?? "weekly",
    priority: options.priority ?? 0.6,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, properties] = await Promise.all([
    getPublishedProjectSlugs(),
    getPublishedPropertySlugs(),
  ]);

  return [
    ...entries("/", { priority: 1, changeFrequency: "daily" }),
    ...entries("/about", { priority: 0.7, changeFrequency: "monthly" }),
    ...entries("/projects", { priority: 0.9 }),
    ...entries("/properties", { priority: 0.9, changeFrequency: "daily" }),
    ...entries("/contact", { priority: 0.5, changeFrequency: "monthly" }),
    ...projects.flatMap((project) =>
      entries(`/projects/${project.slug}`, {
        lastModified: project.updatedAt,
        priority: 0.8,
      }),
    ),
    ...properties.flatMap((property) =>
      entries(`/properties/${property.slug}`, {
        lastModified: property.updatedAt,
        priority: 0.7,
      }),
    ),
  ];
}
