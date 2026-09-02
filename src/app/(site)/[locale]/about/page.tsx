import React from "react";
import type { Metadata } from "next";
import { getGlobalSeo, getPageSeo } from "@/lib/queries/seo";
import { getSiteSettings } from "@/lib/queries/site-settings";
import { getStorageUrl } from "@/lib/supabase/storage";
import { JsonLd, buildAboutSchema } from "@/lib/seo/schema";
import AboutClient from "./AboutClient";

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

  const [pageSeo, globalSeo] = await Promise.all([
    getPageSeo("about"),
    getGlobalSeo(),
  ]);

  const title = isAr
    ? pageSeo?.meta_title_ar || "عن سبيك هوم دبي | استشارات ووساطة عقارية نخبوية"
    : pageSeo?.meta_title_en || "About SPEC Home Dubai | Elite Real Estate Advisory & Brokerage";

  const description = isAr
    ? pageSeo?.meta_description_ar || "تعرف على سبيك هوم دبي، الشريك الاستشاري الرائد لأصحاب الثروات في شراء العقارات الفاخرة، والمساكن الشاطئية، وإدارة المحافظ الاستثمارية."
    : pageSeo?.meta_description_en || "Learn about SPEC Home Dubai, your premier boutique advisory for high-net-worth real estate acquisition, private waterfront estates, and portfolio management.";

  const keywords = isAr
    ? pageSeo?.keywords_ar || globalSeo.default_keywords_ar || undefined
    : pageSeo?.keywords_en || globalSeo.default_keywords_en || undefined;

  const ogImage = pageSeo?.og_image_path || globalSeo.og_image_path
    ? getStorageUrl(pageSeo?.og_image_path || globalSeo.og_image_path!, "site-assets")
    : undefined;

  const canonical = `${SITE_URL}/${locale}/about`;

  return {
    title,
    description,
    keywords,
    robots: pageSeo?.robots || "index, follow",
    alternates: {
      canonical,
      languages: {
        en: `${SITE_URL}/en/about`,
        ar: `${SITE_URL}/ar/about`,
        "x-default": `${SITE_URL}/en/about`,
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

export default async function AboutPage({ params }: Props) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale === "ar" ? "ar" : "en";
  const siteSettings = await getSiteSettings();

  return (
    <>
      <JsonLd data={buildAboutSchema(locale, siteSettings)} />
      <AboutClient />
    </>
  );
}
