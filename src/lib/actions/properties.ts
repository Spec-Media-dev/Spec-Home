"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { cacheTags } from "@/lib/cache-tags";
import { logAndMap, type ActionResult } from "@/lib/errors";
import { pingIndexNow } from "@/lib/seo/indexnow";
import { generateReferenceCode, propertySlug } from "@/lib/slug";
import { storagePathFromUrl } from "@/lib/storage";
import { requireAdminAction } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { STORAGE_BUCKET } from "@/lib/supabase/types";
import { propertySchema } from "@/lib/validations/property";

function revalidateProperties(slug?: string) {
  revalidateTag(cacheTags.properties, "max");
  revalidateTag(cacheTags.projects, "max"); // project cards show published counts
  revalidatePath("/dashboard-admin/properties");
  revalidatePath("/dashboard-admin");
  if (slug) revalidatePath(`/properties/${slug}`);
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
  if (!parsed.success) return { ok: false, error: "validation" };

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

  revalidateProperties(data.slug);
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

  const parsed = propertySchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "validation" };

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

  revalidateProperties(slug);
  revalidatePath(`/dashboard-admin/properties/${id}`);
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

  revalidateProperties(data.slug);
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

  revalidateProperties();
  return { ok: true };
}

/**
 * Storage objects are removed before the row, because deleting the row cascades
 * `property_images` away and would leave the files orphaned with no reference
 * back to them.
 */
export async function deleteProperty(id: string): Promise<ActionResult> {
  try {
    await requireAdminAction();
  } catch {
    return { ok: false, error: "unauthorized" };
  }

  const supabase = await createClient();

  const { data: images } = await supabase
    .from("property_images")
    .select("image_url")
    .eq("property_id", id);

  const paths = (images ?? [])
    .map((image) => storagePathFromUrl(image.image_url))
    .filter((path): path is string => Boolean(path));

  if (paths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove(paths);
    // A storage failure should not block the delete; log and continue.
    if (storageError) console.error("[deleteProperty] storage", storageError);
  }

  const { error } = await supabase.from("properties").delete().eq("id", id);

  if (error) {
    return { ok: false, error: logAndMap("deleteProperty", error, "property") };
  }

  revalidateProperties();
  return { ok: true };
}
