import React from "react";
import type { Metadata } from "next";
import { getGlobalSeo, getPageSeo } from "@/lib/queries/seo";
import { getProperties } from "@/lib/queries/properties";
import { getStorageUrl } from "@/lib/supabase/storage";
import { JsonLd, buildCollectionSchema } from "@/lib/seo/schema";
import PropertiesClient from "./PropertiesClient";

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
    getPageSeo("properties"),
    getGlobalSeo(),
  ]);

  const title = isAr
    ? pageSeo?.meta_title_ar || "عقارات للبيع في دبي | فلل وبنتهاوس فاخرة | سبيك هوم"
    : pageSeo?.meta_title_en || "Properties for Sale in Dubai | Luxury Penthouses & Villas | SPEC Home";

  const description = isAr
    ? pageSeo?.meta_description_ar || "تصفح أرقى العقارات الفاخرة المعروضة للبيع في دبي. استكشف البنتهاوس الحصري، والقصور الشاطئية، والشقق الفاخرة في أفضل المواقع."
    : pageSeo?.meta_description_en || "Browse verified luxury properties for sale in Dubai. Explore exclusive penthouses, waterfront mansions, prime apartments, and branded residences.";

  const keywords = isAr
    ? pageSeo?.keywords_ar || globalSeo.default_keywords_ar || undefined
    : pageSeo?.keywords_en || globalSeo.default_keywords_en || undefined;

  const ogImage = pageSeo?.og_image_path || globalSeo.og_image_path
    ? getStorageUrl(pageSeo?.og_image_path || globalSeo.og_image_path!, "site-assets")
    : undefined;

  const canonical = `${SITE_URL}/${locale}/properties`;

  return {
    title,
    description,
    keywords,
    robots: pageSeo?.robots || "index, follow",
    alternates: {
      canonical,
      languages: {
        en: `${SITE_URL}/en/properties`,
        ar: `${SITE_URL}/ar/properties`,
        "x-default": `${SITE_URL}/en/properties`,
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

export default async function PropertiesPage({ params }: Props) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale === "ar" ? "ar" : "en";
  const isAr = locale === "ar";

  const properties = await getProperties();

  const collectionSchema = buildCollectionSchema({
    title: isAr ? "عقارات للبيع في دبي" : "Properties for Sale in Dubai",
    description: isAr
      ? "مجموعة حصرية من العقارات والفلل والبنتهاوس الفاخرة المعروضة للبيع في دبي."
      : "Exclusive collection of verified luxury properties, penthouses, and waterfront villas for sale in Dubai.",
    url: `${SITE_URL}/${locale}/properties`,
    locale,
    breadcrumbs: [
      { name: isAr ? "الرئيسية" : "Home", url: `${SITE_URL}/${locale}` },
      { name: isAr ? "العقارات" : "Properties", url: `${SITE_URL}/${locale}/properties` },
    ],
    items: properties.map((p) => ({
      name: isAr ? p.title_ar || p.title_en : p.title_en,
      url: `${SITE_URL}/${locale}/properties/${p.slug}`,
      price: Number(p.price) || undefined,
      currency: p.currency || "AED",
    })),
  });

  return (
    <>
      <JsonLd data={collectionSchema} />
      <PropertiesClient />
    </>
  );
}
