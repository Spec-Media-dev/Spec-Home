import React from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Preloader from "@/components/Preloader";
import CustomCursor from "@/components/CustomCursor";
import { I18nProvider, Locale } from "@/lib/i18n";
import { getGlobalSeo, getPageSeo } from "@/lib/queries/seo";
import { getSiteSettings } from "@/lib/queries/site-settings";
import { getStorageUrl } from "@/lib/supabase/storage";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/+$/, "");

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
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
    ? homeSeo?.meta_title_ar || globalSeo.default_meta_title_ar || globalSeo.website_title_ar || brandName
    : homeSeo?.meta_title_en || globalSeo.default_meta_title_en || globalSeo.website_title_en || brandName;

  const description = isAr
    ? homeSeo?.meta_description_ar || globalSeo.default_meta_description_ar || ""
    : homeSeo?.meta_description_en || globalSeo.default_meta_description_en || "";

  const keywords = isAr
    ? homeSeo?.keywords_ar || globalSeo.default_keywords_ar || undefined
    : homeSeo?.keywords_en || globalSeo.default_keywords_en || undefined;

  const ogImage = globalSeo.og_image_path
    ? getStorageUrl(globalSeo.og_image_path, "site-assets")
    : undefined;

  return {
    title: `${title} | ${brandName}`,
    description,
    keywords,
    robots: globalSeo.robots || "index, follow",
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: {
        en: `${SITE_URL}/en`,
        ar: `${SITE_URL}/ar`,
        "x-default": `${SITE_URL}/en`,
      },
    },
    icons: {
      icon: [
        { url: "/icon.svg", type: "image/svg+xml" },
        { url: "/favicon.ico", sizes: "any" },
      ],
      shortcut: "/icon.svg",
      apple: "/apple-touch-icon.png",
    },
    openGraph: {
      title,
      description,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  };
}

import { SiteSettingsProvider } from "@/lib/context/SiteSettingsContext";
import PageAnnouncementBar from "@/components/PageAnnouncementBar";

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;
  const locale: Locale = resolvedParams?.locale === "ar" ? "ar" : "en";
  const siteSettings = await getSiteSettings();

  return (
    <I18nProvider locale={locale}>
      <SiteSettingsProvider settings={siteSettings}>
        <Preloader />
        <CustomCursor />
        <Header />
        <main className="min-h-screen">
          <PageAnnouncementBar />
          {children}
        </main>
        <Footer />
      </SiteSettingsProvider>
    </I18nProvider>
  );
}
