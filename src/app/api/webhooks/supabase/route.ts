import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import crypto from "crypto";

/**
 * Supabase Database Webhook handler for cache revalidation.
 * Validates the webhook secret, then revalidates the appropriate cache tag.
 */
export async function POST(request: Request) {
  try {
    const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET;

    // Validate signature if secret is configured
    if (webhookSecret) {
      const signature = request.headers.get("x-supabase-signature");
      if (!signature) {
        return NextResponse.json({ error: "Missing signature" }, { status: 401 });
      }

      const body = await request.text();
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(body)
        .digest("hex");

      if (signature !== expectedSignature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }

      // Re-parse the body since we consumed it
      const payload = JSON.parse(body);
      await handleRevalidation(payload);
    } else {
      const payload = await request.json();
      await handleRevalidation(payload);
    }

    return NextResponse.json({ revalidated: true });
  } catch (err) {
    console.error("[Webhook]", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

async function handleRevalidation(payload: { table?: string; [key: string]: unknown }) {
  const table = payload.table;

  const tagMap: Record<string, string> = {
    projects: "projects",
    properties: "properties",
    property_images: "properties",
    property_specs: "properties",
    site_settings: "site-settings",
    enquiries: "enquiries",
  };

  const tag = table ? tagMap[table] : undefined;

  if (tag) {
    try {
      (revalidateTag as any)(tag, { expire: 0 });
    } catch {
      try {
        (revalidateTag as any)(tag);
      } catch (e) {
        console.error("Failed to revalidate tag:", e);
      }
    }
    console.log(`[Webhook] Revalidated tag: ${tag} (table: ${table})`);
  }
}
