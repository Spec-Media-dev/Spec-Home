"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { ProjectRow, ProjectUpdate } from "@/lib/supabase/types";

function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
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
  data?: ProjectRow;
}

/**
 * Create a new project.
 * - Auto-generates slug from name_en.
 * - Always starts with is_published = false.
 */
export async function createProject(formData: {
  name_en: string;
  name_ar: string;
  description_en?: string;
  description_ar?: string;
  location_en?: string;
  location_ar?: string;
  cover_image_path?: string;
  is_featured?: boolean;
}): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const supabase = createAdminClient();
    const slug = slugify(formData.name_en);

    const { data, error } = await supabase
      .from("projects")
      .insert({
        slug,
        name_en: formData.name_en,
        name_ar: formData.name_ar,
        description_en: formData.description_en ?? null,
        description_ar: formData.description_ar ?? null,
        location_en: formData.location_en ?? null,
        location_ar: formData.location_ar ?? null,
        cover_image_path: formData.cover_image_path ?? null,
        is_published: false,
        is_featured: formData.is_featured ?? false,
      } as any)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as ProjectRow };
  } catch (err) {
    console.error("[createProject]", err);
    return { success: false, error: "Failed to create project" };
  }
}

/**
 * Update a project.
 * - If published, slug is frozen (immutable).
 * - If in draft, updating name_en regenerates slug.
 */
export async function updateProject(
  id: string,
  updates: ProjectUpdate & { name_en?: string }
): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const supabase = createAdminClient();

    // Check current state for slug freeze logic
    const { data: currentData } = await supabase
      .from("projects")
      .select("is_published, slug")
      .eq("id", id)
      .single();

    const current = currentData as { is_published: boolean; slug: string } | null;
    const updatePayload: Record<string, any> = { ...updates };

    // Slug regeneration: only in draft state
    if (updates.name_en && current && !current.is_published) {
      updatePayload.slug = slugify(updates.name_en);
    } else {
      // Slug is frozen once published — remove it from updates
      delete updatePayload.slug;
    }

    const { data, error } = await supabase
      .from("projects")
      .update(updatePayload as any)
      .eq("id", id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as ProjectRow };
  } catch (err) {
    console.error("[updateProject]", err);
    return { success: false, error: "Failed to update project" };
  }
}

/**
 * Delete a project.
 * Rejects if child properties exist (ON DELETE RESTRICT).
 */
export async function deleteProject(id: string): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const supabase = createAdminClient();

    // Check for child properties first
    const { count } = await supabase
      .from("properties")
      .select("id", { count: "exact", head: true })
      .eq("project_id", id);

    if (count && count > 0) {
      return {
        success: false,
        error: `Cannot delete: project has ${count} associated properties. Remove them first.`,
      };
    }

    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    console.error("[deleteProject]", err);
    return { success: false, error: "Failed to delete project" };
  }
}

/**
 * Toggle project published status.
 * Publishing requires a cover_image_path.
 */
export async function toggleProjectPublished(id: string): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const supabase = createAdminClient();

    const { data: currentData } = await supabase
      .from("projects")
      .select("is_published, cover_image_path")
      .eq("id", id)
      .single();

    const current = currentData as { is_published: boolean; cover_image_path: string | null } | null;
    if (!current) return { success: false, error: "Project not found" };

    // Publishing invariant: requires cover image
    if (!current.is_published && !current.cover_image_path) {
      return {
        success: false,
        error: "Cannot publish: a cover image is required.",
      };
    }

    const { data, error } = await supabase
      .from("projects")
      .update({ is_published: !current.is_published } as any)
      .eq("id", id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as ProjectRow };
  } catch (err) {
    console.error("[toggleProjectPublished]", err);
    return { success: false, error: "Failed to toggle publish status" };
  }
}
