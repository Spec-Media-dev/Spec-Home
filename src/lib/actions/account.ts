"use server";

import { requireAdminAction } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type PasswordResult =
  | { ok: true }
  | { ok: false; error: "unauthorized" | "validation" | "wrongPassword" | "generic" };

/**
 * Passwords live only in Supabase Auth — `admin_profiles` has no password
 * column and must never gain one.
 *
 * The current password is re-verified first: `updateUser` alone would let a
 * stolen session change the password without knowing the old one.
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<PasswordResult> {
  let session;
  try {
    session = await requireAdminAction();
  } catch {
    return { ok: false, error: "unauthorized" };
  }

  if (newPassword.length < 8 || newPassword.length > 200) {
    return { ok: false, error: "validation" };
  }

  const supabase = await createClient();

  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: session.email,
    password: currentPassword,
  });

  if (reauthError) return { ok: false, error: "wrongPassword" };

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    console.error("[changePassword]", error);
    return { ok: false, error: "generic" };
  }

  return { ok: true };
}
