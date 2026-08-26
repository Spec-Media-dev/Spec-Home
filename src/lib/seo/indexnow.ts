import "server-only";

import { siteUrl } from "@/lib/env";
import { serverEnv } from "@/lib/env.server";
import { locales } from "@/i18n/routing";
import { absoluteUrl } from "@/lib/seo/metadata";

/**
 * Optional IndexNow ping on publish/update/delete.
 *
 * Deliberately a no-op unless INDEXNOW_KEY is set, and it never throws: search
 * notification must not be able to fail an admin mutation. Nothing in the app
 * depends on it. See the final report — currently NOT CONFIGURED.
 */
export function isIndexNowConfigured(): boolean {
  return Boolean(serverEnv.INDEXNOW_KEY) && !siteUrl.includes("localhost");
}

export async function pingIndexNow(paths: string[]): Promise<void> {
  if (!isIndexNowConfigured() || paths.length === 0) return;

  const host = new URL(siteUrl).host;
  const urlList = paths.flatMap((path) =>
    locales.map((locale) => absoluteUrl(path, locale)),
  );

  try {
    await fetch("https://api.indexnow.org/IndexNow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key: serverEnv.INDEXNOW_KEY,
        keyLocation: `${siteUrl}/${serverEnv.INDEXNOW_KEY}.txt`,
        urlList,
      }),
    });
  } catch (error) {
    console.error("[indexnow] ping failed", error);
  }
}
