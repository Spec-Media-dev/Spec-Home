"use server";

import { createServerClient } from "@/lib/supabase/server";
import type {
  PropertyRow,
  PropertyWithDetails,
  PropertyImageRow,
  PropertySpecRow,
  ProjectRow,
} from "@/lib/supabase/types";

function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

/**
 * Fetch all published properties with their cover images, newest first.
 */
export async function getProperties(): Promise<(PropertyRow & { cover_image?: string })[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createServerClient();
  const { data: properties, error } = await supabase
    .from("properties")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error || !properties) {
    console.error("[getProperties]", error?.message);
    return [];
  }

  // Fetch cover images for all properties in one batch query
  const propertyIds = properties.map((p) => p.id);
  if (propertyIds.length === 0) return [];

  const { data: images } = await supabase
    .from("property_images")
    .select("*")
    .in("property_id", propertyIds)
    .order("display_order", { ascending: true });

  const imagesMap: Record<string, string> = {};
  if (images) {
    images.forEach((img) => {
      // If we don't have an image for this property yet, or this one is cover, set it
      if (!imagesMap[img.property_id] || img.is_cover) {
        imagesMap[img.property_id] = img.image_url;
      }
    });
  }

  return properties.map((p) => ({
    ...p,
    cover_image: imagesMap[p.id] || p.og_image_path || undefined,
  }));
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
 * Fetch a single property by slug with all images, specs, and parent project.
 */
export async function getPropertyBySlug(slug: string): Promise<PropertyWithDetails | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

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
    property.project_id
      ? supabase
          .from("projects")
          .select("*")
          .eq("id", property.project_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const images = (imagesRes.data as PropertyImageRow[]) ?? [];
  const coverImg = images.find((i) => i.is_cover)?.image_url || images[0]?.image_url;

  return {
    ...property,
    images,
    specs: (specsRes.data as PropertySpecRow[]) ?? [],
    project: (projectRes.data as ProjectRow) ?? undefined,
    cover_image: coverImg,
  };
}

/**
 * Fetch featured properties with cover images.
 */
export async function getFeaturedProperties(): Promise<(PropertyRow & { cover_image?: string })[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createServerClient();
  const { data: properties, error } = await supabase
    .from("properties")
    .select("*")
    .eq("is_published", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false });

  if (error || !properties) {
    console.error("[getFeaturedProperties]", error?.message);
    return [];
  }

  const propertyIds = properties.map((p) => p.id);
  if (propertyIds.length === 0) return [];

  const { data: images } = await supabase
    .from("property_images")
    .select("*")
    .in("property_id", propertyIds)
    .order("display_order", { ascending: true });

  const imagesMap: Record<string, string> = {};
  if (images) {
    images.forEach((img) => {
      if (!imagesMap[img.property_id] || img.is_cover) {
        imagesMap[img.property_id] = img.image_url;
      }
    });
  }

  return properties.map((p) => ({
    ...p,
    cover_image: imagesMap[p.id] || p.og_image_path || undefined,
  }));
}

/**
 * Fetch properties belonging to a specific project.
 */
export async function getPropertiesByProject(
  projectId: string
): Promise<(PropertyRow & { cover_image?: string })[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createServerClient();
  const { data: properties, error } = await supabase
    .from("properties")
    .select("*")
    .eq("project_id", projectId)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error || !properties) {
    console.error("[getPropertiesByProject]", error?.message);
    return [];
  }

  const propertyIds = properties.map((p) => p.id);
  if (propertyIds.length === 0) return [];

  const { data: images } = await supabase
    .from("property_images")
    .select("*")
    .in("property_id", propertyIds)
    .order("display_order", { ascending: true });

  const imagesMap: Record<string, string> = {};
  if (images) {
    images.forEach((img) => {
      if (!imagesMap[img.property_id] || img.is_cover) {
        imagesMap[img.property_id] = img.image_url;
      }
    });
  }

  return properties.map((p) => ({
    ...p,
    cover_image: imagesMap[p.id] || p.og_image_path || undefined,
  }));
}

/**
 * Search properties by query.
 */
export async function searchProperties(
  query: string
): Promise<(PropertyRow & { cover_image?: string })[]> {
  if (!isSupabaseConfigured() || !query.trim()) return [];

  const supabase = createServerClient();
  const searchTerm = `%${query.trim()}%`;

  const { data: properties, error } = await supabase
    .from("properties")
    .select("*")
    .eq("is_published", true)
    .or(
      `title_en.ilike.${searchTerm},title_ar.ilike.${searchTerm},slug.ilike.${searchTerm},reference_code.ilike.${searchTerm},property_type_en.ilike.${searchTerm}`
    )
    .order("created_at", { ascending: false });

  if (error || !properties) {
    console.error("[searchProperties]", error?.message);
    return [];
  }

  const propertyIds = properties.map((p) => p.id);
  if (propertyIds.length === 0) return [];

  const { data: images } = await supabase
    .from("property_images")
    .select("*")
    .in("property_id", propertyIds);

  const imagesMap: Record<string, string> = {};
  if (images) {
    images.forEach((img) => {
      if (!imagesMap[img.property_id] || img.is_cover) {
        imagesMap[img.property_id] = img.image_url;
      }
    });
  }

  return properties.map((p) => ({
    ...p,
    cover_image: imagesMap[p.id] || p.og_image_path || undefined,
  }));
}
