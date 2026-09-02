import React from "react";
import type { Metadata } from "next";
import Hero from "@/components/Hero";
import SelectedOpportunities from "@/components/SelectedOpportunities";
import AreaGuides from "@/components/AreaGuides";
import Services from "@/components/Services";
import FeaturedInsights from "@/components/FeaturedInsights";
import OfficeLocationSection from "@/components/OfficeLocationSection";
import InteractiveForm from "@/components/InteractiveForm";
import { getGlobalSeo, getPageSeo } from "@/lib/queries/seo";
import { getSiteSettings } from "@/lib/queries/site-settings";
import { getStorageUrl } from "@/lib/supabase/storage";
import { JsonLd, buildHomepageSchema } from "@/lib/seo/schema";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/+$/, "");

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale === "ar" ? "ar" : "en";
  const isAr = locale === "ar";

  const [globalSeo, homeSeo, siteSettings] = await Promise.all([
    getGlobalSeo(),
    getPageSeo("home"),
    getSiteSettings(),
  ]);

  const brandName = isAr
    ? siteSettings.brand_name_ar || "سبيك هوم دبي"
    : siteSettings.brand_name_en || "SPEC Home Dubai";

  const title = isAr
    ? homeSeo?.meta_title_ar || "سبيك هوم دبي | وسيط عقارات فاخرة في دبي والإمارات"
    : homeSeo?.meta_title_en || "SPEC Home Dubai | Luxury Real Estate Broker in Dubai & UAE";

  const description = isAr
    ? homeSeo?.meta_description_ar || "محفظة استثنائية من أفخم العقارات الشاطئية، البنتهاوس المعلق، والمساكن الحصرية في دبي."
    : homeSeo?.meta_description_en || "Curated portfolio of prime waterfront estates, sky penthouses, and branded residences in Dubai. Discover luxury villas, apartments, and off-plan investments.";

  const keywords = isAr
    ? homeSeo?.keywords_ar || globalSeo.default_keywords_ar || undefined
    : homeSeo?.keywords_en || globalSeo.default_keywords_en || undefined;

  const ogImage = homeSeo?.og_image_path || globalSeo.og_image_path
    ? getStorageUrl(homeSeo?.og_image_path || globalSeo.og_image_path!, "site-assets")
    : undefined;

  const canonical = `${SITE_URL}/${locale}`;

  return {
    title,
    description,
    keywords,
    robots: homeSeo?.robots || globalSeo.robots || "index, follow",
    alternates: {
      canonical,
      languages: {
        en: `${SITE_URL}/en`,
        ar: `${SITE_URL}/ar`,
        "x-default": `${SITE_URL}/en`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  };
}

export default async function Home({ params }: Props) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale === "ar" ? "ar" : "en";
  const siteSettings = await getSiteSettings();

  return (
    <div className="bg-background text-foreground selection:bg-accent selection:text-accent-foreground">
      <JsonLd data={buildHomepageSchema(locale, siteSettings)} />
      <Hero />
      <SelectedOpportunities />
      <AreaGuides />
      <Services />
      <FeaturedInsights />
      <OfficeLocationSection />
      <InteractiveForm />
    </div>
  );
}
