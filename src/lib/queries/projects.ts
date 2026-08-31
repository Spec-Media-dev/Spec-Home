"use server";

import { createServerClient } from "@/lib/supabase/server";
import type { ProjectRow } from "@/lib/supabase/types";

function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

/**
 * Fetch all published projects, ordered by creation date (newest first).
 * Cache tag: "projects"
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
    .single();

  if (error) {
    console.error("[getProjectBySlug]", error.message);
    return null;
  }

  return (data as ProjectRow) ?? null;
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
