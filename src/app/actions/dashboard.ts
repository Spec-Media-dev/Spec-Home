"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type {
  ProjectRow,
  PropertyRow,
  PropertyImageRow,
  PropertySpecRow,
  AdminProfileRow,
  EnquiryRow,
  SiteSettingsRow,
  SeoSettingsRow,
  PageSeoRow,
} from "@/lib/supabase/types";
import { unstable_noStore as noStore } from "next/cache";

export interface FullDashboardData {
  projects: ProjectRow[];
  properties: PropertyRow[];
  images: PropertyImageRow[];
  specs: PropertySpecRow[];
  admins: AdminProfileRow[];
  enquiries: EnquiryRow[];
  siteSettings: SiteSettingsRow | null;
  seoSettings: SeoSettingsRow | null;
  pageSeoList: PageSeoRow[];
}

/**
 * Server-side full database fetch using Service Role Client (bypassing any client RLS restrictions).
 */
export async function getFullDashboardData(): Promise<FullDashboardData> {
  noStore();
  try {
    const supabase = createAdminClient();

    const [
      projectsRes,
      propertiesRes,
      imagesRes,
      specsRes,
      adminsRes,
      enquiriesRes,
      settingsRes,
      seoRes,
      pageSeoRes,
    ] = await Promise.all([
      supabase.from("projects").select("*").order("created_at", { ascending: false }),
      supabase.from("properties").select("*").order("created_at", { ascending: false }),
      supabase.from("property_images").select("*").order("display_order", { ascending: true }),
      supabase.from("property_specs").select("*").order("created_at", { ascending: true }),
      supabase.from("admin_profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("enquiries").select("*").order("created_at", { ascending: false }),
      supabase.from("site_settings").select("*").limit(1).maybeSingle(),
      supabase.from("seo_settings").select("*").limit(1).maybeSingle(),
      supabase.from("page_seo").select("*").order("page_slug", { ascending: true }),
    ]);

    return {
      projects: (projectsRes.data as ProjectRow[]) || [],
      properties: (propertiesRes.data as PropertyRow[]) || [],
      images: (imagesRes.data as PropertyImageRow[]) || [],
      specs: (specsRes.data as PropertySpecRow[]) || [],
      admins: (adminsRes.data as AdminProfileRow[]) || [],
      enquiries: (enquiriesRes.data as EnquiryRow[]) || [],
      siteSettings: (settingsRes.data as SiteSettingsRow) || null,
      seoSettings: (seoRes.data as SeoSettingsRow) || null,
      pageSeoList: (pageSeoRes.data as PageSeoRow[]) || [],
    };
  } catch (error) {
    console.error("[getFullDashboardData] Error:", error);
    return {
      projects: [],
      properties: [],
      images: [],
      specs: [],
      admins: [],
      enquiries: [],
      siteSettings: null,
      seoSettings: null,
      pageSeoList: [],
    };
  }
}
