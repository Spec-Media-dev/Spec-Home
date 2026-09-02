import React from "react";
import type { Metadata } from "next";
import { getGlobalSeo, getPageSeo } from "@/lib/queries/seo";
import SearchClient from "./SearchClient";

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
    getPageSeo("search"),
    getGlobalSeo(),
  ]);

  const title = isAr
    ? pageSeo?.meta_title_ar || "بحث عن العقارات الفاخرة في دبي | سبيك هوم"
    : pageSeo?.meta_title_en || "Search Luxury Properties in Dubai | SPEC Home";

  const description = isAr
    ? pageSeo?.meta_description_ar || "ابحث وفلتر العقارات والفلل والبنتهاوس الفاخرة عبر أفضل مناطق دبي."
    : pageSeo?.meta_description_en || "Search and filter luxury properties, villas, and penthouses across prime Dubai locations.";

  const canonical = `${SITE_URL}/${locale}/search`;

  return {
    title,
    description,
    robots: "noindex, follow", // Strictly noindex per SRS SHR-SEO-003 and PDF Page 19
    alternates: {
      canonical,
      languages: {
        en: `${SITE_URL}/en/search`,
        ar: `${SITE_URL}/ar/search`,
        "x-default": `${SITE_URL}/en/search`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
    },
  };
}

export default function SearchPage() {
  return <SearchClient />;
}
