"use server";

import { createAdminClient } from "@/lib/supabase/admin";

function isSupabaseConfigured(): boolean {
  return !!(
    (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    (process.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
  );
}

export interface UploadResult {
  success: boolean;
  error?: string;
  url?: string;
  path?: string;
}

/**
 * Upload a media file directly to the Supabase storage bucket ('media').
 */
export async function uploadMediaFile(
  fileBase64: string,
  fileName: string,
  bucket: string = "media",
  folder: string = ""
): Promise<UploadResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const supabase = createAdminClient();
    const base64Data = fileBase64.includes(",") ? fileBase64.split(",")[1] : fileBase64;
    const buffer = Buffer.from(base64Data, "base64");

    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const targetFolder = folder || "projects";
    const filePath = `${targetFolder.replace(/^\/+|\/+$/g, "")}/${Date.now()}-${cleanFileName}`;

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

    // Target the primary 'media' bucket
    const targetBucket = bucket === "project-covers" || bucket === "property-images" || bucket === "site-assets"
      ? "media"
      : bucket;

    const { error: uploadError } = await supabase.storage
      .from(targetBucket)
      .upload(filePath, buffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error("[uploadMediaFile] Error:", uploadError.message);
      return { success: false, error: uploadError.message };
    }

    const { data: publicUrlData } = supabase.storage.from(targetBucket).getPublicUrl(filePath);

    return {
      success: true,
      url: publicUrlData?.publicUrl || filePath,
      path: filePath,
    };
  } catch (err: any) {
    console.error("[uploadMediaFile]", err);
    return { success: false, error: err?.message || "Failed to upload media file" };
  }
}
