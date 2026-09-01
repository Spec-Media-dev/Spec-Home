import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  const { data, error } = await supabase.from("admin_profiles").select("*").limit(1);
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Columns in admin_profiles:");
    if (data.length > 0) {
      console.log(Object.keys(data[0]));
    } else {
      console.log("No data, inserting a dummy to check columns...");
    }
  }
}
main();
