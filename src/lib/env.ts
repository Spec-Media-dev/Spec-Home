// The configured entry point, not "zod" directly: `publicEnv` below is
// imported by `@/lib/supabase/browser`, which the realtime bridge mounted in
// the root site layout pulls into every public page's client bundle, so this
// schema is one of the places that must not risk running before Zod's
// eval-based JIT probe is disabled. See src/lib/zod.ts.
import { z } from "@/lib/zod";

/**
 * Supabase's dashboard exposes several URLs; the REST one carries a
 * `/rest/v1` suffix that supabase-js must not receive. Normalise here so a
 * copy-paste of the wrong URL cannot break every client at once.
 */
const supabaseUrl = z
  .string()
  .url()
  .transform((value) => value.replace(/\/+$/, "").replace(/\/rest\/v1$/, ""));

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url()
    .default("http://localhost:3000")
    .transform((value) => value.replace(/\/+$/, "")),
});

export const publicEnv = publicSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

export const siteUrl = publicEnv.NEXT_PUBLIC_SITE_URL;
