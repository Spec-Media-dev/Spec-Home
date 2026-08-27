"use server";

import { updateDatasets } from "@/lib/cache/freshness";
import { logAndMap, type ActionResult } from "@/lib/errors";
import { inspectImageBlob, kindForMime } from "@/lib/image-signatures";
import {
  MAX_PROPERTY_IMAGE_BYTES,
  propertyImageRuleError,
  type PropertyImageDescriptor,
} from "@/lib/property-image-rules";
import { storagePathFromUrl, storagePaths } from "@/lib/storage";
import { requireAdminAction } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { MAX_PROPERTY_IMAGES, STORAGE_BUCKET } from "@/lib/supabase/types";
import { isUuid } from "@/lib/validations/id";

const MAX_BYTES = MAX_PROPERTY_IMAGE_BYTES;
const UUID_SOURCE =
  "[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}";
const UUID_PATTERN = new RegExp(`^${UUID_SOURCE}$`, "i");
const PROPERTY_IMAGE_PATH_PATTERN = new RegExp(
  `^properties/(${UUID_SOURCE})/(${UUID_SOURCE})\\.(jpg|png|webp)$`,
  "i",
);

/**
 * `file.type` is attacker-controlled, so the real format is confirmed from the
 * leading bytes by the shared detector. The bucket also enforces its own MIME
 * allowlist and size cap, so a forged upload fails at two independent layers.
 */
const inspectImage = (file: Blob) => inspectImageBlob(file, MAX_BYTES);

export type SignedImageUpload = {
  path: string;
  token: string;
};

/**
 * Authorises a batch and creates short-lived, path-scoped upload tokens. The
 * browser sends the binary directly to Storage, never through a Server Action.
 */
export async function preparePropertyImageUploads(
  propertyId: string,
  files: PropertyImageDescriptor[],
): Promise<ActionResult<SignedImageUpload[]>> {
  try {
    await requireAdminAction();
  } catch {
    return { ok: false, error: "unauthorized" };
  }

  if (
    !UUID_PATTERN.test(propertyId) ||
    files.length === 0
  ) {
    return { ok: false, error: "validation" };
  }

  const kinds = files.map((file) => kindForMime(file.type));

  const supabase = await createClient();

  const { data: property } = await supabase
    .from("properties")
    .select("id, slug")
    .eq("id", propertyId)
    .maybeSingle();

  if (!property) return { ok: false, error: "notFound" };

  const { count } = await supabase
    .from("property_images")
    .select("id", { count: "exact", head: true })
    .eq("property_id", propertyId);

  const ruleError = propertyImageRuleError(count ?? 0, files);
  if (ruleError) return { ok: false, error: ruleError };
  if (kinds.some((kind) => !kind)) return { ok: false, error: "invalidFile" };

  const tickets = await Promise.all(
    kinds.map(async (kind) => {
      const path = storagePaths.propertyImage(
        propertyId,
        `${crypto.randomUUID()}.${kind!.ext}`,
      );
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUploadUrl(path);
      return { data, error };
    }),
  );

  const failed = tickets.find((ticket) => ticket.error || !ticket.data);
  if (failed) {
    if (failed.error) console.error("[preparePropertyImageUploads]", failed.error);
    return { ok: false, error: "uploadFailed" };
  }

  return {
    ok: true,
    data: tickets.map(({ data }) => ({
      path: data!.path,
      token: data!.token,
    })),
  };
}

/**
 * Verifies the uploaded object itself before recording its path in Postgres.
 * Invalid or excess objects are removed so failed finalisation cannot leave
 * orphaned files behind.
 */
export async function finalizePropertyImageUpload(
  propertyId: string,
  path: string,
): Promise<ActionResult> {
  try {
    await requireAdminAction();
  } catch {
    return { ok: false, error: "unauthorized" };
  }

  if (!UUID_PATTERN.test(propertyId)) {
    return { ok: false, error: "validation" };
  }

  const pathMatch = path.match(PROPERTY_IMAGE_PATH_PATTERN);
  if (!pathMatch || pathMatch[1].toLowerCase() !== propertyId.toLowerCase()) {
    return { ok: false, error: "validation" };
  }

  const supabase = await createClient();
  const cleanup = async () => {
    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);
    if (error) console.error("[finalizePropertyImageUpload cleanup]", error);
  };

  const { data: property } = await supabase
    .from("properties")
    .select("id, slug")
    .eq("id", propertyId)
    .maybeSingle();

  if (!property) {
    await cleanup();
    return { ok: false, error: "notFound" };
  }

  const { data: duplicate } = await supabase
    .from("property_images")
    .select("id")
    .eq("property_id", propertyId)
    .eq("image_url", path)
    .maybeSingle();
  // Never clean up here: this path is already referenced by a valid row.
  if (duplicate) return { ok: false, error: "validation" };

  const { data: file, error: downloadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .download(path);
  if (downloadError || !file) {
    await cleanup();
    if (downloadError) console.error("[finalizePropertyImageUpload download]", downloadError);
    return { ok: false, error: "uploadFailed" };
  }

  if (file.size > MAX_BYTES) {
    await cleanup();
    return { ok: false, error: "fileTooLarge" };
  }

  const kind = await inspectImage(file);
  if (!kind || kind.ext.toLowerCase() !== pathMatch[3].toLowerCase()) {
    await cleanup();
    return { ok: false, error: "invalidFile" };
  }

  // Re-count immediately before the database insert. This is authoritative;
  // the UI's remaining-count check is only a convenience.
  const { data: existing } = await supabase
    .from("property_images")
    .select("id, display_order")
    .eq("property_id", propertyId);
  const current = existing ?? [];
  if (current.length >= MAX_PROPERTY_IMAGES) {
    await cleanup();
    return { ok: false, error: "imageLimit" };
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
    await cleanup();
    return { ok: false, error: logAndMap("finalizePropertyImageUpload", error) };
  }

  await updateDatasets(["property_images"], {
    paths: [
      `/dashboard-admin/properties/${propertyId}/images`,
      `/properties/${property.slug}`,
    ],
  });
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
  if (!isUuid(imageId)) return { ok: false, error: "validation" };

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

  await updateDatasets(["property_images"], {
    paths: [
      `/dashboard-admin/properties/${image.property_id}/images`,
      ...(property?.slug ? [`/properties/${property.slug}`] : []),
    ],
  });
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
  if (!isUuid(imageId)) return { ok: false, error: "validation" };

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

  await updateDatasets(["property_images"], {
    paths: [`/dashboard-admin/properties/${image.property_id}/images`],
  });
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
  if (
    !isUuid(propertyId) ||
    !Array.isArray(orderedIds) ||
    orderedIds.length > MAX_PROPERTY_IMAGES ||
    orderedIds.some((id) => !isUuid(id))
  ) {
    return { ok: false, error: "validation" };
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

  await updateDatasets(["property_images"], {
    paths: [`/dashboard-admin/properties/${propertyId}/images`],
  });
  return { ok: true };
}
