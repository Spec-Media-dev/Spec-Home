"use client";

import React, { useState, useEffect } from "react";
import {
  Settings2,
  Save,
  Globe,
  Phone,
  Mail,
  Share2,
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  MessageCircle,
} from "lucide-react";
import { useRealtimeDashboard } from "@/lib/supabase/useRealtimeDashboard";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

// Define a type for local settings state to support missing UI fields
interface LocalSiteSettings {
  key: string;
  brand_name_en: string;
  brand_name_ar: string;
  contact_email: string;
  contact_phone: string;
  whatsapp_number: string;
  logo_path: string;
  siteUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;
  enableVipInquiries?: boolean;
  maintenanceMode?: boolean;
  officeAddress?: string;
}

export default function SiteSettingsPage() {
  const { siteSettings, refreshData } = useRealtimeDashboard();
  const [settings, setSettings] = useState<LocalSiteSettings | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "contact" | "social" | "system">("general");
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (siteSettings) {
      setSettings({
        key: siteSettings.key || "global",
        brand_name_en: siteSettings.brand_name_en || "",
        brand_name_ar: siteSettings.brand_name_ar || "",
        contact_email: siteSettings.contact_email || "",
        contact_phone: siteSettings.contact_phone || "",
        whatsapp_number: siteSettings.whatsapp_number || "",
        logo_path: siteSettings.logo_path || "",
        siteUrl: "https://spechome.com",
        seoTitle: "SPEC - Luxury Real Estate",
        seoDescription: "Exclusive ultra-luxury properties in Dubai",
        facebookUrl: "https://facebook.com",
        instagramUrl: "https://instagram.com",
        linkedinUrl: "https://linkedin.com",
        youtubeUrl: "https://youtube.com",
        enableVipInquiries: false,
        maintenanceMode: false,
        officeAddress: "Dubai, UAE",
      });
    } else {
      setSettings({
        key: "global",
        brand_name_en: "SPEC Luxury",
        brand_name_ar: "سبيك للعقارات",
        contact_email: "contact@spechome.com",
        contact_phone: "+971 4 123 4567",
        whatsapp_number: "+971 50 123 4567",
        logo_path: "",
        facebookUrl: "https://facebook.com",
        instagramUrl: "https://instagram.com",
        linkedinUrl: "https://linkedin.com",
        youtubeUrl: "https://youtube.com",
        enableVipInquiries: false,
        maintenanceMode: false,
        officeAddress: "Dubai, UAE",
      });
    }
  }, [siteSettings]);

  const handleChange = <K extends keyof LocalSiteSettings>(key: K, value: LocalSiteSettings[K]) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    
    try {
      const { error } = await supabase.from("site_settings").upsert({
        key: "global",
        brand_name_en: settings.brand_name_en,
        brand_name_ar: settings.brand_name_ar,
        contact_email: settings.contact_email,
        contact_phone: settings.contact_phone,
        whatsapp_number: settings.whatsapp_number,
        logo_path: settings.logo_path,
        updated_at: new Date().toISOString()
      }, { onConflict: "key" });
      
      if (error) throw error;
      
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
      refreshData();
    } catch (err: unknown) {
      console.error("Failed to save site settings:", err);
      alert(`Error saving: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetData = () => {
    if (confirm("Reset is disabled in connected database mode.")) {
      // Disabled
    }
  };

  if (!settings) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#222222]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-accent font-semibold">table: site_settings</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Settings2 className="text-accent" size={24} />
            Global Site Settings & Brand Configuration
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Configure platform branding, contact WhatsApp integration, SEO meta headers, and system status.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-black font-semibold text-xs rounded-lg hover:bg-[#e5c158] transition-all shadow-[0_0_15px_rgba(212,175,55,0.25)] self-start sm:self-auto disabled:opacity-50"
        >
          <Save size={16} />
          <span>{isSaving ? "Saving..." : "Save Changes"}</span>
        </button>
      </div>

      {isSaved && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-medium flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={18} />
          <span>Site settings successfully updated and synchronized!</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#262626] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === "general"
              ? "bg-white/10 text-white border-b-2 border-accent"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <Globe size={14} />
          <span>General & SEO</span>
        </button>

        <button
          onClick={() => setActiveTab("contact")}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === "contact"
              ? "bg-white/10 text-white border-b-2 border-accent"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <Phone size={14} />
          <span>Contact & WhatsApp</span>
        </button>

        <button
          onClick={() => setActiveTab("social")}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === "social"
              ? "bg-white/10 text-white border-b-2 border-accent"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <Share2 size={14} />
          <span>Social Media & VIP</span>
        </button>

        <button
          onClick={() => setActiveTab("system")}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === "system"
              ? "bg-white/10 text-white border-b-2 border-accent"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <ShieldAlert size={14} />
          <span>System & Maintenance</span>
        </button>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSave} className="bg-[#141414] border border-[#262626] rounded-2xl p-6 space-y-6 shadow-sm">
        {/* Tab 1: General & SEO */}
        {activeTab === "general" && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Brand Name (EN) *</label>
                <input
                  type="text"
                  value={settings.brand_name_en}
                  onChange={(e) => handleChange("brand_name_en", e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Brand Name (AR)</label>
                <input
                  type="text"
                  value={settings.brand_name_ar}
                  onChange={(e) => handleChange("brand_name_ar", e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white text-right focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Contact & WhatsApp */}
        {activeTab === "contact" && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Support Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
                  <input
                    type="email"
                    value={settings.contact_email}
                    onChange={(e) => handleChange("contact_email", e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
                  <input
                    type="tel"
                    value={settings.contact_phone}
                    onChange={(e) => handleChange("contact_phone", e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-300 font-medium mb-1 flex items-center gap-1.5">
                  <MessageCircle size={14} className="text-emerald-400" />
                  <span>WhatsApp Integration Number</span>
                </label>
                <input
                  type="text"
                  value={settings.whatsapp_number}
                  onChange={(e) => handleChange("whatsapp_number", e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent font-mono"
                />
              </div>
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Physical Office Address</label>
                <input
                  type="text"
                  value={settings.officeAddress}
                  onChange={(e) => handleChange("officeAddress", e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Social & VIP */}
        {activeTab === "social" && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Instagram URL</label>
                <input
                  type="text"
                  value={settings.instagramUrl}
                  onChange={(e) => handleChange("instagramUrl", e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent font-mono"
                />
              </div>
              <div>
                <label className="block text-neutral-300 font-medium mb-1">LinkedIn URL</label>
                <input
                  type="text"
                  value={settings.linkedinUrl}
                  onChange={(e) => handleChange("linkedinUrl", e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent font-mono"
                />
              </div>
              <div>
                <label className="block text-neutral-300 font-medium mb-1">YouTube URL</label>
                <input
                  type="text"
                  value={settings.youtubeUrl}
                  onChange={(e) => handleChange("youtubeUrl", e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent font-mono"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#1a1a1a] border border-[#2c2c2c] flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Enable VIP Private Inquiries</div>
                <div className="text-xs text-neutral-400">
                  Allow high-net-worth buyers to request private discrete viewings with NDAs.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.enableVipInquiries}
                onChange={(e) => handleChange("enableVipInquiries", e.target.checked)}
                className="w-5 h-5 rounded border-neutral-700 bg-neutral-900 text-accent focus:ring-accent"
              />
            </div>
          </div>
        )}

        {/* Tab 4: System & Maintenance */}
        {activeTab === "system" && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-[#1a1a1a] border border-[#2c2c2c] flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Maintenance Mode</div>
                <div className="text-xs text-neutral-400">
                  When enabled, public visitors see an elegant private preview notice.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => handleChange("maintenanceMode", e.target.checked)}
                className="w-5 h-5 rounded border-neutral-700 bg-neutral-900 text-accent focus:ring-accent"
              />
            </div>

            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-red-300">Reset Demo Database</div>
                <div className="text-xs text-neutral-400">
                  Restore all 7 collections (`admin_profiles`, `enquiries`, `projects`, `properties`, etc.) back to default seed data.
                </div>
              </div>
              <button
                type="button"
                onClick={handleResetData}
                className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold text-xs transition-colors flex items-center gap-1.5 shrink-0"
              >
                <RotateCcw size={14} />
                <span>Reset Database</span>
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#262626]">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-accent text-black font-semibold text-xs hover:bg-[#e5c158] transition-all shadow-[0_0_15px_rgba(212,175,55,0.25)] flex items-center gap-2"
          >
            <Save size={15} />
            <span>Save All Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
