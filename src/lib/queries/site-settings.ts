"use server";

import { createServerClient } from "@/lib/supabase/server";
import type { SiteSettingsRow } from "@/lib/supabase/types";
import { unstable_noStore as noStore } from "next/cache";

function isSupabaseConfigured(): boolean {
  return !!(
    (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    (process.env.SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

/** Default site settings fallback when Supabase is not configured */
const defaultSettings: SiteSettingsRow = {
  key: "general",
  brand_name_en: "SPEC Home Dubai",
  brand_name_ar: "سبيك هوم دبي",
  tagline_en: "The Pinnacle of Dubai Luxury Real Estate",
  tagline_ar: "قمة العقارات الفاخرة في دبي",
  meta_description_en:
    "Curated portfolio of prime waterfront estates, sky penthouses, and branded residences in Dubai.",
  meta_description_ar:
    "محفظة مختارة بعناية من العقارات الشاطئية الفاخرة، والبنتهاوس المعلق في دبي.",
  contact_email: "concierge@spechome.com",
  contact_phone: "+971 4 800 7732",
  whatsapp_number: "+971 50 999 8888",
  office_address_en: "Level 42, Al Saada Tower, Downtown Dubai, UAE",
  office_address_ar: "الطابق 42، برج السعادة، وسط مدينة دبي، الإمارات",
  instagram_url: "https://instagram.com/spechomedubai",
  linkedin_url: "https://linkedin.com/company/spechomedubai",
  youtube_url: "https://youtube.com/@spechomedubai",
  maintenance_mode: false,
  announcement_en: "Private Previews Available for Q4 2026 Signature Collections",
  announcement_ar: "معاينات خاصة متاحة لمجموعات الربع الرابع 2026 الحصرية",
  logo_path: null,
  hero_image_path: null,
  currency: "AED",
  updated_at: new Date().toISOString(),
};

/**
 * Fetch site settings.
 * Tolerates any key name ('general', 'main', 'global') by taking the single configuration row.
 */
export async function getSiteSettings(): Promise<SiteSettingsRow> {
  noStore();
  if (!isSupabaseConfigured()) return defaultSettings;

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return defaultSettings;
    }

    return { ...defaultSettings, ...data };
  } catch (err) {
    console.error("[getSiteSettings]", err);
    return defaultSettings;
  }
}
