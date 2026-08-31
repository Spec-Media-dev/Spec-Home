"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { PropertySpecRow } from "@/lib/supabase/types";

function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export interface SpecActionResult {
  success: boolean;
  error?: string;
  data?: PropertySpecRow;
}

/**
 * Create a property specification.
 */
export async function createPropertySpec(formData: {
  property_id: string;
  label_en: string;
  label_ar: string;
  value_en: string;
  value_ar: string;
}): Promise<SpecActionResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("property_specs")
      .insert(formData as any)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as PropertySpecRow };
  } catch (err) {
    console.error("[createPropertySpec]", err);
    return { success: false, error: "Failed to create spec" };
  }
}

/**
 * Update a property specification.
 */
export async function updatePropertySpec(
  id: string,
  updates: Partial<{
    label_en: string;
    label_ar: string;
    value_en: string;
    value_ar: string;
  }>
): Promise<SpecActionResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("property_specs")
      .update(updates as any)
      .eq("id", id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as PropertySpecRow };
  } catch (err) {
    console.error("[updatePropertySpec]", err);
    return { success: false, error: "Failed to update spec" };
  }
}

/**
 * Delete a property specification.
 */
export async function deletePropertySpec(id: string): Promise<SpecActionResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("property_specs")
      .delete()
      .eq("id", id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    console.error("[deletePropertySpec]", err);
    return { success: false, error: "Failed to delete spec" };
  }
}
