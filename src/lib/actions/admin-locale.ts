"use server";

import { cookies } from "next/headers";

import {
  ADMIN_LOCALE_COOKIE,
  ADMIN_LOCALE_COOKIE_MAX_AGE,
  isAdminLocale,
  type AdminLocale,
} from "@/lib/admin-locale";

/**
 * Stores the admin console's display language.
 *
 * Deliberately *not* behind `requireAdminAction`. This is a display preference
 * with no privilege attached — like the theme — and the sign-in screen is
 * rendered to someone who has no session yet. Gating it would have meant an
 * admin who set the console to Arabic could never read their way back to
 * English from the login page. The value is still strictly validated, so the
 * cookie can only ever hold "en" or "ar".
 */
export async function setAdminLocale(
  locale: AdminLocale,
): Promise<{ ok: boolean }> {
  if (!isAdminLocale(locale)) return { ok: false };

  const store = await cookies();
  store.set(ADMIN_LOCALE_COOKIE, locale, {
    path: "/dashboard-admin",
    maxAge: ADMIN_LOCALE_COOKIE_MAX_AGE,
    sameSite: "lax",
    // Readable by script on purpose: it carries no secret, and nothing
    // authorizes off it.
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
  });

  return { ok: true };
}
