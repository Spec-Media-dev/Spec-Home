import { NextResponse } from "next/server";

import { expireDatasets } from "@/lib/cache/freshness";
import {
  secretMatches,
  WEBHOOK_SECRET_HEADER,
} from "@/lib/cache/webhook-auth";
import { parseWebhookPayload } from "@/lib/cache/webhook-payload";
import { serverEnv } from "@/lib/env.server";

/**
 * Supabase Database Webhook receiver.
 *
 * The only endpoint through which a change made *outside* this application —
 * an edit in the Supabase dashboard, a SQL console update, another service —
 * can reach the Next.js cache. Its entire authority is:
 *
 *   1. expire cache tags for one known dataset, and
 *   2. emit one sanitized refresh hint.
 *
 * It reads no rows, writes no rows, and returns no row data. There is
 * deliberately no code path here that can mutate business data.
 *
 * POST-DEPLOYMENT ACTIVATION: this handler is implemented and unit tested, but
 * end-to-end delivery from Supabase Cloud has NOT been verified, because
 * Supabase cannot reach a localhost origin. See docs/DEPLOYMENT-FRESHNESS.md.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BODY_BYTES = 256 * 1024;

function deny(status: number, reason: string) {
  // Reason strings are fixed vocabulary, never derived from the payload.
  return NextResponse.json({ ok: false, reason }, { status });
}

export async function POST(request: Request): Promise<Response> {
  const expected = serverEnv.SUPABASE_WEBHOOK_SECRET;

  // Unconfigured means closed, never open. Answering 503 rather than 401 keeps
  // "no secret set" distinguishable in deployment logs without revealing it to
  // an unauthenticated caller in any usable way.
  if (!expected) return deny(503, "not_configured");

  if (!secretMatches(request.headers.get(WEBHOOK_SECRET_HEADER), expected)) {
    return deny(401, "unauthorized");
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return deny(415, "unsupported_media_type");
  }

  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return deny(413, "payload_too_large");
  }

  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return deny(413, "payload_too_large");
    body = JSON.parse(raw);
  } catch {
    // The parse error itself is not logged: it would embed the raw body.
    return deny(400, "malformed");
  }

  const parsed = parseWebhookPayload(body);
  if (!parsed.ok) {
    // Only the rejection reason and, where safe, the table name are logged.
    // `record` / `old_record` are never read, so no enquiry or admin row can
    // reach the logs through this path.
    console.warn("[supabase-webhook] rejected", { reason: parsed.reason });
    return deny(parsed.reason === "malformed" ? 400 : 422, parsed.reason);
  }

  await expireDatasets([parsed.dataset]);

  return NextResponse.json({ ok: true, dataset: parsed.dataset });
}

/** Any other method is refused outright rather than silently 404ing. */
export async function GET() {
  return deny(405, "method_not_allowed");
}

export const PUT = GET;
export const PATCH = GET;
export const DELETE = GET;
export const HEAD = GET;
