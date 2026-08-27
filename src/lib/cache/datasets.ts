/**
 * The dataset vocabulary that ties database tables, cache tags, and refresh
 * notifications together.
 *
 * Nothing outside this module decides which tables are safe to announce
 * publicly, so the security boundary lives in exactly one place and is
 * enforced identically by Server Actions, the webhook Route Handler, and both
 * browser bridges.
 */

import { cacheTags } from "@/lib/cache-tags";

/** Every dataset the application knows how to refresh. */
export const DATASETS = [
  "site_settings",
  "admin_profiles",
  "projects",
  "properties",
  "property_images",
  "property_specs",
  "enquiries",
] as const;

export type Dataset = (typeof DATASETS)[number];

/**
 * Datasets whose *existence of a change* may be announced to anonymous
 * browsers. These back published, publicly readable pages, so telling a
 * visitor "the projects listing moved on" reveals nothing they could not learn
 * by reloading.
 */
export const PUBLIC_DATASETS = [
  "site_settings",
  "projects",
  "properties",
  "property_images",
  "property_specs",
] as const satisfies readonly Dataset[];

/**
 * Lead data and administrator identity. A change to either is never announced
 * on the public channel, in any form.
 */
export const PRIVATE_DATASETS = [
  "admin_profiles",
  "enquiries",
] as const satisfies readonly Dataset[];

const PUBLIC_SET: ReadonlySet<string> = new Set(PUBLIC_DATASETS);
const DATASET_SET: ReadonlySet<string> = new Set(DATASETS);

export function isDataset(value: unknown): value is Dataset {
  return typeof value === "string" && DATASET_SET.has(value);
}

export function isPublicDataset(value: unknown): value is Dataset {
  return typeof value === "string" && PUBLIC_SET.has(value);
}

/**
 * Cache tags a dataset invalidates.
 *
 * Deliberately conservative in one direction only: a project's publish state
 * gates whether its properties are publicly visible, so touching `projects`
 * must also expire the properties tag. Everything else stays narrow — no
 * mutation invalidates the whole application.
 *
 * Private datasets map to no tags at all: admin reads are uncached by design
 * (see `lib/data/admin.ts`), so there is nothing to invalidate and nothing
 * that could accidentally place lead data in a public cache.
 */
const DATASET_TAGS: Record<Dataset, readonly string[]> = {
  site_settings: [cacheTags.siteSettings],
  projects: [cacheTags.projects, cacheTags.properties],
  properties: [cacheTags.properties],
  property_images: [cacheTags.properties],
  property_specs: [cacheTags.properties],
  admin_profiles: [],
  enquiries: [],
};

export function tagsForDatasets(datasets: readonly Dataset[]): string[] {
  const tags = new Set<string>();
  for (const dataset of datasets) {
    for (const tag of DATASET_TAGS[dataset]) tags.add(tag);
  }
  return [...tags];
}

/**
 * Table allowlist for the Supabase Database Webhook. A table absent from this
 * map is rejected before anything else happens — the endpoint can never be
 * pointed at a table the application does not model.
 */
const TABLE_TO_DATASET: Record<string, Dataset> = {
  site_settings: "site_settings",
  admin_profiles: "admin_profiles",
  projects: "projects",
  properties: "properties",
  property_images: "property_images",
  property_specs: "property_specs",
  enquiries: "enquiries",
};

export function datasetForTable(table: unknown): Dataset | null {
  if (typeof table !== "string") return null;
  return TABLE_TO_DATASET[table] ?? null;
}

/** The only schema the webhook will accept events from. */
export const ALLOWED_WEBHOOK_SCHEMA = "public";

/** The only row-level events worth acting on. */
export const ALLOWED_WEBHOOK_EVENTS = ["INSERT", "UPDATE", "DELETE"] as const;

export type WebhookEvent = (typeof ALLOWED_WEBHOOK_EVENTS)[number];

export function isWebhookEvent(value: unknown): value is WebhookEvent {
  return (
    typeof value === "string" &&
    (ALLOWED_WEBHOOK_EVENTS as readonly string[]).includes(value)
  );
}
