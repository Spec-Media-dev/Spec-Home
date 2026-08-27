import "server-only";

import { z } from "zod";

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  TURNSTILE_SECRET_KEY: z.string().optional(),
  INDEXNOW_KEY: z.string().optional(),
  /**
   * Shared secret for the Supabase Database Webhook. Optional so local
   * development runs without it; the endpoint refuses to serve while it is
   * unset rather than falling back to an unauthenticated mode. A short value
   * is rejected outright so a placeholder cannot become a live credential.
   */
  SUPABASE_WEBHOOK_SECRET: z.string().min(32).optional(),
});

export const serverEnv = serverSchema.parse({
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
  INDEXNOW_KEY: process.env.INDEXNOW_KEY,
  SUPABASE_WEBHOOK_SECRET: process.env.SUPABASE_WEBHOOK_SECRET,
});
