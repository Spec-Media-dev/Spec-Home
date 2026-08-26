"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { cacheTags } from "@/lib/cache-tags";
import { logAndMap, type ActionResult } from "@/lib/errors";
import { pingIndexNow } from "@/lib/seo/indexnow";
import { projectSlug } from "@/lib/slug";
import { requireAdminAction } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { projectSchema } from "@/lib/validations/project";

/** Public listings plus the admin views that read the same rows. */
function revalidateProjects(slug?: string) {
  revalidateTag(cacheTags.projects, "max");
  revalidateTag(cacheTags.properties, "max"); // project publish state gates properties
  revalidatePath("/dashboard-admin/projects");
  revalidatePath("/dashboard-admin");
  if (slug) revalidatePath(`/projects/${slug}`);
}

async function uniqueSlug(
  base: string,
  excludeId?: string,
): Promise<string> {
  const supabase = await createClient();

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
    let query = supabase.from("projects").select("id").eq("slug", candidate);
    if (excludeId) query = query.neq("id", excludeId);

    const { data } = await query.maybeSingle();
    if (!data) return candidate;
  }

  return `${base}-${Date.now().toString(36)}`;
}

export async function createProject(
  raw: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdminAction();
  } catch {
    return { ok: false, error: "unauthorized" };
  }

  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "validation" };

  const input = parsed.data;
  const slug = await uniqueSlug(projectSlug(input.name_en, input.name_ar));

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({ ...input, slug })
    .select("id, slug")
    .single();

  if (error || !data) {
    return { ok: false, error: logAndMap("createProject", error, "project") };
  }

  revalidateProjects(data.slug);
  return { ok: true, data: { id: data.id } };
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

  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "validation" };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("projects")
    .select("slug, is_published")
    .eq("id", id)
    .maybeSingle();

  if (!existing) return { ok: false, error: "notFound" };

  const input = parsed.data;

  // Once a project has been published its URL is live, so renaming it must not
  // move that URL. Drafts may still have their slug regenerated.
  const slug = existing.is_published
    ? existing.slug
    : await uniqueSlug(projectSlug(input.name_en, input.name_ar), id);

  const { error } = await supabase
    .from("projects")
    .update({ ...input, slug })
    .eq("id", id);

  if (error) {
    return { ok: false, error: logAndMap("updateProject", error, "project") };
  }

  revalidateProjects(slug);
  revalidatePath(`/dashboard-admin/projects/${id}`);
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

  const supabase = await createClient();
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

  revalidateProjects(data.slug);
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

  revalidateProjects();
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

  const supabase = await createClient();

  const { count } = await supabase
    .from("properties")
    .select("id", { count: "exact", head: true })
    .eq("project_id", id);

  if ((count ?? 0) > 0) return { ok: false, error: "projectHasProperties" };

  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    return { ok: false, error: logAndMap("deleteProject", error, "project") };
  }

  revalidateProjects();
  return { ok: true };
}
