import "server-only";

import { unstable_cache } from "next/cache";

import { cacheTags } from "@/lib/cache-tags";
import { createPublicClient } from "@/lib/supabase/public";
import { SITE_SETTINGS_KEY, type SiteSettings } from "@/lib/supabase/types";

/**
 * Read on every page for the header/footer logo, so it is cached and
 * invalidated by tag when an admin uploads a new one.
 */
export const getSiteSettings = unstable_cache(
  async (): Promise<SiteSettings | null> => {
    const { data, error } = await createPublicClient()
      .from("site_settings")
      .select("*")
      .eq("key", SITE_SETTINGS_KEY)
      .maybeSingle();

    if (error) throw error;
    return data;
  },
  ["site-settings"],
  { tags: [cacheTags.siteSettings], revalidate: 3600 },
);
