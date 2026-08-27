/**
 * Admin console language.
 *
 * Deliberately independent of the public site's `[locale]` routing: the admin
 * lives at a single set of URLs (`/dashboard-admin/...`) and duplicating every
 * route under a locale segment would double the surface for no benefit. The
 * choice is a cookie instead, which also means switching language never
 * navigates — see `AdminLocaleSwitcher`.
 */

export const ADMIN_LOCALES = ["en", "ar"] as const;

export type AdminLocale = (typeof ADMIN_LOCALES)[number];

export const DEFAULT_ADMIN_LOCALE: AdminLocale = "en";

export const ADMIN_LOCALE_COOKIE = "spec_admin_locale";

/** One year: the console is a daily tool, not a session-scoped visit. */
export const ADMIN_LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const adminLocaleDirection: Record<AdminLocale, "ltr" | "rtl"> = {
  en: "ltr",
  ar: "rtl",
};

export function isAdminLocale(value: unknown): value is AdminLocale {
  return (
    typeof value === "string" &&
    (ADMIN_LOCALES as readonly string[]).includes(value)
  );
}

export function normalizeAdminLocale(value: unknown): AdminLocale {
  return isAdminLocale(value) ? value : DEFAULT_ADMIN_LOCALE;
}
