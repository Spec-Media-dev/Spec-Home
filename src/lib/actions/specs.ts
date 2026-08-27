"use server";

import { updateDatasets } from "@/lib/cache/freshness";
import { logAndMap, type ActionResult } from "@/lib/errors";
import { requireAdminAction } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { specsPayloadSchema } from "@/lib/validations/property";

/**
 * Saves the whole spec set atomically rather than row by row, which keeps
 * ordering consistent and avoids a half-applied edit.
 *
 * `property_specs` has no ordering column and the brief forbids adding one, so
 * order is carried by `created_at`. A plain batch insert would give every row
 * the same transaction timestamp and leave sequence to a random UUID, so each
 * row is written with an explicit, incrementing `created_at`. Reads sort by
 * `created_at, id`, making the order deterministic within the existing schema.
 */
export async function savePropertySpecs(raw: unknown): Promise<ActionResult> {
  try {
    await requireAdminAction();
  } catch {
    return { ok: false, error: "unauthorized" };
  }

  const parsed = specsPayloadSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "validation" };

  const { propertyId, specs } = parsed.data;
  const supabase = await createClient();

  const { data: property } = await supabase
    .from("properties")
    .select("id, slug")
    .eq("id", propertyId)
    .maybeSingle();

  if (!property) return { ok: false, error: "notFound" };

  const { error: deleteError } = await supabase
    .from("property_specs")
    .delete()
    .eq("property_id", propertyId);

  if (deleteError) {
    return { ok: false, error: logAndMap("savePropertySpecs", deleteError) };
  }

  if (specs.length > 0) {
    const base = Date.now();
    const rows = specs.map((spec, index) => ({
      property_id: propertyId,
      key_en: spec.key_en,
      key_ar: spec.key_ar,
      value_en: spec.value_en,
      value_ar: spec.value_ar,
      created_at: new Date(base + index).toISOString(),
    }));

    const { error } = await supabase.from("property_specs").insert(rows);
    if (error) {
      return { ok: false, error: logAndMap("savePropertySpecs", error) };
    }
  }

  await updateDatasets(["property_specs"], {
    paths: [
      `/dashboard-admin/properties/${propertyId}/specs`,
      `/properties/${property.slug}`,
    ],
  });
  return { ok: true };
}
