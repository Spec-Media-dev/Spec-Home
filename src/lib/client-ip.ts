/**
 * Resolves the caller's IP from proxy headers, for rate-limit keying only.
 *
 * Every header consulted here is client-settable. They are only trustworthy
 * when a proxy in front of the app *overwrites* them on the way in, which is
 * what Cloudflare, Vercel and a correctly configured Nginx/Apache all do. On a
 * deployment where nothing overwrites them, a determined caller can rotate
 * `X-Forwarded-For` and get a fresh rate-limit bucket per request.
 *
 * That is a property of the deployment, not something app code can fix: there
 * is no way to distinguish a forged header from a proxy-set one without
 * knowing which proxy is trusted. The value is therefore used *only* as a
 * rate-limit bucket key — never for authorization, never stored, never logged
 * — so the worst case is weaker throttling, not a security bypass.
 *
 * Kept as a pure function over a header getter so it is unit-testable without
 * a request context.
 */
export function clientIpFromHeaders(
  get: (name: string) => string | null | undefined,
): string {
  // Cloudflare sets this itself and strips any inbound copy, so it is the
  // most trustworthy of the three when present.
  const cloudflare = firstValue(get("cf-connecting-ip"));
  if (cloudflare) return cloudflare;

  const vercel = firstValue(get("x-vercel-forwarded-for"));
  if (vercel) return vercel;

  // `X-Forwarded-For` is a list appended to by each hop. The left-most entry
  // is the original client as reported by the first proxy.
  const forwarded = firstValue(get("x-forwarded-for"));
  if (forwarded) return forwarded;

  const real = firstValue(get("x-real-ip"));
  if (real) return real;

  // One shared bucket rather than no limit at all: an unidentifiable caller
  // is throttled together with every other unidentifiable caller.
  return "unknown";
}

function firstValue(header: string | null | undefined): string | null {
  if (!header) return null;
  const first = header.split(",")[0]?.trim();
  return first ? first : null;
}
