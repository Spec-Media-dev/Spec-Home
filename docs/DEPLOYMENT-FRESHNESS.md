# Content freshness — deployment and activation

This document covers the one part of the freshness architecture that **cannot
be finished before the application is deployed**: delivery of Supabase Database
Webhooks to the Next.js Route Handler.

Everything else — Server Action cache invalidation, the sanitized Broadcast, the
Admin and public Realtime bridges, and the Route Handler itself — is implemented
and works locally. Supabase Cloud cannot reach `http://localhost:3000`, so the
dashboard-edit → every-browser path is **NOT YET VERIFIED** and must be
activated and tested after the first deploy.

Never put a real secret in this file, in the repository, or in a commit message.

---

## 1. How the two paths differ

**Application Server Action** (works today, locally and deployed)

```
admin saves in the console
  → Server Action writes to Postgres
  → updateTag(...) expires the affected cache tags immediately
  → targeted revalidatePath(...) for slug and admin pages
  → sanitized Broadcast: { type, version, dataset }
  → the acting tab re-renders; other connected browsers router.refresh()
```

**Direct change in the Supabase dashboard** (requires deployment)

```
someone edits a row in the Supabase dashboard / SQL console
  → Supabase Database Webhook POSTs to the deployed app
  → POST /api/revalidate/supabase verifies the shared secret
  → revalidateTag(tag, { expire: 0 }) for the affected dataset
  → sanitized Broadcast: { type, version, dataset }
  → relevant connected browsers router.refresh()
```

`updateTag()` is Server-Action-only and throws inside a Route Handler, which is
why the webhook uses `revalidateTag(tag, { expire: 0 })` — the documented Route
Handler equivalent of immediate expiration.

---

## 2. Deploy the application

Deploy as normal. Note the public origin, e.g. `https://spechome.example`.

## 3. Create the webhook secret

Generate a high-entropy value locally — at least 32 characters; the app rejects
anything shorter so a placeholder cannot become a live credential:

```bash
openssl rand -base64 48
```

Keep it in your password manager. Do not commit it, paste it into a ticket, or
put it in this file.

## 4. Configure the production environment

Add to the deployment platform's environment variables (server-side only — the
name deliberately has no `NEXT_PUBLIC_` prefix):

```
SUPABASE_WEBHOOK_SECRET=<the value from step 3>
```

Redeploy so the variable is picked up.

Until this is set, `POST /api/revalidate/supabase` answers `503 not_configured`
and does nothing. Unconfigured means closed, never open.

## 5. Enable Realtime publication for the approved tables

The Broadcast messages themselves do not require Postgres replication, but
enabling it keeps the option open for future row-level subscriptions. In the
Supabase dashboard, **Database → Publications → `supabase_realtime`**, confirm
these seven tables are present:

```
site_settings
admin_profiles
projects
properties
property_images
property_specs
enquiries
```

This is the only database-side change in scope. Do not add tables, columns, RLS
policies, or buckets.

## 6. Create the seven Database Webhooks

In **Database → Webhooks**, create one webhook per table. All seven use the
same configuration:

| Setting | Value |
| --- | --- |
| Table | one of the seven above |
| Events | `INSERT`, `UPDATE`, `DELETE` |
| Type | HTTP Request |
| Method | `POST` |
| URL | `https://<your-domain>/api/revalidate/supabase` |
| HTTP header | `x-spec-home-webhook-secret: <secret from step 3>` |
| HTTP header | `Content-Type: application/json` |

The endpoint rejects anything else:

- a wrong or missing secret → `401`
- a schema other than `public` → `422`
- a table outside the seven → `422`
- an event other than INSERT/UPDATE/DELETE → `422`
- a non-JSON content type → `415`
- a body over 256 KB → `413`
- any method other than POST → `405`

It reads only `type`, `table`, and `schema`. It never reads, logs, or returns
`record` or `old_record`, which is what keeps an `enquiries` delivery from
putting lead data anywhere.

## 7. What the webhook is allowed to do

Exactly two things: expire cache tags for one known dataset, and emit one
sanitized refresh hint. It cannot mutate business data — there is no code path
that writes.

`enquiries` and `admin_profiles` are **private datasets**. A webhook for either
one invalidates nothing (admin reads are uncached by design) and is announced
only on the admin channel, and even there only as a dataset name.

## 8. Verify: direct dashboard mutation

1. Open the public site in a browser and leave it on `/projects`.
2. In the Supabase dashboard, edit a published project's `name_en`.
3. Within a few seconds the page should re-render with the new name, with no
   manual reload.
4. Check the deployment logs: one `POST /api/revalidate/supabase` → `200`.
5. Confirm no row content appears in the logs.

Repeat for `site_settings.logo_path` — the header and footer logo should change
on every open page.

## 9. Verify: cross-device

1. Open the site on a phone and on a desktop at the same time.
2. Sign in to `/dashboard-admin` in a third browser and publish a project.
3. Both the phone and the desktop should refresh without interaction.
4. Open two admin sessions and change the display name in one; the other
   session's sidebar and topbar should update.
5. Confirm the browser console is clean and that exactly one Realtime channel
   is open per browser.

---

## Hardening left as a deliberate follow-up

The two Broadcast channels are public topics. The payload is a version and a
dataset name — no rows, ids, emails, or metadata — so joining a channel reveals
only that *some* row in a named table changed, and a forged message can at most
cause an extra re-fetch of data the viewer was already entitled to read.

Restricting the admin channel further requires Supabase Realtime Authorization
(RLS policies on `realtime.messages`) plus private channels, which is a
database-side change outside the approved scope for this pass. Raise it as its
own change if the "an enquiry arrived" signal is considered sensitive.

---

## Status summary

| Capability | Status |
| --- | --- |
| Server Action cache invalidation (`updateTag`) | Implemented, verified locally |
| Sanitized Broadcast from Server Actions | Implemented, verified locally |
| Admin Realtime bridge | Implemented, verified locally |
| Public ContentRefreshBridge | Implemented, verified locally |
| Webhook Route Handler + auth + allowlists | Implemented, unit tested |
| Supabase Cloud → webhook delivery | **POST-DEPLOYMENT ACTIVATION — NOT YET VERIFIED** |
| Cross-device freshness from a dashboard edit | **POST-DEPLOYMENT ACTIVATION — NOT YET VERIFIED** |
