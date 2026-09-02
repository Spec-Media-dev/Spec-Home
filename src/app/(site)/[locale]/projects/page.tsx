import React from "react";
import type { Metadata } from "next";
import { getGlobalSeo, getPageSeo } from "@/lib/queries/seo";
import { getProjects } from "@/lib/queries/projects";
import { getStorageUrl } from "@/lib/supabase/storage";
import { JsonLd, buildCollectionSchema } from "@/lib/seo/schema";
import ProjectsClient from "./ProjectsClient";

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
    getPageSeo("projects"),
    getGlobalSeo(),
  ]);

  const title = isAr
    ? pageSeo?.meta_title_ar || "مشاريع عقارية جديدة وقيد الإنشاء في دبي | سبيك هوم"
    : pageSeo?.meta_title_en || "New Developments & Off-Plan Projects in Dubai | SPEC Home";

  const description = isAr
    ? pageSeo?.meta_description_ar || "استكشف أحدث المشاريع العقارية الفاخرة والتطويرات قيد الإنشاء في دبي بخطط سداد مرنة وعوائد استثمارية مجزية مع سبيك هوم."
    : pageSeo?.meta_description_en || "Explore the most anticipated luxury off-plan developments and branded residential projects in Dubai with flexible payment plans and high investment yield.";

  const keywords = isAr
    ? pageSeo?.keywords_ar || globalSeo.default_keywords_ar || undefined
    : pageSeo?.keywords_en || globalSeo.default_keywords_en || undefined;

  const ogImage = pageSeo?.og_image_path || globalSeo.og_image_path
    ? getStorageUrl(pageSeo?.og_image_path || globalSeo.og_image_path!, "site-assets")
    : undefined;

  const canonical = `${SITE_URL}/${locale}/projects`;

  return {
    title,
    description,
    keywords,
    robots: pageSeo?.robots || "index, follow",
    alternates: {
      canonical,
      languages: {
        en: `${SITE_URL}/en/projects`,
        ar: `${SITE_URL}/ar/projects`,
        "x-default": `${SITE_URL}/en/projects`,
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

export default async function ProjectsPage({ params }: Props) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale === "ar" ? "ar" : "en";
  const isAr = locale === "ar";

  const projects = await getProjects();

  const collectionSchema = buildCollectionSchema({
    title: isAr ? "مشاريع وتطويرات عقارية في دبي" : "Property Developments & Projects in Dubai",
    description: isAr
      ? "استكشف أحدث المشاريع العقارية والتطويرات السكنية الفاخرة قيد الإنشاء في دبي."
      : "Explore the most anticipated luxury residential developments and off-plan towers in Dubai.",
    url: `${SITE_URL}/${locale}/projects`,
    locale,
    breadcrumbs: [
      { name: isAr ? "الرئيسية" : "Home", url: `${SITE_URL}/${locale}` },
      { name: isAr ? "المشاريع" : "Projects", url: `${SITE_URL}/${locale}/projects` },
    ],
    items: projects.map((p) => ({
      name: isAr ? p.name_ar || p.name_en : p.name_en,
      url: `${SITE_URL}/${locale}/projects/${p.slug}`,
      price: Number(p.starting_price) || undefined,
      currency: p.currency || "AED",
    })),
  });

  return (
    <>
      <JsonLd data={collectionSchema} />
      <ProjectsClient />
    </>
  );
}
