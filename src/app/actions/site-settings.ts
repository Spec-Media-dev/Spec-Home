"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { SiteSettingsRow } from "@/lib/supabase/types";

function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export interface SettingsResult {
  success: boolean;
  error?: string;
}

/**
 * Update site settings (upsert the 'general' key row).
 */
export async function updateSiteSettings(
  settings: Partial<Omit<SiteSettingsRow, "key" | "updated_at">>
): Promise<SettingsResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("site_settings")
      .upsert(
        {
          key: "general",
          ...settings,
          updated_at: new Date().toISOString(),
        } as any,
        { onConflict: "key" }
      );

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    console.error("[updateSiteSettings]", err);
    return { success: false, error: "Failed to update settings" };
  }
}
