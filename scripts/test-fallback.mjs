import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testWithFallback() {
  console.log("Testing fallback retry logic on real database...");
  const settings = {
    brand_name_en: "SPEC Home Dubai",
    brand_name_ar: "سبيك هوم دبي",
    tagline_en: "The Pinnacle of Dubai Luxury Real Estate",
    tagline_ar: "قمة العقارات الفاخرة في دبي",
    contact_email: "concierge@spechome.com",
    contact_phone: "+971 4 800 7732",
    whatsapp_number: "+971 50 999 8888",
    office_address_en: "Level 42, Al Saada Tower, Downtown Dubai, UAE",
    office_address_ar: "الطابق 42، برج السعادة، وسط مدينة دبي، الإمارات",
    instagram_url: "https://instagram.com/spechomedubai",
    linkedin_url: "https://linkedin.com/company/spechomedubai",
    youtube_url: "https://youtube.com/@spechomedubai",
    maintenance_mode: false,
    announcement_en: "Private Previews Available for Q4 2026 Signature Collections",
    announcement_ar: "معاينات خاصة متاحة لمجموعات الربع الرابع 2026 الحصرية",
  };

  const { data: existing } = await supabase.from("site_settings").select("key").limit(1).maybeSingle();
  const key = existing?.key || "general";

  let payload = { key, ...settings, updated_at: new Date().toISOString() };

  let { data, error } = await supabase.from("site_settings").upsert(payload, { onConflict: "key" }).select().single();

  if (error && error.message && error.message.includes("in the schema cache")) {
    console.log("Caught schema cache error:", error.message);
    let currentError = error;
    let retries = 0;
    while (
      currentError &&
      currentError.message &&
      currentError.message.includes("in the schema cache") &&
      retries < 15
    ) {
      retries++;
      const match = currentError.message.match(/Could not find the '([^']+)' column/);
      if (match && match[1]) {
        console.log(`[Retry ${retries}] Stripping unsupported column:`, match[1]);
        delete payload[match[1]];
        const retryRes = await supabase
          .from("site_settings")
          .upsert(payload, { onConflict: "key" })
          .select()
          .single();
        currentError = retryRes.error;
        data = retryRes.data;
      } else {
        break;
      }
    }
    error = currentError;
  }

  if (error) {
    console.error("❌ Final error:", error.message);
  } else {
    console.log("✅ Successfully saved with resilient fallback! Saved keys in DB:", Object.keys(data));
  }
}

testWithFallback();
