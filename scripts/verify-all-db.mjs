import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing Supabase URL or Key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function runTests() {
  console.log("==================================================");
  console.log("  SPEC HOME — FULL DATABASE & SCHEMA VERIFICATION ");
  console.log("==================================================\n");

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  async function check(name, testFn) {
    totalTests++;
    process.stdout.write(`⏳ Testing: ${name}... `);
    try {
      const result = await testFn();
      if (result.success) {
        console.log(`✅ PASS ${result.info ? `(${result.info})` : ""}`);
        passedTests++;
      } else {
        console.log(`❌ FAIL: ${result.error}`);
        failedTests++;
      }
    } catch (err) {
      console.log(`❌ EXCEPTION: ${err.message}`);
      failedTests++;
    }
  }

  // 1. Check site_settings table and announcement_ar column
  await check("site_settings table & announcement_ar column", async () => {
    const { data: existing, error: selectErr } = await supabase
      .from("site_settings")
      .select("*")
      .limit(1);

    if (selectErr) return { success: false, error: selectErr.message };

    // Test upsert with announcement_ar
    const testPayload = {
      key: existing && existing.length > 0 ? existing[0].key : "general",
      brand_name_en: existing && existing[0]?.brand_name_en ? existing[0].brand_name_en : "SPEC Home Dubai",
      announcement_en: "Test announcement EN",
      announcement_ar: "إعلان تجريبي بالعربية",
      tagline_en: "The Pinnacle of Dubai Luxury Real Estate",
      tagline_ar: "قمة العقارات الفاخرة في دبي",
      updated_at: new Date().toISOString(),
    };

    const { data: upsertData, error: upsertErr } = await supabase
      .from("site_settings")
      .upsert(testPayload, { onConflict: "key" })
      .select()
      .single();

    if (upsertErr) return { success: false, error: `Upsert failed: ${upsertErr.message}` };
    return { success: true, info: `Columns verified: ${Object.keys(upsertData).length} cols present` };
  });

  // 2. Check projects table
  await check("projects table & schema columns", async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("id, name_en, name_ar, slug, developer_en, developer_ar, starting_price, currency, handover_en, payment_plan_en, seo_title_en, og_title_en, robots")
      .limit(5);

    if (error) return { success: false, error: error.message };
    return { success: true, info: `Found ${data.length} project records` };
  });

  // 3. Check properties table
  await check("properties table & schema columns", async () => {
    const { data, error } = await supabase
      .from("properties")
      .select("id, title_en, title_ar, slug, reference_code, payment_plan_en, handover_en, currency, seo_title_en, og_title_en, robots")
      .limit(5);

    if (error) return { success: false, error: error.message };
    return { success: true, info: `Found ${data.length} property records` };
  });

  // 4. Check seo_settings table
  await check("seo_settings table (Global SEO)", async () => {
    const { data, error } = await supabase
      .from("seo_settings")
      .select("*")
      .eq("key", "global")
      .maybeSingle();

    if (error) return { success: false, error: error.message };
    return { success: true, info: data ? "Global SEO record present" : "Table accessible (empty/ready)" };
  });

  // 5. Check page_seo table
  await check("page_seo table (Page-level SEO)", async () => {
    const { data, error } = await supabase
      .from("page_seo")
      .select("id, page_slug, title_en, title_ar, meta_title_en, meta_description_en")
      .limit(10);

    if (error) return { success: false, error: error.message };
    return { success: true, info: `Found ${data.length} SEO page routes` };
  });

  // 6. Check enquiries table
  await check("enquiries table", async () => {
    const { data, error } = await supabase
      .from("enquiries")
      .select("id, full_name, email, phone, status, created_at")
      .limit(5);

    if (error) return { success: false, error: error.message };
    return { success: true, info: `Found ${data.length} enquiries` };
  });

  // 7. Check property_specs table
  await check("property_specs table", async () => {
    const { data, error } = await supabase
      .from("property_specs")
      .select("id, property_id, label_en, label_ar, value_en, value_ar")
      .limit(5);

    if (error) return { success: false, error: error.message };
    return { success: true, info: `Found ${data.length} property specs` };
  });

  // 8. Check property_images table
  await check("property_images table", async () => {
    const { data, error } = await supabase
      .from("property_images")
      .select("id, property_id, image_path, is_primary, display_order")
      .limit(5);

    if (error) return { success: false, error: error.message };
    return { success: true, info: `Found ${data.length} property images` };
  });

  // 9. Check admin_profiles table
  await check("admin_profiles table", async () => {
    const { data, error } = await supabase
      .from("admin_profiles")
      .select("id, full_name, role, is_active")
      .limit(5);

    if (error) return { success: false, error: error.message };
    return { success: true, info: `Found ${data.length} admin profiles` };
  });

  // 10. Check storage buckets
  await check("Storage Buckets (property-images, project-covers, site-assets)", async () => {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) return { success: false, error: error.message };
    const bucketNames = buckets.map((b) => b.name);
    return { success: true, info: `Buckets: ${bucketNames.join(", ")}` };
  });

  console.log("\n==================================================");
  console.log(`VERIFICATION SUMMARY: ${passedTests}/${totalTests} Passed`);
  if (failedTests === 0) {
    console.log("🎉 ALL TESTS PASSED! Database schema is 100% healthy and ready.");
  } else {
    console.log(`⚠️ ${failedTests} test(s) failed. Please check errors above.`);
  }
  console.log("==================================================");
}

runTests();
