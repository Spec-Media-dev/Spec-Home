import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testFullDashboard() {
  const [
    projectsRes,
    propertiesRes,
    imagesRes,
    specsRes,
    adminsRes,
    enquiriesRes,
    settingsRes,
    seoRes,
    pageSeoRes,
  ] = await Promise.all([
    supabase.from("projects").select("*").order("created_at", { ascending: false }),
    supabase.from("properties").select("*").order("created_at", { ascending: false }),
    supabase.from("property_images").select("*").order("display_order", { ascending: true }),
    supabase.from("property_specs").select("*").order("created_at", { ascending: true }),
    supabase.from("admin_profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("enquiries").select("*").order("created_at", { ascending: false }),
    supabase.from("site_settings").select("*").limit(1).maybeSingle(),
    supabase.from("seo_settings").select("*").limit(1).maybeSingle(),
    supabase.from("page_seo").select("*").order("page_slug", { ascending: true }),
  ]);

  console.log("projects:", projectsRes.data?.length, "error:", projectsRes.error?.message);
  console.log("properties:", propertiesRes.data?.length, "error:", propertiesRes.error?.message);
  console.log("images:", imagesRes.data?.length, "error:", imagesRes.error?.message);
  console.log("specs:", specsRes.data?.length, "error:", specsRes.error?.message);
  console.log("admins:", adminsRes.data?.length, "error:", adminsRes.error?.message);
  console.log("enquiries:", enquiriesRes.data?.length, "error:", enquiriesRes.error?.message);
  console.log("settings:", settingsRes.data ? "found" : "null", "error:", settingsRes.error?.message);
  console.log("seoSettings:", seoRes.data ? "found" : "null", "error:", seoRes.error?.message);
  console.log("pageSeo:", pageSeoRes.data?.length, "error:", pageSeoRes.error?.message);
}

testFullDashboard();
