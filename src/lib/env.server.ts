import "server-only";

import { z } from "zod";

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  TURNSTILE_SECRET_KEY: z.string().optional(),
  INDEXNOW_KEY: z.string().optional(),
});

export const serverEnv = serverSchema.parse({
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
  INDEXNOW_KEY: process.env.INDEXNOW_KEY,
});
