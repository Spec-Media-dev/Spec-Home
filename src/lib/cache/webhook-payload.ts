/**
 * Parsing and allowlisting for Supabase Database Webhook deliveries.
 *
 * Kept free of `server-only` and of Next imports so the allowlist can be unit
 * tested directly. It reads exactly three fields — `type`, `table`, `schema` —
 * and never looks at `record` or `old_record`. Row payloads are not inspected,
 * not logged, and not returned, which is what keeps an `enquiries` delivery
 * from ever putting lead data anywhere.
 */

import {
  ALLOWED_WEBHOOK_SCHEMA,
  datasetForTable,
  isWebhookEvent,
  type Dataset,
  type WebhookEvent,
} from "@/lib/cache/datasets";

export type WebhookRejection =
  | "malformed"
  | "schemaNotAllowed"
  | "tableNotAllowed"
  | "eventNotAllowed";

export type WebhookParseResult =
  | { ok: true; dataset: Dataset; event: WebhookEvent; table: string }
  | { ok: false; reason: WebhookRejection };

export function parseWebhookPayload(value: unknown): WebhookParseResult {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { ok: false, reason: "malformed" };
  }

  const body = value as Record<string, unknown>;

  if (typeof body.schema !== "string" || typeof body.table !== "string") {
    return { ok: false, reason: "malformed" };
  }

  if (body.schema !== ALLOWED_WEBHOOK_SCHEMA) {
    return { ok: false, reason: "schemaNotAllowed" };
  }

  if (!isWebhookEvent(body.type)) {
    return { ok: false, reason: "eventNotAllowed" };
  }

  const dataset = datasetForTable(body.table);
  if (!dataset) return { ok: false, reason: "tableNotAllowed" };

  return { ok: true, dataset, event: body.type, table: body.table };
}
