/**
 * Mirrors the audited production schema. The database is the source of truth:
 * nothing here may be "improved" without a migration approved separately.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          id: string;
          name: string;
          avatar_path: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          avatar_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          avatar_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          name_en: string;
          name_ar: string;
          slug: string;
          developer_en: string;
          developer_ar: string;
          location_en: string | null;
          location_ar: string | null;
          type_en: string | null;
          type_ar: string | null;
          status: string;
          handover_en: string | null;
          handover_ar: string | null;
          portfolio: string | null;
          price_min: number | null;
          price_max: number | null;
          currency: string;
          area_min_sqft: number | null;
          area_max_sqft: number | null;
          installment_en: string | null;
          installment_ar: string | null;
          down_payment_en: string | null;
          down_payment_ar: string | null;
          monthly_installment_en: string | null;
          monthly_installment_ar: string | null;
          cash_discount_en: string | null;
          cash_discount_ar: string | null;
          notes_en: string | null;
          notes_ar: string | null;
          description_en: string | null;
          description_ar: string | null;
          cover_image_path: string | null;
          is_featured: boolean;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["projects"]["Row"]> &
          Pick<
            Database["public"]["Tables"]["projects"]["Row"],
            "name_en" | "name_ar" | "slug" | "developer_en" | "developer_ar"
          >;
        Update: Partial<Database["public"]["Tables"]["projects"]["Row"]>;
        Relationships: [];
      };
      properties: {
        Row: {
          id: string;
          project_id: string;
          reference_code: string;
          title_en: string;
          title_ar: string;
          slug: string;
          description_en: string | null;
          description_ar: string | null;
          property_type_en: string;
          property_type_ar: string;
          price: number | null;
          currency: string;
          bedrooms: number | null;
          bathrooms: number | null;
          size_sqft: number | null;
          status: string;
          is_featured: boolean;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["properties"]["Row"]> &
          Pick<
            Database["public"]["Tables"]["properties"]["Row"],
            | "project_id"
            | "reference_code"
            | "title_en"
            | "title_ar"
            | "slug"
            | "property_type_en"
            | "property_type_ar"
          >;
        Update: Partial<Database["public"]["Tables"]["properties"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "properties_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      property_images: {
        Row: {
          id: string;
          property_id: string;
          image_url: string;
          display_order: number;
          is_cover: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          image_url: string;
          display_order?: number;
          is_cover?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["property_images"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      property_specs: {
        Row: {
          id: string;
          property_id: string;
          key_en: string;
          key_ar: string;
          value_en: string;
          value_ar: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          key_en: string;
          key_ar: string;
          value_en: string;
          value_ar: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["property_specs"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "property_specs_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      enquiries: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          message: string;
          project_id: string | null;
          property_id: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          message: string;
          project_id?: string | null;
          property_id?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["enquiries"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "enquiries_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "enquiries_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      site_settings: {
        Row: {
          key: string;
          logo_path: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          key?: string;
          logo_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["site_settings"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}

type Tables = Database["public"]["Tables"];

export type Project = Tables["projects"]["Row"];
export type Property = Tables["properties"]["Row"];
export type PropertyImage = Tables["property_images"]["Row"];
export type PropertySpec = Tables["property_specs"]["Row"];
export type Enquiry = Tables["enquiries"]["Row"];
export type SiteSettings = Tables["site_settings"]["Row"];
export type AdminProfile = Tables["admin_profiles"]["Row"];

/** Text columns, not enums — the database intentionally leaves these open. */
export const PROJECT_STATUSES = ["under_construction", "ready", "sold_out"] as const;
export const PROPERTY_STATUSES = ["available", "reserved", "sold"] as const;
export const ENQUIRY_STATUSES = ["new", "contacted", "closed"] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export type PropertyStatus = (typeof PROPERTY_STATUSES)[number];
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export const SITE_SETTINGS_KEY = "main";
export const MAX_PROPERTY_IMAGES = 4;
export const STORAGE_BUCKET = "site-media";
