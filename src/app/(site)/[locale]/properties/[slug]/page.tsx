import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPropertyBySlug } from "@/lib/queries/properties";
import { getStorageUrl } from "@/lib/supabase/storage";
import PropertyDetailClient from "./PropertyDetailClient";

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

  return {
    title: `${title} | SPEC Home Dubai`,
    description,
    keywords: isAr ? property.seo_keywords_ar || undefined : property.seo_keywords_en || undefined,
    openGraph: {
      title,
      description,
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
    <PropertyDetailClient
      locale={locale}
      property={property}
    />
  );
}
