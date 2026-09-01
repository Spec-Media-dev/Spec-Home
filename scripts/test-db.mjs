import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  console.log(`\n🔍 Testing Database Connection to: ${supabaseUrl}\n`);
  
  try {
    const { data: projects, error: projectsError } = await supabase.from('projects').select('*').limit(1);
    if (projectsError) throw projectsError;
    console.log("✅ Successfully connected to Supabase and queried 'projects' table.");
    
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) throw usersError;
    console.log(`✅ Successfully queried Auth users. Found ${users.users.length} users.`);

    console.log("\n🎉 Database connection is working perfectly!");
  } catch (error) {
    console.error("❌ Database connection test failed:");
    console.error(error);
  }
}

main();
