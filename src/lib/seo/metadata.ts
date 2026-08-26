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
