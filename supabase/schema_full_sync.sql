-- ==============================================================================
-- SPEC HOME — COMPLETE DATABASE SYNC & MIGRATION SCRIPT
-- Run this in your Supabase Dashboard > SQL Editor to resolve all schema errors.
-- ==============================================================================

-- 1. EXTEND SITE_SETTINGS WITH ALL CMS COLUMNS
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS brand_name_en text DEFAULT 'SPEC Home Dubai',
  ADD COLUMN IF NOT EXISTS brand_name_ar text DEFAULT 'سبيك هوم دبي',
  ADD COLUMN IF NOT EXISTS tagline_en text DEFAULT 'The Pinnacle of Dubai Luxury Real Estate',
  ADD COLUMN IF NOT EXISTS tagline_ar text DEFAULT 'قمة العقارات الفاخرة في دبي',
  ADD COLUMN IF NOT EXISTS meta_description_en text DEFAULT 'Curated portfolio of prime waterfront estates, sky penthouses, and branded residences in Dubai.',
  ADD COLUMN IF NOT EXISTS meta_description_ar text DEFAULT 'محفظة مختارة بعناية من العقارات الشاطئية الفاخرة، والبنتهاوس المعلق في دبي.',
  ADD COLUMN IF NOT EXISTS contact_email text DEFAULT 'concierge@spechome.com',
  ADD COLUMN IF NOT EXISTS contact_phone text DEFAULT '+971 4 800 7732',
  ADD COLUMN IF NOT EXISTS whatsapp_number text DEFAULT '+971 50 999 8888',
  ADD COLUMN IF NOT EXISTS office_address_en text DEFAULT 'Level 42, Al Saada Tower, Downtown Dubai, UAE',
  ADD COLUMN IF NOT EXISTS office_address_ar text DEFAULT 'الطابق 42، برج السعادة، وسط مدينة دبي، الإمارات',
  ADD COLUMN IF NOT EXISTS instagram_url text DEFAULT 'https://instagram.com/spechomedubai',
  ADD COLUMN IF NOT EXISTS linkedin_url text DEFAULT 'https://linkedin.com/company/spechomedubai',
  ADD COLUMN IF NOT EXISTS youtube_url text DEFAULT 'https://youtube.com/@spechomedubai',
  ADD COLUMN IF NOT EXISTS maintenance_mode boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS announcement_en text DEFAULT 'Private Previews Available for Q4 2026 Signature Collections',
  ADD COLUMN IF NOT EXISTS announcement_ar text DEFAULT 'معاينات خاصة متاحة لمجموعات الربع الرابع 2026 الحصرية',
  ADD COLUMN IF NOT EXISTS logo_path text,
  ADD COLUMN IF NOT EXISTS hero_image_path text,
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'AED';

-- Ensure initial row exists
INSERT INTO public.site_settings (key, brand_name_en, brand_name_ar)
VALUES ('general', 'SPEC Home Dubai', 'سبيك هوم دبي')
ON CONFLICT (key) DO NOTHING;

-- 2. EXTEND ADMIN_PROFILES & ENQUIRIES FOR COMPATIBILITY
ALTER TABLE public.admin_profiles
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS avatar_path text,
  ADD COLUMN IF NOT EXISTS role text DEFAULT 'admin',
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

ALTER TABLE public.enquiries
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS notes text;

-- 3. GLOBAL SEO SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.seo_settings (
  key text PRIMARY KEY DEFAULT 'global',
  website_title_en text DEFAULT 'SPEC Home Dubai | Premium Real Estate',
  website_title_ar text DEFAULT 'سبيك هوم دبي | عقارات فاخرة',
  default_meta_title_en text DEFAULT 'SPEC Home Dubai | Ultra-Luxury Real Estate Portfolio',
  default_meta_title_ar text DEFAULT 'سبيك هوم دبي | المحفظة العقارية فائقة الفخامة',
  default_meta_description_en text DEFAULT 'Curated portfolio of prime waterfront estates, sky penthouses, and branded residences in Dubai.',
  default_meta_description_ar text DEFAULT 'محفظة مختارة بعناية من العقارات الشاطئية الفاخرة، والبنتهاوس المعلق، والمساكن ذات العلامات التجارية العالمية في دبي.',
  default_keywords_en text DEFAULT 'dubai luxury real estate, penthouses, villas, waterfront properties, spec home',
  default_keywords_ar text DEFAULT 'عقارات دبي الفاخرة, بنتهاوس دبي, فلل فاخرة, عقارات شاطئية, سبيك هوم',
  og_title_en text DEFAULT 'SPEC Home Dubai | Ultra-Luxury Real Estate',
  og_title_ar text DEFAULT 'سبيك هوم دبي | عقارات فائقة الفخامة',
  og_description_en text DEFAULT 'Curated portfolio of prime waterfront estates, sky penthouses, and branded residences in Dubai.',
  og_description_ar text DEFAULT 'محفظة مختارة بعناية من العقارات الشاطئية الفاخرة، والبنتهاوس المعلق في دبي.',
  og_image_path text,
  twitter_title_en text,
  twitter_title_ar text,
  twitter_description_en text,
  twitter_description_ar text,
  twitter_image_path text,
  canonical_url text,
  robots text DEFAULT 'index, follow',
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 4. PAGE-LEVEL SEO TABLE
CREATE TABLE IF NOT EXISTS public.page_seo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug text UNIQUE NOT NULL,
  title_en text NOT NULL,
  title_ar text NOT NULL,
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
  robots text DEFAULT 'index, follow',
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 5. RLS POLICIES FOR SEO TABLES
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_seo ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view seo_settings') THEN
    CREATE POLICY "Public can view seo_settings" ON public.seo_settings FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can modify seo_settings') THEN
    CREATE POLICY "Admins can modify seo_settings" ON public.seo_settings FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view page_seo') THEN
    CREATE POLICY "Public can view page_seo" ON public.page_seo FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can modify page_seo') THEN
    CREATE POLICY "Admins can modify page_seo" ON public.page_seo FOR ALL USING (true);
  END IF;
END $$;

-- 6. SEED DEFAULT GLOBAL SEO & PAGES SEO
INSERT INTO public.seo_settings (key, website_title_en, website_title_ar)
VALUES ('global', 'SPEC Home Dubai | Premium Real Estate', 'سبيك هوم دبي | عقارات فاخرة')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.page_seo (page_slug, title_en, title_ar, meta_title_en, meta_title_ar, meta_description_en, meta_description_ar)
VALUES 
  ('home', 'Home', 'الرئيسية', 'SPEC Home Dubai | Luxury Real Estate & Exclusive Residences', 'سبيك هوم دبي | عقارات فاخرة ومساكن حصرية', 'Discover exclusive luxury properties, sky penthouses, and beachfront villas in Dubai.', 'اكتشف أرقى العقارات الفاخرة والبنتهاوس والفلل الشاطئية في دبي.'),
  ('projects', 'Master Projects', 'المشاريع الرئيسية', 'Master Developments & Projects | SPEC Home Dubai', 'أبرز المشاريع والتطويرات العقارية | سبيك هوم دبي', 'Explore iconic master-planned developments and architectural landmarks in Dubai.', 'استكشف أبرز المخططات والمشاريع العمرانية والأيقونات المعمارية في دبي.'),
  ('properties', 'Properties Portfolio', 'محفظة العقارات', 'Luxury Properties & Penthouses For Sale | SPEC Home Dubai', 'عقارات وبنتهاوس فاخر للبيع | سبيك هوم دبي', 'Browse curated prime residential properties, penthouses, and private estates in Dubai.', 'تصفح نخبة العقارات السكنية الفاخرة والبنتهاوس والقصور الخاصة في دبي.'),
  ('about', 'About Us', 'من نحن', 'About SPEC Home Dubai | Luxury Real Estate Advisory', 'عن سبيك هوم دبي | الاستشارات العقارية الفاخرة', 'Learn about our boutique advisory and heritage in Dubai prime luxury real estate.', 'تعرف على رؤيتنا وخبرتنا في سوق العقارات الفاخرة في دبي.'),
  ('contact', 'Contact & Advisory', 'اتصل بنا', 'Contact Private Advisory | SPEC Home Dubai', 'تواصل مع مستشارينا | سبيك هوم دبي', 'Get in touch with our senior investment advisors for private portfolio consultations.', 'تواصل مع نخبة مستشاري الاستثمار للحصول على استشارة خاصة ومخصصة.'),
  ('search', 'Search Portfolio', 'البحث في المحفظة', 'Search Properties & Developments | SPEC Home Dubai', 'البحث في العقارات والمشاريع | سبيك هوم دبي', 'Search through our exclusive portfolio of prime Dubai luxury properties.', 'ابحث في محفظتنا الحصرية من أرقى عقارات دبي الفاخرة.')
ON CONFLICT (page_slug) DO NOTHING;

-- 7. STORAGE BUCKETS (CREATE IF MISSING)
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('property-images', 'property-images', true),
  ('project-covers', 'project-covers', true),
  ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 8. RELOAD POSTGREST SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
