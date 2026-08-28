import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const supabaseHost = (() => {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return undefined;
  try {
    return new URL(raw).hostname;
  } catch {
    return undefined;
  }
})();

const isProduction = process.env.NODE_ENV === "production";

/**
 * Storage serves images over HTTPS; Realtime uses a WebSocket to the same
 * host. Both are needed by name — `'self'` does not cover them.
 */
const supabaseImage = supabaseHost ? [`https://${supabaseHost}`] : [];
const supabaseConnect = supabaseHost
  ? [`https://${supabaseHost}`, `wss://${supabaseHost}`]
  : [];

/**
 * Analytics is opt-in (`components/analytics.tsx` renders nothing without an
 * id), so its origins are only admitted when an id is actually configured.
 */
const analyticsEnabled = Boolean(process.env.NEXT_PUBLIC_GA_ID);
const analyticsScript = analyticsEnabled
  ? ["https://www.googletagmanager.com"]
  : [];
const analyticsConnect = analyticsEnabled
  ? [
      "https://www.googletagmanager.com",
      "https://www.google-analytics.com",
      "https://region1.google-analytics.com",
    ]
  : [];

/**
 * The full policy, kept in Report-Only until it has been observed clean in a
 * production browser (see README). Two allowances are deliberate rather than
 * lazy:
 *
 * - `script-src 'unsafe-inline'`: the App Router emits inline bootstrap and
 *   flight-data scripts, and next-themes writes a blocking inline script to
 *   set the theme class before first paint. Replacing this with a nonce means
 *   generating one per request, which forces every static and ISR page to
 *   render dynamically — a real cost for no attacker-facing gain here, since
 *   the app renders no untrusted HTML.
 * - `style-src 'unsafe-inline'`: next/font and React inline style attributes.
 *
 * Everything else is closed: no `*`, no `unsafe-eval`, no remote script hosts
 * beyond the analytics origins that are only added when analytics is on.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  ["script-src", "'self'", "'unsafe-inline'", ...analyticsScript].join(" "),
  "style-src 'self' 'unsafe-inline'",
  ["img-src", "'self'", "data:", "blob:", ...supabaseImage].join(" "),
  "font-src 'self' data:",
  ["connect-src", "'self'", ...supabaseConnect, ...analyticsConnect].join(" "),
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

/**
 * Security headers, applied to every response.
 *
 * The enforced `Content-Security-Policy` carries only `frame-ancestors`. That
 * directive governs who may frame the page and nothing else, so enforcing it
 * cannot break a script, style, image or fetch — while the full policy above
 * rides along in Report-Only so violations can be collected from a real
 * production browser before it is enforced for real.
 */
const securityHeaders = [
  // Stops a browser from re-interpreting a response as a type the server did
  // not declare — the classic route from "uploaded image" to "executed script".
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Clickjacking. Kept alongside `frame-ancestors` for older browsers; the two
  // say the same thing, so they cannot disagree.
  { key: "X-Frame-Options", value: "DENY" },
  // Send the full URL to ourselves, only the origin cross-site, nothing when
  // downgrading to HTTP. Keeps property slugs out of third-party referer logs.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Nothing on this site uses any of these; denying them means an injected
  // script cannot use them either.
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()",
  },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "Content-Security-Policy-Report-Only", value: contentSecurityPolicy },
  // HSTS is meaningful only over real HTTPS — browsers ignore it on plain
  // HTTP, so a local production build is unaffected. No `preload` and no
  // `includeSubDomains`: both are hard to reverse and neither has been
  // approved against the final domain's subdomains.
  ...(isProduction
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000" }]
    : []),
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    // Property images upload directly to Storage. This narrowly covers the
    // remaining 1 MB avatar and 2 MB logo Server Action forms plus multipart
    // overhead without allowing large request bodies application-wide.
    serverActions: { bodySizeLimit: "2.25mb" },
  },
  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
