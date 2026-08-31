"use server";

import { createBrowserClient } from "@/lib/supabase/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export interface AuthResult {
  success: boolean;
  error?: string;
}

/**
 * Log in as an admin.
 * Validates credentials, then checks is_admin() — existence in admin_profiles table.
 */
export async function loginAdmin(email: string, password: string): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    // Fallback: accept hardcoded demo credentials when Supabase isn't configured
    if (email === "admin@spechome.com" && password === "admin123") {
      const cookieStore = await cookies();
      cookieStore.set("admin_session", "demo-session", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
      });
      return { success: true };
    }
    return { success: false, error: "Invalid credentials" };
  }

  try {
    const adminClient = createAdminClient();

    // Authenticate via Supabase Auth
    const { data: authData, error: authError } =
      await adminClient.auth.signInWithPassword({ email, password });

    if (authError || !authData.user) {
      return { success: false, error: authError?.message ?? "Authentication failed" };
    }

    // Check admin_profiles table — is_admin() equivalent
    const { data: profile, error: profileError } = await adminClient
      .from("admin_profiles")
      .select("id")
      .eq("id", authData.user.id)
      .single();

    if (profileError || !profile) {
      return { success: false, error: "You do not have administrator privileges." };
    }

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_session", authData.session?.access_token ?? authData.user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return { success: true };
  } catch (err) {
    console.error("[loginAdmin]", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Log out the current admin by clearing the session cookie.
 */
export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
}

/**
 * Check if the current request has a valid admin session.
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  return !!session?.value;
}
