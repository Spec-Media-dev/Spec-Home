"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { SiteSettingsRow } from "@/lib/supabase/types";
import { revalidatePath } from "next/cache";

function isSupabaseConfigured(): boolean {
  return !!(
    (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    (process.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

export interface SettingsResult {
  success: boolean;
  error?: string;
  data?: SiteSettingsRow;
}

/**
 * Update site settings.
 * Preserves the existing key ('main', 'general') if one exists.
 */
export async function updateSiteSettings(
  settings: Partial<Omit<SiteSettingsRow, "key" | "updated_at">>
): Promise<SettingsResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const supabase = createAdminClient();

    // Check if a row already exists to preserve the key ('main' or 'general')
    const { data: existing } = await supabase
      .from("site_settings")
      .select("key")
      .limit(1)
      .maybeSingle();

    const key = (existing as { key: string } | null)?.key || "general";

    const { data, error } = await supabase
      .from("site_settings")
      .upsert(
        {
          key,
          ...settings,
          updated_at: new Date().toISOString(),
        } as any,
        { onConflict: "key" }
      )
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/", "layout");
    revalidatePath("/dashboard-admin/settings");

    return { success: true, data: data as SiteSettingsRow };
  } catch (err: any) {
    console.error("[updateSiteSettings]", err);
    return { success: false, error: err?.message || "Failed to update settings" };
  }
}
