import "server-only";

import { revalidatePath, revalidateTag, updateTag } from "next/cache";

import { tagsForDatasets, type Dataset } from "@/lib/cache/datasets";
import { broadcastDatasetChanged } from "@/lib/realtime/broadcast.server";

/**
 * The two ways this application invalidates cached data.
 *
 * Next 16 exposes two distinct APIs and they are not interchangeable:
 *
 *   `updateTag(tag)`  — Server Actions only. Expires immediately *and* gives
 *                       the acting request read-your-own-writes semantics, so
 *                       the response rendered right after a mutation already
 *                       reflects it. Throws if called from a Route Handler.
 *
 *   `revalidateTag(tag, profile)` — valid anywhere. `{ expire: 0 }` is the
 *                       Route Handler equivalent of immediate expiration; the
 *                       webhook has no user request to make consistent, it
 *                       only needs the next reader to miss the cache.
 *
 * Both paths funnel through `tagsForDatasets`, so a Server Action and a
 * Database Webhook touching the same table can never invalidate different tags.
 */

type FreshnessOptions = {
  /** Extra concrete paths to drop, e.g. a slug page or an admin list. */
  paths?: readonly (string | { path: string; type: "layout" | "page" })[];
  /** Set false to invalidate caches without notifying browsers. */
  broadcast?: boolean;
};

function dropPaths(paths: FreshnessOptions["paths"]) {
  for (const entry of paths ?? []) {
    if (typeof entry === "string") revalidatePath(entry);
    else revalidatePath(entry.path, entry.type);
  }
}

/**
 * For Server Actions: expire the affected datasets immediately, drop any
 * targeted paths, then announce the change to connected browsers.
 */
export async function updateDatasets(
  datasets: readonly Dataset[],
  options: FreshnessOptions = {},
): Promise<void> {
  for (const tag of tagsForDatasets(datasets)) updateTag(tag);
  dropPaths(options.paths);

  if (options.broadcast !== false) {
    await broadcastDatasetChanged(datasets);
  }
}

/**
 * For Route Handlers (the Supabase Database Webhook). Uses the Route Handler
 * cache API — `updateTag` would throw here.
 */
export async function expireDatasets(
  datasets: readonly Dataset[],
  options: FreshnessOptions = {},
): Promise<void> {
  for (const tag of tagsForDatasets(datasets)) {
    revalidateTag(tag, { expire: 0 });
  }
  dropPaths(options.paths);

  if (options.broadcast !== false) {
    await broadcastDatasetChanged(datasets);
  }
}
