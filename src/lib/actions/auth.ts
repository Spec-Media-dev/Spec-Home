"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { pruneRateLimits, rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { ADMIN_LOGIN_PATH } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type SignInResult =
  | { ok: true }
  | { ok: false; error: "invalid" | "notAdmin" | "rateLimited" };

/**
 * Signing in is not the same as being an admin: after authentication we still
 * require a matching `admin_profiles` row, and sign the user straight back out
 * if there isn't one.
 */
export async function signIn(
  email: string,
  password: string,
): Promise<SignInResult> {
  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerList.get("x-real-ip") ??
    "unknown";

  pruneRateLimits();
  if (!rateLimit(`login:${ip}`, 10, 15 * 60 * 1000).allowed) {
    return { ok: false, error: "rateLimited" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // Deliberately generic: never reveal whether the address exists.
  if (error || !data.user) return { ok: false, error: "invalid" };

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("id")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile) {
    await supabase.auth.signOut();
    return { ok: false, error: "notAdmin" };
  }

  revalidatePath("/dashboard-admin", "layout");
  return { ok: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/dashboard-admin", "layout");
  redirect(ADMIN_LOGIN_PATH);
}
