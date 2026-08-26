import "server-only";

import { unstable_cache } from "next/cache";

import { cacheTags } from "@/lib/cache-tags";
import { createPublicClient } from "@/lib/supabase/public";
import type {
  Project,
  Property,
  PropertyImage,
  PropertySpec,
} from "@/lib/supabase/types";

export type PropertyWithProject = Property & {
  projects: Pick<
    Project,
    "id" | "slug" | "name_en" | "name_ar" | "is_published"
  > | null;
  property_images: PropertyImage[];
};

export type PropertyDetail = PropertyWithProject & {
  property_specs: PropertySpec[];
};

const LIST_SELECT = `
  *,
  projects!inner(id, slug, name_en, name_ar, is_published),
  property_images(*)
`;

/**
 * RLS publishes a property on its own `is_published` flag and does not consult
 * its parent project, so an unpublished project's units would otherwise stay
 * publicly visible. The inner join below is the single place that gate is
 * enforced — no page may query `properties` directly.
 */
function publishedQuery() {
  return createPublicClient()
    .from("properties")
    .select(LIST_SELECT)
    .eq("is_published", true)
    .eq("projects.is_published", true);
}

function sortImages<T extends { property_images: PropertyImage[] }>(row: T): T {
  row.property_images.sort(
    (a, b) =>
      Number(b.is_cover) - Number(a.is_cover) ||
      a.display_order - b.display_order ||
      a.created_at.localeCompare(b.created_at),
  );
  return row;
}

export const getFeaturedProperties = unstable_cache(
  async (limit = 6): Promise<PropertyWithProject[]> => {
    const { data, error } = await publishedQuery()
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []).map(sortImages);
  },
  ["featured-properties"],
  { tags: [cacheTags.properties], revalidate: 300 },
);

export const getRecentProperties = unstable_cache(
  async (limit = 8): Promise<PropertyWithProject[]> => {
    const { data, error } = await publishedQuery()
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []).map(sortImages);
  },
  ["recent-properties"],
  { tags: [cacheTags.properties], revalidate: 300 },
);

export const getPropertiesByProject = unstable_cache(
  async (projectId: string): Promise<PropertyWithProject[]> => {
    const { data, error } = await publishedQuery()
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []).map(sortImages);
  },
  ["properties-by-project"],
  { tags: [cacheTags.properties], revalidate: 300 },
);

export const getPropertyBySlug = unstable_cache(
  async (slug: string): Promise<PropertyDetail | null> => {
    const { data, error } = await createPublicClient()
      .from("properties")
      .select(`${LIST_SELECT}, property_specs(*)`)
      .eq("slug", slug)
      .eq("is_published", true)
      .eq("projects.is_published", true)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const detail = sortImages(data as PropertyDetail);
    // No ordering column exists on property_specs; creation order is the
    // deterministic sequence the admin editor writes.
    detail.property_specs.sort(
      (a, b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id),
    );
    return detail;
  },
  ["property-by-slug"],
  { tags: [cacheTags.properties], revalidate: 300 },
);

export type PropertyFilters = {
  projectId?: string;
  type?: string;
  bedrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  page?: number;
  perPage?: number;
};

export type PropertyListResult = {
  items: PropertyWithProject[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export async function listProperties(
  filters: PropertyFilters = {},
): Promise<PropertyListResult> {
  const perPage = filters.perPage ?? 12;
  const page = Math.max(1, filters.page ?? 1);
  const from = (page - 1) * perPage;

  let query = createPublicClient()
    .from("properties")
    .select(LIST_SELECT, { count: "exact" })
    .eq("is_published", true)
    .eq("projects.is_published", true);

  if (filters.projectId) query = query.eq("project_id", filters.projectId);
  if (filters.type) query = query.eq("property_type_en", filters.type);
  if (filters.bedrooms !== undefined) {
    query = query.eq("bedrooms", filters.bedrooms);
  }
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.minPrice !== undefined) {
    query = query.gte("price", filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    query = query.lte("price", filters.maxPrice);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, from + perPage - 1);

  if (error) throw error;

  const total = count ?? 0;
  return {
    items: (data ?? []).map(sortImages),
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

/** Distinct published property types, for the listing filter. */
export const getPropertyTypes = unstable_cache(
  async (): Promise<{ en: string; ar: string }[]> => {
    const { data, error } = await createPublicClient()
      .from("properties")
      .select("property_type_en, property_type_ar, projects!inner(is_published)")
      .eq("is_published", true)
      .eq("projects.is_published", true);

    if (error) throw error;

    const seen = new Map<string, { en: string; ar: string }>();
    for (const row of data ?? []) {
      if (!seen.has(row.property_type_en)) {
        seen.set(row.property_type_en, {
          en: row.property_type_en,
          ar: row.property_type_ar,
        });
      }
    }
    return [...seen.values()].sort((a, b) => a.en.localeCompare(b.en));
  },
  ["property-types"],
  { tags: [cacheTags.properties], revalidate: 600 },
);

/** Slugs for the sitemap: published units under published projects only. */
export async function getPublishedPropertySlugs() {
  const { data, error } = await createPublicClient()
    .from("properties")
    .select("slug, updated_at, projects!inner(is_published)")
    .eq("is_published", true)
    .eq("projects.is_published", true);

  if (error) throw error;
  return (data ?? []).map((row) => ({
    slug: row.slug,
    updatedAt: row.updated_at,
  }));
}
