import { defineRouting } from "next-intl/routing";

export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/**
 * `as-needed` keeps English on unprefixed paths (/projects) and Arabic on /ar.
 * That preserves the English URL architecture, at the cost of the same page
 * being reachable as /en/... — handled by explicit canonicals plus a 308 in the
 * proxy so the prefixed form is never indexed.
 */
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
  localeDetection: false,
});

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export const localeDirection: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr",
  ar: "rtl",
};
