"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { cacheTags } from "@/lib/cache-tags";
import { logAndMap, type ActionResult } from "@/lib/errors";
import { storagePathFromUrl, storagePaths, storageUrl } from "@/lib/storage";
import { requireAdminAction } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { MAX_PROPERTY_IMAGES, STORAGE_BUCKET } from "@/lib/supabase/types";

const MAX_BYTES = 5 * 1024 * 1024;

const SIGNATURES: { ext: string; mime: string; test: (b: Uint8Array) => boolean }[] = [
  {
    ext: "jpg",
    mime: "image/jpeg",
    test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    ext: "png",
    mime: "image/png",
    test: (b) =>
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  },
  {
    ext: "webp",
    mime: "image/webp",
    test: (b) =>
      b[0] === 0x52 &&
      b[1] === 0x49 &&
      b[2] === 0x46 &&
      b[3] === 0x46 &&
      b[8] === 0x57 &&
      b[9] === 0x45 &&
      b[10] === 0x42 &&
      b[11] === 0x50,
  },
];

/**
 * `file.type` is attacker-controlled, so the real format is confirmed from the
 * leading bytes. The bucket also enforces its own MIME allowlist and size cap,
 * so a forged upload fails at two independent layers.
 */
async function inspectImage(file: File) {
  if (file.size === 0 || file.size > MAX_BYTES) return null;

  const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  return SIGNATURES.find((signature) => signature.test(header)) ?? null;
}

export async function uploadPropertyImage(
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireAdminAction();
  } catch {
    return { ok: false, error: "unauthorized" };
  }

  const propertyId = String(formData.get("propertyId") ?? "");
  const file = formData.get("file");

  if (!propertyId || !(file instanceof File)) {
    return { ok: false, error: "validation" };
  }

  const kind = await inspectImage(file);
  if (!kind) return { ok: false, error: "invalidFile" };

  const supabase = await createClient();

  const { data: property } = await supabase
    .from("properties")
    .select("id, slug")
    .eq("id", propertyId)
    .maybeSingle();

  if (!property) return { ok: false, error: "notFound" };

  // Re-counted immediately before the insert rather than trusting the client's
  // view of how many images already exist.
  const { data: existing } = await supabase
    .from("property_images")
    .select("id, display_order")
    .eq("property_id", propertyId);

  const current = existing ?? [];
  if (current.length >= MAX_PROPERTY_IMAGES) {
    return { ok: false, error: "imageLimit" };
  }

  // Random name: the client's filename never reaches storage, which removes
  // path traversal, unicode tricks, and collisions in one step.
  const objectName = `${crypto.randomUUID()}.${kind.ext}`;
  const path = storagePaths.propertyImage(propertyId, objectName);

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { contentType: kind.mime, upsert: false });

  if (uploadError) {
    console.error("[uploadPropertyImage] storage", uploadError);
    return { ok: false, error: "uploadFailed" };
  }

  const nextOrder =
    current.reduce((max, image) => Math.max(max, image.display_order), 0) + 1;

  const { error } = await supabase.from("property_images").insert({
    property_id: propertyId,
    image_url: path,
    display_order: nextOrder,
    is_cover: current.length === 0,
  });

  if (error) {
    // Roll the object back so a failed insert cannot orphan a file.
    await supabase.storage.from(STORAGE_BUCKET).remove([path]);
    return { ok: false, error: logAndMap("uploadPropertyImage", error) };
  }

  revalidateTag(cacheTags.properties, "max");
  revalidatePath(`/dashboard-admin/properties/${propertyId}/images`);
  revalidatePath(`/properties/${property.slug}`);
  return { ok: true };
}

export async function deletePropertyImage(
  imageId: string,
): Promise<ActionResult> {
  try {
    await requireAdminAction();
  } catch {
    return { ok: false, error: "unauthorized" };
  }

  const supabase = await createClient();

  const { data: image } = await supabase
    .from("property_images")
    .select("id, property_id, image_url, is_cover")
    .eq("id", imageId)
    .maybeSingle();

  if (!image) return { ok: false, error: "notFound" };

  const { data: property } = await supabase
    .from("properties")
    .select("id, slug, is_published")
    .eq("id", image.property_id)
    .maybeSingle();

  // A published listing must keep at least one image.
  if (property?.is_published) {
    const { count } = await supabase
      .from("property_images")
      .select("id", { count: "exact", head: true })
      .eq("property_id", image.property_id);

    if ((count ?? 0) <= 1) return { ok: false, error: "imageRequired" };
  }

  const { error } = await supabase
    .from("property_images")
    .delete()
    .eq("id", imageId);

  if (error) {
    return { ok: false, error: logAndMap("deletePropertyImage", error) };
  }

  const path = storagePathFromUrl(image.image_url);
  if (path) {
    const { error: storageError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([path]);
    if (storageError) {
      console.error("[deletePropertyImage] storage", storageError);
    }
  }

  // The cover must never be left unset while images remain.
  if (image.is_cover) {
    const { data: next } = await supabase
      .from("property_images")
      .select("id")
      .eq("property_id", image.property_id)
      .order("display_order", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (next) {
      await supabase
        .from("property_images")
        .update({ is_cover: true })
        .eq("id", next.id);
    }
  }

  revalidateTag(cacheTags.properties, "max");
  revalidatePath(`/dashboard-admin/properties/${image.property_id}/images`);
  if (property?.slug) revalidatePath(`/properties/${property.slug}`);
  return { ok: true };
}

export async function setPropertyImageCover(
  imageId: string,
): Promise<ActionResult> {
  try {
    await requireAdminAction();
  } catch {
    return { ok: false, error: "unauthorized" };
  }

  const supabase = await createClient();

  const { data: image } = await supabase
    .from("property_images")
    .select("id, property_id")
    .eq("id", imageId)
    .maybeSingle();

  if (!image) return { ok: false, error: "notFound" };

  // No unique index guarantees a single cover, so clear the others explicitly.
  const { error: clearError } = await supabase
    .from("property_images")
    .update({ is_cover: false })
    .eq("property_id", image.property_id);

  if (clearError) {
    return { ok: false, error: logAndMap("setPropertyImageCover", clearError) };
  }

  const { error } = await supabase
    .from("property_images")
    .update({ is_cover: true })
    .eq("id", imageId);

  if (error) {
    return { ok: false, error: logAndMap("setPropertyImageCover", error) };
  }

  revalidateTag(cacheTags.properties, "max");
  revalidatePath(`/dashboard-admin/properties/${image.property_id}/images`);
  return { ok: true };
}

export async function reorderPropertyImages(
  propertyId: string,
  orderedIds: string[],
): Promise<ActionResult> {
  try {
    await requireAdminAction();
  } catch {
    return { ok: false, error: "unauthorized" };
  }

  const supabase = await createClient();

  const { data: images } = await supabase
    .from("property_images")
    .select("id")
    .eq("property_id", propertyId);

  const known = new Set((images ?? []).map((image) => image.id));
  if (orderedIds.length !== known.size || orderedIds.some((id) => !known.has(id))) {
    return { ok: false, error: "validation" };
  }

  // display_order has no unique constraint, so a straight rewrite is safe.
  for (const [index, id] of orderedIds.entries()) {
    const { error } = await supabase
      .from("property_images")
      .update({ display_order: index + 1 })
      .eq("id", id);

    if (error) {
      return { ok: false, error: logAndMap("reorderPropertyImages", error) };
    }
  }

  revalidateTag(cacheTags.properties, "max");
  revalidatePath(`/dashboard-admin/properties/${propertyId}/images`);
  return { ok: true };
}

export async function getPropertyImageUrl(path: string) {
  return storageUrl(path);
}
