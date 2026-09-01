/**
 * TypeScript types matching the Supabase database schema
 * All tables: projects, properties, property_images, property_specs,
 * admin_profiles, enquiries, site_settings, seo_settings, page_seo.
 */

// ─── Row types (what you get back from SELECT) ───

export interface ProjectRow {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string;
  description_en: string | null;
  description_ar: string | null;
  location_en: string | null;
  location_ar: string | null;
  cover_image_path: string | null;
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
  down_payment_en?: string | null;
  down_payment_ar?: string | null;
  total_units?: number | null;
  display_order?: number | null;
  is_published: boolean;
  is_featured: boolean;
  seo_title_en?: string | null;
  seo_title_ar?: string | null;
  seo_description_en?: string | null;
  seo_description_ar?: string | null;
  seo_keywords_en?: string | null;
  seo_keywords_ar?: string | null;
  og_title_en?: string | null;
  og_title_ar?: string | null;
  og_description_en?: string | null;
  og_description_ar?: string | null;
  og_image_path?: string | null;
  canonical_url?: string | null;
  robots?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyRow {
  id: string;
  project_id: string;
  slug: string;
  reference_code: string;
  title_en: string;
  title_ar: string;
  description_en: string | null;
  description_ar: string | null;
  price: number;
  currency?: string | null;
  bedrooms: number;
  bathrooms: number;
  area_sqft?: number;
  size_sqft?: number;
  location?: string | null;
  location_en?: string | null;
  location_ar?: string | null;
  property_type_en: string;
  property_type_ar: string;
  status: "available" | "reserved" | "sold";
  handover_en?: string | null;
  handover_ar?: string | null;
  payment_plan_en?: string | null;
  payment_plan_ar?: string | null;
  is_published: boolean;
  is_featured: boolean;
  seo_title_en?: string | null;
  seo_title_ar?: string | null;
  seo_description_en?: string | null;
  seo_description_ar?: string | null;
  seo_keywords_en?: string | null;
  seo_keywords_ar?: string | null;
  og_title_en?: string | null;
  og_title_ar?: string | null;
  og_description_en?: string | null;
  og_description_ar?: string | null;
  og_image_path?: string | null;
  canonical_url?: string | null;
  robots?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyImageRow {
  id: string;
  property_id: string;
  image_url: string;
  is_cover: boolean;
  display_order: number;
  created_at: string;
}

export interface PropertySpecRow {
  id: string;
  property_id: string;
  label_en?: string;
  label_ar?: string;
  key_en?: string;
  key_ar?: string;
  value_en: string;
  value_ar: string;
  created_at: string;
}

export interface AdminProfileRow {
  id: string;
  name?: string | null;
  full_name?: string | null;
  avatar_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface EnquiryRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  project_id: string | null;
  property_id: string | null;
  status: "new" | "in_progress" | "contacted" | "closed" | "spam";
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SiteSettingsRow {
  key: string;
  brand_name_en?: string;
  brand_name_ar?: string;
  tagline_en?: string | null;
  tagline_ar?: string | null;
  meta_description_en?: string | null;
  meta_description_ar?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  whatsapp_number?: string | null;
  office_address_en?: string | null;
  office_address_ar?: string | null;
  instagram_url?: string | null;
  linkedin_url?: string | null;
  youtube_url?: string | null;
  maintenance_mode?: boolean | null;
  announcement_en?: string | null;
  announcement_ar?: string | null;
  logo_path: string | null;
  hero_image_path?: string | null;
  currency?: string | null;
  updated_at: string;
}

export interface SeoSettingsRow {
  key: string;
  website_title_en: string | null;
  website_title_ar: string | null;
  default_meta_title_en: string | null;
  default_meta_title_ar: string | null;
  default_meta_description_en: string | null;
  default_meta_description_ar: string | null;
  default_keywords_en: string | null;
  default_keywords_ar: string | null;
  og_title_en: string | null;
  og_title_ar: string | null;
  og_description_en: string | null;
  og_description_ar: string | null;
  og_image_path: string | null;
  twitter_title_en: string | null;
  twitter_title_ar: string | null;
  twitter_description_en: string | null;
  twitter_description_ar: string | null;
  twitter_image_path: string | null;
  canonical_url: string | null;
  robots: string | null;
  updated_at: string;
}

export interface PageSeoRow {
  id: string;
  page_slug: string;
  title_en: string;
  title_ar: string;
  meta_title_en: string | null;
  meta_title_ar: string | null;
  meta_description_en: string | null;
  meta_description_ar: string | null;
  keywords_en: string | null;
  keywords_ar: string | null;
  og_title_en: string | null;
  og_title_ar: string | null;
  og_description_en: string | null;
  og_description_ar: string | null;
  og_image_path: string | null;
  twitter_title_en: string | null;
  twitter_title_ar: string | null;
  twitter_description_en: string | null;
  twitter_description_ar: string | null;
  twitter_image_path: string | null;
  canonical_url: string | null;
  robots: string | null;
  updated_at: string;
}

// ─── Insert types (what you send to INSERT) ───

export type ProjectInsert = Omit<ProjectRow, "id" | "created_at" | "updated_at">;
export type PropertyInsert = Omit<PropertyRow, "id" | "created_at" | "updated_at" | "reference_code" | "slug">;
export type PropertyImageInsert = Omit<PropertyImageRow, "id" | "created_at">;
export type PropertySpecInsert = Omit<PropertySpecRow, "id" | "created_at">;
export type EnquiryInsert = Omit<EnquiryRow, "id" | "created_at" | "updated_at" | "status" | "notes">;
export type SiteSettingsInsert = SiteSettingsRow;
export type SeoSettingsInsert = SeoSettingsRow;
export type PageSeoInsert = Omit<PageSeoRow, "id" | "updated_at">;

// ─── Update types ───

export type ProjectUpdate = Partial<Omit<ProjectRow, "id" | "created_at" | "updated_at">>;
export type PropertyUpdate = Partial<Omit<PropertyRow, "id" | "created_at" | "updated_at">>;
export type PropertyImageUpdate = Partial<Omit<PropertyImageRow, "id" | "created_at">>;
export type EnquiryUpdate = Partial<Omit<EnquiryRow, "id" | "created_at" | "updated_at">>;
export type SeoSettingsUpdate = Partial<Omit<SeoSettingsRow, "key" | "updated_at">>;
export type PageSeoUpdate = Partial<Omit<PageSeoRow, "id" | "updated_at">>;

// ─── Extended types (with joins) ───

export interface PropertyWithDetails extends PropertyRow {
  project?: ProjectRow;
  images?: PropertyImageRow[];
  specs?: PropertySpecRow[];
  cover_image?: string;
}

export interface ProjectWithDetails extends ProjectRow {
  properties?: PropertyRow[];
}
