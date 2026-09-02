"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { SiteSettingsRow } from "@/lib/supabase/types";
import { useI18n } from "@/lib/i18n";
import { getStorageUrl } from "@/lib/supabase/storage";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

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
  const [currentSettings, setCurrentSettings] = useState<SiteSettingsRow>(settings);

  // Sync state whenever props change from SSR
  useEffect(() => {
    setCurrentSettings(settings);
  }, [settings]);

  // Real-time synchronization: listen for database updates to site_settings
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel("public-site-settings-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_settings" },
        (payload) => {
          if (payload.new) {
            setCurrentSettings((prev) => ({
              ...prev,
              ...(payload.new as SiteSettingsRow),
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const brandName = isAr
    ? currentSettings.brand_name_ar || currentSettings.brand_name_en || "سبيك هوم دبي"
    : currentSettings.brand_name_en || currentSettings.brand_name_ar || "SPEC Home Dubai";

  const tagline = isAr
    ? currentSettings.tagline_ar || currentSettings.tagline_en || "قمة العقارات الفاخرة في دبي"
    : currentSettings.tagline_en || currentSettings.tagline_ar || "The Pinnacle of Dubai Luxury Real Estate";

  const announcement = isAr
    ? currentSettings.announcement_ar || currentSettings.announcement_en || ""
    : currentSettings.announcement_en || currentSettings.announcement_ar || "";

  const officeAddress = isAr
    ? currentSettings.office_address_ar || currentSettings.office_address_en || "الطابق 42، برج السعادة، وسط مدينة دبي، الإمارات"
    : currentSettings.office_address_en || currentSettings.office_address_ar || "Level 42, Al Saada Tower, Downtown Dubai, UAE";

  const logoUrl = currentSettings.logo_path
    ? currentSettings.logo_path.startsWith("http")
      ? currentSettings.logo_path
      : getStorageUrl(currentSettings.logo_path, "site-assets")
    : null;

  const heroImageUrl = currentSettings.hero_image_path
    ? currentSettings.hero_image_path.startsWith("http")
      ? currentSettings.hero_image_path
      : getStorageUrl(currentSettings.hero_image_path, "site-assets")
    : null;

  const value: SiteSettingsContextType = {
    settings: currentSettings,
    brandName,
    tagline,
    announcement,
    officeAddress,
    contactEmail: currentSettings.contact_email || "concierge@spechome.com",
    contactPhone: currentSettings.contact_phone || "+971 4 800 7732",
    whatsappNumber: currentSettings.whatsapp_number || "+971 50 999 8888",
    logoUrl,
    heroImageUrl,
    instagramUrl: currentSettings.instagram_url || "https://instagram.com/spechomedubai",
    linkedinUrl: currentSettings.linkedin_url || "https://linkedin.com/company/spechomedubai",
    youtubeUrl: currentSettings.youtube_url || "https://youtube.com/@spechomedubai",
    maintenanceMode: !!currentSettings.maintenance_mode,
    currency: currentSettings.currency || "AED",
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
