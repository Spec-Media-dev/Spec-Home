import "server-only";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { AdminProfile } from "@/lib/supabase/types";

export const ADMIN_LOGIN_PATH = "/dashboard-admin/login";

export type AdminSession = {
  userId: string;
  email: string;
  profile: AdminProfile;
};

/**
 * Resolves the admin session or returns null.
 *
 * Uses `getUser()` rather than `getSession()`: `getSession()` only decodes a
 * client-supplied cookie locally, so it can be forged. `getUser()` validates
 * the token against the Auth server. Being authenticated is also not enough —
 * a matching `admin_profiles` row is required, and that table has no INSERT
 * policy, so nobody can grant themselves one.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return null;

  return { userId: user.id, email: user.email ?? "", profile };
}

/** For layouts and pages: redirects when the caller is not an admin. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect(ADMIN_LOGIN_PATH);
  return session;
}

export class NotAuthorizedError extends Error {
  constructor() {
    super("NOT_AUTHORIZED");
    this.name = "NotAuthorizedError";
  }
}

/**
 * For Server Actions. Actions are independently addressable HTTP endpoints and
 * never pass through the layout tree, so each one must re-check authorization
 * rather than trusting that a protected layout ran.
 */
export async function requireAdminAction(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) throw new NotAuthorizedError();
  return session;
}
