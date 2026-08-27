"use server";

import { requireAdminAction } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

export type PasswordResult =
  | { ok: true }
  | { ok: false; error: "unauthorized" | "validation" | "wrongPassword" | "generic" };

export type EmailResult =
  | { ok: true; status: "confirmationSent" | "updated" }
  | {
      ok: false;
      error:
        | "unauthorized"
        | "invalidEmail"
        | "emailMismatch"
        | "sameEmail"
        | "rateLimited"
        | "generic";
    };

const emailSchema = z.string().trim().max(254).pipe(z.email());

/**
 * Starts Supabase Auth's normal email-change flow for the signed-in user. With
 * Secure Email Change enabled, Supabase confirms both the current and new
 * addresses before replacing the address on the same Auth UID.
 */
export async function changeEmail(
  newEmailInput: string,
  confirmEmailInput: string,
): Promise<EmailResult> {
  let session;
  try {
    session = await requireAdminAction();
  } catch {
    return { ok: false, error: "unauthorized" };
  }

  const parsed = emailSchema.safeParse(newEmailInput);
  const confirmed = emailSchema.safeParse(confirmEmailInput);
  if (!parsed.success || !confirmed.success) {
    return { ok: false, error: "invalidEmail" };
  }

  const newEmail = parsed.data.toLowerCase();
  if (newEmail !== confirmed.data.toLowerCase()) {
    return { ok: false, error: "emailMismatch" };
  }
  if (newEmail === session.email.trim().toLowerCase()) {
    return { ok: false, error: "sameEmail" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.updateUser({ email: newEmail });

  if (error) {
    if (error.status === 429) return { ok: false, error: "rateLimited" };
    console.error("[changeEmail]", { status: error.status, code: error.code });
    return { ok: false, error: "generic" };
  }

  return {
    ok: true,
    status:
      data.user.email?.toLowerCase() === newEmail
        ? "updated"
        : "confirmationSent",
  };
}

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
