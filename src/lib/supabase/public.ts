import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { publicEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

/**
 * Anonymous, cookie-free client for public reads.
 *
 * Deliberately does not touch `cookies()`: a request-scoped API cannot be used
 * inside `unstable_cache`, and public listings must never vary by session.
 * RLS still applies under the `anon` role, so only published rows come back.
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
