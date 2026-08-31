-- ==============================================================================
-- SPEC HOME — COMPLETE SUPABASE DATABASE SCHEMA & RLS SETUP
-- Paste this entire script into your Supabase SQL Editor and click "Run".
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. HELPER FUNCTIONS
-- Updated at auto-trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 3. TABLES DEFINITIONS

-- 3.1 Admin Profiles (linked to Supabase auth.users)
create table if not exists public.admin_profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_path text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Admin verification function (Security Definer)
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.admin_profiles
    where id = auth.uid()
  );
end;
$$ language plpgsql security definer;

-- 3.2 Projects (Master Developments)
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_en text not null,
  name_ar text not null,
  description_en text,
  description_ar text,
  location_en text,
  location_ar text,
  cover_image_path text,
  is_published boolean default false not null,
  is_featured boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 3.3 Properties (Individual Units / Listings)
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade not null,
  slug text unique not null,
  reference_code text unique not null,
  title_en text not null,
  title_ar text not null,
  description_en text,
  description_ar text,
  price numeric(14, 2) not null default 0,
  bedrooms int not null default 1,
  bathrooms int not null default 1,
  area_sqft numeric(10, 2) not null default 0,
  property_type_en text not null,
  property_type_ar text not null,
  status text not null default 'available' check (status in ('available', 'reserved', 'sold')),
  is_published boolean default false not null,
  is_featured boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 3.4 Property Images (Max 4 per property)
create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade not null,
  image_url text not null,
  is_cover boolean default false not null,
  display_order int default 0 not null,
  created_at timestamptz default now() not null
);

-- 3.5 Property Specifications (Dynamic bilingual specs)
create table if not exists public.property_specs (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade not null,
  label_en text not null,
  label_ar text not null,
  value_en text not null,
  value_ar text not null,
  created_at timestamptz default now() not null
);

-- 3.6 Enquiries (Leads & Contact Inquiries)
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  message text not null,
  project_id uuid references public.projects(id) on delete set null,
  property_id uuid references public.properties(id) on delete set null,
  status text not null default 'new' check (status in ('new', 'in_progress', 'contacted', 'closed', 'spam')),
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 3.7 Site Settings
create table if not exists public.site_settings (
  key text primary key default 'general',
  brand_name_en text not null default 'SPEC Home',
  brand_name_ar text not null default 'سبيك هوم',
  contact_email text default 'info@spechome.com',
  contact_phone text default '+971 4 123 4567',
  whatsapp_number text default '+971 50 000 0000',
  logo_path text,
  updated_at timestamptz default now() not null
);

-- 4. TRIGGERS FOR AUTO UPDATING updated_at
drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at before update on public.projects for each row execute procedure public.set_updated_at();

drop trigger if exists set_properties_updated_at on public.properties;
create trigger set_properties_updated_at before update on public.properties for each row execute procedure public.set_updated_at();

drop trigger if exists set_admin_profiles_updated_at on public.admin_profiles;
create trigger set_admin_profiles_updated_at before update on public.admin_profiles for each row execute procedure public.set_updated_at();

drop trigger if exists set_enquiries_updated_at on public.enquiries;
create trigger set_enquiries_updated_at before update on public.enquiries for each row execute procedure public.set_updated_at();

drop trigger if exists set_site_settings_updated_at on public.site_settings;
create trigger set_site_settings_updated_at before update on public.site_settings for each row execute procedure public.set_updated_at();

-- 5. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
alter table public.admin_profiles enable row level security;
alter table public.projects enable row level security;
alter table public.properties enable row level security;
alter table public.property_images enable row level security;
alter table public.property_specs enable row level security;
alter table public.enquiries enable row level security;
alter table public.site_settings enable row level security;

-- Admin Profiles Policies
create policy "Admins can view profiles" on public.admin_profiles for select using (public.is_admin() or auth.uid() = id);
create policy "Admins can update profiles" on public.admin_profiles for update using (public.is_admin() or auth.uid() = id);

-- Projects Policies
create policy "Public can view published projects" on public.projects for select using (is_published = true or public.is_admin());
create policy "Admins can insert projects" on public.projects for insert with check (public.is_admin());
create policy "Admins can update projects" on public.projects for update using (public.is_admin());
create policy "Admins can delete projects" on public.projects for delete using (public.is_admin());

-- Properties Policies
create policy "Public can view published properties" on public.properties for select using (is_published = true or public.is_admin());
create policy "Admins can insert properties" on public.properties for insert with check (public.is_admin());
create policy "Admins can update properties" on public.properties for update using (public.is_admin());
create policy "Admins can delete properties" on public.properties for delete using (public.is_admin());

-- Property Images Policies
create policy "Public can view property images" on public.property_images for select using (true);
create policy "Admins can insert property images" on public.property_images for insert with check (public.is_admin());
create policy "Admins can update property images" on public.property_images for update using (public.is_admin());
create policy "Admins can delete property images" on public.property_images for delete using (public.is_admin());

-- Property Specs Policies
create policy "Public can view property specs" on public.property_specs for select using (true);
create policy "Admins can insert property specs" on public.property_specs for insert with check (public.is_admin());
create policy "Admins can update property specs" on public.property_specs for update using (public.is_admin());
create policy "Admins can delete property specs" on public.property_specs for delete using (public.is_admin());

-- Enquiries Policies
create policy "Public can submit enquiries" on public.enquiries for insert with check (true);
create policy "Admins can view enquiries" on public.enquiries for select using (public.is_admin());
create policy "Admins can update enquiries" on public.enquiries for update using (public.is_admin());
create policy "Admins can delete enquiries" on public.enquiries for delete using (public.is_admin());

-- Site Settings Policies
create policy "Public can view site settings" on public.site_settings for select using (true);
create policy "Admins can update site settings" on public.site_settings for all using (public.is_admin());

-- 6. STORAGE BUCKETS SETUP
insert into storage.buckets (id, name, public)
values 
  ('property-images', 'property-images', true),
  ('project-covers', 'project-covers', true)
on conflict (id) do update set public = true;

-- Storage Policies
create policy "Public can view property image files" on storage.objects for select using (bucket_id in ('property-images', 'project-covers'));
create policy "Admins can upload files" on storage.objects for insert with check (bucket_id in ('property-images', 'project-covers') and public.is_admin());
create policy "Admins can delete files" on storage.objects for delete using (bucket_id in ('property-images', 'project-covers') and public.is_admin());

-- 7. INITIAL SEED DATA
insert into public.site_settings (key, brand_name_en, brand_name_ar, contact_email, contact_phone, whatsapp_number)
values ('general', 'SPEC Home', 'سبيك هوم', 'info@spechome.com', '+971 4 123 4567', '+971 50 000 0000')
on conflict (key) do nothing;

-- Sample Published Project
insert into public.projects (id, slug, name_en, name_ar, description_en, description_ar, location_en, location_ar, cover_image_path, is_published, is_featured)
values (
  'a0000000-0000-0000-0000-000000000001',
  'the-sapphire-residences',
  'The Sapphire Residences',
  'أبراج ذا سافاير ريزيدنسز',
  'An ultra-luxury architectural icon rising 65 storeys in Downtown Dubai with direct Burj Khalifa and Dubai Fountain views.',
  'برج أيقوني فائق الفخامة يرتفع 65 طابقاً في قلب وسط مدينة دبي بإطلالات مباشرة على برج خليفة ونافورة دبي.',
  'Downtown Dubai',
  'وسط مدينة دبي',
  'https://images.unsplash.com/photo-1546412414-e1885259563a?q=80&w=2000&auto=format&fit=crop',
  true,
  true
) on conflict (slug) do nothing;

-- Sample Published Property
insert into public.properties (id, project_id, slug, reference_code, title_en, title_ar, description_en, description_ar, price, bedrooms, bathrooms, area_sqft, property_type_en, property_type_ar, status, is_published, is_featured)
values (
  'b0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'the-sapphire',
  'SHP-00101',
  'The Sapphire',
  'ذا سافاير',
  'Experience unparalleled luxury with panoramic Dubai Marina and Arabian Gulf views. Premium Italian finishes and expansive terraces.',
  'عش تجربة فخامة لا مثيل لها مع إطلالات بانورامية على أفق دبي مارينا والخليج العربي مع تشطيبات إيطالية وتراسات رحبة.',
  4500000.00,
  3,
  4,
  2850.00,
  'Apartment',
  'شقة فاخرة',
  'available',
  true,
  true
) on conflict (slug) do nothing;

-- Sample Property Specs
insert into public.property_specs (property_id, label_en, label_ar, value_en, value_ar)
values 
  ('b0000000-0000-0000-0000-000000000001', 'Handover', 'موعد التسليم', 'Q4 2026', 'الربع الرابع 2026'),
  ('b0000000-0000-0000-0000-000000000001', 'Payment Plan', 'خطة الدفع', '50 / 50', '50 / 50'),
  ('b0000000-0000-0000-0000-000000000001', 'View', 'الإطلالة', 'Marina & Sea View', 'إطلالة كاملة على المارينا والبحر');
