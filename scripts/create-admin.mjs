#!/usr/bin/env node

/**
 * Admin Provisioning CLI
 * 
 * Usage:
 *   npm run seed:admin
 *   node scripts/create-admin.mjs <email> <password> <full_name>
 * 
 * Default credentials: admin@spechome.com / AdminPassword123!
 */

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

const email = process.argv[2] || "admin@spechome.com";
const password = process.argv[3] || "AdminPassword123!";
const fullName = process.argv[4] || "SPEC Admin";

async function main() {
  console.log(`\n🔧 Admin Provisioning`);
  console.log(`   Email:     ${email}`);
  console.log(`   Full Name: ${fullName}\n`);

  // 1. Check if user exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingUser = existingUsers?.users?.find((u) => u.email === email);

  let userId;

  if (existingUser) {
    console.log(`✅ User already exists (${existingUser.id}). Updating password...`);
    const { error } = await supabase.auth.admin.updateUserById(existingUser.id, {
      password,
      email_confirm: true,
    });
    if (error) {
      console.error("❌ Failed to update user:", error.message);
      process.exit(1);
    }
    userId = existingUser.id;
  } else {
    console.log("📝 Creating new auth user...");
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) {
      console.error("❌ Failed to create user:", error.message);
      process.exit(1);
    }
    userId = data.user.id;
    console.log(`✅ User created (${userId})`);
  }

  // 2. Ensure admin_profiles row
  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("id")
    .eq("id", userId)
    .single();

  if (!profile) {
    console.log("📝 Inserting admin_profiles row...");
    const { error } = await supabase.from("admin_profiles").insert({
      id: userId,
      full_name: fullName,
    });
    if (error) {
      console.error("❌ Failed to insert admin profile:", error.message);
      process.exit(1);
    }
    console.log("✅ Admin profile created.");
  } else {
    console.log("✅ Admin profile already exists.");
  }

  console.log("\n🎉 Admin provisioned successfully!");
  console.log(`   Login at: ${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard-admin/login\n`);
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
});
