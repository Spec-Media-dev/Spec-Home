/**
 * The wire contract for refresh notifications.
 *
 * A refresh message is a *hint*, never data. It carries a version and a known
 * dataset identifier and nothing else — no rows, no ids, no emails, no raw
 * Supabase payloads. A client that receives one re-fetches its own RSC data
 * through the normal authenticated/RLS-guarded path, so a forged message can
 * at worst cause an extra render of data the viewer was already entitled to.
 * It can never mutate anything or invalidate a server cache.
 *
 * Shared by server and client, so this module must stay free of `server-only`
 * and of any Node built-in.
 */

import { isDataset, isPublicDataset, type Dataset } from "@/lib/cache/datasets";

export const REFRESH_PROTOCOL_VERSION = 1;

/** Anonymous visitors may join this channel; only public datasets appear on it. */
export const PUBLIC_REFRESH_CHANNEL = "spec-home:public-content";

/** Carries the same sanitized shape, including private dataset identifiers. */
export const ADMIN_REFRESH_CHANNEL = "spec-home:admin-content";

export const REFRESH_EVENT = "content-changed";

export type RefreshMessage = {
  type: typeof REFRESH_EVENT;
  version: number;
  dataset: Dataset;
};

export function buildRefreshMessage(dataset: Dataset): RefreshMessage {
  return {
    type: REFRESH_EVENT,
    version: REFRESH_PROTOCOL_VERSION,
    dataset,
  };
}

function hasRefreshShape(value: unknown): value is RefreshMessage {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    candidate.type === REFRESH_EVENT &&
    candidate.version === REFRESH_PROTOCOL_VERSION &&
    isDataset(candidate.dataset)
  );
}

/**
 * Validates an inbound message on the admin channel. Unknown versions are
 * dropped rather than guessed at, so a future protocol change cannot make an
 * old client behave unpredictably.
 */
export function parseRefreshMessage(value: unknown): RefreshMessage | null {
  return hasRefreshShape(value) ? value : null;
}

/**
 * Validates an inbound message on the public channel. Anything naming a
 * private dataset is discarded even though the payload itself carries no data:
 * public clients have no business acting on lead or administrator activity.
 */
export function parsePublicRefreshMessage(
  value: unknown,
): RefreshMessage | null {
  const message = parseRefreshMessage(value);
  if (!message || !isPublicDataset(message.dataset)) return null;
  return message;
}
