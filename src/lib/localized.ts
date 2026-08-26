import type { Locale } from "@/i18n/routing";
import type { Project, Property, PropertySpec } from "@/lib/supabase/types";

/**
 * Picks the `_en` / `_ar` variant of a bilingual column, falling back to the
 * other language when a translation is missing so a page never renders blank.
 */
function pick(
  locale: Locale,
  en: string | null | undefined,
  ar: string | null | undefined,
): string | null {
  const primary = locale === "ar" ? ar : en;
  const fallback = locale === "ar" ? en : ar;
  return primary?.trim() || fallback?.trim() || null;
}

export type LocalizedProject = {
  name: string;
  developer: string;
  location: string | null;
  type: string | null;
  handover: string | null;
  description: string | null;
  notes: string | null;
  installment: string | null;
  downPayment: string | null;
  monthlyInstallment: string | null;
  cashDiscount: string | null;
};

export function localizeProject(
  project: Project,
  locale: Locale,
): LocalizedProject {
  return {
    name: pick(locale, project.name_en, project.name_ar) ?? project.slug,
    developer: pick(locale, project.developer_en, project.developer_ar) ?? "",
    location: pick(locale, project.location_en, project.location_ar),
    type: pick(locale, project.type_en, project.type_ar),
    handover: pick(locale, project.handover_en, project.handover_ar),
    description: pick(locale, project.description_en, project.description_ar),
    notes: pick(locale, project.notes_en, project.notes_ar),
    installment: pick(locale, project.installment_en, project.installment_ar),
    downPayment: pick(locale, project.down_payment_en, project.down_payment_ar),
    monthlyInstallment: pick(
      locale,
      project.monthly_installment_en,
      project.monthly_installment_ar,
    ),
    cashDiscount: pick(
      locale,
      project.cash_discount_en,
      project.cash_discount_ar,
    ),
  };
}

export type LocalizedProperty = {
  title: string;
  description: string | null;
  propertyType: string;
};

export function localizeProperty(
  property: Property,
  locale: Locale,
): LocalizedProperty {
  return {
    title: pick(locale, property.title_en, property.title_ar) ?? property.slug,
    description: pick(
      locale,
      property.description_en,
      property.description_ar,
    ),
    propertyType:
      pick(locale, property.property_type_en, property.property_type_ar) ?? "",
  };
}

export function localizeSpec(spec: PropertySpec, locale: Locale) {
  return {
    id: spec.id,
    key: pick(locale, spec.key_en, spec.key_ar) ?? "",
    value: pick(locale, spec.value_en, spec.value_ar) ?? "",
  };
}
