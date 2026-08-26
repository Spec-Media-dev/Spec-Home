import type { Locale } from "@/i18n/routing";

/**
 * Gulf real-estate listings conventionally show Latin digits in both
 * languages, so the numbering system is pinned rather than left to the locale.
 */
function numberLocale(locale: Locale) {
  return locale === "ar" ? "ar-AE-u-nu-latn" : "en-AE";
}

export function formatPrice(
  value: number | null | undefined,
  currency: string,
  locale: Locale,
): string | null {
  if (value === null || value === undefined) return null;

  return new Intl.NumberFormat(numberLocale(locale), {
    style: "currency",
    currency: currency || "AED",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPriceRange(
  min: number | null,
  max: number | null,
  currency: string,
  locale: Locale,
): string | null {
  const low = formatPrice(min, currency, locale);
  const high = formatPrice(max, currency, locale);

  if (low && high) return low === high ? low : `${low} – ${high}`;
  return low ?? high;
}

export function formatNumber(
  value: number | null | undefined,
  locale: Locale,
): string | null {
  if (value === null || value === undefined) return null;
  return new Intl.NumberFormat(numberLocale(locale), {
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatArea(
  value: number | null | undefined,
  locale: Locale,
): string | null {
  return formatNumber(value, locale);
}

export function formatDate(value: string, locale: Locale): string {
  return new Intl.DateTimeFormat(numberLocale(locale), {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
