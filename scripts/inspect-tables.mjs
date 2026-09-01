import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function inspectTables() {
  const tables = [
    "site_settings",
    "projects",
    "properties",
    "enquiries",
    "property_specs",
    "property_images",
    "admin_profiles",
    "seo_settings",
    "page_seo"
  ];

  for (const t of tables) {
    const { data, error } = await supabase.from(t).select("*").limit(1);
    if (error) {
      console.log(`❌ Table [${t}]: ${error.message}`);
    } else {
      console.log(`✅ Table [${t}]: exists. Sample row keys:`, data[0] ? Object.keys(data[0]) : "(empty table)");
    }
  }
}

inspectTables();
