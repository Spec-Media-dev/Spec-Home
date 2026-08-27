import "server-only";

import { cookies } from "next/headers";
import { createTranslator } from "next-intl";

import {
  ADMIN_LOCALE_COOKIE,
  normalizeAdminLocale,
  type AdminLocale,
} from "@/lib/admin-locale";

import adminEn from "../../messages/admin/en.json";
import adminAr from "../../messages/admin/ar.json";

/**
 * Translations for admin Server Components.
 *
 * `getTranslations()` from next-intl/server resolves its locale from the
 * request config, which is driven by the public site's `[locale]` segment. The
 * admin console has no such segment, so it would always fall back to English
 * with the *site* catalogue. Reading the admin cookie and building a
 * translator explicitly keeps the two i18n systems from interfering.
 */

export type AdminMessages = typeof adminEn;

const CATALOGUES: Record<AdminLocale, AdminMessages> = {
  en: adminEn,
  ar: adminAr as AdminMessages,
};

export async function getAdminLocale(): Promise<AdminLocale> {
  const store = await cookies();
  return normalizeAdminLocale(store.get(ADMIN_LOCALE_COOKIE)?.value);
}

export function adminMessages(locale: AdminLocale): AdminMessages {
  return CATALOGUES[locale];
}

/**
 * Mirrors `getTranslations()` from next-intl, scoped to the admin catalogue.
 * `timeZone` is fixed to the operating market so dates an admin sees do not
 * shift with the server's own zone.
 */
export async function getAdminTranslations<
  Namespace extends keyof AdminMessages & string,
>(namespace: Namespace) {
  const locale = await getAdminLocale();
  return createTranslator({
    locale,
    messages: adminMessages(locale),
    timeZone: ADMIN_TIME_ZONE,
    namespace,
  });
}

export const ADMIN_TIME_ZONE = "Asia/Dubai";

/** BCP-47 tags used for date and number formatting in the console. */
export const ADMIN_INTL_LOCALE: Record<AdminLocale, string> = {
  en: "en-AE",
  ar: "ar-AE",
};
