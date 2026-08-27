import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Header Supabase is configured to send. Named after the product rather than
 * something generic, so a header injected by an intermediary proxy cannot
 * accidentally satisfy it.
 *
 * No `server-only` marker here on purpose: this module is pure and imported by
 * the Route Handler and by the unit tests, never by a client component.
 */
export const WEBHOOK_SECRET_HEADER = "x-spec-home-webhook-secret";

/**
 * Constant-time secret comparison.
 *
 * Both sides are reduced to a fixed-width SHA-256 digest before comparing.
 * `timingSafeEqual` throws on a length mismatch, and bailing out on that throw
 * would leak the expected secret's length through timing; hashing first makes
 * every comparison the same shape regardless of input length.
 */
export function secretMatches(
  provided: string | null | undefined,
  expected: string | null | undefined,
): boolean {
  if (!expected || !provided) return false;

  const digest = (value: string) =>
    createHash("sha256").update(value, "utf8").digest();

  return timingSafeEqual(digest(provided), digest(expected));
}
