/**
 * TypeScript types matching the Supabase database schema
 * from LOGIC_REPORT.md — all 7 tables.
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
  is_published: boolean;
  is_featured: boolean;
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
  bedrooms: number;
  bathrooms: number;
  area_sqft: number;
  property_type_en: string;
  property_type_ar: string;
  status: "available" | "reserved" | "sold";
  is_published: boolean;
  is_featured: boolean;
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
  label_en: string;
  label_ar: string;
  value_en: string;
  value_ar: string;
  created_at: string;
}

export interface AdminProfileRow {
  id: string;
  full_name: string | null;
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
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SiteSettingsRow {
  key: string;
  brand_name_en: string;
  brand_name_ar: string;
  contact_email: string | null;
  contact_phone: string | null;
  whatsapp_number: string | null;
  logo_path: string | null;
  updated_at: string;
}

// ─── Insert types (what you send to INSERT) ───

export type ProjectInsert = Omit<ProjectRow, "id" | "created_at" | "updated_at">;
export type PropertyInsert = Omit<PropertyRow, "id" | "created_at" | "updated_at" | "reference_code" | "slug">;
export type PropertyImageInsert = Omit<PropertyImageRow, "id" | "created_at">;
export type PropertySpecInsert = Omit<PropertySpecRow, "id" | "created_at">;
export type EnquiryInsert = Omit<EnquiryRow, "id" | "created_at" | "updated_at" | "status" | "notes">;
export type SiteSettingsInsert = SiteSettingsRow;

// ─── Update types ───

export type ProjectUpdate = Partial<Omit<ProjectRow, "id" | "created_at" | "updated_at">>;
export type PropertyUpdate = Partial<Omit<PropertyRow, "id" | "created_at" | "updated_at">>;
export type PropertyImageUpdate = Partial<Omit<PropertyImageRow, "id" | "created_at">>;
export type EnquiryUpdate = Partial<Omit<EnquiryRow, "id" | "created_at" | "updated_at">>;

// ─── Extended types (with joins) ───

export interface PropertyWithDetails extends PropertyRow {
  project?: ProjectRow;
  images?: PropertyImageRow[];
  specs?: PropertySpecRow[];
}

// ─── Supabase Database type helper ───

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: ProjectRow;
        Insert: ProjectInsert;
        Update: ProjectUpdate;
      };
      properties: {
        Row: PropertyRow;
        Insert: PropertyInsert;
        Update: PropertyUpdate;
      };
      property_images: {
        Row: PropertyImageRow;
        Insert: PropertyImageInsert;
        Update: PropertyImageUpdate;
      };
      property_specs: {
        Row: PropertySpecRow;
        Insert: PropertySpecInsert;
        Update: Partial<Omit<PropertySpecRow, "id" | "created_at">>;
      };
      admin_profiles: {
        Row: AdminProfileRow;
        Insert: Omit<AdminProfileRow, "created_at" | "updated_at">;
        Update: Partial<Omit<AdminProfileRow, "id" | "created_at" | "updated_at">>;
      };
      enquiries: {
        Row: EnquiryRow;
        Insert: EnquiryInsert;
        Update: EnquiryUpdate;
      };
      site_settings: {
        Row: SiteSettingsRow;
        Insert: SiteSettingsInsert;
        Update: Partial<SiteSettingsRow>;
      };
    };
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
  };
}
