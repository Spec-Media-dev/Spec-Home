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

## Verification

```text
npm run lint
npm run typecheck
npm test
npm run test:integration
npm run build
```

The integration suite uses clearly prefixed temporary records and removes them
afterward. It requires the local environment variables, including the
server-only service-role key.

## Project documentation

- Product and data contract: `docs/SPEC-HOME-BRIEF.md`
- Existing-admin recovery: `docs/ADMIN-RECOVERY.md`
- Freshness deployment and activation: `docs/DEPLOYMENT-FRESHNESS.md`

Images are stored in the existing Supabase Storage bucket `site-media`.
PostgreSQL stores only bucket-relative image paths and other schema metadata.
