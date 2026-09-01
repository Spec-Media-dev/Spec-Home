"use server";

import { createServerClient } from "@/lib/supabase/server";
import type { ProjectRow, PropertyRow } from "@/lib/supabase/types";

function isSupabaseConfigured(): boolean {
  return !!(
    (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    (process.env.SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

export type ProjectWithPropertyCount = ProjectRow & {
  property_count: number;
};

/**
 * Fetch all published projects.
 */
export async function getProjects(): Promise<ProjectRow[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getProjects]", error.message);
    return [];
  }

  return (data as ProjectRow[]) ?? [];
}

/**
 * Fetch all published projects with actual property count per project.
 */
export async function getProjectsWithPropertyCount(): Promise<ProjectWithPropertyCount[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createServerClient();
  const [projectsRes, propertiesRes] = await Promise.all([
    supabase
      .from("projects")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("properties")
      .select("id, project_id")
      .eq("is_published", true),
  ]);

  if (projectsRes.error) {
    console.error("[getProjectsWithPropertyCount] Projects Error:", projectsRes.error.message);
    return [];
  }

  const projects = (projectsRes.data as ProjectRow[]) || [];
  const properties = propertiesRes.data || [];

  return projects.map((p) => {
    const count = properties.filter((pr) => pr.project_id === p.id).length;
    return {
      ...p,
      property_count: count,
    };
  });
}

/**
 * Fetch all projects (including unpublished) for admin.
 */
export async function getAllProjects(): Promise<ProjectRow[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getAllProjects]", error.message);
    return [];
  }

  return (data as ProjectRow[]) ?? [];
}

/**
 * Fetch a single project by its slug.
 */
export async function getProjectBySlug(slug: string): Promise<ProjectRow | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("[getProjectBySlug]", error.message);
    return null;
  }

  return (data as ProjectRow) ?? null;
}

/**
 * Fetch a single project with its child published properties.
 */
export async function getProjectWithProperties(
  slug: string
): Promise<{ project: ProjectRow | null; properties: PropertyRow[] }> {
  if (!isSupabaseConfigured()) return { project: null, properties: [] };

  const supabase = createServerClient();
  const { data: project, error: pErr } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (pErr || !project) {
    return { project: null, properties: [] };
  }

  const { data: properties } = await supabase
    .from("properties")
    .select("*")
    .eq("project_id", project.id)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return {
    project: project as ProjectRow,
    properties: (properties as PropertyRow[]) || [],
  };
}

/**
 * Fetch featured projects only.
 */
export async function getFeaturedProjects(): Promise<ProjectRow[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("is_published", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getFeaturedProjects]", error.message);
    return [];
  }

  return (data as ProjectRow[]) ?? [];
}
