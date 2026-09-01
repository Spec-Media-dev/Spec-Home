"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { PropertyRow, PropertyUpdate } from "@/lib/supabase/types";
import { revalidatePath } from "next/cache";

function isSupabaseConfigured(): boolean {
  return !!(
    (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    (process.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
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
 * Filter payload to known database columns to avoid schema cache errors.
 */
function sanitizePropertyPayload(input: Record<string, any>): Record<string, any> {
  const sizeNum = input.area_sqft !== undefined
    ? Number(input.area_sqft)
    : input.size_sqft !== undefined
    ? Number(input.size_sqft)
    : 0;

  const payload: Record<string, any> = {
    project_id: input.project_id,
    slug: input.slug,
    reference_code: input.reference_code,
    title_en: input.title_en,
    title_ar: input.title_ar || input.title_en,
    description_en: input.description_en ?? null,
    description_ar: input.description_ar ?? null,
    price: input.price !== undefined ? Number(input.price) : 0,
    currency: input.currency || "AED",
    bedrooms: input.bedrooms !== undefined ? Number(input.bedrooms) : 1,
    bathrooms: input.bathrooms !== undefined ? Number(input.bathrooms) : 1,
    size_sqft: sizeNum,
    property_type_en: input.property_type_en || "apartment",
    property_type_ar: input.property_type_ar || input.property_type_en || "عقار",
    status: input.status || "available",
    is_published: input.is_published ?? false,
    is_featured: input.is_featured ?? false,
  };

  // Clean undefined keys
  Object.keys(payload).forEach((k) => {
    if (payload[k] === undefined) delete payload[k];
  });

  return payload;
}

/**
 * Create a new property.
 */
export async function createProperty(
  formData: {
    project_id: string;
    title_en: string;
    title_ar: string;
    description_en?: string | null;
    description_ar?: string | null;
    price: number;
    currency?: string | null;
    bedrooms: number;
    bathrooms: number;
    area_sqft: number;
    size_sqft?: number;
    property_type_en: string;
    property_type_ar?: string | null;
    status?: "available" | "reserved" | "sold";
    is_published?: boolean;
    is_featured?: boolean;
  } & Record<string, any>
): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const supabase = createAdminClient();
    const referenceCode = await generateReferenceCode();
    const slug = `${slugify(formData.title_en)}-${slugify(referenceCode)}`;

    const payload = sanitizePropertyPayload({
      ...formData,
      slug,
      reference_code: referenceCode,
    });

    const { data, error } = await supabase
      .from("properties")
      .insert(payload as any)
      .select()
      .single();

    if (error) {
      console.error("[createProperty] Error:", error.message);
      return { success: false, error: error.message };
    }

    revalidatePath("/[locale]/properties", "page");
    revalidatePath("/[locale]", "page");
    revalidatePath("/dashboard-admin/properties");

    return { success: true, data: data as PropertyRow };
  } catch (err: any) {
    console.error("[createProperty]", err);
    return { success: false, error: err?.message || "Failed to create property" };
  }
}

/**
 * Update a property.
 */
export async function updateProperty(
  id: string,
  updates: (PropertyUpdate | Record<string, any>)
): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const supabase = createAdminClient();
    const payload = sanitizePropertyPayload(updates);

    const { data, error } = await supabase
      .from("properties")
      .update(payload as any)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[updateProperty] Error:", error.message);
      return { success: false, error: error.message };
    }

    revalidatePath("/[locale]/properties", "page");
    revalidatePath("/[locale]", "page");
    revalidatePath("/dashboard-admin/properties");

    return { success: true, data: data as PropertyRow };
  } catch (err: any) {
    console.error("[updateProperty]", err);
    return { success: false, error: err?.message || "Failed to update property" };
  }
}

/**
 * Delete a property.
 */
export async function deleteProperty(id: string): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const supabase = createAdminClient();

    const { data: imagesData } = await supabase
      .from("property_images")
      .select("image_url")
      .eq("property_id", id);

    const images = imagesData as { image_url: string }[] | null;

    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) return { success: false, error: error.message };

    if (images && images.length > 0) {
      const storagePaths = images
        .map((img) => img.image_url)
        .filter((url) => !url.startsWith("http://") && !url.startsWith("https://"));
      if (storagePaths.length > 0) {
        await supabase.storage.from("media").remove(storagePaths);
      }
    }

    revalidatePath("/[locale]/properties", "page");
    revalidatePath("/[locale]", "page");
    revalidatePath("/dashboard-admin/properties");

    return { success: true };
  } catch (err: any) {
    console.error("[deleteProperty]", err);
    return { success: false, error: err?.message || "Failed to delete property" };
  }
}

/**
 * Toggle property published status.
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

    const { data, error } = await supabase
      .from("properties")
      .update({ is_published: !current.is_published } as any)
      .eq("id", id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/[locale]/properties", "page");
    revalidatePath("/[locale]", "page");
    revalidatePath("/dashboard-admin/properties");

    return { success: true, data: data as PropertyRow };
  } catch (err: any) {
    console.error("[togglePropertyPublished]", err);
    return { success: false, error: err?.message || "Failed to toggle publish status" };
  }
}
