import { z } from "zod";

import { PROPERTY_STATUSES } from "@/lib/supabase/types";

/** Same null-tolerance as the project schema — see the note there. */
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

/** Focus order for the property form, matching its visual section order. */
export const PROPERTY_FIELD_ORDER = [
  "project_id",
  "title_en",
  "title_ar",
  "property_type_en",
  "property_type_ar",
  "description_en",
  "description_ar",
  "price",
  "currency",
  "status",
  "bedrooms",
  "bathrooms",
  "size_sqft",
  "is_featured",
  "is_published",
] as const;

/** Fields authored in Arabic, so the form can open the right bilingual tab. */
export const PROPERTY_ARABIC_FIELDS = new Set(
  PROPERTY_FIELD_ORDER.filter((field) => field.endsWith("_ar")),
);
