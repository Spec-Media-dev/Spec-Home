import "server-only";

import { createClient } from "@/lib/supabase/server";
import type {
  Enquiry,
  Project,
  Property,
  PropertyImage,
  PropertySpec,
} from "@/lib/supabase/types";

/**
 * Admin reads are never cached: they show drafts and lead data, and go through
 * the session-bound client so RLS still evaluates `is_admin()`.
 */

export type AdminPropertyRow = Property & {
  projects: Pick<Project, "id" | "name_en" | "slug"> | null;
  property_images: Pick<PropertyImage, "id" | "image_url" | "is_cover">[];
};

export async function getAdminStats() {
  const supabase = await createClient();

  const counts = await Promise.all([
    supabase.from("projects").select("id", { count: "exact", head: true }),
    supabase.from("properties").select("id", { count: "exact", head: true }),
    supabase
      .from("properties")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true),
    supabase
      .from("properties")
      .select("id", { count: "exact", head: true })
      .eq("is_featured", true),
    supabase
      .from("enquiries")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
  ]);

  const [projects, properties, published, featured, newEnquiries] = counts.map(
    (result) => result.count ?? 0,
  );

  return { projects, properties, published, featured, newEnquiries };
}

export async function getAdminProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getAdminProject(id: string): Promise<Project | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getAdminProjectOptions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, name_en, name_ar")
    .order("name_en");

  if (error) throw error;
  return data ?? [];
}

export async function countProjects(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true });

  if (error) throw error;
  return count ?? 0;
}

export async function getAdminProperties(filters: {
  projectId?: string;
  status?: string;
  published?: string;
} = {}): Promise<AdminPropertyRow[]> {
  const supabase = await createClient();

  let query = supabase
    .from("properties")
    .select(
      "*, projects(id, name_en, slug), property_images(id, image_url, is_cover)",
    )
    .order("created_at", { ascending: false });

  if (filters.projectId) query = query.eq("project_id", filters.projectId);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.published === "true") query = query.eq("is_published", true);
  if (filters.published === "false") query = query.eq("is_published", false);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as AdminPropertyRow[];
}

export type AdminPropertyDetail = Property & {
  projects: Pick<Project, "id" | "name_en" | "slug"> | null;
  property_images: PropertyImage[];
  property_specs: PropertySpec[];
};

export async function getAdminProperty(
  id: string,
): Promise<AdminPropertyDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(
      "*, projects(id, name_en, slug), property_images(*), property_specs(*)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const detail = data as AdminPropertyDetail;
  detail.property_images.sort(
    (a, b) =>
      a.display_order - b.display_order || a.created_at.localeCompare(b.created_at),
  );
  // No ordering column on specs; creation order is the deterministic sequence.
  detail.property_specs.sort(
    (a, b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id),
  );
  return detail;
}

export type AdminEnquiryRow = Enquiry & {
  projects: Pick<Project, "id" | "name_en" | "slug"> | null;
  properties: Pick<Property, "id" | "title_en" | "slug" | "reference_code"> | null;
};

export async function getAdminEnquiries(
  status?: string,
): Promise<AdminEnquiryRow[]> {
  const supabase = await createClient();

  let query = supabase
    .from("enquiries")
    .select(
      "*, projects(id, name_en, slug), properties(id, title_en, slug, reference_code)",
    )
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as AdminEnquiryRow[];
}

export async function getAdminEnquiry(
  id: string,
): Promise<AdminEnquiryRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enquiries")
    .select(
      "*, projects(id, name_en, slug), properties(id, title_en, slug, reference_code)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return (data as AdminEnquiryRow) ?? null;
}

export async function getRecentEnquiries(limit = 5) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enquiries")
    .select("id, name, email, status, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}
