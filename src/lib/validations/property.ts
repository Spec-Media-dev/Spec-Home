import { z } from "zod";

import { PROPERTY_STATUSES } from "@/lib/supabase/types";

/**
 * Optional really means optional.
 *
 * `.optional()` accepts `undefined` but not `null`, and the form seeds every
 * untouched nullable field with `null` — that is what the database column
 * holds. The result was that a description left alone failed validation as
 * "invalid" and blocked the whole property form. Normalising null/undefined
 * to "" first, and "" back to null after, means blank, absent, and
 * whitespace-only all land on the same nullable column value.
 *
 * Mirrors `optionalText` in `validations/project.ts`; the two must not drift.
 */
const optionalText = z.preprocess(
  (value) => (value === null || value === undefined ? "" : value),
  z
    .string()
    .trim()
    .max(6000)
    .transform((value) => (value === "" ? null : value)),
);

const blankToNull = (value: unknown) => {
  if (value === undefined || value === null) return null;
  if (typeof value === "string" && value.trim() === "") return null;
  return typeof value === "string" ? Number(value) : value;
};

const optionalNumber = z.preprocess(
  blankToNull,
  z.number().finite().nonnegative().nullable(),
);

const optionalInt = z.preprocess(
  blankToNull,
  z.number().int().min(0).max(50).nullable(),
);

/** `project_id` is required by the schema and re-verified server-side. */
export const propertySchema = z.object({
  project_id: z.uuid(),
  title_en: z.string().trim().min(2).max(250),
  title_ar: z.string().trim().min(2).max(250),
  description_en: optionalText,
  description_ar: optionalText,
  property_type_en: z.string().trim().min(1).max(120),
  property_type_ar: z.string().trim().min(1).max(120),
  price: optionalNumber,
  currency: z
    .string()
    .trim()
    .regex(/^[a-z]{3}$/i)
    .transform((value) => value.toUpperCase())
    .default("AED"),
  bedrooms: optionalInt,
  bathrooms: optionalInt,
  size_sqft: optionalNumber,
  status: z.enum(PROPERTY_STATUSES),
  is_featured: z.boolean().default(false),
  is_published: z.boolean().default(false),
});

export type PropertyInput = z.infer<typeof propertySchema>;

/**
 * Focus order for the form. Matches the visual order of the sections so the
 * first invalid field an admin is sent to is the first one they would read.
 *
 * Mirrors `PROJECT_FIELD_ORDER` in `validations/project.ts`; the two must not
 * drift. `project_id` is excluded because it is set by route context, not
 * typed by the admin, so it is never the field a validation error should
 * focus.
 */
export const PROPERTY_FIELD_ORDER = [
  "title_en",
  "property_type_en",
  "description_en",
  "title_ar",
  "property_type_ar",
  "description_ar",
  "price",
  "currency",
  "bedrooms",
  "bathrooms",
  "size_sqft",
  "status",
  "is_featured",
  "is_published",
] as const;

/** Fields authored in Arabic, so the form can open the right bilingual tab. */
export const PROPERTY_ARABIC_FIELDS = new Set(
  PROPERTY_FIELD_ORDER.filter((field) => field.endsWith("_ar")),
);

export const specSchema = z.object({
  key_en: z.string().trim().min(1).max(120),
  key_ar: z.string().trim().min(1).max(120),
  value_en: z.string().trim().min(1).max(500),
  value_ar: z.string().trim().min(1).max(500),
});

export const specsPayloadSchema = z.object({
  propertyId: z.uuid(),
  specs: z.array(specSchema).max(40),
});

export type SpecInput = z.infer<typeof specSchema>;
