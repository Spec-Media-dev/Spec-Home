"use server";

import { createServerClient } from "@/lib/supabase/server";
import type { SiteSettingsRow } from "@/lib/supabase/types";

function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

/** Default site settings fallback when Supabase is not configured */
const defaultSettings: SiteSettingsRow = {
  key: "general",
  brand_name_en: "SPEC Home Dubai",
  brand_name_ar: "سبيك هوم دبي",
  contact_email: "concierge@spechome.com",
  contact_phone: "+971 4 800 7732",
  whatsapp_number: "+971 50 999 8888",
  logo_path: null,
  updated_at: new Date().toISOString(),
};

/**
 * Fetch site settings (the 'general' key row).
 * Cache tag: "site-settings"
 */
export async function getSiteSettings(): Promise<SiteSettingsRow> {
  if (!isSupabaseConfigured()) return defaultSettings;

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("key", "general")
    .single();

  if (error) {
    console.error("[getSiteSettings]", error.message);
    return defaultSettings;
  }

  return data ?? defaultSettings;
}
