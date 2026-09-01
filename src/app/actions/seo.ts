"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { SeoSettingsRow, PageSeoRow } from "@/lib/supabase/types";
import { revalidatePath } from "next/cache";

function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

export interface SeoActionResult {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * Update global SEO settings (upsert 'global' key).
 */
export async function updateGlobalSeo(
  settings: Partial<Omit<SeoSettingsRow, "key" | "updated_at">>
): Promise<SeoActionResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("seo_settings")
      .upsert(
        {
          key: "global",
          ...settings,
          updated_at: new Date().toISOString(),
        } as any,
        { onConflict: "key" }
      )
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/", "layout");
    revalidatePath("/dashboard-admin/seo");

    return { success: true, data };
  } catch (err: any) {
    console.error("[updateGlobalSeo]", err);
    return { success: false, error: err?.message || "Failed to update global SEO" };
  }
}

/**
 * Upsert page-level SEO settings.
 */
export async function upsertPageSeo(
  pageSlug: string,
  settings: Partial<Omit<PageSeoRow, "id" | "page_slug" | "updated_at">>
): Promise<SeoActionResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("page_seo")
      .upsert(
        {
          page_slug: pageSlug,
          ...settings,
          updated_at: new Date().toISOString(),
        } as any,
        { onConflict: "page_slug" }
      )
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/[locale]", "layout");
    revalidatePath(`/[locale]/${pageSlug === "home" ? "" : pageSlug}`, "page");
    revalidatePath("/dashboard-admin/seo");

    return { success: true, data };
  } catch (err: any) {
    console.error("[upsertPageSeo]", err);
    return { success: false, error: err?.message || "Failed to update page SEO" };
  }
}

/**
 * Get all page SEO records.
 */
export async function getAllPageSeo(): Promise<PageSeoRow[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("page_seo")
      .select("*")
      .order("page_slug", { ascending: true });

    if (error) {
      console.error("[getAllPageSeo]", error.message);
      return [];
    }

    return (data as PageSeoRow[]) || [];
  } catch (err) {
    console.error("[getAllPageSeo]", err);
    return [];
  }
}

/**
 * Get global SEO record.
 */
export async function getGlobalSeo(): Promise<SeoSettingsRow | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("seo_settings")
      .select("*")
      .eq("key", "global")
      .maybeSingle();

    if (error) {
      console.error("[getGlobalSeo]", error.message);
      return null;
    }

    return data as SeoSettingsRow | null;
  } catch (err) {
    console.error("[getGlobalSeo]", err);
    return null;
  }
}
