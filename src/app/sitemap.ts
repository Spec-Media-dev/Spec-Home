import type { MetadataRoute } from "next";

import { locales, type Locale } from "@/i18n/routing";
import { getPublishedProjectSlugs } from "@/lib/data/projects";
import { getPublishedPropertySlugs } from "@/lib/data/properties";
import { absoluteUrl } from "@/lib/seo/metadata";

/**
 * Only 200, indexable, self-canonical, published pages.
 * Admin routes, /search, drafts and filter permutations are all excluded.
 */
function entry(
  path: string,
  options: { lastModified?: string | Date; priority?: number; changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"] } = {},
): MetadataRoute.Sitemap[number] {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = absoluteUrl(path, locale);
  }

  return {
    url: absoluteUrl(path, "en" as Locale),
    lastModified: options.lastModified,
    changeFrequency: options.changeFrequency ?? "weekly",
    priority: options.priority ?? 0.6,
    alternates: { languages },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, properties] = await Promise.all([
    getPublishedProjectSlugs(),
    getPublishedPropertySlugs(),
  ]);

  return [
    entry("/", { priority: 1, changeFrequency: "daily" }),
    entry("/projects", { priority: 0.9 }),
    entry("/properties", { priority: 0.9, changeFrequency: "daily" }),
    entry("/contact", { priority: 0.5, changeFrequency: "monthly" }),
    ...projects.map((project) =>
      entry(`/projects/${project.slug}`, {
        lastModified: project.updatedAt,
        priority: 0.8,
      }),
    ),
    ...properties.map((property) =>
      entry(`/properties/${property.slug}`, {
        lastModified: property.updatedAt,
        priority: 0.7,
      }),
    ),
  ];
}
