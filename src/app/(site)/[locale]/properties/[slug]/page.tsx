import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPropertyBySlug } from "@/lib/queries/properties";
import { getStorageUrl } from "@/lib/supabase/storage";
import { JsonLd, buildPropertySchema } from "@/lib/seo/schema";
import PropertyDetailClient from "./PropertyDetailClient";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/+$/, "");

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const { locale, slug } = resolvedParams;
  const isAr = locale === "ar";

  const property = await getPropertyBySlug(slug);
  if (!property) return {};

  const title = isAr
    ? property.seo_title_ar || property.title_ar || property.title_en
    : property.seo_title_en || property.title_en;

  const description = isAr
    ? property.seo_description_ar || property.description_ar || property.description_en || ""
    : property.seo_description_en || property.description_en || "";

  const ogImage = property.cover_image
    ? getStorageUrl(property.cover_image, "property-images")
    : undefined;

  const canonical = `${SITE_URL}/${locale}/properties/${slug}`;

  return {
    title: `${title} | SPEC Home Dubai`,
    description,
    keywords: isAr ? property.seo_keywords_ar || undefined : property.seo_keywords_en || undefined,
    alternates: {
      canonical,
      languages: {
        en: `${SITE_URL}/en/properties/${slug}`,
        ar: `${SITE_URL}/ar/properties/${slug}`,
        "x-default": `${SITE_URL}/en/properties/${slug}`,
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

export default async function PropertyDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const { locale, slug } = resolvedParams;

  const property = await getPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  return (
    <>
      <JsonLd data={buildPropertySchema({ property, locale })} />
      <PropertyDetailClient
        locale={locale}
        property={property}
      />
    </>
  );
}
