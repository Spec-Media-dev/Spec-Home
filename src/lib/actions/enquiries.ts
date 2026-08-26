"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { serverEnv } from "@/lib/env.server";
import { pruneRateLimits, rateLimit } from "@/lib/rate-limit";
import { requireAdminAction } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { ENQUIRY_STATUSES, type EnquiryStatus } from "@/lib/supabase/types";
import { enquirySchema } from "@/lib/validations/enquiry";

export type EnquiryActionResult =
  | { ok: true }
  | {
      ok: false;
      error: "validation" | "rateLimited" | "verification" | "generic";
    };

async function clientIp(): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() || headerList.get("x-real-ip") || "unknown"
  );
}

async function verifyTurnstile(token: string | undefined): Promise<boolean> {
  // Optional by design: without a configured secret the honeypot and rate
  // limit remain the active defences.
  if (!serverEnv.TURNSTILE_SECRET_KEY) return true;
  if (!token) return false;

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: serverEnv.TURNSTILE_SECRET_KEY,
          response: token,
        }),
      },
    );
    const result = (await response.json()) as { success?: boolean };
    return result.success === true;
  } catch {
    return false;
  }
}

/**
 * Public enquiry submission.
 *
 * The database intentionally grants `anon` no INSERT on `enquiries`, so this
 * runs through the service-role client, which bypasses RLS entirely. That makes
 * this function the only trust boundary: every field written here is either
 * validated or system-controlled, and `status` is forced server-side so a
 * visitor cannot submit an already-closed lead.
 */
export async function submitEnquiry(raw: unknown): Promise<EnquiryActionResult> {
  const parsed = enquirySchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "validation" };

  const input = parsed.data;

  // Honeypot: a populated hidden field means a bot. Report success so the bot
  // gains no signal, but write nothing.
  if (input.company) return { ok: true };

  const ip = await clientIp();
  pruneRateLimits();
  const limit = rateLimit(`enquiry:${ip}`, 5, 10 * 60 * 1000);
  if (!limit.allowed) return { ok: false, error: "rateLimited" };

  if (!(await verifyTurnstile(input.turnstileToken))) {
    return { ok: false, error: "verification" };
  }

  const supabase = createServiceClient();

  // Client-supplied relations are verified against real published rows rather
  // than trusted, since RLS is not protecting this write.
  let projectId: string | null = null;
  let propertyId: string | null = null;

  if (input.propertyId) {
    const { data } = await supabase
      .from("properties")
      .select("id, project_id")
      .eq("id", input.propertyId)
      .eq("is_published", true)
      .maybeSingle();
    if (data) {
      propertyId = data.id;
      projectId = data.project_id;
    }
  }

  if (!projectId && input.projectId) {
    const { data } = await supabase
      .from("projects")
      .select("id")
      .eq("id", input.projectId)
      .eq("is_published", true)
      .maybeSingle();
    if (data) projectId = data.id;
  }

  const { error } = await supabase.from("enquiries").insert({
    name: input.name,
    email: input.email,
    phone: input.phone ? input.phone : null,
    message: input.message,
    project_id: projectId,
    property_id: propertyId,
    status: "new",
  });

  if (error) {
    console.error("submitEnquiry failed", error);
    return { ok: false, error: "generic" };
  }

  revalidatePath("/dashboard-admin/enquiries");
  return { ok: true };
}

export type AdminEnquiryResult =
  | { ok: true }
  | { ok: false; error: "unauthorized" | "validation" | "generic" };

/** Admin-side status transition. Re-checks authorization independently. */
export async function updateEnquiryStatus(
  id: string,
  status: string,
): Promise<AdminEnquiryResult> {
  try {
    await requireAdminAction();
  } catch {
    return { ok: false, error: "unauthorized" };
  }

  if (!ENQUIRY_STATUSES.includes(status as EnquiryStatus)) {
    return { ok: false, error: "validation" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("enquiries")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("updateEnquiryStatus failed", error);
    return { ok: false, error: "generic" };
  }

  revalidatePath("/dashboard-admin/enquiries");
  revalidatePath(`/dashboard-admin/enquiries/${id}`);
  return { ok: true };
}

export async function deleteEnquiry(id: string): Promise<AdminEnquiryResult> {
  try {
    await requireAdminAction();
  } catch {
    return { ok: false, error: "unauthorized" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("enquiries").delete().eq("id", id);

  if (error) {
    console.error("deleteEnquiry failed", error);
    return { ok: false, error: "generic" };
  }

  revalidatePath("/dashboard-admin/enquiries");
  return { ok: true };
}
