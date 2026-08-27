"use server";

import { updateDatasets } from "@/lib/cache/freshness";
import { logAndMap, validationFailure, type ActionResult } from "@/lib/errors";
import { pingIndexNow } from "@/lib/seo/indexnow";
import { projectSlug } from "@/lib/slug";
import { storagePathFromUrl } from "@/lib/storage";
import { requireAdminAction } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { STORAGE_BUCKET } from "@/lib/supabase/types";
import { toFieldErrors } from "@/lib/validations/field-errors";
import { projectSchema } from "@/lib/validations/project";
import { isUuid } from "@/lib/validations/id";

/**
 * Public listings plus the admin views that read the same rows.
 *
 * `projects` also expires the properties tag — a project's publish state gates
 * whether its units are publicly visible — which is encoded once in
 * `lib/cache/datasets.ts` rather than repeated here.
 */
async function refreshProjects(slug?: string) {
  await updateDatasets(["projects"], {
    paths: [
      "/dashboard-admin/projects",
      "/dashboard-admin",
      ...(slug ? [`/projects/${slug}`] : []),
    ],
  });
}

/**
 * Slugs are generated from the English name and must be unique.
 *
 * Silently creating `marina-heights-2` was worse than refusing: it produced a
 * live URL nobody chose, and two projects an admin could not tell apart in a
 * list. A collision is now reported against the field that caused it.
 */
async function slugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const supabase = await createClient();
  let query = supabase.from("projects").select("id").eq("slug", slug);
  if (excludeId) query = query.neq("id", excludeId);

  const { data } = await query.maybeSingle();
  return Boolean(data);
}

const duplicateSlugFailure = () =>
  ({
    ok: false as const,
    error: "duplicateSlug" as const,
    fieldErrors: { name_en: "duplicate" as const },
  });

const coverRequiredFailure = () =>
  ({
    ok: false as const,
    error: "coverRequired" as const,
    fieldErrors: { is_published: "coverRequired" as const },
  });

export async function createProject(
  raw: unknown,
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    await requireAdminAction();
  } catch {
    return { ok: false, error: "unauthorized" };
  }

  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) return validationFailure(toFieldErrors(parsed.error.issues));

  const input = parsed.data;

  // A brand-new project has no cover yet, so it cannot start published. The
  // create flow deliberately produces a draft and sends the admin to Media.
  if (input.is_published) return coverRequiredFailure();

  const slug = projectSlug(input.name_en, input.name_ar);
  if (await slugTaken(slug)) return duplicateSlugFailure();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({ ...input, slug })
    .select("id, slug")
    .single();

  if (error || !data) {
    const code = logAndMap("createProject", error, "project");
    if (code === "duplicateSlug") return duplicateSlugFailure();
    return { ok: false, error: code };
  }

  await refreshProjects(data.slug);
  return { ok: true, data: { id: data.id, slug: data.slug } };
}

export async function updateProject(
  id: string,
  raw: unknown,
): Promise<ActionResult> {
  try {
    await requireAdminAction();
  } catch {
    return { ok: false, error: "unauthorized" };
  }
  if (!isUuid(id)) return { ok: false, error: "validation" };

  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) return validationFailure(toFieldErrors(parsed.error.issues));

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("projects")
    .select("slug, is_published, cover_image_path")
    .eq("id", id)
    .maybeSingle();

  if (!existing) return { ok: false, error: "notFound" };

  const input = parsed.data;

  if (input.is_published && !existing.cover_image_path) {
    return coverRequiredFailure();
  }

  // Once a project has been published its URL is live, so renaming it must not
  // move that URL. Drafts still regenerate their slug from the English name.
  let slug = existing.slug;
  if (!existing.is_published) {
    slug = projectSlug(input.name_en, input.name_ar);
    if (slug !== existing.slug && (await slugTaken(slug, id))) {
      return duplicateSlugFailure();
    }
  }

  const { error } = await supabase
    .from("projects")
    .update({ ...input, slug })
    .eq("id", id);

  if (error) {
    const code = logAndMap("updateProject", error, "project");
    if (code === "duplicateSlug") return duplicateSlugFailure();
    return { ok: false, error: code };
  }

  await refreshProjects(slug);
  return { ok: true };
}

export async function setProjectPublished(
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

  const supabase = await createClient();

  if (published) {
    const { data: existing } = await supabase
      .from("projects")
      .select("cover_image_path")
      .eq("id", id)
      .maybeSingle();

    if (!existing) return { ok: false, error: "notFound" };
    if (!existing.cover_image_path) return coverRequiredFailure();
  }

  const { data, error } = await supabase
    .from("projects")
    .update({ is_published: published })
    .eq("id", id)
    .select("slug")
    .maybeSingle();

  if (error || !data) {
    return {
      ok: false,
      error: logAndMap("setProjectPublished", error, "project"),
    };
  }

  await refreshProjects(data.slug);
  await pingIndexNow([`/projects/${data.slug}`, "/projects"]);
  return { ok: true };
}

export async function setProjectFeatured(
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
    .from("projects")
    .update({ is_featured: featured })
    .eq("id", id);

  if (error) {
    return {
      ok: false,
      error: logAndMap("setProjectFeatured", error, "project"),
    };
  }

  await refreshProjects();
  return { ok: true };
}

/**
 * `properties.project_id` is ON DELETE RESTRICT, so a project holding units
 * cannot be removed. The count is checked first to produce a clear message
 * rather than surfacing a foreign-key violation.
 */
export async function deleteProject(id: string): Promise<ActionResult> {
  try {
    await requireAdminAction();
  } catch {
    return { ok: false, error: "unauthorized" };
  }
  if (!isUuid(id)) return { ok: false, error: "validation" };

  const supabase = await createClient();

  const { count } = await supabase
    .from("properties")
    .select("id", { count: "exact", head: true })
    .eq("project_id", id);

  if ((count ?? 0) > 0) return { ok: false, error: "projectHasProperties" };

  // Read the cover before deleting so its Storage object can be cleaned up.
  const { data: existing } = await supabase
    .from("projects")
    .select("cover_image_path")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    return { ok: false, error: logAndMap("deleteProject", error, "project") };
  }

  // The row is gone, so a failure here leaves an orphan rather than a broken
  // reference: log it and move on instead of failing a completed delete.
  const coverPath = storagePathFromUrl(existing?.cover_image_path ?? null);
  if (coverPath) {
    const { error: storageError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([coverPath]);
    if (storageError) console.error("[deleteProject] storage", storageError);
  }

  await refreshProjects();
  return { ok: true };
}
