"use server";

import { createServerClient } from "@/lib/supabase/server";
import type { PropertyRow, PropertyWithDetails, PropertyImageRow, PropertySpecRow, ProjectRow } from "@/lib/supabase/types";

function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

/**
 * Fetch all published properties, newest first.
 * Cache tag: "properties"
 */
export async function getProperties(): Promise<PropertyRow[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getProperties]", error.message);
    return [];
  }

  return (data as PropertyRow[]) ?? [];
}

/**
 * Fetch all properties (including unpublished) for admin.
 */
export async function getAllProperties(): Promise<PropertyRow[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getAllProperties]", error.message);
    return [];
  }

  return (data as PropertyRow[]) ?? [];
}

/**
 * Fetch a property by slug, including its images, specs, and parent project.
 */
export async function getPropertyBySlug(slug: string): Promise<PropertyWithDetails | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("slug", slug)
    .single();

  const property = data as PropertyRow | null;

  if (error || !property) {
    console.error("[getPropertyBySlug]", error?.message);
    return null;
  }

  // Fetch related data in parallel
  const [imagesRes, specsRes, projectRes] = await Promise.all([
    supabase
      .from("property_images")
      .select("*")
      .eq("property_id", property.id)
      .order("display_order", { ascending: true }),
    supabase
      .from("property_specs")
      .select("*")
      .eq("property_id", property.id),
    supabase
      .from("projects")
      .select("*")
      .eq("id", property.project_id)
      .single(),
  ]);

  return {
    ...property,
    images: (imagesRes.data as PropertyImageRow[]) ?? [],
    specs: (specsRes.data as PropertySpecRow[]) ?? [],
    project: (projectRes.data as ProjectRow) ?? undefined,
  };
}

/**
 * Fetch featured properties.
 */
export async function getFeaturedProperties(): Promise<PropertyRow[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("is_published", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getFeaturedProperties]", error.message);
    return [];
  }

  return (data as PropertyRow[]) ?? [];
}

/**
 * Fetch properties belonging to a specific project.
 */
export async function getPropertiesByProject(projectId: string): Promise<PropertyRow[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("project_id", projectId)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getPropertiesByProject]", error.message);
    return [];
  }

  return (data as PropertyRow[]) ?? [];
}

/**
 * Search properties by title, location, or type.
 */
export async function searchProperties(query: string): Promise<PropertyRow[]> {
  if (!isSupabaseConfigured() || !query.trim()) return [];

  const supabase = createServerClient();
  const searchTerm = `%${query.trim()}%`;

  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("is_published", true)
    .or(
      `title_en.ilike.${searchTerm},title_ar.ilike.${searchTerm},property_type_en.ilike.${searchTerm}`
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[searchProperties]", error.message);
    return [];
  }

  return (data as PropertyRow[]) ?? [];
}
