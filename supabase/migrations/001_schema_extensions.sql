-- ==============================================================================
-- SPEC HOME — DATABASE EXTENSIONS (SEO, PROJECTS, PROPERTIES, SETTINGS)
-- Run this in your Supabase SQL Editor to add the full CMS fields.
-- ==============================================================================

-- 1. EXTEND PROJECTS TABLE
ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS developer_en text,
  ADD COLUMN IF NOT EXISTS developer_ar text,
  ADD COLUMN IF NOT EXISTS starting_price numeric(14, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'AED',
  ADD COLUMN IF NOT EXISTS property_type_en text,
  ADD COLUMN IF NOT EXISTS property_type_ar text,
  ADD COLUMN IF NOT EXISTS handover_en text,
  ADD COLUMN IF NOT EXISTS handover_ar text,
  ADD COLUMN IF NOT EXISTS payment_plan_en text,
  ADD COLUMN IF NOT EXISTS payment_plan_ar text,
  ADD COLUMN IF NOT EXISTS total_units int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS display_order int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS seo_title_en text,
  ADD COLUMN IF NOT EXISTS seo_title_ar text,
  ADD COLUMN IF NOT EXISTS seo_description_en text,
  ADD COLUMN IF NOT EXISTS seo_description_ar text,
  ADD COLUMN IF NOT EXISTS seo_keywords_en text,
  ADD COLUMN IF NOT EXISTS seo_keywords_ar text,
  ADD COLUMN IF NOT EXISTS og_title_en text,
  ADD COLUMN IF NOT EXISTS og_title_ar text,
  ADD COLUMN IF NOT EXISTS og_description_en text,
  ADD COLUMN IF NOT EXISTS og_description_ar text,
  ADD COLUMN IF NOT EXISTS og_image_path text,
  ADD COLUMN IF NOT EXISTS canonical_url text,
  ADD COLUMN IF NOT EXISTS robots text DEFAULT 'index, follow';

-- 2. EXTEND PROPERTIES TABLE
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS payment_plan_en text,
  ADD COLUMN IF NOT EXISTS payment_plan_ar text,
  ADD COLUMN IF NOT EXISTS handover_en text,
  ADD COLUMN IF NOT EXISTS handover_ar text,
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'AED',
  ADD COLUMN IF NOT EXISTS seo_title_en text,
  ADD COLUMN IF NOT EXISTS seo_title_ar text,
  ADD COLUMN IF NOT EXISTS seo_description_en text,
  ADD COLUMN IF NOT EXISTS seo_description_ar text,
  ADD COLUMN IF NOT EXISTS seo_keywords_en text,
  ADD COLUMN IF NOT EXISTS seo_keywords_ar text,
  ADD COLUMN IF NOT EXISTS og_title_en text,
  ADD COLUMN IF NOT EXISTS og_title_ar text,
  ADD COLUMN IF NOT EXISTS og_description_en text,
  ADD COLUMN IF NOT EXISTS og_description_ar text,
  ADD COLUMN IF NOT EXISTS og_image_path text,
  ADD COLUMN IF NOT EXISTS canonical_url text,
  ADD COLUMN IF NOT EXISTS robots text DEFAULT 'index, follow';

-- 3. EXTEND SITE_SETTINGS TABLE
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS tagline_en text DEFAULT 'The Pinnacle of Dubai Luxury Real Estate',
  ADD COLUMN IF NOT EXISTS tagline_ar text DEFAULT 'قمة العقارات الفاخرة في دبي',
  ADD COLUMN IF NOT EXISTS meta_description_en text,
  ADD COLUMN IF NOT EXISTS meta_description_ar text,
  ADD COLUMN IF NOT EXISTS office_address_en text,
  ADD COLUMN IF NOT EXISTS office_address_ar text,
  ADD COLUMN IF NOT EXISTS instagram_url text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS youtube_url text,
  ADD COLUMN IF NOT EXISTS maintenance_mode boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS announcement_en text,
  ADD COLUMN IF NOT EXISTS announcement_ar text,
  ADD COLUMN IF NOT EXISTS hero_image_path text,
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'AED';

-- 4. GLOBAL SEO SETTINGS TABLE
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

-- 5. PAGE-LEVEL SEO TABLE
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

-- Triggers for updated_at
DROP TRIGGER IF EXISTS set_seo_settings_updated_at ON public.seo_settings;
CREATE TRIGGER set_seo_settings_updated_at BEFORE UPDATE ON public.seo_settings FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

DROP TRIGGER IF EXISTS set_page_seo_updated_at ON public.page_seo;
CREATE TRIGGER set_page_seo_updated_at BEFORE UPDATE ON public.page_seo FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- 6. RLS POLICIES FOR NEW TABLES
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_seo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view seo_settings" ON public.seo_settings FOR SELECT USING (true);
CREATE POLICY "Admins can modify seo_settings" ON public.seo_settings FOR ALL USING (public.is_admin());

CREATE POLICY "Public can view page_seo" ON public.page_seo FOR SELECT USING (true);
CREATE POLICY "Admins can modify page_seo" ON public.page_seo FOR ALL USING (public.is_admin());

-- 7. STORAGE BUCKETS SETUP
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('property-images', 'property-images', true),
  ('project-covers', 'project-covers', true),
  ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policies
CREATE POLICY "Public can view site-assets" ON storage.objects FOR SELECT USING (bucket_id IN ('property-images', 'project-covers', 'site-assets'));
CREATE POLICY "Admins can upload site-assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('property-images', 'project-covers', 'site-assets') AND public.is_admin());
CREATE POLICY "Admins can delete site-assets" ON storage.objects FOR DELETE USING (bucket_id IN ('property-images', 'project-covers', 'site-assets') AND public.is_admin());

-- 8. SEED DEFAULT GLOBAL SEO & PAGES SEO
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
