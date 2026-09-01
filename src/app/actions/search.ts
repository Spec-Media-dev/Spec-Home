"use server";

import { createServerClient } from "@/lib/supabase/server";
import { getStorageUrl } from "@/lib/supabase/storage";
import type { PropertyRow, ProjectRow } from "@/lib/supabase/types";

export interface SearchResultItem {
  id: string;
  type: "property" | "project";
  title_en: string;
  title_ar: string;
  slug: string;
  subtitle_en: string;
  subtitle_ar: string;
  price?: number | null;
  currency?: string;
  imageUrl: string;
  href: string;
  badge_en: string;
  badge_ar: string;
}

export async function liveSearch(query: string, locale: string = "en"): Promise<{
  properties: SearchResultItem[];
  projects: SearchResultItem[];
}> {
  const clean = query.trim();
  if (!clean) {
    return { properties: [], projects: [] };
  }

  const supabase = createServerClient();
  const pattern = `%${clean}%`;

  try {
    const [propsRes, projRes] = await Promise.all([
      supabase
        .from("properties")
        .select("*")
        .eq("is_published", true)
        .or(`title_en.ilike.${pattern},title_ar.ilike.${pattern},slug.ilike.${pattern},reference_code.ilike.${pattern},property_type_en.ilike.${pattern}`)
        .limit(6),
      supabase
        .from("projects")
        .select("*")
        .eq("is_published", true)
        .or(`name_en.ilike.${pattern},name_ar.ilike.${pattern},slug.ilike.${pattern},developer_en.ilike.${pattern},location_en.ilike.${pattern}`)
        .limit(6),
    ]);

    const properties = (propsRes.data as PropertyRow[]) || [];
    const projects = (projRes.data as ProjectRow[]) || [];

    // Get cover images for properties
    let propertyImagesMap: Record<string, string> = {};
    if (properties.length > 0) {
      const propIds = properties.map((p) => p.id);
      const { data: images } = await supabase
        .from("property_images")
        .select("*")
        .in("property_id", propIds)
        .order("display_order", { ascending: true });

      if (images) {
        images.forEach((img) => {
          if (!propertyImagesMap[img.property_id] || img.is_cover) {
            propertyImagesMap[img.property_id] = img.image_url;
          }
        });
      }
    }

    const formattedProperties: SearchResultItem[] = properties.map((p) => {
      const img = propertyImagesMap[p.id];
      return {
        id: p.id,
        type: "property",
        title_en: p.title_en,
        title_ar: p.title_ar || p.title_en,
        slug: p.slug,
        subtitle_en: `${p.bedrooms || 1} Beds • ${p.property_type_en || "Apartment"} • ${p.reference_code}`,
        subtitle_ar: `${p.bedrooms || 1} غرف • ${p.property_type_ar || p.property_type_en || "عقار"} • ${p.reference_code}`,
        price: p.price,
        currency: p.currency || "AED",
        imageUrl: getStorageUrl(img, "media"),
        href: `/${locale}/properties/${p.slug}`,
        badge_en: p.status || "available",
        badge_ar: p.status || "available",
      };
    });

    const formattedProjects: SearchResultItem[] = projects.map((proj: any) => ({
      id: proj.id,
      type: "project",
      title_en: proj.name_en,
      title_ar: proj.name_ar || proj.name_en,
      slug: proj.slug,
      subtitle_en: `${proj.developer_en || "SPEC Developments"} • ${proj.location_en || "Dubai"}`,
      subtitle_ar: `${proj.developer_ar || proj.developer_en || "سبيك للتطوير"} • ${proj.location_ar || proj.location_en || "دبي"}`,
      price: proj.price_min || proj.starting_price || null,
      currency: proj.currency || "AED",
      imageUrl: getStorageUrl(proj.cover_image_path, "media"),
      href: `/${locale}/projects/${proj.slug}`,
      badge_en: proj.status || "ready",
      badge_ar: proj.status || "ready",
    }));

    return {
      properties: formattedProperties,
      projects: formattedProjects,
    };
  } catch (error) {
    console.error("[liveSearch] Error:", error);
    return { properties: [], projects: [] };
  }
}
