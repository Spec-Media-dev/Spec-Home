"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { EnquiryRow } from "@/lib/supabase/types";
import { z } from "zod";

function isSupabaseConfigured(): boolean {
  return !!(
    (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    (process.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
  );
}

// Strict Zod schema
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
  const maxRequests = 15;

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
  data?: EnquiryRow;
}

/**
 * Submit a public enquiry.
 */
export async function submitEnquiry(
  formData: Record<string, unknown>,
  clientIp?: string
): Promise<EnquiryResult> {
  // Honeypot check
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
    return { success: true };
  }

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("enquiries")
      .insert({
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        message: parsed.data.message,
        project_id: parsed.data.project_id ?? null,
        property_id: parsed.data.property_id ?? null,
        status: "new",
      } as any)
      .select()
      .single();

    if (error) {
      console.error("[submitEnquiry] Insert error:", error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data: data as EnquiryRow };
  } catch (err: any) {
    console.error("[submitEnquiry]", err);
    return { success: false, error: err?.message || "Failed to submit enquiry" };
  }
}

/**
 * Update enquiry status (admin action via service role).
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
    const { data, error } = await supabase
      .from("enquiries")
      .update({ status } as any)
      .eq("id", id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as EnquiryRow };
  } catch (err: any) {
    console.error("[updateEnquiryStatus]", err);
    return { success: false, error: err?.message || "Failed to update status" };
  }
}

/**
 * Delete an enquiry (admin action via service role).
 */
export async function deleteEnquiry(id: string): Promise<EnquiryResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("enquiries").delete().eq("id", id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    console.error("[deleteEnquiry]", err);
    return { success: false, error: err?.message || "Failed to delete enquiry" };
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
