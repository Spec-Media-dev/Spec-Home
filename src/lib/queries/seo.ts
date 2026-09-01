"use server";

import { createServerClient } from "@/lib/supabase/server";
import type { SeoSettingsRow, PageSeoRow } from "@/lib/supabase/types";

function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

const defaultGlobalSeo: SeoSettingsRow = {
  key: "global",
  website_title_en: "SPEC Home Dubai | Premium Real Estate",
  website_title_ar: "سبيك هوم دبي | عقارات فاخرة",
  default_meta_title_en: "SPEC Home Dubai | Ultra-Luxury Real Estate Portfolio",
  default_meta_title_ar: "سبيك هوم دبي | المحفظة العقارية فائقة الفخامة",
  default_meta_description_en:
    "Curated portfolio of prime waterfront estates, sky penthouses, and branded residences in Dubai.",
  default_meta_description_ar:
    "محفظة مختارة بعناية من العقارات الشاطئية الفاخرة، والبنتهاوس المعلق في دبي.",
  default_keywords_en: "dubai luxury real estate, penthouses, villas, waterfront properties, spec home",
  default_keywords_ar: "عقارات دبي الفاخرة, بنتهاوس دبي, فلل فاخرة, عقارات شاطئية, سبيك هوم",
  og_title_en: "SPEC Home Dubai | Ultra-Luxury Real Estate",
  og_title_ar: "سبيك هوم دبي | عقارات فائقة الفخامة",
  og_description_en:
    "Curated portfolio of prime waterfront estates, sky penthouses, and branded residences in Dubai.",
  og_description_ar:
    "محفظة مختارة بعناية من العقارات الشاطئية الفاخرة، والبنتهاوس المعلق في دبي.",
  og_image_path: null,
  twitter_title_en: null,
  twitter_title_ar: null,
  twitter_description_en: null,
  twitter_description_ar: null,
  twitter_image_path: null,
  canonical_url: null,
  robots: "index, follow",
  updated_at: new Date().toISOString(),
};

/**
 * Fetch global SEO settings from Supabase.
 */
export async function getGlobalSeo(): Promise<SeoSettingsRow> {
  if (!isSupabaseConfigured()) return defaultGlobalSeo;

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("seo_settings")
      .select("*")
      .eq("key", "global")
      .maybeSingle();

    if (error || !data) {
      return defaultGlobalSeo;
    }

    return data as SeoSettingsRow;
  } catch (err) {
    console.error("[getGlobalSeo]", err);
    return defaultGlobalSeo;
  }
}

/**
 * Fetch page-specific SEO settings.
 */
export async function getPageSeo(pageSlug: string): Promise<PageSeoRow | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("page_seo")
      .select("*")
      .eq("page_slug", pageSlug)
      .maybeSingle();

    if (error) {
      return null;
    }

    return (data as PageSeoRow) || null;
  } catch (err) {
    console.error("[getPageSeo]", err);
    return null;
  }
}
