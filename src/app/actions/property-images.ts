"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { PropertyImageRow } from "@/lib/supabase/types";

function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export interface ImageActionResult {
  success: boolean;
  error?: string;
  data?: PropertyImageRow;
}

/**
 * Upload a property image.
 * - Enforces max 4 images per property.
 * - Uploads to site-media bucket.
 * - If first image, sets it as cover.
 */
export async function uploadPropertyImage(
  propertyId: string,
  fileBase64: string,
  fileName: string,
  displayOrder?: number
): Promise<ImageActionResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const supabase = createAdminClient();

    // Check image count constraint (max 4)
    const { count } = await supabase
      .from("property_images")
      .select("id", { count: "exact", head: true })
      .eq("property_id", propertyId);

    if (count && count >= 4) {
      return {
        success: false,
        error: "Maximum 4 images allowed per property.",
      };
    }

    // Decode base64 and upload to storage
    const buffer = Buffer.from(fileBase64, "base64");
    const storagePath = `properties/${propertyId}/${Date.now()}-${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("site-media")
      .upload(storagePath, buffer, {
        contentType: `image/${fileName.split(".").pop() || "jpeg"}`,
        upsert: false,
      });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    // Determine if this should be cover (first image = cover)
    const isCover = !count || count === 0;

    const { data, error } = await supabase
      .from("property_images")
      .insert({
        property_id: propertyId,
        image_url: storagePath,
        is_cover: isCover,
        display_order: displayOrder ?? (count ?? 0) + 1,
      } as any)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as PropertyImageRow };
  } catch (err) {
    console.error("[uploadPropertyImage]", err);
    return { success: false, error: "Failed to upload image" };
  }
}

/**
 * Delete a property image.
 * Removes from both storage and database.
 */
export async function deletePropertyImage(id: string): Promise<ImageActionResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const supabase = createAdminClient();

    // Get the image path for storage cleanup
    const { data: imageData } = await supabase
      .from("property_images")
      .select("image_url")
      .eq("id", id)
      .single();

    const image = imageData as { image_url: string } | null;

    // Delete from DB
    const { error } = await supabase
      .from("property_images")
      .delete()
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    // Cleanup storage
    if (image?.image_url) {
      await supabase.storage.from("site-media").remove([image.image_url]);
    }

    return { success: true };
  } catch (err) {
    console.error("[deletePropertyImage]", err);
    return { success: false, error: "Failed to delete image" };
  }
}

/**
 * Set cover image.
 * Ensures exactly one image has is_cover = true for the property.
 */
export async function setCoverImage(
  imageId: string,
  propertyId: string
): Promise<ImageActionResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const supabase = createAdminClient();

    // Unset all covers for this property
    await supabase
      .from("property_images")
      .update({ is_cover: false } as any)
      .eq("property_id", propertyId);

    // Set the new cover
    const { data, error } = await supabase
      .from("property_images")
      .update({ is_cover: true } as any)
      .eq("id", imageId)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as PropertyImageRow };
  } catch (err) {
    console.error("[setCoverImage]", err);
    return { success: false, error: "Failed to set cover image" };
  }
}
