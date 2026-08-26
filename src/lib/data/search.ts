import "server-only";

import { createPublicClient } from "@/lib/supabase/public";
import type { PropertyWithProject } from "@/lib/data/properties";
import type { Project } from "@/lib/supabase/types";

/**
 * PostgREST `or` filters treat commas and parentheses as syntax, and `%`, `*`
 * and backslash are ILIKE metacharacters, so they are stripped before the term
 * is interpolated. No tsvector or pg_trgm is used — the brief rules those out
 * without a separately approved migration.
 */
const UNSAFE_CHARS = new Set([
  ",",
  "(",
  ")",
  "*",
  "%",
  "_",
  String.fromCharCode(92),
]);

function sanitize(term: string): string {
  return [...term]
    .map((char) => (UNSAFE_CHARS.has(char) ? " " : char))
    .join("")
    .trim()
    .slice(0, 80);
}

export type SearchResults = {
  projects: Project[];
  properties: PropertyWithProject[];
};

export async function searchAll(
  rawQuery: string,
  limit = 12,
): Promise<SearchResults> {
  const term = sanitize(rawQuery);
  if (term.length < 2) return { projects: [], properties: [] };

  const supabase = createPublicClient();
  const pattern = `%${term}%`;

  const [projectsResult, propertiesResult] = await Promise.all([
    supabase
      .from("projects")
      .select("*")
      .eq("is_published", true)
      .or(`name_en.ilike.${pattern},name_ar.ilike.${pattern}`)
      .order("is_featured", { ascending: false })
      .limit(limit),
    supabase
      .from("properties")
      .select(
        "*, projects!inner(id, slug, name_en, name_ar, is_published), property_images(*)",
      )
      .eq("is_published", true)
      .eq("projects.is_published", true)
      .or(
        `title_en.ilike.${pattern},title_ar.ilike.${pattern},reference_code.ilike.${pattern}`,
      )
      .order("created_at", { ascending: false })
      .limit(limit),
  ]);

  if (projectsResult.error) throw projectsResult.error;
  if (propertiesResult.error) throw propertiesResult.error;

  return {
    projects: projectsResult.data ?? [],
    properties: (propertiesResult.data ?? []) as PropertyWithProject[],
  };
}
