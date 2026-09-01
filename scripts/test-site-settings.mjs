import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testFullSiteSettingsSave() {
  console.log("Simulating full site settings form submission...");
  const formPayload = {
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
    logo_path: null,
    hero_image_path: null,
  };

  const { data: existing } = await supabase.from("site_settings").select("key").limit(1).maybeSingle();
  const key = existing?.key || "general";

  let payload = { key, ...formPayload, updated_at: new Date().toISOString() };

  let { data, error } = await supabase.from("site_settings").upsert(payload, { onConflict: "key" }).select().single();

  if (error) {
    console.log("❌ Initial save failed with:", error.message);
  } else {
    console.log("✅ Initial save succeeded! Saved keys:", Object.keys(data));
  }
}

testFullSiteSettingsSave();
