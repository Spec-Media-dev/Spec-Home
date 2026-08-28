import type { Metadata } from "next";

import { brand } from "@/config/brand";
import { siteUrl } from "@/lib/env";
import { defaultLocale, locales, type Locale } from "@/i18n/routing";

/**
 * `localePrefix: "as-needed"` means English lives at the unprefixed path, so
 * the same page is also reachable at /en/... . Explicit canonicals plus the
 * proxy's 308 keep only one form indexable.
 */
export function localizedPath(path: string, locale: Locale): string {
  const clean = path === "/" ? "" : path.replace(/\/+$/, "");
  return locale === defaultLocale ? clean || "/" : `/${locale}${clean}`;
}

export function absoluteUrl(path: string, locale: Locale): string {
  const localized = localizedPath(path, locale);
  return `${siteUrl}${localized === "/" ? "" : localized}` || siteUrl;
}

export function absoluteSiteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${siteUrl}/${pathOrUrl.replace(/^\/+/, "")}`;
}

export function buildAlternates(path: string, locale: Locale) {
  const languages: Record<string, string> = {};
  for (const candidate of locales) {
    languages[candidate] = absoluteUrl(path, candidate);
  }
  languages["x-default"] = absoluteUrl(path, defaultLocale);

  return {
    canonical: absoluteUrl(path, locale),
    languages,
  };
}

/** Query-state pages must not multiply into indexable URLs. */
export const noindexFollow = {
  index: false,
  follow: true,
} as const;

type LocalizedMetadataInput = {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  image?: string | null;
  robots?: Metadata["robots"];
};

/** Consistent current-route metadata without hiding entity-specific copy. */
export function buildLocalizedMetadata({
  locale,
  path,
  title,
  description,
  image = brand.hero.image,
  robots = { index: true, follow: true },
}: LocalizedMetadataInput): Metadata {
  const url = absoluteUrl(path, locale);
  const imageUrl = image ? absoluteSiteUrl(image) : null;

  return {
    title,
    description,
    alternates: buildAlternates(path, locale),
    robots,
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: brand.name,
      locale: locale === "ar" ? "ar_AE" : "en_AE",
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}
