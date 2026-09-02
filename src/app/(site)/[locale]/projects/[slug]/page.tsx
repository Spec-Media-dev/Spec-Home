import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjectWithProperties, getProjectBySlug } from "@/lib/queries/projects";
import { getStorageUrl } from "@/lib/supabase/storage";
import { JsonLd, buildProjectSchema } from "@/lib/seo/schema";
import ProjectDetailClient from "./ProjectDetailClient";

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

  const project = await getProjectBySlug(slug);
  if (!project) return {};

  const title = isAr
    ? project.seo_title_ar || project.name_ar || project.name_en
    : project.seo_title_en || project.name_en;

  const description = isAr
    ? project.seo_description_ar || project.description_ar || project.description_en || ""
    : project.seo_description_en || project.description_en || "";

  const ogImage = project.og_image_path || project.cover_image_path
    ? getStorageUrl(project.og_image_path || project.cover_image_path, "project-covers")
    : undefined;

  const canonical = `${SITE_URL}/${locale}/projects/${slug}`;

  return {
    title: `${title} | SPEC Home Dubai`,
    description,
    keywords: isAr ? project.seo_keywords_ar || undefined : project.seo_keywords_en || undefined,
    alternates: {
      canonical,
      languages: {
        en: `${SITE_URL}/en/projects/${slug}`,
        ar: `${SITE_URL}/ar/projects/${slug}`,
        "x-default": `${SITE_URL}/en/projects/${slug}`,
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

export default async function ProjectDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const { locale, slug } = resolvedParams;

  const { project, properties } = await getProjectWithProperties(slug);

  if (!project) {
    notFound();
  }

  return (
    <>
      <JsonLd data={buildProjectSchema({ project, locale })} />
      <ProjectDetailClient
        locale={locale}
        project={project}
        properties={properties}
      />
    </>
  );
}
