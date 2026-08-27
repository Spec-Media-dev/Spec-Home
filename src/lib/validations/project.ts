import { z } from "zod";

import { PROJECT_STATUSES } from "@/lib/supabase/types";
import type { CustomIssueParams } from "@/lib/validations/field-errors";

/**
 * Upper bound for money and area. Well below `Number.MAX_SAFE_INTEGER`, so a
 * value that survives validation is always exactly representable and always
 * fits Postgres `numeric` without surprise.
 */
export const MAX_PROJECT_NUMERIC = 1_000_000_000_000;

/**
 * Optional really means optional.
 *
 * `.optional()` accepts `undefined` but not `null`, and the form seeds every
 * untouched nullable field with `null` (that is what the database column
 * holds). The result was that a field labelled "optional" failed validation
 * the moment it was left alone, which blocked the whole form. Normalising
 * null/undefined to "" first, and "" back to null after, means blank, absent,
 * and whitespace-only all land on the same nullable column value.
 */
const optionalText = z.preprocess(
  (value) => (value === null || value === undefined ? "" : value),
  z
    .string()
    .trim()
    .max(4000)
    .transform((value) => (value === "" ? null : value)),
);

/**
 * Required in both languages.
 *
 * `.trim()` runs before the length checks, so "   " is not a name. The extra
 * `.min(1)` is not redundant: it makes an empty field report as *required*
 * rather than *too short*, which is the difference between telling an admin
 * "fill this in" and telling them "add another character" about a blank box.
 */
const requiredText = (min: number, max: number) =>
  z.string().trim().min(1).min(min).max(max);

/**
 * Blank means "not provided", not zero. Everything else must be a real,
 * finite, non-negative amount of at most two decimal places — an admin typing
 * `1e21`, `Infinity`, `-5`, or `1.005` is a mistake worth catching, not a
 * value to round silently into the database.
 */
const blankToNull = (value: unknown) => {
  if (value === undefined || value === null) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return null;
    return Number(trimmed);
  }
  return value;
};

const optionalAmount = z.preprocess(
  blankToNull,
  z
    .number()
    .finite()
    .nonnegative()
    .max(MAX_PROJECT_NUMERIC)
    .multipleOf(0.01)
    .nullable(),
);

const currency = z
  .string()
  .trim()
  .regex(/^[a-z]{3}$/i)
  .transform((value) => value.toUpperCase())
  .default("AED");

function reversedRange(
  context: z.RefinementCtx,
  path: string,
  message: string,
) {
  const params: CustomIssueParams = { code: "rangeReversed" };
  context.addIssue({ code: "custom", path: [path], message, params });
}

/**
 * Slug is deliberately absent: it is generated from `name_en` server-side and
 * frozen after publication, so an admin never types or edits it.
 *
 * `is_published` is present but its *gating* is not expressible here — a
 * published project must have a cover image, and that requires reading the
 * row. `lib/actions/projects.ts` enforces it and reports it as a field error
 * on `is_published`.
 */
export const projectSchema = z
  .object({
    name_en: requiredText(2, 200),
    name_ar: requiredText(2, 200),
    developer_en: requiredText(1, 200),
    developer_ar: requiredText(1, 200),
    location_en: optionalText,
    location_ar: optionalText,
    type_en: optionalText,
    type_ar: optionalText,
    status: z.enum(PROJECT_STATUSES),
    handover_en: optionalText,
    handover_ar: optionalText,
    portfolio: optionalText,
    price_min: optionalAmount,
    price_max: optionalAmount,
    currency,
    area_min_sqft: optionalAmount,
    area_max_sqft: optionalAmount,
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
  })
  .superRefine((value, context) => {
    if (
      value.price_min !== null &&
      value.price_max !== null &&
      value.price_min > value.price_max
    ) {
      reversedRange(
        context,
        "price_max",
        "Maximum price must be at least the minimum price.",
      );
    }

    if (
      value.area_min_sqft !== null &&
      value.area_max_sqft !== null &&
      value.area_min_sqft > value.area_max_sqft
    ) {
      reversedRange(
        context,
        "area_max_sqft",
        "Maximum area must be at least the minimum area.",
      );
    }
  });

export type ProjectInput = z.infer<typeof projectSchema>;

/**
 * Focus order for the form. Matches the visual order of the sections so the
 * first invalid field an admin is sent to is the first one they would read.
 */
export const PROJECT_FIELD_ORDER = [
  "name_en",
  "name_ar",
  "developer_en",
  "developer_ar",
  "location_en",
  "location_ar",
  "type_en",
  "type_ar",
  "status",
  "portfolio",
  "handover_en",
  "handover_ar",
  "price_min",
  "price_max",
  "currency",
  "area_min_sqft",
  "area_max_sqft",
  "installment_en",
  "installment_ar",
  "down_payment_en",
  "down_payment_ar",
  "monthly_installment_en",
  "monthly_installment_ar",
  "cash_discount_en",
  "cash_discount_ar",
  "description_en",
  "description_ar",
  "notes_en",
  "notes_ar",
  "is_featured",
  "is_published",
] as const;

/** Fields authored in Arabic, so the form can open the right bilingual tab. */
export const PROJECT_ARABIC_FIELDS = new Set(
  PROJECT_FIELD_ORDER.filter((field) => field.endsWith("_ar")),
);
