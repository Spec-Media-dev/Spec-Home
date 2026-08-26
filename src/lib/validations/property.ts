import { z } from "zod";

import { PROPERTY_STATUSES } from "@/lib/supabase/types";

const optionalText = z
  .string()
  .trim()
  .max(6000)
  .optional()
  .or(z.literal(""))
  .transform((value) => (value ? value : null));

const optionalNumber = z
  .union([z.number(), z.string()])
  .optional()
  .transform((value) => {
    if (value === undefined || value === "" || value === null) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
  });

const optionalInt = z
  .union([z.number(), z.string()])
  .optional()
  .transform((value) => {
    if (value === undefined || value === "" || value === null) return null;
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed >= 0 && parsed <= 50
      ? parsed
      : null;
  });

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
    .length(3)
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
