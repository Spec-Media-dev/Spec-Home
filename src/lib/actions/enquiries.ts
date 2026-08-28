"use server";

import { headers } from "next/headers";

import { updateDatasets } from "@/lib/cache/freshness";
import { clientIpFromHeaders } from "@/lib/client-ip";
import { pruneRateLimits, rateLimit } from "@/lib/rate-limit";
import { requireAdminAction } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { ENQUIRY_STATUSES, type EnquiryStatus } from "@/lib/supabase/types";
import { enquirySchema } from "@/lib/validations/enquiry";
import { isUuid } from "@/lib/validations/id";

export type EnquiryActionResult =
  | { ok: true }
  | { ok: false; error: "validation" | "rateLimited" | "generic" };

/**
 * Five submissions per IP per ten minutes. Generous for the one or two
 * enquiries a real visitor sends, restrictive enough that a scripted flood
 * stops being useful. Module-local rather than exported: a `"use server"`
 * module may only export async functions.
 */
const ENQUIRY_RATE_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 } as const;

/**
 * Enquiries are lead data. The dataset maps to no cache tags — admin reads are
 * uncached by design — and it is never announced on the public channel, so the
 * only effect here is dropping the admin paths and notifying signed-in admins
 * that their inbox moved on. No part of the enquiry itself is transmitted.
 */
async function refreshEnquiries(extraPaths: string[] = []) {
  await updateDatasets(["enquiries"], {
    paths: ["/dashboard-admin/enquiries", "/dashboard-admin", ...extraPaths],
  });
}

async function clientIp(): Promise<string> {
  const headerList = await headers();
  return clientIpFromHeaders((name) => headerList.get(name));
}

/**
 * Public enquiry submission.
 *
 * There is deliberately no CAPTCHA. The defence is layered instead: a honeypot
 * that costs a real visitor nothing, a per-IP rate limit, strict schema
 * validation, and verification of every client-supplied relation against real
 * published rows.
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
  // gains no signal, but write nothing — and return before the rate limiter,
  // so bot traffic cannot consume a real visitor's allowance.
  if (input.company) return { ok: true };

  const ip = await clientIp();
  pruneRateLimits();
  const limit = rateLimit(
    `enquiry:${ip}`,
    ENQUIRY_RATE_LIMIT.limit,
    ENQUIRY_RATE_LIMIT.windowMs,
  );
  if (!limit.allowed) return { ok: false, error: "rateLimited" };

  const supabase = createServiceClient();

  // Client-supplied relations are verified against real published rows rather
  // than trusted, since RLS is not protecting this write.
  let projectId: string | null = null;
  let propertyId: string | null = null;

  if (input.propertyId) {
    const { data } = await supabase
      .from("properties")
      .select("id, project_id, projects!inner(is_published)")
      .eq("id", input.propertyId)
      .eq("is_published", true)
      .eq("projects.is_published", true)
      .maybeSingle();
    if (!data) return { ok: false, error: "validation" };
    propertyId = data.id;
    projectId = data.project_id;
  }

  if (input.projectId && projectId && input.projectId !== projectId) {
    return { ok: false, error: "validation" };
  }

  if (!projectId && input.projectId) {
    const { data } = await supabase
      .from("projects")
      .select("id")
      .eq("id", input.projectId)
      .eq("is_published", true)
      .maybeSingle();
    if (!data) return { ok: false, error: "validation" };
    projectId = data.id;
  }

  const { error } = await supabase.from("enquiries").insert({
    name: input.name,
    email: input.email,
    phone: input.phone ? input.phone : null,
    message: input.message,
    project_id: projectId,
    property_id: propertyId,
    // System-controlled. The schema is `.strict()`, so a client that tries to
    // send its own `status` is rejected outright rather than overridden here.
    status: "new",
  });

  if (error) {
    // Logged server-side only; the visitor gets a generic message so a
    // database detail never reaches the browser.
    console.error("submitEnquiry failed", error);
    return { ok: false, error: "generic" };
  }

  await refreshEnquiries();
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

  if (!isUuid(id) || !ENQUIRY_STATUSES.includes(status as EnquiryStatus)) {
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

  await refreshEnquiries([`/dashboard-admin/enquiries/${id}`]);
  return { ok: true };
}

export async function deleteEnquiry(id: string): Promise<AdminEnquiryResult> {
  try {
    await requireAdminAction();
  } catch {
    return { ok: false, error: "unauthorized" };
  }
  if (!isUuid(id)) return { ok: false, error: "validation" };

  const supabase = await createClient();
  const { error } = await supabase.from("enquiries").delete().eq("id", id);

  if (error) {
    console.error("deleteEnquiry failed", error);
    return { ok: false, error: "generic" };
  }

  await refreshEnquiries();
  return { ok: true };
}
