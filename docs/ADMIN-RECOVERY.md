# Existing Admin account recovery

Use this only as a one-time development or operations procedure for the
existing Supabase Auth Admin. It must never create a second user or replace the
existing UID because `auth.users.id` must remain equal to `admin_profiles.id`.

## Preferred self-service paths

After signing in, use **Settings → Account**. Email changes use the normal
authenticated Supabase confirmation flow. Password changes re-check the current
password before updating it. Name and avatar remain under **Settings → Profile**
and are the only account details stored in `admin_profiles`.

## One-time Admin API procedure

Use this only when self-service recovery is impossible.

1. Back up the project and identify the existing UID by checking the sole
   expected `admin_profiles.id`. Never infer the UID from a display name.
2. Keep `SUPABASE_SERVICE_ROLE_KEY`, the existing UID, and the replacement
   value in local environment variables. Never paste them into source control,
   shell history, issue trackers, or logs.
3. Create a temporary script outside the application routes. The essential
   update must use the existing UID:

```js
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const existingAdminUid = process.env.EXISTING_ADMIN_UID;
const attributes = {};

if (process.env.NEW_ADMIN_EMAIL) {
  attributes.email = process.env.NEW_ADMIN_EMAIL.trim();
  attributes.email_confirm = true;
}
if (process.env.NEW_ADMIN_PASSWORD) {
  attributes.password = process.env.NEW_ADMIN_PASSWORD;
}

const { data: beforeProfile, error: profileError } = await admin
  .from("admin_profiles")
  .select("id")
  .eq("id", existingAdminUid)
  .single();
if (profileError || beforeProfile.id !== existingAdminUid) {
  throw new Error("Existing Admin profile/UID relationship was not verified");
}

const { data, error } = await admin.auth.admin.updateUserById(
  existingAdminUid,
  attributes,
);
if (error || data.user.id !== existingAdminUid) {
  throw new Error("Existing Admin update failed");
}
```

4. Do not print the replacement email/password or service-role key. Put a new
   password into the operator's clipboard through a local, non-logging step if
   required.
5. Verify with a separate public Supabase client that password sign-in succeeds
   for the expected email, `getUser()` returns the same UID, the same
   `admin_profiles.id` still exists, and the Auth user count did not increase.
6. Delete the temporary script immediately, clear the temporary environment
   variables, and clear the clipboard after the password is saved in a password
   manager.

Never implement this recovery flow as an API route, Server Action, browser
utility, or permanent script. The service-role key bypasses RLS and must remain
server-side throughout the one-time procedure.
