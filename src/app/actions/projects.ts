"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { ProjectRow, ProjectUpdate } from "@/lib/supabase/types";
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
 * Filter payload to known database columns to avoid schema cache errors.
 */
function sanitizeProjectPayload(input: Record<string, any>): Record<string, any> {
  const priceNum = input.starting_price !== undefined
    ? Number(input.starting_price)
    : input.price_min !== undefined
    ? Number(input.price_min)
    : 0;

  const payload: Record<string, any> = {
    name_en: input.name_en,
    name_ar: input.name_ar || input.name_en,
    slug: input.slug,
    developer_en: input.developer_en ?? null,
    developer_ar: input.developer_ar ?? input.developer_en ?? null,
    location_en: input.location_en ?? null,
    location_ar: input.location_ar ?? input.location_en ?? null,
    type_en: input.property_type_en ?? input.type_en ?? "apartment",
    type_ar: input.property_type_ar ?? input.type_ar ?? input.property_type_en ?? "عقار",
    status: input.status || "ready",
    handover_en: input.handover_en ?? null,
    handover_ar: input.handover_ar ?? input.handover_en ?? null,
    price_min: priceNum,
    price_max: input.price_max ? Number(input.price_max) : priceNum,
    currency: input.currency || "AED",
    installment_en: input.payment_plan_en ?? input.installment_en ?? null,
    installment_ar: input.payment_plan_ar ?? input.installment_ar ?? input.payment_plan_en ?? null,
    description_en: input.description_en ?? null,
    description_ar: input.description_ar ?? null,
    cover_image_path: input.cover_image_path ?? null,
    is_featured: input.is_featured ?? false,
    is_published: input.is_published ?? false,
  };

  // Clean undefined keys
  Object.keys(payload).forEach((k) => {
    if (payload[k] === undefined) delete payload[k];
  });

  return payload;
}

/**
 * Create a new project.
 */
export async function createProject(
  formData: {
    name_en: string;
    name_ar: string;
    description_en?: string | null;
    description_ar?: string | null;
    location_en?: string | null;
    location_ar?: string | null;
    developer_en?: string | null;
    developer_ar?: string | null;
    starting_price?: number | null;
    price_min?: number | null;
    price_max?: number | null;
    currency?: string | null;
    property_type_en?: string | null;
    property_type_ar?: string | null;
    type_en?: string | null;
    type_ar?: string | null;
    handover_en?: string | null;
    handover_ar?: string | null;
    payment_plan_en?: string | null;
    payment_plan_ar?: string | null;
    installment_en?: string | null;
    installment_ar?: string | null;
    total_units?: number | null;
    cover_image_path?: string | null;
    is_published?: boolean;
    is_featured?: boolean;
  } & Record<string, any>
): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const supabase = createAdminClient();
    const slug = slugify(formData.name_en) || `project-${Date.now()}`;
    const payload = sanitizeProjectPayload({ ...formData, slug });

    const { data, error } = await supabase
      .from("projects")
      .insert(payload as any)
      .select()
      .single();

    if (error) {
      console.error("[createProject] Error:", error.message);
      return { success: false, error: error.message };
    }

    revalidatePath("/[locale]/projects", "page");
    revalidatePath("/[locale]", "page");
    revalidatePath("/dashboard-admin/projects");

    return { success: true, data: data as ProjectRow };
  } catch (err: any) {
    console.error("[createProject]", err);
    return { success: false, error: err?.message || "Failed to create project" };
  }
}

/**
 * Update a project.
 */
export async function updateProject(
  id: string,
  updates: (ProjectUpdate | Record<string, any>)
): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const supabase = createAdminClient();
    const payload = sanitizeProjectPayload(updates);

    const { data, error } = await supabase
      .from("projects")
      .update(payload as any)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[updateProject] Error:", error.message);
      return { success: false, error: error.message };
    }

    revalidatePath("/[locale]/projects", "page");
    revalidatePath("/[locale]", "page");
    revalidatePath("/dashboard-admin/projects");

    return { success: true, data: data as ProjectRow };
  } catch (err: any) {
    console.error("[updateProject]", err);
    return { success: false, error: err?.message || "Failed to update project" };
  }
}

/**
 * Delete a project.
 */
export async function deleteProject(id: string): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const supabase = createAdminClient();

    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) return { success: false, error: error.message };

    revalidatePath("/[locale]/projects", "page");
    revalidatePath("/[locale]", "page");
    revalidatePath("/dashboard-admin/projects");

    return { success: true };
  } catch (err: any) {
    console.error("[deleteProject]", err);
    return { success: false, error: err?.message || "Failed to delete project" };
  }
}

/**
 * Toggle project published status.
 */
export async function toggleProjectPublished(id: string): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const supabase = createAdminClient();

    const { data: currentData } = await supabase
      .from("projects")
      .select("is_published")
      .eq("id", id)
      .single();

    const current = currentData as { is_published: boolean } | null;
    if (!current) return { success: false, error: "Project not found" };

    const { data, error } = await supabase
      .from("projects")
      .update({ is_published: !current.is_published } as any)
      .eq("id", id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/[locale]/projects", "page");
    revalidatePath("/[locale]", "page");
    revalidatePath("/dashboard-admin/projects");

    return { success: true, data: data as ProjectRow };
  } catch (err: any) {
    console.error("[toggleProjectPublished]", err);
    return { success: false, error: err?.message || "Failed to toggle publish status" };
  }
}
