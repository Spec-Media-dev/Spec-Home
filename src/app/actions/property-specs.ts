"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { PropertySpecRow } from "@/lib/supabase/types";

function isSupabaseConfigured(): boolean {
  return !!(
    (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    (process.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
  );
}

export interface SpecActionResult {
  success: boolean;
  error?: string;
  data?: PropertySpecRow;
}

/**
 * Create a property specification.
 * Supports both key_en/key_ar and label_en/label_ar schema variants.
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

    // Try inserting with key_en / key_ar (standard in existing DB)
    const payload: Record<string, any> = {
      property_id: formData.property_id,
      key_en: formData.label_en,
      key_ar: formData.label_ar || formData.label_en,
      value_en: formData.value_en,
      value_ar: formData.value_ar || formData.value_en,
    };

    let { data, error } = await supabase
      .from("property_specs")
      .insert(payload as any)
      .select()
      .single();

    // If schema uses label_en instead of key_en, try that
    if (error && error.message.includes("key_en")) {
      const altPayload = {
        property_id: formData.property_id,
        label_en: formData.label_en,
        label_ar: formData.label_ar || formData.label_en,
        value_en: formData.value_en,
        value_ar: formData.value_ar || formData.value_en,
      };
      const altRes = await supabase
        .from("property_specs")
        .insert(altPayload as any)
        .select()
        .single();
      data = altRes.data;
      error = altRes.error;
    }

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as PropertySpecRow };
  } catch (err: any) {
    console.error("[createPropertySpec]", err);
    return { success: false, error: err?.message || "Failed to create spec" };
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

    const payload: Record<string, any> = {
      value_en: updates.value_en,
      value_ar: updates.value_ar,
    };
    if (updates.label_en !== undefined) {
      payload.key_en = updates.label_en;
    }
    if (updates.label_ar !== undefined) {
      payload.key_ar = updates.label_ar;
    }

    let { data, error } = await supabase
      .from("property_specs")
      .update(payload as any)
      .eq("id", id)
      .select()
      .single();

    if (error && error.message.includes("key_en")) {
      const altPayload: Record<string, any> = {
        value_en: updates.value_en,
        value_ar: updates.value_ar,
        label_en: updates.label_en,
        label_ar: updates.label_ar,
      };
      const altRes = await supabase
        .from("property_specs")
        .update(altPayload as any)
        .eq("id", id)
        .select()
        .single();
      data = altRes.data;
      error = altRes.error;
    }

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as PropertySpecRow };
  } catch (err: any) {
    console.error("[updatePropertySpec]", err);
    return { success: false, error: err?.message || "Failed to update spec" };
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
  } catch (err: any) {
    console.error("[deletePropertySpec]", err);
    return { success: false, error: err?.message || "Failed to delete spec" };
  }
}
