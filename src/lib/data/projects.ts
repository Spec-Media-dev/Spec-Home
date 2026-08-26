import "server-only";

import { unstable_cache } from "next/cache";

import { cacheTags } from "@/lib/cache-tags";
import { createPublicClient } from "@/lib/supabase/public";
import type { Project } from "@/lib/supabase/types";

export type ProjectWithCount = Project & {
  propertyCount: number;
};

/**
 * Counts only published units, so the public card never advertises inventory a
 * visitor cannot reach.
 */
async function withPublishedCounts(
  projects: Project[],
): Promise<ProjectWithCount[]> {
  if (projects.length === 0) return [];

  const { data, error } = await createPublicClient()
    .from("properties")
    .select("project_id")
    .eq("is_published", true)
    .in(
      "project_id",
      projects.map((project) => project.id),
    );

  if (error) throw error;

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    counts.set(row.project_id, (counts.get(row.project_id) ?? 0) + 1);
  }

  return projects.map((project) => ({
    ...project,
    propertyCount: counts.get(project.id) ?? 0,
  }));
}

export const getPublishedProjects = unstable_cache(
  async (limit?: number): Promise<ProjectWithCount[]> => {
    let query = createPublicClient()
      .from("projects")
      .select("*")
      .eq("is_published", true)
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw error;

    return withPublishedCounts(data ?? []);
  },
  ["published-projects"],
  { tags: [cacheTags.projects], revalidate: 300 },
);

export const getProjectBySlug = unstable_cache(
  async (slug: string): Promise<Project | null> => {
    const { data, error } = await createPublicClient()
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (error) throw error;
    return data;
  },
  ["project-by-slug"],
  { tags: [cacheTags.projects], revalidate: 300 },
);

/** Minimal published project list for the properties filter control. */
export const getProjectOptions = unstable_cache(
  async () => {
    const { data, error } = await createPublicClient()
      .from("projects")
      .select("id, slug, name_en, name_ar")
      .eq("is_published", true)
      .order("name_en");

    if (error) throw error;
    return data ?? [];
  },
  ["project-options"],
  { tags: [cacheTags.projects], revalidate: 600 },
);

export async function getPublishedProjectSlugs() {
  const { data, error } = await createPublicClient()
    .from("projects")
    .select("slug, updated_at")
    .eq("is_published", true);

  if (error) throw error;
  return (data ?? []).map((row) => ({
    slug: row.slug,
    updatedAt: row.updated_at,
  }));
}
