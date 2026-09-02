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

    const payload: Record<string, any> = {
      key,
      ...settings,
      updated_at: new Date().toISOString(),
    };

    let { data, error } = await supabase
      .from("site_settings")
      .upsert(
        payload as any,
        { onConflict: "key" }
      )
      .select()
      .single();

    // If Supabase schema cache is missing newly added columns, gracefully retry by stripping them
    if (error && error.message && error.message.includes("in the schema cache")) {
      let currentError: any = error;
      let retries = 0;
      while (
        currentError &&
        currentError.message &&
        currentError.message.includes("in the schema cache") &&
        retries < 15
      ) {
        retries++;
        const match = currentError.message.match(/Could not find the '([^']+)' column/);
        if (match && match[1]) {
          delete payload[match[1]];
          const retryRes = await supabase
            .from("site_settings")
            .upsert(payload as any, { onConflict: "key" })
            .select()
            .single();
          currentError = retryRes.error;
          data = retryRes.data;
        } else {
          break;
        }
      }
      error = currentError;
    }

    if (error) return { success: false, error: error.message };

    // Revalidate root layouts and concrete dynamic localized routes
    revalidatePath("/", "layout");
    revalidatePath("/[locale]", "layout");
    revalidatePath("/en", "layout");
    revalidatePath("/ar", "layout");
    revalidatePath("/en");
    revalidatePath("/ar");
    revalidatePath("/en/properties");
    revalidatePath("/ar/properties");
    revalidatePath("/en/projects");
    revalidatePath("/ar/projects");
    revalidatePath("/en/about");
    revalidatePath("/ar/about");
    revalidatePath("/en/contact");
    revalidatePath("/ar/contact");
    revalidatePath("/dashboard-admin/settings");
    revalidatePath("/dashboard-admin/site-settings");

    return { success: true, data: data as SiteSettingsRow };
  } catch (err: any) {
    console.error("[updateSiteSettings]", err);
    return { success: false, error: err?.message || "Failed to update settings" };
  }
}
