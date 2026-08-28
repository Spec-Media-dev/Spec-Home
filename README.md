# SPEC Home

Production-oriented bilingual real-estate website and admin dashboard built
with Next.js 16, React 19, Supabase, and next-intl.

## Local development

1. Copy the required Supabase and public site values into `.env.local`.
2. Install dependencies with `npm install`.
3. Start the app with `npm run dev`.
4. Open `http://localhost:3000` for the public site or
   `http://localhost:3000/dashboard-admin` for Admin.

The service-role key is server-only. Never prefix it with `NEXT_PUBLIC_`, place
it in client code, or commit it. The same applies to `SUPABASE_WEBHOOK_SECRET`
(see below), which is optional locally.

## Admin language

The console is available in English (LTR) and Arabic (RTL) at the same routes.
The choice is a cookie, not a URL segment, so `/dashboard-admin/...` is a single
set of routes in both languages. Copy lives in `messages/admin/{en,ar}.json`;
the two files are kept structurally identical and a unit test asserts it.

Content fields are separate from the interface: English content is always
authored LTR and Arabic content RTL, whichever language the console is in.

## Content freshness

Changes made *through the application* invalidate their cache tags immediately
and notify connected browsers over a sanitized Realtime Broadcast. Changes made
*directly in the Supabase dashboard* reach browsers through a signed Database
Webhook, which requires a deployed origin.

Setup and verification steps: `docs/DEPLOYMENT-FRESHNESS.md`.

## Enquiry protection

The public enquiry form uses no CAPTCHA and depends on no external anti-bot
account. The layers, in the order a request meets them:

1. **Honeypot** — an off-screen `company` field. A populated value returns a
   normal-looking success and writes nothing, so a bot learns nothing. Checked
   before the rate limiter, so bot traffic cannot spend a real visitor's
   allowance.
2. **Rate limit** — five submissions per IP per ten minutes.
3. **Strict Zod validation** — `.strict()`, so an unexpected key (`status`,
   say) is rejected rather than ignored.
4. **Business validation** — any supplied project/property id is re-checked
   against real published rows.
5. **Server-only privileged insert** — `anon` has no INSERT on `enquiries`;
   the Server Action is the only path in, and it sets `status` itself.

A unit test fails if any CAPTCHA provider is reintroduced under `src/`.

The rate limiter is in-process (`src/lib/rate-limit.ts`). That is correct for a
single long-lived Node process. On a multi-instance or serverless deployment
each instance keeps its own counters, so the effective limit multiplies by the
instance count — see "Deployment" below.

## Security headers

Set centrally in `next.config.ts` and applied to every response: `nosniff`,
`X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, a
`Permissions-Policy` denying capabilities the site does not use, and HSTS in
production builds only (no `preload`, no `includeSubDomains`).

The Content-Security-Policy ships in two parts on purpose:

- **Enforced**: `frame-ancestors 'none'` only. That directive controls framing
  and nothing else, so it cannot break a script, style, image or fetch.
- **Report-Only**: the full policy, so violations can be observed from a real
  production browser before it is enforced for real.

`tests/e2e/security-headers.spec.ts` fails on any violation of the Report-Only
policy across EN/AR and light/dark. **Once that suite passes against a
production build, promote the policy**: in `next.config.ts`, give the
`Content-Security-Policy` key the value `contentSecurityPolicy` and delete the
`Content-Security-Policy-Report-Only` entry.

## Verification

```text
npm run lint
npm run typecheck
npm test
npm run test:integration
npm run build
npm run test:e2e
```

The integration suite uses clearly prefixed temporary records and removes them
afterward. It requires the local environment variables, including the
server-only service-role key.

`npm run test:e2e` builds and serves the app on port 3100 with a fresh server
per run, so the in-process rate limiter always starts empty. Its enquiry suite
asserts persisted database state, not just on-screen messages, and deletes only
the rows its own run created.

## Deployment

Decisions that depend on the final host rather than the code:

- `NEXT_PUBLIC_SITE_URL` must be the real origin — canonicals, hreflang, the
  sitemap and robots all derive from it.
- HTTPS, so HSTS becomes meaningful.
- If deploying to more than one instance, move the rate limiter to shared
  storage or put rate limiting in front of the app (hosting WAF).
- The rate-limit key trusts `CF-Connecting-IP` / `X-Forwarded-For`. Those are
  only trustworthy behind a proxy that overwrites them; see
  `src/lib/client-ip.ts`.

## Project documentation

- Product and data contract: `docs/SPEC-HOME-BRIEF.md`
- Existing-admin recovery: `docs/ADMIN-RECOVERY.md`
- Freshness deployment and activation: `docs/DEPLOYMENT-FRESHNESS.md`

Images are stored in the existing Supabase Storage bucket `site-media`.
PostgreSQL stores only bucket-relative image paths and other schema metadata.
