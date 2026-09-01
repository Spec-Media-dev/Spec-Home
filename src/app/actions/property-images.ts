"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { PropertyImageRow } from "@/lib/supabase/types";
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

export interface ImageActionResult {
  success: boolean;
  error?: string;
  data?: PropertyImageRow;
}

/**
 * Add image to property by URL (e.g. Unsplash or pre-uploaded CDN/Storage URL).
 */
export async function addPropertyImageUrl(
  propertyId: string,
  imageUrl: string,
  isCover: boolean = false
): Promise<ImageActionResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const supabase = createAdminClient();

    const { count } = await supabase
      .from("property_images")
      .select("id", { count: "exact", head: true })
      .eq("property_id", propertyId);

    const shouldBeCover = isCover || !count || count === 0;

    if (shouldBeCover) {
      await supabase
        .from("property_images")
        .update({ is_cover: false } as any)
        .eq("property_id", propertyId);
    }

    const { data, error } = await supabase
      .from("property_images")
      .insert({
        property_id: propertyId,
        image_url: imageUrl,
        is_cover: shouldBeCover,
        display_order: (count ?? 0) + 1,
      } as any)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/[locale]/properties", "page");
    revalidatePath("/dashboard-admin/property-images");

    return { success: true, data: data as PropertyImageRow };
  } catch (err: any) {
    console.error("[addPropertyImageUrl]", err);
    return { success: false, error: err?.message || "Failed to add image" };
  }
}

/**
 * Upload a property image file via Base64 into the 'media' storage bucket.
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

    const { count } = await supabase
      .from("property_images")
      .select("id", { count: "exact", head: true })
      .eq("property_id", propertyId);

    const base64Data = fileBase64.includes(",") ? fileBase64.split(",")[1] : fileBase64;
    const buffer = Buffer.from(base64Data, "base64");
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const storagePath = `properties/${propertyId}/${Date.now()}-${cleanFileName}`;

    const ext = fileName.split(".").pop()?.toLowerCase() || "jpeg";
    const mimeTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      svg: "image/svg+xml",
      gif: "image/gif",
    };
    const contentType = mimeTypes[ext] || "image/jpeg";

    // Upload to 'media' bucket
    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(storagePath, buffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error("[uploadPropertyImage] Storage Error:", uploadError.message);
      return { success: false, error: uploadError.message };
    }

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

    revalidatePath("/[locale]/properties", "page");
    revalidatePath("/dashboard-admin/property-images");

    return { success: true, data: data as PropertyImageRow };
  } catch (err: any) {
    console.error("[uploadPropertyImage]", err);
    return { success: false, error: err?.message || "Failed to upload image" };
  }
}

/**
 * Delete a property image.
 */
export async function deletePropertyImage(id: string): Promise<ImageActionResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const supabase = createAdminClient();

    const { data: imageData } = await supabase
      .from("property_images")
      .select("image_url")
      .eq("id", id)
      .single();

    const image = imageData as { image_url: string } | null;

    const { error } = await supabase.from("property_images").delete().eq("id", id);
    if (error) return { success: false, error: error.message };

    if (image?.image_url && !image.image_url.startsWith("http://") && !image.image_url.startsWith("https://")) {
      await supabase.storage.from("media").remove([image.image_url]);
    }

    revalidatePath("/[locale]/properties", "page");
    revalidatePath("/dashboard-admin/property-images");

    return { success: true };
  } catch (err: any) {
    console.error("[deletePropertyImage]", err);
    return { success: false, error: err?.message || "Failed to delete image" };
  }
}

/**
 * Set an image as the cover image for its property.
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

    await supabase
      .from("property_images")
      .update({ is_cover: false } as any)
      .eq("property_id", propertyId);

    const { data, error } = await supabase
      .from("property_images")
      .update({ is_cover: true } as any)
      .eq("id", imageId)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/[locale]/properties", "page");
    revalidatePath("/dashboard-admin/property-images");

    return { success: true, data: data as PropertyImageRow };
  } catch (err: any) {
    console.error("[setCoverImage]", err);
    return { success: false, error: err?.message || "Failed to set cover image" };
  }
}
