import React from "react";
import type { Metadata } from "next";
import { getGlobalSeo, getPageSeo } from "@/lib/queries/seo";
import { getSiteSettings } from "@/lib/queries/site-settings";
import { getStorageUrl } from "@/lib/supabase/storage";
import { JsonLd, buildContactSchema } from "@/lib/seo/schema";
import ContactClient from "./ContactClient";

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
    getPageSeo("contact"),
    getGlobalSeo(),
  ]);

  const title = isAr
    ? pageSeo?.meta_title_ar || "اتصل بسبيك هوم دبي | استشارات كبار العملاء والاستفسارات"
    : pageSeo?.meta_title_en || "Contact SPEC Home Dubai | Private Client Advisory & Inquiries";

  const description = isAr
    ? pageSeo?.meta_description_ar || "تواصل مع مستشاري العقارات الخاصة في دبي. احجز استشارة خاصة أو جولة معاينة حصرية لأفخم العقارات في دبي بكل سرية واحترافية."
    : pageSeo?.meta_description_en || "Connect with our private client real estate advisors in Dubai. Schedule a confidential consultation or private viewing for prime Dubai residences.";

  const keywords = isAr
    ? pageSeo?.keywords_ar || globalSeo.default_keywords_ar || undefined
    : pageSeo?.keywords_en || globalSeo.default_keywords_en || undefined;

  const ogImage = pageSeo?.og_image_path || globalSeo.og_image_path
    ? getStorageUrl(pageSeo?.og_image_path || globalSeo.og_image_path!, "site-assets")
    : undefined;

  const canonical = `${SITE_URL}/${locale}/contact`;

  return {
    title,
    description,
    keywords,
    robots: pageSeo?.robots || "index, follow",
    alternates: {
      canonical,
      languages: {
        en: `${SITE_URL}/en/contact`,
        ar: `${SITE_URL}/ar/contact`,
        "x-default": `${SITE_URL}/en/contact`,
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

export default async function ContactPage({ params }: Props) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale === "ar" ? "ar" : "en";
  const siteSettings = await getSiteSettings();

  return (
    <>
      <JsonLd data={buildContactSchema(locale, siteSettings)} />
      <ContactClient />
    </>
  );
}
