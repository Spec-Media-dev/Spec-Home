import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { publicEnv } from "@/lib/env";
import { serverEnv } from "@/lib/env.server";
import type { Database } from "@/lib/supabase/types";

/**
 * Bypasses RLS entirely. Only the public enquiry flow uses it, because the
 * database intentionally grants anon no INSERT on `enquiries`. Every field it
 * writes must be validated and system-controlled by the caller.
 */
export function createServiceClient() {
  return createSupabaseClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
