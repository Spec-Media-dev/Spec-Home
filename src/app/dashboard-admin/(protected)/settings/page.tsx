"use client";

import React, { useState, useEffect } from "react";
import { useRealtimeDashboard } from "@/lib/supabase/useRealtimeDashboard";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";

type SettingsTab = "site" | "profile" | "account";

export default function SettingsPage() {
  const { siteSettings, refreshData } = useRealtimeDashboard();
  const supabase = getSupabaseBrowserClient();
  const [activeTab, setActiveTab] = useState<SettingsTab>("site");

  // ── Site tab state ──
  const [logoPath, setLogoPath] = useState("");
  const [brandNameEn, setBrandNameEn] = useState("");
  const [brandNameAr, setBrandNameAr] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  // ── Profile tab state ──
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // ── Account tab state ──
  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // ── Global state ──
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  // Load site settings into form
  useEffect(() => {
    if (siteSettings) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLogoPath(siteSettings.logo_path || "");
      setBrandNameEn(siteSettings.brand_name_en || "");
      setBrandNameAr(siteSettings.brand_name_ar || "");
      setContactEmail(siteSettings.contact_email || "");
      setContactPhone(siteSettings.contact_phone || "");
      setWhatsappNumber(siteSettings.whatsapp_number || "");
    }
  }, [siteSettings]);

  // Load current user profile
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setCurrentEmail(data.user.email || "");
        setDisplayName(data.user.user_metadata?.full_name || "");
        // Try to load profile from admin_profiles
        supabase
          .from("admin_profiles")
          .select("*")
          .eq("id", data.user.id)
          .single()
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
    setTimeout(() => setSavedMessage(""), 3000);
  };

  // ── Save Site Settings ──
  const handleSaveSite = async () => {
    setSaving(true);
    const { error } = await supabase.from("site_settings").upsert(
      {
        key: "global",
        brand_name_en: brandNameEn,
        brand_name_ar: brandNameAr,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        whatsapp_number: whatsappNumber,
        logo_path: logoPath,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );
    setSaving(false);
    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      showSuccess("Site settings saved.");
      refreshData();
    }
  };

  // ── Save Profile ──
  const handleSaveProfile = async () => {
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      alert("Not authenticated.");
      setSaving(false);
      return;
    }

    // Update admin_profiles
    const { error } = await supabase
      .from("admin_profiles")
      .update({
        full_name: displayName,
        avatar_path: avatarUrl,
      })
      .eq("id", userData.user.id);

    // Also update auth metadata
    await supabase.auth.updateUser({
      data: { full_name: displayName },
    });

    setSaving(false);
    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      showSuccess("Profile saved.");
      refreshData();
    }
  };

  // ── Change Email ──
  const handleChangeEmail = async () => {
    if (!newEmail || newEmail !== confirmEmail) {
      alert("Emails do not match.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    setSaving(false);
    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      showSuccess("Email change initiated. Check your inbox for confirmation.");
      setNewEmail("");
      setConfirmEmail("");
    }
  };

  // ── Change Password ──
  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);
    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      showSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const inputClass =
    "w-full bg-[#1c1c1c] border border-[#333] rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-accent placeholder:text-neutral-600";
  const labelClass = "block text-sm font-medium text-neutral-300 mb-1.5";
  const cardClass = "bg-[#141414] border border-[#262626] rounded-xl p-6 space-y-5";
  const btnPrimary =
    "px-5 py-2.5 text-sm font-semibold text-black bg-accent rounded-lg hover:bg-[#e5c158] transition-colors disabled:opacity-50";

  const tabs: { key: SettingsTab; label: string }[] = [
    { key: "site", label: "Site" },
    { key: "profile", label: "Profile" },
    { key: "account", label: "Account" },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>

      {/* Success Message */}
      {savedMessage && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium flex items-center gap-2">
          <CheckCircle2 size={16} />
          {savedMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              activeTab === tab.key
                ? "bg-accent/15 text-accent border-accent/40"
                : "bg-transparent text-neutral-400 border-[#333] hover:text-white hover:border-neutral-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Site Tab ── */}
      {activeTab === "site" && (
        <div className="space-y-6">
          {/* Site Logo */}
          <div className={cardClass}>
            <h2 className="text-base font-semibold text-white">Site logo</h2>
            <p className="text-xs text-neutral-500 -mt-3">
              Replaces the bundled SPEC Home logo in the public header and footer, and across the admin console.
            </p>

            {logoPath ? (
              <div className="flex items-center gap-4">
                <img
                  src={logoPath}
                  alt="Site logo"
                  className="h-12 object-contain rounded bg-[#1a1a1a] p-2 border border-[#333]"
                />
                <button
                  type="button"
                  onClick={() => setLogoPath("")}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Remove logo
                </button>
              </div>
            ) : (
              <div className="bg-[#1a1a1a] border border-dashed border-[#333] rounded-lg p-8 text-center">
                <p className="text-sm text-neutral-500">
                  No custom logo — the bundled SPEC Home logo is in use.
                </p>
              </div>
            )}

            <div>
              <label className={labelClass}>Logo URL</label>
              <input
                type="text"
                value={logoPath}
                onChange={(e) => setLogoPath(e.target.value)}
                className={inputClass}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <button type="button" onClick={handleSaveSite} disabled={saving} className={btnPrimary}>
              {saving ? "Saving..." : "Upload logo"}
            </button>
          </div>

          {/* Brand & Contact */}
          <div className={cardClass}>
            <h2 className="text-base font-semibold text-white">Brand & Contact</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Brand Name (EN)</label>
                <input type="text" value={brandNameEn} onChange={(e) => setBrandNameEn(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Brand Name (AR)</label>
                <input type="text" value={brandNameAr} onChange={(e) => setBrandNameAr(e.target.value)} className={`${inputClass} text-right`} dir="rtl" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Contact Email</label>
                <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Contact Phone</label>
                <input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>WhatsApp Number</label>
              <input type="text" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} className={inputClass} placeholder="+971 50 123 4567" />
            </div>
            <button type="button" onClick={handleSaveSite} disabled={saving} className={btnPrimary}>
              {saving ? "Saving..." : "Save settings"}
            </button>
          </div>
        </div>
      )}

      {/* ── Profile Tab ── */}
      {activeTab === "profile" && (
        <div className={cardClass}>
          <h2 className="text-base font-semibold text-white">Your profile</h2>
          <p className="text-xs text-neutral-500 -mt-3">
            Name and avatar are stored in admin_profiles.
          </p>

          <div>
            <label className={labelClass}>Display name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={inputClass}
              placeholder="Your name"
            />
          </div>

          <div>
            <label className={labelClass}>Avatar</label>
            {avatarUrl && (
              <div className="flex items-center gap-4 mb-3">
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#333]"
                />
                <button
                  type="button"
                  onClick={() => setAvatarUrl("")}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Remove avatar
                </button>
              </div>
            )}
            <input
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className={inputClass}
              placeholder="https://example.com/avatar.jpg"
            />
            <p className="text-xs text-neutral-500 mt-1">JPEG, PNG or WebP up to 1 MB.</p>
          </div>

          <button type="button" onClick={handleSaveProfile} disabled={saving} className={btnPrimary}>
            {saving ? "Saving..." : "Save profile"}
          </button>
        </div>
      )}

      {/* ── Account Tab ── */}
      {activeTab === "account" && (
        <div className="space-y-6">
          {/* Email Change */}
          <div className={cardClass}>
            <h2 className="text-base font-semibold text-white">Email address</h2>
            <p className="text-xs text-neutral-500 -mt-3">
              Email is stored in Supabase Auth. Changing it keeps this admin account and its UID unchanged.
            </p>

            <div>
              <label className={labelClass}>Current email</label>
              <input type="email" value={currentEmail} readOnly className={`${inputClass} opacity-60 cursor-not-allowed`} />
            </div>
            <div>
              <label className={labelClass}>New email</label>
              <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className={inputClass} placeholder="new@example.com" />
            </div>
            <div>
              <label className={labelClass}>Confirm new email</label>
              <input type="email" value={confirmEmail} onChange={(e) => setConfirmEmail(e.target.value)} className={inputClass} placeholder="new@example.com" />
            </div>

            <button type="button" onClick={handleChangeEmail} disabled={saving} className={btnPrimary}>
              {saving ? "Saving..." : "Change email"}
            </button>
          </div>

          {/* Password Change */}
          <div className={cardClass}>
            <h2 className="text-base font-semibold text-white">Change password</h2>
            <p className="text-xs text-neutral-500 -mt-3">
              Enter the current password before choosing a new one.
            </p>

            <div>
              <label className={labelClass}>Current password</label>
              <div className="relative">
                <input
                  type={showCurrentPw ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                >
                  {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className={labelClass}>New password</label>
              <div className="relative">
                <input
                  type={showNewPw ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                >
                  {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-xs text-neutral-500 mt-1">At least 8 characters.</p>
            </div>

            <div>
              <label className={labelClass}>Confirm new password</label>
              <div className="relative">
                <input
                  type={showConfirmPw ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                >
                  {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="button" onClick={handleChangePassword} disabled={saving} className={btnPrimary}>
              {saving ? "Saving..." : "Update password"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
