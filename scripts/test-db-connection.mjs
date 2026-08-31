import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env.local');

const env = {};
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      env[key] = val;
    }
  }
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

console.log('=== Supabase Connection Test ===');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? `${supabaseKey.slice(0, 15)}...` : 'MISSING');
console.log('Service Role Key:', serviceRoleKey ? 'PRESENT' : 'EMPTY');

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('\n1. Checking `projects` table...');
  const { data: projects, error: pErr } = await supabase.from('projects').select('*').limit(3);
  if (pErr) {
    console.log('❌ Projects Error:', pErr.message);
  } else {
    console.log('✅ Projects accessible! Count:', projects?.length);
  }

  console.log('\n2. Checking `properties` table...');
  const { data: properties, error: prErr } = await supabase.from('properties').select('*').limit(3);
  if (prErr) {
    console.log('❌ Properties Error:', prErr.message);
  } else {
    console.log('✅ Properties accessible! Count:', properties?.length);
  }

  console.log('\n3. Checking `site_settings` table...');
  const { data: settings, error: sErr } = await supabase.from('site_settings').select('*').limit(1);
  if (sErr) {
    console.log('❌ Site Settings Error:', sErr.message);
  } else {
    console.log('✅ Site Settings accessible! Data:', settings);
  }
}

run();
