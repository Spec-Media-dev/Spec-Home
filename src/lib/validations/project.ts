import { z } from "zod";

import { PROJECT_STATUSES } from "@/lib/supabase/types";

const optionalText = z
  .string()
  .trim()
  .max(4000)
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

/**
 * Slug is deliberately absent: it is generated from `name_en` server-side and
 * frozen after publication, so an admin never types or edits it.
 */
export const projectSchema = z.object({
  name_en: z.string().trim().min(2).max(200),
  name_ar: z.string().trim().min(2).max(200),
  developer_en: z.string().trim().min(1).max(200),
  developer_ar: z.string().trim().min(1).max(200),
  location_en: optionalText,
  location_ar: optionalText,
  type_en: optionalText,
  type_ar: optionalText,
  status: z.enum(PROJECT_STATUSES),
  handover_en: optionalText,
  handover_ar: optionalText,
  portfolio: optionalText,
  price_min: optionalNumber,
  price_max: optionalNumber,
  currency: z
    .string()
    .trim()
    .length(3)
    .transform((value) => value.toUpperCase())
    .default("AED"),
  area_min_sqft: optionalNumber,
  area_max_sqft: optionalNumber,
  installment_en: optionalText,
  installment_ar: optionalText,
  down_payment_en: optionalText,
  down_payment_ar: optionalText,
  monthly_installment_en: optionalText,
  monthly_installment_ar: optionalText,
  cash_discount_en: optionalText,
  cash_discount_ar: optionalText,
  notes_en: optionalText,
  notes_ar: optionalText,
  description_en: optionalText,
  description_ar: optionalText,
  is_featured: z.boolean().default(false),
  is_published: z.boolean().default(false),
});

export type ProjectInput = z.infer<typeof projectSchema>;
