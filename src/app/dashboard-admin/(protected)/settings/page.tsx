"use client";

import React, { useState, useEffect } from "react";
import { useRealtimeDashboard } from "@/lib/supabase/useRealtimeDashboard";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { updateSiteSettings } from "@/app/actions/site-settings";
import { uploadMediaFile } from "@/app/actions/upload";
import { getStorageUrl } from "@/lib/supabase/storage";
import { CheckCircle2, Eye, EyeOff, Upload, Settings, User, ShieldCheck } from "lucide-react";

type SettingsTab = "site" | "profile" | "account";

export default function SettingsPage() {
  const { siteSettings, refreshData } = useRealtimeDashboard();
  const supabase = getSupabaseBrowserClient();
  const [activeTab, setActiveTab] = useState<SettingsTab>("site");

  // ── Site tab state ──
  const [logoPath, setLogoPath] = useState("");
  const [heroImagePath, setHeroImagePath] = useState("");
  const [brandNameEn, setBrandNameEn] = useState("");
  const [brandNameAr, setBrandNameAr] = useState("");
  const [taglineEn, setTaglineEn] = useState("");
  const [taglineAr, setTaglineAr] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [officeAddressEn, setOfficeAddressEn] = useState("");
  const [officeAddressAr, setOfficeAddressAr] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [announcementEn, setAnnouncementEn] = useState("");
  const [announcementAr, setAnnouncementAr] = useState("");

  // ── Profile tab state ──
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // ── Account tab state ──
  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // ── Global state ──
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Load site settings into form
  useEffect(() => {
    if (siteSettings) {
      setLogoPath(siteSettings.logo_path || "");
      setHeroImagePath(siteSettings.hero_image_path || "");
      setBrandNameEn(siteSettings.brand_name_en || "SPEC Home");
      setBrandNameAr(siteSettings.brand_name_ar || "سبيك هوم");
      setTaglineEn(siteSettings.tagline_en || "The Pinnacle of Dubai Luxury Real Estate");
      setTaglineAr(siteSettings.tagline_ar || "قمة العقارات الفاخرة في دبي");
      setContactEmail(siteSettings.contact_email || "info@spechome.com");
      setContactPhone(siteSettings.contact_phone || "+971 4 123 4567");
      setWhatsappNumber(siteSettings.whatsapp_number || "+971 50 000 0000");
      setOfficeAddressEn(siteSettings.office_address_en || "Level 42, Al Saada Tower, Downtown Dubai, UAE");
      setOfficeAddressAr(siteSettings.office_address_ar || "الطابق 42، برج السعادة، وسط مدينة دبي، الإمارات");
      setInstagramUrl(siteSettings.instagram_url || "https://instagram.com/spechomedubai");
      setLinkedinUrl(siteSettings.linkedin_url || "https://linkedin.com/company/spechomedubai");
      setYoutubeUrl(siteSettings.youtube_url || "https://youtube.com/@spechomedubai");
      setMaintenanceMode(!!siteSettings.maintenance_mode);
      setAnnouncementEn(siteSettings.announcement_en || "");
      setAnnouncementAr(siteSettings.announcement_ar || "");
    }
  }, [siteSettings]);

  // Load current user profile
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setCurrentEmail(data.user.email || "");
        setDisplayName(data.user.user_metadata?.full_name || "");
        supabase
          .from("admin_profiles")
          .select("*")
          .eq("id", data.user.id)
          .maybeSingle()
          .then(({ data: profile }) => {
            if (profile) {
              setDisplayName(profile.full_name || "");
              setAvatarUrl(profile.avatar_path || "");
            }
          });
      }
    });
  }, [supabase]);

  const showSuccess = (msg: string) => {
    setSavedMessage(msg);
    setTimeout(() => setSavedMessage(""), 3500);
  };

  // ── Save Site Settings ──
  const handleSaveSite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await updateSiteSettings({
      brand_name_en: brandNameEn,
      brand_name_ar: brandNameAr,
      tagline_en: taglineEn,
      tagline_ar: taglineAr,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      whatsapp_number: whatsappNumber,
      office_address_en: officeAddressEn,
      office_address_ar: officeAddressAr,
      instagram_url: instagramUrl,
      linkedin_url: linkedinUrl,
      youtube_url: youtubeUrl,
      maintenance_mode: maintenanceMode,
      announcement_en: announcementEn,
      announcement_ar: announcementAr,
      logo_path: logoPath,
      hero_image_path: heroImagePath,
    });
    setSaving(false);

    if (res.success) {
      showSuccess("Site settings successfully saved to database.");
      refreshData();
    } else {
      alert(`Error saving site settings: ${res.error}`);
    }
  };

  // ── Save Profile ──
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      alert("Not authenticated.");
      setSaving(false);
      return;
    }

    const { error: profileError } = await supabase
      .from("admin_profiles")
      .upsert({
        id: userData.user.id,
        full_name: displayName,
        avatar_path: avatarUrl,
      });

    await supabase.auth.updateUser({
      data: { full_name: displayName },
    });

    setSaving(false);
    if (profileError) {
      alert(`Error updating profile: ${profileError.message}`);
    } else {
      showSuccess("Admin profile updated successfully.");
      refreshData();
    }
  };

  // ── Change Password ──
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      alert("Please enter a new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);

    if (error) {
      alert(`Error updating password: ${error.message}`);
    } else {
      setNewPassword("");
      setConfirmPassword("");
      showSuccess("Password changed successfully.");
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const res = await uploadMediaFile(base64, file.name, "site-assets", "branding");
      if (res.success && res.url) {
        setLogoPath(res.url);
      } else {
        alert(res.error || "Failed to upload logo.");
      }
      setUploadingLogo(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#222222]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-accent font-semibold">table: site_settings</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Settings className="text-accent" size={24} />
            Website & System Settings
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Manage global branding, contact channels, announcements, social profiles, and admin security credentials.
          </p>
        </div>
      </div>

      {savedMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#262626] pb-3">
        <button
          onClick={() => setActiveTab("site")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === "site"
              ? "bg-accent text-black shadow-md"
              : "text-neutral-400 hover:text-white bg-[#161616] border border-[#262626]"
          }`}
        >
          <Settings size={14} />
          <span>Public Website Settings</span>
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === "profile"
              ? "bg-accent text-black shadow-md"
              : "text-neutral-400 hover:text-white bg-[#161616] border border-[#262626]"
          }`}
        >
          <User size={14} />
          <span>Admin Profile</span>
        </button>

        <button
          onClick={() => setActiveTab("account")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === "account"
              ? "bg-accent text-black shadow-md"
              : "text-neutral-400 hover:text-white bg-[#161616] border border-[#262626]"
          }`}
        >
          <ShieldCheck size={14} />
          <span>Account Security</span>
        </button>
      </div>

      {/* TAB 1: Site Settings */}
      {activeTab === "site" && (
        <form onSubmit={handleSaveSite} className="bg-[#141414] border border-[#262626] rounded-2xl p-6 space-y-6">
          {/* Brand Identity */}
          <div>
            <h2 className="text-base font-bold text-white mb-1">Brand Identity & Taglines</h2>
            <p className="text-xs text-neutral-400">Controls headers, footers, and brand badges across the site.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-300 font-medium text-xs mb-1">Brand Name (English)</label>
              <input
                type="text"
                required
                value={brandNameEn}
                onChange={(e) => setBrandNameEn(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-neutral-300 font-medium text-xs mb-1">Brand Name (Arabic)</label>
              <input
                type="text"
                value={brandNameAr}
                onChange={(e) => setBrandNameAr(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-accent dir-ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-300 font-medium text-xs mb-1">Brand Tagline (English)</label>
              <input
                type="text"
                value={taglineEn}
                onChange={(e) => setTaglineEn(e.target.value)}
                placeholder="The Pinnacle of Dubai Luxury Real Estate"
                className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-neutral-300 font-medium text-xs mb-1">Brand Tagline (Arabic)</label>
              <input
                type="text"
                value={taglineAr}
                onChange={(e) => setTaglineAr(e.target.value)}
                placeholder="قمة العقارات الفاخرة في دبي"
                className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-accent dir-ltr"
              />
            </div>
          </div>

          {/* Logo Asset */}
          <div>
            <label className="block text-neutral-300 font-medium text-xs mb-1">Public Website Logo Asset</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={logoPath}
                onChange={(e) => setLogoPath(e.target.value)}
                placeholder="Logo image URL or storage path"
                className="flex-1 bg-[#1c1c1c] border border-[#333] rounded-lg px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-accent font-mono"
              />
              <label className="px-4 py-2.5 bg-[#222] hover:bg-[#333] text-white rounded-lg border border-[#3a3a3a] cursor-pointer text-xs flex items-center gap-1.5 shrink-0">
                <Upload size={14} className={uploadingLogo ? "animate-spin" : ""} />
                <span>Upload Logo</span>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>
            {logoPath && (
              <div className="mt-2 h-12 w-36 rounded border border-[#333] p-1 bg-black flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={getStorageUrl(logoPath, "site-assets")} alt="Logo preview" className="max-h-full max-w-full object-contain" />
              </div>
            )}
          </div>

          {/* Contact Channels */}
          <div className="pt-4 border-t border-[#262626] space-y-4">
            <h3 className="text-sm font-bold text-white">Direct Contact Channels</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-neutral-300 font-medium text-xs mb-1">Contact Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-neutral-300 font-medium text-xs mb-1">Phone Number</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-neutral-300 font-medium text-xs mb-1">WhatsApp Number</label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-300 font-medium text-xs mb-1">Office Address (EN)</label>
                <input
                  type="text"
                  value={officeAddressEn}
                  onChange={(e) => setOfficeAddressEn(e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-neutral-300 font-medium text-xs mb-1">Office Address (AR)</label>
                <input
                  type="text"
                  value={officeAddressAr}
                  onChange={(e) => setOfficeAddressAr(e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-accent dir-ltr"
                />
              </div>
            </div>
          </div>

          {/* Social Profiles */}
          <div className="pt-4 border-t border-[#262626] space-y-4">
            <h3 className="text-sm font-bold text-white">Social Profiles</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-neutral-300 font-medium text-xs mb-1">Instagram URL</label>
                <input
                  type="text"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/..."
                  className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-neutral-300 font-medium text-xs mb-1">LinkedIn URL</label>
                <input
                  type="text"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/company/..."
                  className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-neutral-300 font-medium text-xs mb-1">YouTube URL</label>
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtube.com/@..."
                  className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          </div>

          {/* Announcements & Maintenance */}
          <div className="pt-4 border-t border-[#262626] space-y-4">
            <h3 className="text-sm font-bold text-white">Announcement Banner & Maintenance</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-300 font-medium text-xs mb-1">Announcement Banner (EN)</label>
                <input
                  type="text"
                  value={announcementEn}
                  onChange={(e) => setAnnouncementEn(e.target.value)}
                  placeholder="Private Previews Available..."
                  className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-neutral-300 font-medium text-xs mb-1">Announcement Banner (AR)</label>
                <input
                  type="text"
                  value={announcementAr}
                  onChange={(e) => setAnnouncementAr(e.target.value)}
                  placeholder="معاينات خاصة متاحة لمجموعات..."
                  className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-accent dir-ltr"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 p-3 bg-[#181818] border border-[#262626] rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="rounded accent-accent w-4 h-4 cursor-pointer"
              />
              <div>
                <span className="text-white text-xs font-semibold block">Maintenance Mode</span>
                <span className="text-neutral-500 text-[11px] block">Show maintenance splash page to public visitors</span>
              </div>
            </label>
          </div>

          <div className="pt-4 border-t border-[#262626] flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-accent text-black font-bold text-xs rounded-lg hover:bg-[#e5c158] transition-all disabled:opacity-50"
            >
              {saving ? "Saving Changes..." : "Save Public Website Settings"}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Profile Settings */}
      {activeTab === "profile" && (
        <form onSubmit={handleSaveProfile} className="bg-[#141414] border border-[#262626] rounded-2xl p-6 space-y-5 max-w-xl">
          <div>
            <h2 className="text-base font-bold text-white mb-1">Admin Profile Information</h2>
            <p className="text-xs text-neutral-400">Update your administrator display name and avatar.</p>
          </div>

          <div>
            <label className="block text-neutral-300 font-medium text-xs mb-1">Display Full Name</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-neutral-300 font-medium text-xs mb-1">Avatar Image URL</label>
            <input
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-accent font-mono"
            />
          </div>

          <div className="pt-3 border-t border-[#262626] flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-accent text-black font-bold text-xs rounded-lg hover:bg-[#e5c158] transition-all disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: Account Security */}
      {activeTab === "account" && (
        <form onSubmit={handleChangePassword} className="bg-[#141414] border border-[#262626] rounded-2xl p-6 space-y-5 max-w-xl">
          <div>
            <h2 className="text-base font-bold text-white mb-1">Administrator Password & Security</h2>
            <p className="text-xs text-neutral-400">Update your Supabase authentication password.</p>
          </div>

          <div>
            <label className="block text-neutral-400 text-xs mb-1">Current Logged-in Email</label>
            <input
              type="text"
              disabled
              value={currentEmail}
              className="w-full bg-[#1c1c1c] border border-[#262626] rounded-lg px-3.5 py-2.5 text-neutral-400 text-xs font-mono cursor-not-allowed"
            />
          </div>

          <div className="relative">
            <label className="block text-neutral-300 font-medium text-xs mb-1">New Password</label>
            <input
              type={showNewPw ? "text" : "password"}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-accent pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNewPw(!showNewPw)}
              className="absolute right-3 top-7 text-neutral-400 hover:text-white"
            >
              {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          <div className="relative">
            <label className="block text-neutral-300 font-medium text-xs mb-1">Confirm New Password</label>
            <input
              type={showConfirmPw ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-accent pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPw(!showConfirmPw)}
              className="absolute right-3 top-7 text-neutral-400 hover:text-white"
            >
              {showConfirmPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          <div className="pt-3 border-t border-[#262626] flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-accent text-black font-bold text-xs rounded-lg hover:bg-[#e5c158] transition-all disabled:opacity-50"
            >
              {saving ? "Updating Password..." : "Update Password"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
