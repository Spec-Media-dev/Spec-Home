import type { Locale } from "@/i18n/routing";

/**
 * Gulf real-estate listings conventionally show Latin digits in both
 * languages, so the numbering system is pinned rather than left to the locale.
 */
function numberLocale(locale: Locale) {
  return locale === "ar" ? "ar-AE-u-nu-latn" : "en-AE";
}

/**
 * Currency always leads the amount, in both languages.
 *
 * `Intl.NumberFormat`'s own `style: "currency"` follows each locale's CLDR
 * convention, which puts the symbol *after* the number in Arabic ("100,000
 * د.إ.") but *before* it in English ("AED 100,000") — same price, opposite
 * layout depending on language. Read on its own that is arguably correct
 * Arabic typography, but next to the English version on the same site it
 * reads as the number having been reversed. `formatToParts` gets the
 * properly localized currency symbol and grouped digits, then this
 * reassembles them in one fixed order so the price looks the same shape in
 * both locales.
 */
export function formatPrice(
  value: number | null | undefined,
  currency: string,
  locale: Locale,
): string | null {
  if (value === null || value === undefined) return null;

  const parts = new Intl.NumberFormat(numberLocale(locale), {
    style: "currency",
    currency: currency || "AED",
    maximumFractionDigits: 0,
  }).formatToParts(value);

  const currencyPart = parts.find((part) => part.type === "currency")?.value;
  const amount = parts
    .filter((part) => part.type !== "currency" && part.type !== "literal")
    .map((part) => part.value)
    .join("");

  return currencyPart ? `${currencyPart} ${amount}` : amount;
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
