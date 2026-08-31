"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { EnquiryRow } from "@/lib/supabase/types";
import { z } from "zod";

function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

// Strict Zod schema — extra keys cause validation failure
const enquirySchema = z
  .object({
    name: z.string().min(1, "Name is required").max(200),
    email: z.string().email("Valid email is required"),
    phone: z.string().min(1, "Phone is required").max(30),
    message: z.string().min(1, "Message is required").max(5000),
    project_id: z.string().uuid().optional().nullable(),
    property_id: z.string().uuid().optional().nullable(),
    company: z.string().optional(), // Honeypot field
  })
  .strict();

// Simple in-memory rate limiting (per server instance)
const rateMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes
  const maxRequests = 5;

  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

export interface EnquiryResult {
  success: boolean;
  error?: string;
}

/**
 * Submit a public enquiry.
 * Implements all LOGIC_REPORT defenses:
 * - Honeypot (company field) silently discards bots
 * - Rate limiting (5 per 10 minutes per IP)
 * - Strict Zod validation (extra keys rejected)
 * - Service-role insert (no public INSERT on enquiries)
 * - Forces status = 'new' server-side
 */
export async function submitEnquiry(
  formData: Record<string, unknown>,
  clientIp?: string
): Promise<EnquiryResult> {
  // Honeypot check — if company field is filled, silently succeed
  if (formData.company && String(formData.company).trim().length > 0) {
    return { success: true };
  }

  // Rate limit check
  const ip = clientIp || "unknown";
  if (!checkRateLimit(ip)) {
    return { success: false, error: "Too many submissions. Please try again later." };
  }

  // Strict Zod validation
  const parsed = enquirySchema.safeParse(formData);
  if (!parsed.success) {
    const firstError = parsed.error.issues?.[0]?.message ?? "Invalid form data";
    return { success: false, error: firstError };
  }

  if (!isSupabaseConfigured()) {
    // Demo mode: just return success
    return { success: true };
  }

  try {
    const supabase = createAdminClient();

    const { error } = await supabase.from("enquiries").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      message: parsed.data.message,
      project_id: parsed.data.project_id ?? null,
      property_id: parsed.data.property_id ?? null,
      status: "new", // Enforced server-side
      notes: null,
    } as any);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    console.error("[submitEnquiry]", err);
    return { success: false, error: "Failed to submit enquiry" };
  }
}

/**
 * Update enquiry status (admin action).
 */
export async function updateEnquiryStatus(
  id: string,
  status: EnquiryRow["status"]
): Promise<EnquiryResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("enquiries")
      .update({ status } as any)
      .eq("id", id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    console.error("[updateEnquiryStatus]", err);
    return { success: false, error: "Failed to update status" };
  }
}

/**
 * Add admin notes to an enquiry.
 */
export async function addEnquiryNote(
  id: string,
  note: string
): Promise<EnquiryResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("enquiries")
      .update({ notes: note } as any)
      .eq("id", id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    console.error("[addEnquiryNote]", err);
    return { success: false, error: "Failed to add note" };
  }
}

/**
 * Fetch all enquiries (admin).
 */
export async function getEnquiries(): Promise<EnquiryRow[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[getEnquiries]", error.message);
      return [];
    }
    return (data as EnquiryRow[]) ?? [];
  } catch (err) {
    console.error("[getEnquiries]", err);
    return [];
  }
}
