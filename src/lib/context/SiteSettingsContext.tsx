"use client";

import React, { createContext, useContext } from "react";
import type { SiteSettingsRow } from "@/lib/supabase/types";
import { useI18n } from "@/lib/i18n";
import { getStorageUrl } from "@/lib/supabase/storage";

interface SiteSettingsContextType {
  settings: SiteSettingsRow;
  brandName: string;
  tagline: string;
  announcement: string;
  officeAddress: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  logoUrl: string | null;
  heroImageUrl: string | null;
  instagramUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  maintenanceMode: boolean;
  currency: string;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | null>(null);

export function SiteSettingsProvider({
  settings,
  children,
}: {
  settings: SiteSettingsRow;
  children: React.ReactNode;
}) {
  const { locale } = useI18n();
  const isAr = locale === "ar";

  const brandName = isAr
    ? settings.brand_name_ar || settings.brand_name_en || "سبيك هوم دبي"
    : settings.brand_name_en || settings.brand_name_ar || "SPEC Home Dubai";

  const tagline = isAr
    ? settings.tagline_ar || settings.tagline_en || "قمة العقارات الفاخرة في دبي"
    : settings.tagline_en || settings.tagline_ar || "The Pinnacle of Dubai Luxury Real Estate";

  const announcement = isAr
    ? settings.announcement_ar || settings.announcement_en || ""
    : settings.announcement_en || settings.announcement_ar || "";

  const officeAddress = isAr
    ? settings.office_address_ar || settings.office_address_en || "الطابق 42، برج السعادة، وسط مدينة دبي، الإمارات"
    : settings.office_address_en || settings.office_address_ar || "Level 42, Al Saada Tower, Downtown Dubai, UAE";

  const logoUrl = settings.logo_path
    ? settings.logo_path.startsWith("http")
      ? settings.logo_path
      : getStorageUrl(settings.logo_path, "site-assets")
    : null;

  const heroImageUrl = settings.hero_image_path
    ? settings.hero_image_path.startsWith("http")
      ? settings.hero_image_path
      : getStorageUrl(settings.hero_image_path, "site-assets")
    : null;

  const value: SiteSettingsContextType = {
    settings,
    brandName,
    tagline,
    announcement,
    officeAddress,
    contactEmail: settings.contact_email || "concierge@spechome.com",
    contactPhone: settings.contact_phone || "+971 4 800 7732",
    whatsappNumber: settings.whatsapp_number || "+971 50 999 8888",
    logoUrl,
    heroImageUrl,
    instagramUrl: settings.instagram_url || "https://instagram.com/spechomedubai",
    linkedinUrl: settings.linkedin_url || "https://linkedin.com/company/spechomedubai",
    youtubeUrl: settings.youtube_url || "https://youtube.com/@spechomedubai",
    maintenanceMode: !!settings.maintenance_mode,
    currency: settings.currency || "AED",
  };

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings(): SiteSettingsContextType {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    // Return graceful defaults if used outside provider
    return {
      settings: {
        key: "general",
        brand_name_en: "SPEC Home Dubai",
        brand_name_ar: "سبيك هوم دبي",
        updated_at: new Date().toISOString(),
        logo_path: null,
      },
      brandName: "SPEC Home Dubai",
      tagline: "The Pinnacle of Dubai Luxury Real Estate",
      announcement: "",
      officeAddress: "Level 42, Al Saada Tower, Downtown Dubai, UAE",
      contactEmail: "concierge@spechome.com",
      contactPhone: "+971 4 800 7732",
      whatsappNumber: "+971 50 999 8888",
      logoUrl: null,
      heroImageUrl: null,
      instagramUrl: "https://instagram.com/spechomedubai",
      linkedinUrl: "https://linkedin.com/company/spechomedubai",
      youtubeUrl: "https://youtube.com/@spechomedubai",
      maintenanceMode: false,
      currency: "AED",
    };
  }
  return context;
}
