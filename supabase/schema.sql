-- ==============================================================================
-- SPEC HOME — COMPLETE SUPABASE DATABASE SCHEMA & RLS SETUP
-- Paste this entire script into your Supabase SQL Editor and click "Run".
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. HELPER FUNCTIONS
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
  developer_en text,
  developer_ar text,
  starting_price numeric(14, 2) default 0,
  currency text default 'AED',
  property_type_en text,
  property_type_ar text,
  handover_en text,
  handover_ar text,
  payment_plan_en text,
  payment_plan_ar text,
  total_units int default 0,
  display_order int default 0,
  is_published boolean default false not null,
  is_featured boolean default false not null,
  seo_title_en text,
  seo_title_ar text,
  seo_description_en text,
  seo_description_ar text,
  seo_keywords_en text,
  seo_keywords_ar text,
  og_title_en text,
  og_title_ar text,
  og_description_en text,
  og_description_ar text,
  og_image_path text,
  canonical_url text,
  robots text default 'index, follow',
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
  currency text default 'AED',
  bedrooms int not null default 1,
  bathrooms int not null default 1,
  area_sqft numeric(10, 2) not null default 0,
  property_type_en text not null,
  property_type_ar text not null,
  status text not null default 'available' check (status in ('available', 'reserved', 'sold')),
  handover_en text,
  handover_ar text,
  payment_plan_en text,
  payment_plan_ar text,
  is_published boolean default false not null,
  is_featured boolean default false not null,
  seo_title_en text,
  seo_title_ar text,
  seo_description_en text,
  seo_description_ar text,
  seo_keywords_en text,
  seo_keywords_ar text,
  og_title_en text,
  og_title_ar text,
  og_description_en text,
  og_description_ar text,
  og_image_path text,
  canonical_url text,
  robots text default 'index, follow',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 3.4 Property Images
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
  tagline_en text default 'The Pinnacle of Dubai Luxury Real Estate',
  tagline_ar text default 'قمة العقارات الفاخرة في دبي',
  meta_description_en text,
  meta_description_ar text,
  contact_email text default 'info@spechome.com',
  contact_phone text default '+971 4 123 4567',
  whatsapp_number text default '+971 50 000 0000',
  office_address_en text default 'Level 42, Al Saada Tower, Downtown Dubai, UAE',
  office_address_ar text default 'الطابق 42، برج السعادة، وسط مدينة دبي، الإمارات',
  instagram_url text default 'https://instagram.com/spechomedubai',
  linkedin_url text default 'https://linkedin.com/company/spechomedubai',
  youtube_url text default 'https://youtube.com/@spechomedubai',
  maintenance_mode boolean default false,
  announcement_en text default 'Private Previews Available for Q4 2026 Signature Collections',
  announcement_ar text default 'معاينات خاصة متاحة لمجموعات الربع الرابع 2026 الحصرية',
  logo_path text,
  hero_image_path text,
  currency text default 'AED',
  updated_at timestamptz default now() not null
);

-- 3.8 Global SEO Settings
create table if not exists public.seo_settings (
  key text primary key default 'global',
  website_title_en text default 'SPEC Home Dubai | Premium Real Estate',
  website_title_ar text default 'سبيك هوم دبي | عقارات فاخرة',
  default_meta_title_en text default 'SPEC Home Dubai | Ultra-Luxury Real Estate Portfolio',
  default_meta_title_ar text default 'سبيك هوم دبي | المحفظة العقارية فائقة الفخامة',
  default_meta_description_en text default 'Curated portfolio of prime waterfront estates, sky penthouses, and branded residences in Dubai.',
  default_meta_description_ar text default 'محفظة مختارة بعناية من العقارات الشاطئية الفاخرة، والبنتهاوس المعلق، والمساكن ذات العلامات التجارية العالمية في دبي.',
  default_keywords_en text default 'dubai luxury real estate, penthouses, villas, waterfront properties, spec home',
  default_keywords_ar text default 'عقارات دبي الفاخرة, بنتهاوس دبي, فلل فاخرة, عقارات شاطئية, سبيك هوم',
  og_title_en text default 'SPEC Home Dubai | Ultra-Luxury Real Estate',
  og_title_ar text default 'سبيك هوم دبي | عقارات فائقة الفخامة',
  og_description_en text default 'Curated portfolio of prime waterfront estates, sky penthouses, and branded residences in Dubai.',
  og_description_ar text default 'محفظة مختارة بعناية من العقارات الشاطئية الفاخرة، والبنتهاوس المعلق في دبي.',
  og_image_path text,
  twitter_title_en text,
  twitter_title_ar text,
  twitter_description_en text,
  twitter_description_ar text,
  twitter_image_path text,
  canonical_url text,
  robots text default 'index, follow',
  updated_at timestamptz default now() not null
);

-- 3.9 Page-Level SEO Settings
create table if not exists public.page_seo (
  id uuid primary key default gen_random_uuid(),
  page_slug text unique not null,
  title_en text not null,
  title_ar text not null,
  meta_title_en text,
  meta_title_ar text,
  meta_description_en text,
  meta_description_ar text,
  keywords_en text,
  keywords_ar text,
  og_title_en text,
  og_title_ar text,
  og_description_en text,
  og_description_ar text,
  og_image_path text,
  twitter_title_en text,
  twitter_title_ar text,
  twitter_description_en text,
  twitter_description_ar text,
  twitter_image_path text,
  canonical_url text,
  robots text default 'index, follow',
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

drop trigger if exists set_seo_settings_updated_at on public.seo_settings;
create trigger set_seo_settings_updated_at before update on public.seo_settings for each row execute procedure public.set_updated_at();

drop trigger if exists set_page_seo_updated_at on public.page_seo;
create trigger set_page_seo_updated_at before update on public.page_seo for each row execute procedure public.set_updated_at();

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
alter table public.admin_profiles enable row level security;
alter table public.projects enable row level security;
alter table public.properties enable row level security;
alter table public.property_images enable row level security;
alter table public.property_specs enable row level security;
alter table public.enquiries enable row level security;
alter table public.site_settings enable row level security;
alter table public.seo_settings enable row level security;
alter table public.page_seo enable row level security;

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

-- SEO Settings Policies
create policy "Public can view seo settings" on public.seo_settings for select using (true);
create policy "Admins can update seo settings" on public.seo_settings for all using (public.is_admin());

-- Page SEO Policies
create policy "Public can view page seo" on public.page_seo for select using (true);
create policy "Admins can update page seo" on public.page_seo for all using (public.is_admin());

-- 6. STORAGE BUCKETS SETUP
insert into storage.buckets (id, name, public)
values 
  ('property-images', 'property-images', true),
  ('project-covers', 'project-covers', true),
  ('site-assets', 'site-assets', true)
on conflict (id) do update set public = true;

-- Storage Policies
create policy "Public can view media files" on storage.objects for select using (bucket_id in ('property-images', 'project-covers', 'site-assets'));
create policy "Admins can upload media files" on storage.objects for insert with check (bucket_id in ('property-images', 'project-covers', 'site-assets') and public.is_admin());
create policy "Admins can delete media files" on storage.objects for delete using (bucket_id in ('property-images', 'project-covers', 'site-assets') and public.is_admin());

-- 7. INITIAL SEED DATA
insert into public.site_settings (key, brand_name_en, brand_name_ar, contact_email, contact_phone, whatsapp_number)
values ('general', 'SPEC Home', 'سبيك هوم', 'info@spechome.com', '+971 4 123 4567', '+971 50 000 0000')
on conflict (key) do nothing;

insert into public.seo_settings (key, website_title_en, website_title_ar)
values ('global', 'SPEC Home Dubai | Premium Real Estate', 'سبيك هوم دبي | عقارات فاخرة')
on conflict (key) do nothing;

insert into public.page_seo (page_slug, title_en, title_ar, meta_title_en, meta_title_ar, meta_description_en, meta_description_ar)
values 
  ('home', 'Home', 'الرئيسية', 'SPEC Home Dubai | Luxury Real Estate & Exclusive Residences', 'سبيك هوم دبي | عقارات فاخرة ومساكن حصرية', 'Discover exclusive luxury properties, sky penthouses, and beachfront villas in Dubai.', 'اكتشف أرقى العقارات الفاخرة والبنتهاوس والفلل الشاطئية في دبي.'),
  ('projects', 'Master Projects', 'المشاريع الرئيسية', 'Master Developments & Projects | SPEC Home Dubai', 'أبرز المشاريع والتطويرات العقارية | سبيك هوم دبي', 'Explore iconic master-planned developments and architectural landmarks in Dubai.', 'استكشف أبرز المخططات والمشاريع العمرانية والأيقونات المعمارية في دبي.'),
  ('properties', 'Properties Portfolio', 'محفظة العقارات', 'Luxury Properties & Penthouses For Sale | SPEC Home Dubai', 'عقارات وبنتهاوس فاخر للبيع | سبيك هوم دبي', 'Browse curated prime residential properties, penthouses, and private estates in Dubai.', 'تصفح نخبة العقارات السكنية الفاخرة والبنتهاوس والقصور الخاصة في دبي.'),
  ('about', 'About Us', 'من نحن', 'About SPEC Home Dubai | Luxury Real Estate Advisory', 'عن سبيك هوم دبي | الاستشارات العقارية الفاخرة', 'Learn about our boutique advisory and heritage in Dubai prime luxury real estate.', 'تعرف على رؤيتنا وخبرتنا في سوق العقارات الفاخرة في دبي.'),
  ('contact', 'Contact & Advisory', 'اتصل بنا', 'Contact Private Advisory | SPEC Home Dubai', 'تواصل مع مستشارينا | سبيك هوم دبي', 'Get in touch with our senior investment advisors for private portfolio consultations.', 'تواصل مع نخبة مستشاري الاستثمار للحصول على استشارة خاصة ومخصصة.'),
  ('search', 'Search Portfolio', 'البحث في المحفظة', 'Search Properties & Developments | SPEC Home Dubai', 'البحث في العقارات والمشاريع | سبيك هوم دبي', 'Search through our exclusive portfolio of prime Dubai luxury properties.', 'ابحث في محفظتنا الحصرية من أرقى عقارات دبي الفاخرة.')
on conflict (page_slug) do nothing;

-- Sample Published Project
insert into public.projects (
  id, slug, name_en, name_ar, description_en, description_ar, location_en, location_ar, 
  developer_en, developer_ar, starting_price, currency, property_type_en, property_type_ar,
  handover_en, handover_ar, payment_plan_en, payment_plan_ar, total_units,
  cover_image_path, is_published, is_featured
)
values (
  'a0000000-0000-0000-0000-000000000001',
  'the-sapphire-residences',
  'The Sapphire Residences',
  'أبراج ذا سافاير ريزيدنسز',
  'An ultra-luxury architectural icon rising 65 storeys in Downtown Dubai with direct Burj Khalifa and Dubai Fountain views.',
  'برج أيقوني فائق الفخامة يرتفع 65 طابقاً في قلب وسط مدينة دبي بإطلالات مباشرة على برج خليفة ونافورة دبي.',
  'Downtown Dubai',
  'وسط مدينة دبي',
  'SPEC Signature Developments',
  'سبيك للتطوير العقاري',
  9500000.00,
  'AED',
  'Residential Tower',
  'برج سكني فاخر',
  'Q4 2027',
  'الربع الرابع 2027',
  '60 / 40',
  '60 / 40',
  48,
  'https://images.unsplash.com/photo-1546412414-e1885259563a?q=80&w=2000&auto=format&fit=crop',
  true,
  true
) on conflict (slug) do nothing;

-- Sample Published Property
insert into public.properties (
  id, project_id, slug, reference_code, title_en, title_ar, description_en, description_ar, 
  price, currency, bedrooms, bathrooms, area_sqft, property_type_en, property_type_ar, 
  status, handover_en, handover_ar, payment_plan_en, payment_plan_ar, is_published, is_featured
)
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
  'AED',
  3,
  4,
  2850.00,
  'Apartment',
  'شقة فاخرة',
  'available',
  'Q4 2026',
  'الربع الرابع 2026',
  '50 / 50',
  '50 / 50',
  true,
  true
) on conflict (slug) do nothing;

-- Sample Property Images
insert into public.property_images (property_id, image_url, is_cover, display_order)
values 
  ('b0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1600', true, 1),
  ('b0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1600', false, 2),
  ('b0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1600', false, 3)
on conflict do nothing;

-- Sample Property Specs
insert into public.property_specs (property_id, label_en, label_ar, value_en, value_ar)
values 
  ('b0000000-0000-0000-0000-000000000001', 'Handover', 'موعد التسليم', 'Q4 2026', 'الربع الرابع 2026'),
  ('b0000000-0000-0000-0000-000000000001', 'Payment Plan', 'خطة الدفع', '50 / 50', '50 / 50'),
  ('b0000000-0000-0000-0000-000000000001', 'View', 'الإطلالة', 'Marina & Sea View', 'إطلالة كاملة على المارينا والبحر')
on conflict do nothing;
