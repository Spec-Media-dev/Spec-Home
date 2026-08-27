"use server";

import { updateDatasets } from "@/lib/cache/freshness";
import { logAndMap, validationFailure, type ActionResult } from "@/lib/errors";
import { pingIndexNow } from "@/lib/seo/indexnow";
import { generateReferenceCode, propertySlug } from "@/lib/slug";
import { storagePathFromUrl } from "@/lib/storage";
import { requireAdminAction } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { STORAGE_BUCKET } from "@/lib/supabase/types";
import { toFieldErrors } from "@/lib/validations/field-errors";
import { propertySchema } from "@/lib/validations/property";
import { isUuid } from "@/lib/validations/id";

/**
 * Touches the projects dataset as well: project cards advertise a published
 * unit count, so a property change moves a number on the projects listing.
 */
async function refreshProperties(slug?: string, extraPaths: string[] = []) {
  await updateDatasets(["properties", "projects"], {
    paths: [
      "/dashboard-admin/properties",
      "/dashboard-admin",
      ...(slug ? [`/properties/${slug}`] : []),
      ...extraPaths,
    ],
  });
}

async function uniqueReferenceCode(): Promise<string> {
  const supabase = await createClient();

  for (let attempt = 0; attempt < 25; attempt += 1) {
    const candidate = generateReferenceCode();
    const { data } = await supabase
      .from("properties")
      .select("id")
      .eq("reference_code", candidate)
      .maybeSingle();
    if (!data) return candidate;
  }

  return `SHP-${Date.now().toString().slice(-6)}`;
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const supabase = await createClient();

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
    let query = supabase.from("properties").select("id").eq("slug", candidate);
    if (excludeId) query = query.neq("id", excludeId);

    const { data } = await query.maybeSingle();
    if (!data) return candidate;
  }

  return `${base}-${Date.now().toString(36)}`;
}

async function countImages(propertyId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("property_images")
    .select("id", { count: "exact", head: true })
    .eq("property_id", propertyId);
  return count ?? 0;
}

export async function createProperty(
  raw: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdminAction();
  } catch {
    return { ok: false, error: "unauthorized" };
  }

  const parsed = propertySchema.safeParse(raw);
  if (!parsed.success) return validationFailure(toFieldErrors(parsed.error.issues));

  const input = parsed.data;
  const supabase = await createClient();

  // The client-supplied project id is never trusted.
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", input.project_id)
    .maybeSingle();

  if (!project) return { ok: false, error: "projectRequired" };

  // A brand new property has no id yet, so it cannot have images, so it cannot
  // satisfy the publish rule. Creation always lands as a draft.
  if (input.is_published) return { ok: false, error: "imageRequired" };

  const referenceCode = await uniqueReferenceCode();
  const slug = await uniqueSlug(propertySlug(input.title_en, referenceCode));

  const { data, error } = await supabase
    .from("properties")
    .insert({ ...input, reference_code: referenceCode, slug, is_published: false })
    .select("id, slug")
    .single();

  if (error || !data) {
    return { ok: false, error: logAndMap("createProperty", error, "property") };
  }

  await refreshProperties(data.slug);
  return { ok: true, data: { id: data.id } };
}

export async function updateProperty(
  id: string,
  raw: unknown,
): Promise<ActionResult> {
  try {
    await requireAdminAction();
  } catch {
    return { ok: false, error: "unauthorized" };
  }
  if (!isUuid(id)) return { ok: false, error: "validation" };

  const parsed = propertySchema.safeParse(raw);
  if (!parsed.success) return validationFailure(toFieldErrors(parsed.error.issues));

  const input = parsed.data;
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("properties")
    .select("slug, reference_code, is_published")
    .eq("id", id)
    .maybeSingle();

  if (!existing) return { ok: false, error: "notFound" };

  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", input.project_id)
    .maybeSingle();

  if (!project) return { ok: false, error: "projectRequired" };

  if (input.is_published && (await countImages(id)) === 0) {
    return { ok: false, error: "imageRequired" };
  }

  // Published URLs are frozen; drafts may still be renamed.
  const slug = existing.is_published
    ? existing.slug
    : await uniqueSlug(propertySlug(input.title_en, existing.reference_code), id);

  const { error } = await supabase
    .from("properties")
    .update({ ...input, slug })
    .eq("id", id);

  if (error) {
    return { ok: false, error: logAndMap("updateProperty", error, "property") };
  }

  await refreshProperties(slug, [`/dashboard-admin/properties/${id}`]);
  return { ok: true };
}

export async function setPropertyPublished(
  id: string,
  published: boolean,
): Promise<ActionResult> {
  try {
    await requireAdminAction();
  } catch {
    return { ok: false, error: "unauthorized" };
  }
  if (!isUuid(id) || typeof published !== "boolean") {
    return { ok: false, error: "validation" };
  }

  // Publishing without imagery would produce an empty listing card.
  if (published && (await countImages(id)) === 0) {
    return { ok: false, error: "imageRequired" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .update({ is_published: published })
    .eq("id", id)
    .select("slug")
    .maybeSingle();

  if (error || !data) {
    return {
      ok: false,
      error: logAndMap("setPropertyPublished", error, "property"),
    };
  }

  await refreshProperties(data.slug);
  await pingIndexNow([`/properties/${data.slug}`, "/properties"]);
  return { ok: true };
}

export async function setPropertyFeatured(
  id: string,
  featured: boolean,
): Promise<ActionResult> {
  try {
    await requireAdminAction();
  } catch {
    return { ok: false, error: "unauthorized" };
  }
  if (!isUuid(id) || typeof featured !== "boolean") {
    return { ok: false, error: "validation" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("properties")
    .update({ is_featured: featured })
    .eq("id", id);

  if (error) {
    return {
      ok: false,
      error: logAndMap("setPropertyFeatured", error, "property"),
    };
  }

  await refreshProperties();
  return { ok: true };
}

/**
 * Paths are captured before deleting the row, then objects are removed only
 * after the database delete succeeds. A failed delete can therefore never
 * leave surviving rows that point at missing images.
 */
export async function deleteProperty(id: string): Promise<ActionResult> {
  try {
    await requireAdminAction();
  } catch {
    return { ok: false, error: "unauthorized" };
  }
  if (!isUuid(id)) return { ok: false, error: "validation" };

  const supabase = await createClient();

  const { data: images } = await supabase
    .from("property_images")
    .select("image_url")
    .eq("property_id", id);

  const paths = (images ?? [])
    .map((image) => storagePathFromUrl(image.image_url))
    .filter((path): path is string => Boolean(path));

  const { error } = await supabase.from("properties").delete().eq("id", id);

  if (error) {
    return { ok: false, error: logAndMap("deleteProperty", error, "property") };
  }

  if (paths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove(paths);
    if (storageError) console.error("[deleteProperty] storage", storageError);
  }

  await refreshProperties();
  return { ok: true };
}
