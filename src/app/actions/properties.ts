"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { PropertyRow, PropertyUpdate } from "@/lib/supabase/types";

function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface ActionResult {
  success: boolean;
  error?: string;
  data?: PropertyRow;
}

/**
 * Generate sequential reference code formatted as SHP-XXXXX.
 */
async function generateReferenceCode(): Promise<string> {
  const supabase = createAdminClient();
  const { count } = await supabase
    .from("properties")
    .select("id", { count: "exact", head: true });
  const nextNum = (count ?? 0) + 1;
  return `SHP-${String(nextNum).padStart(5, "0")}`;
}

/**
 * Create a new property.
 * - Auto-generates reference_code as SHP-XXXXX.
 * - Auto-generates slug from title_en + reference_code.
 * - Must have a valid project_id.
 */
export async function createProperty(formData: {
  project_id: string;
  title_en: string;
  title_ar: string;
  description_en?: string;
  description_ar?: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area_sqft: number;
  property_type_en: string;
  property_type_ar: string;
  is_featured?: boolean;
}): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const supabase = createAdminClient();
    const referenceCode = await generateReferenceCode();
    const slug = `${slugify(formData.title_en)}-${slugify(referenceCode)}`;

    const { data, error } = await supabase
      .from("properties")
      .insert({
        project_id: formData.project_id,
        slug,
        reference_code: referenceCode,
        title_en: formData.title_en,
        title_ar: formData.title_ar,
        description_en: formData.description_en ?? null,
        description_ar: formData.description_ar ?? null,
        price: formData.price,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        area_sqft: formData.area_sqft,
        property_type_en: formData.property_type_en,
        property_type_ar: formData.property_type_ar,
        status: "available",
        is_published: false,
        is_featured: formData.is_featured ?? false,
      } as any)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as PropertyRow };
  } catch (err) {
    console.error("[createProperty]", err);
    return { success: false, error: "Failed to create property" };
  }
}

/**
 * Update a property.
 */
export async function updateProperty(
  id: string,
  updates: PropertyUpdate
): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("properties")
      .update(updates as any)
      .eq("id", id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as PropertyRow };
  } catch (err) {
    console.error("[updateProperty]", err);
    return { success: false, error: "Failed to update property" };
  }
}

/**
 * Delete a property.
 * Also cleans up associated images from the site-media storage bucket.
 */
export async function deleteProperty(id: string): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const supabase = createAdminClient();

    // Fetch all images to clean up storage
    const { data: imagesData } = await supabase
      .from("property_images")
      .select("image_url")
      .eq("property_id", id);

    const images = imagesData as { image_url: string }[] | null;

    // Delete from database (cascades to images + specs)
    const { error } = await supabase.from("properties").delete().eq("id", id);

    if (error) return { success: false, error: error.message };

    // Clean up storage after successful DB deletion
    if (images && images.length > 0) {
      const paths = images.map((img) => img.image_url);
      await supabase.storage.from("site-media").remove(paths);
    }

    return { success: true };
  } catch (err) {
    console.error("[deleteProperty]", err);
    return { success: false, error: "Failed to delete property" };
  }
}

/**
 * Toggle property published status.
 * Requires at least 1 image to publish.
 */
export async function togglePropertyPublished(id: string): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const supabase = createAdminClient();

    const { data: currentData } = await supabase
      .from("properties")
      .select("is_published")
      .eq("id", id)
      .single();

    const current = currentData as { is_published: boolean } | null;
    if (!current) return { success: false, error: "Property not found" };

    // Publishing requires ≥1 image
    if (!current.is_published) {
      const { count } = await supabase
        .from("property_images")
        .select("id", { count: "exact", head: true })
        .eq("property_id", id);

      if (!count || count < 1) {
        return {
          success: false,
          error: "Cannot publish: at least 1 image is required.",
        };
      }
    }

    const { data, error } = await supabase
      .from("properties")
      .update({ is_published: !current.is_published } as any)
      .eq("id", id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as PropertyRow };
  } catch (err) {
    console.error("[togglePropertyPublished]", err);
    return { success: false, error: "Failed to toggle publish status" };
  }
}
