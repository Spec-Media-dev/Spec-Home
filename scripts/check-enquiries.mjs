import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkEnquiries() {
  const { data, error } = await supabase.from("enquiries").select("id, name, email, status, created_at");
  if (error) {
    console.error("Error fetching enquiries:", error);
  } else {
    console.log("Total enquiries in DB:", data.length);
    console.log("Statuses breakdown:", data.map((e) => ({ id: e.id.slice(0, 8), name: e.name, status: e.status })));
    const newCount = data.filter((e) => (e.status || "").toLowerCase() === "new").length;
    console.log("Count with status === 'new':", newCount);
  }
}

checkEnquiries();
