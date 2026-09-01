"use client";

import React, { useState, useEffect } from "react";
import {
  Globe2,
  FileText,
  FolderKanban,
  CheckCircle2,
  RefreshCw,
  Upload,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { useRealtimeDashboard } from "@/lib/supabase/useRealtimeDashboard";
import { updateGlobalSeo, upsertPageSeo } from "@/app/actions/seo";
import { uploadMediaFile } from "@/app/actions/upload";
import { getStorageUrl } from "@/lib/supabase/storage";
import Link from "next/link";
import type { PageSeoRow } from "@/lib/supabase/types";

type SeoTab = "global" | "pages" | "projects";

export default function SeoManagementPage() {
  const { seoSettings, pageSeoList, projects, loading, refreshData } = useRealtimeDashboard();
  const [activeTab, setActiveTab] = useState<SeoTab>("global");
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  // ── Global SEO Form State ──
  const [websiteTitleEn, setWebsiteTitleEn] = useState("");
  const [websiteTitleAr, setWebsiteTitleAr] = useState("");
  const [defaultMetaTitleEn, setDefaultMetaTitleEn] = useState("");
  const [defaultMetaTitleAr, setDefaultMetaTitleAr] = useState("");
  const [defaultMetaDescEn, setDefaultMetaDescEn] = useState("");
  const [defaultMetaDescAr, setDefaultMetaDescAr] = useState("");
  const [defaultKeywordsEn, setDefaultKeywordsEn] = useState("");
  const [defaultKeywordsAr, setDefaultKeywordsAr] = useState("");
  const [ogTitleEn, setOgTitleEn] = useState("");
  const [ogTitleAr, setOgTitleAr] = useState("");
  const [ogDescEn, setOgDescEn] = useState("");
  const [ogDescAr, setOgDescAr] = useState("");
  const [ogImagePath, setOgImagePath] = useState("");
  const [twitterTitleEn, setTwitterTitleEn] = useState("");
  const [twitterDescEn, setTwitterDescEn] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [robots, setRobots] = useState("index, follow");

  // ── Page SEO Selected State ──
  const [selectedPageSlug, setSelectedPageSlug] = useState("home");
  const [pageTitleEn, setPageTitleEn] = useState("");
  const [pageTitleAr, setPageTitleAr] = useState("");
  const [pageMetaTitleEn, setPageMetaTitleEn] = useState("");
  const [pageMetaTitleAr, setPageMetaTitleAr] = useState("");
  const [pageMetaDescEn, setPageMetaDescEn] = useState("");
  const [pageMetaDescAr, setPageMetaDescAr] = useState("");
  const [pageKeywordsEn, setPageKeywordsEn] = useState("");
  const [pageKeywordsAr, setPageKeywordsAr] = useState("");
  const [pageOgImagePath, setPageOgImagePath] = useState("");

  const [uploadingOg, setUploadingOg] = useState(false);

  // Initialize Global SEO State
  useEffect(() => {
    if (seoSettings) {
      setWebsiteTitleEn(seoSettings.website_title_en || "");
      setWebsiteTitleAr(seoSettings.website_title_ar || "");
      setDefaultMetaTitleEn(seoSettings.default_meta_title_en || "");
      setDefaultMetaTitleAr(seoSettings.default_meta_title_ar || "");
      setDefaultMetaDescEn(seoSettings.default_meta_description_en || "");
      setDefaultMetaDescAr(seoSettings.default_meta_description_ar || "");
      setDefaultKeywordsEn(seoSettings.default_keywords_en || "");
      setDefaultKeywordsAr(seoSettings.default_keywords_ar || "");
      setOgTitleEn(seoSettings.og_title_en || "");
      setOgTitleAr(seoSettings.og_title_ar || "");
      setOgDescEn(seoSettings.og_description_en || "");
      setOgDescAr(seoSettings.og_description_ar || "");
      setOgImagePath(seoSettings.og_image_path || "");
      setTwitterTitleEn(seoSettings.twitter_title_en || "");
      setTwitterDescEn(seoSettings.twitter_description_en || "");
      setCanonicalUrl(seoSettings.canonical_url || "");
      setRobots(seoSettings.robots || "index, follow");
    }
  }, [seoSettings]);

  // Load Page SEO State when selected page changes
  useEffect(() => {
    const page = pageSeoList.find((p) => p.page_slug === selectedPageSlug);
    if (page) {
      setPageTitleEn(page.title_en || "");
      setPageTitleAr(page.title_ar || "");
      setPageMetaTitleEn(page.meta_title_en || "");
      setPageMetaTitleAr(page.meta_title_ar || "");
      setPageMetaDescEn(page.meta_description_en || "");
      setPageMetaDescAr(page.meta_description_ar || "");
      setPageKeywordsEn(page.keywords_en || "");
      setPageKeywordsAr(page.keywords_ar || "");
      setPageOgImagePath(page.og_image_path || "");
    } else {
      setPageTitleEn(selectedPageSlug.toUpperCase());
      setPageTitleAr(selectedPageSlug);
      setPageMetaTitleEn("");
      setPageMetaTitleAr("");
      setPageMetaDescEn("");
      setPageMetaDescAr("");
      setPageKeywordsEn("");
      setPageKeywordsAr("");
      setPageOgImagePath("");
    }
  }, [selectedPageSlug, pageSeoList]);

  const showSuccess = (msg: string) => {
    setSavedMessage(msg);
    setTimeout(() => setSavedMessage(""), 3500);
  };

  const handleSaveGlobalSeo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await updateGlobalSeo({
      website_title_en: websiteTitleEn,
      website_title_ar: websiteTitleAr,
      default_meta_title_en: defaultMetaTitleEn,
      default_meta_title_ar: defaultMetaTitleAr,
      default_meta_description_en: defaultMetaDescEn,
      default_meta_description_ar: defaultMetaDescAr,
      default_keywords_en: defaultKeywordsEn,
      default_keywords_ar: defaultKeywordsAr,
      og_title_en: ogTitleEn,
      og_title_ar: ogTitleAr,
      og_description_en: ogDescEn,
      og_description_ar: ogDescAr,
      og_image_path: ogImagePath,
      twitter_title_en: twitterTitleEn,
      twitter_description_en: twitterDescEn,
      canonical_url: canonicalUrl,
      robots,
    });
    setSaving(false);

    if (res.success) {
      showSuccess("Global SEO configuration saved successfully.");
      refreshData();
    } else {
      alert(res.error || "Failed to save global SEO.");
    }
  };

  const handleSavePageSeo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await upsertPageSeo(selectedPageSlug, {
      title_en: pageTitleEn || selectedPageSlug,
      title_ar: pageTitleAr || pageTitleEn || selectedPageSlug,
      meta_title_en: pageMetaTitleEn,
      meta_title_ar: pageMetaTitleAr,
      meta_description_en: pageMetaDescEn,
      meta_description_ar: pageMetaDescAr,
      keywords_en: pageKeywordsEn,
      keywords_ar: pageKeywordsAr,
      og_image_path: pageOgImagePath,
    });
    setSaving(false);

    if (res.success) {
      showSuccess(`SEO for page '/${selectedPageSlug}' saved successfully.`);
      refreshData();
    } else {
      alert(res.error || "Failed to save page SEO.");
    }
  };

  const handleUploadOgImage = async (e: React.ChangeEvent<HTMLInputElement>, isGlobal: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingOg(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const res = await uploadMediaFile(base64, file.name, "site-assets", "seo");
      if (res.success && res.url) {
        if (isGlobal) {
          setOgImagePath(res.url);
        } else {
          setPageOgImagePath(res.url);
        }
      } else {
        alert(res.error || "Failed to upload image.");
      }
      setUploadingOg(false);
    };
    reader.readAsDataURL(file);
  };

  const pageOptions = [
    { slug: "home", label: "Homepage (/)" },
    { slug: "projects", label: "Master Projects (/projects)" },
    { slug: "properties", label: "Properties Portfolio (/properties)" },
    { slug: "about", label: "About Us (/about)" },
    { slug: "contact", label: "Contact & Advisory (/contact)" },
    { slug: "search", label: "Search & Filter (/search)" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#222222]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-accent font-semibold">tables: seo_settings, page_seo</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Globe2 className="text-accent" size={24} />
            Search Engine Optimization (SEO) Center
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Full bilingual SEO metadata management, OpenGraph social cards, canonical URLs, and indexing controls.
          </p>
        </div>

        <button
          onClick={refreshData}
          title="Refresh from DB"
          className="p-2.5 bg-[#1c1c1c] text-neutral-300 hover:text-white rounded-lg border border-[#2f2f2f] transition-colors self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-accent" : ""} />
        </button>
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
          onClick={() => setActiveTab("global")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === "global"
              ? "bg-accent text-black shadow-md"
              : "text-neutral-400 hover:text-white bg-[#161616] border border-[#262626]"
          }`}
        >
          <Globe2 size={14} />
          <span>Global Site SEO</span>
        </button>

        <button
          onClick={() => setActiveTab("pages")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === "pages"
              ? "bg-accent text-black shadow-md"
              : "text-neutral-400 hover:text-white bg-[#161616] border border-[#262626]"
          }`}
        >
          <FileText size={14} />
          <span>Individual Page SEO</span>
        </button>

        <button
          onClick={() => setActiveTab("projects")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === "projects"
              ? "bg-accent text-black shadow-md"
              : "text-neutral-400 hover:text-white bg-[#161616] border border-[#262626]"
          }`}
        >
          <FolderKanban size={14} />
          <span>Project SEO Audit ({projects.length})</span>
        </button>
      </div>

      {/* TAB 1: Global SEO */}
      {activeTab === "global" && (
        <form onSubmit={handleSaveGlobalSeo} className="bg-[#141414] border border-[#262626] rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-white mb-1">Global Website Meta Defaults</h2>
            <p className="text-xs text-neutral-400">
              These settings form the fallback metadata across the entire site when specific overrides are not present.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-300 font-medium text-xs mb-1">Website Brand Title (EN)</label>
              <input
                type="text"
                value={websiteTitleEn}
                onChange={(e) => setWebsiteTitleEn(e.target.value)}
                placeholder="SPEC Home Dubai | Premium Real Estate"
                className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-neutral-300 font-medium text-xs mb-1">Website Brand Title (AR)</label>
              <input
                type="text"
                value={websiteTitleAr}
                onChange={(e) => setWebsiteTitleAr(e.target.value)}
                placeholder="سبيك هوم دبي | عقارات فاخرة"
                className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-accent dir-ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-300 font-medium text-xs mb-1">Default Meta Title (EN)</label>
              <input
                type="text"
                value={defaultMetaTitleEn}
                onChange={(e) => setDefaultMetaTitleEn(e.target.value)}
                placeholder="SPEC Home Dubai | Ultra-Luxury Real Estate Portfolio"
                className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-neutral-300 font-medium text-xs mb-1">Default Meta Title (AR)</label>
              <input
                type="text"
                value={defaultMetaTitleAr}
                onChange={(e) => setDefaultMetaTitleAr(e.target.value)}
                placeholder="سبيك هوم دبي | المحفظة العقارية فائقة الفخامة"
                className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-accent dir-ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-300 font-medium text-xs mb-1">Default Meta Description (EN)</label>
              <textarea
                rows={3}
                value={defaultMetaDescEn}
                onChange={(e) => setDefaultMetaDescEn(e.target.value)}
                placeholder="Curated portfolio of prime waterfront estates, sky penthouses, and branded residences in Dubai."
                className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-neutral-300 font-medium text-xs mb-1">Default Meta Description (AR)</label>
              <textarea
                rows={3}
                value={defaultMetaDescAr}
                onChange={(e) => setDefaultMetaDescAr(e.target.value)}
                placeholder="محفظة مختارة بعناية من العقارات الشاطئية الفاخرة، والبنتهاوس المعلق في دبي."
                className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-accent dir-ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-300 font-medium text-xs mb-1">Keywords (EN)</label>
              <input
                type="text"
                value={defaultKeywordsEn}
                onChange={(e) => setDefaultKeywordsEn(e.target.value)}
                placeholder="dubai luxury real estate, penthouses, villas, spec home"
                className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-neutral-300 font-medium text-xs mb-1">Keywords (AR)</label>
              <input
                type="text"
                value={defaultKeywordsAr}
                onChange={(e) => setDefaultKeywordsAr(e.target.value)}
                placeholder="عقارات دبي الفاخرة, بنتهاوس دبي, فلل فاخرة, سبيك هوم"
                className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-accent dir-ltr"
              />
            </div>
          </div>

          {/* Social OpenGraph Image */}
          <div className="pt-4 border-t border-[#262626] space-y-4">
            <h3 className="text-sm font-bold text-white">Social Open Graph (OG) & Twitter Cards</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-300 font-medium text-xs mb-1">OG Share Title</label>
                <input
                  type="text"
                  value={ogTitleEn}
                  onChange={(e) => setOgTitleEn(e.target.value)}
                  placeholder="SPEC Home Dubai | Ultra-Luxury Real Estate"
                  className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-neutral-300 font-medium text-xs mb-1">OG Share Image URL / File</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={ogImagePath}
                    onChange={(e) => setOgImagePath(e.target.value)}
                    placeholder="https://... or storage URL"
                    className="flex-1 bg-[#1c1c1c] border border-[#333] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-accent font-mono"
                  />
                  <label className="px-3 py-2 bg-[#222] hover:bg-[#333] text-white rounded-lg border border-[#3a3a3a] cursor-pointer text-xs flex items-center gap-1.5 shrink-0">
                    <Upload size={13} className={uploadingOg ? "animate-spin" : ""} />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUploadOgImage(e, true)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-300 font-medium text-xs mb-1">Canonical Base URL</label>
                <input
                  type="text"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder="https://spechome.com"
                  className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-accent font-mono"
                />
              </div>
              <div>
                <label className="block text-neutral-300 font-medium text-xs mb-1">Robots / Indexing Policy</label>
                <select
                  value={robots}
                  onChange={(e) => setRobots(e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-accent cursor-pointer"
                >
                  <option value="index, follow">index, follow (Standard Production Indexing)</option>
                  <option value="noindex, nofollow">noindex, nofollow (Private / Staging Mode)</option>
                  <option value="noindex, follow">noindex, follow (Do Not Index Pages Directly)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#262626] flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-accent text-black font-bold text-xs rounded-lg hover:bg-[#e5c158] transition-all disabled:opacity-50"
            >
              {saving ? "Saving to Database..." : "Save Global SEO Configuration"}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Page SEO */}
      {activeTab === "pages" && (
        <div className="bg-[#141414] border border-[#262626] rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-white mb-1">Page-Level SEO Customization</h2>
            <p className="text-xs text-neutral-400">
              Customize title tags, descriptions, and keywords for individual static pages on your website.
            </p>
          </div>

          {/* Page Selector Pill list */}
          <div className="flex flex-wrap gap-2">
            {pageOptions.map((p) => (
              <button
                key={p.slug}
                type="button"
                onClick={() => setSelectedPageSlug(p.slug)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  selectedPageSlug === p.slug
                    ? "bg-white text-black font-bold shadow-md"
                    : "bg-[#1c1c1c] text-neutral-400 hover:text-white border border-[#2f2f2f]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSavePageSeo} className="space-y-4 pt-4 border-t border-[#262626]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-300 font-medium text-xs mb-1">Page Title (EN)</label>
                <input
                  type="text"
                  required
                  value={pageTitleEn}
                  onChange={(e) => setPageTitleEn(e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-neutral-300 font-medium text-xs mb-1">Page Title (AR)</label>
                <input
                  type="text"
                  value={pageTitleAr}
                  onChange={(e) => setPageTitleAr(e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-accent dir-ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-300 font-medium text-xs mb-1">Meta Title Tag (EN)</label>
                <input
                  type="text"
                  value={pageMetaTitleEn}
                  onChange={(e) => setPageMetaTitleEn(e.target.value)}
                  placeholder="Master Developments | SPEC Home Dubai"
                  className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-neutral-300 font-medium text-xs mb-1">Meta Title Tag (AR)</label>
                <input
                  type="text"
                  value={pageMetaTitleAr}
                  onChange={(e) => setPageMetaTitleAr(e.target.value)}
                  placeholder="المشاريع العقارية الفاخرة | سبيك هوم"
                  className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-accent dir-ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-300 font-medium text-xs mb-1">Meta Description (EN)</label>
                <textarea
                  rows={3}
                  value={pageMetaDescEn}
                  onChange={(e) => setPageMetaDescEn(e.target.value)}
                  placeholder="Detailed description for search snippets..."
                  className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-neutral-300 font-medium text-xs mb-1">Meta Description (AR)</label>
                <textarea
                  rows={3}
                  value={pageMetaDescAr}
                  onChange={(e) => setPageMetaDescAr(e.target.value)}
                  placeholder="وصف محرك البحث باللغة العربية..."
                  className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-accent dir-ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-300 font-medium text-xs mb-1">Keywords (EN)</label>
                <input
                  type="text"
                  value={pageKeywordsEn}
                  onChange={(e) => setPageKeywordsEn(e.target.value)}
                  placeholder="properties, penthouses, dubai"
                  className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-neutral-300 font-medium text-xs mb-1">Keywords (AR)</label>
                <input
                  type="text"
                  value={pageKeywordsAr}
                  onChange={(e) => setPageKeywordsAr(e.target.value)}
                  placeholder="عقارات, بنتهاوس, دبي"
                  className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-accent dir-ltr"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#262626] flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-accent text-black font-bold text-xs rounded-lg hover:bg-[#e5c158] transition-all disabled:opacity-50"
              >
                {saving ? "Saving to Database..." : `Save SEO for /${selectedPageSlug}`}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: Projects SEO */}
      {activeTab === "projects" && (
        <div className="bg-[#141414] border border-[#262626] rounded-2xl p-6 space-y-5">
          <div>
            <h2 className="text-base font-bold text-white mb-1">Project SEO Health & Metadata Summary</h2>
            <p className="text-xs text-neutral-400">
              Review custom SEO configurations across your master developments. Click Edit to customize directly on the project.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#191919] uppercase font-mono text-[11px] text-neutral-400 border-b border-[#262626]">
                <tr>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Custom SEO Title</th>
                  <th className="px-4 py-3">Meta Description</th>
                  <th className="px-4 py-3">Keywords</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {projects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-semibold text-white">{proj.name_en}</div>
                      <div className="text-neutral-500 text-[11px] font-mono">/{proj.slug}</div>
                    </td>
                    <td className="px-4 py-3 text-neutral-300">
                      {proj.seo_title_en ? (
                        <span className="text-emerald-400 font-mono">✓ {proj.seo_title_en}</span>
                      ) : (
                        <span className="text-neutral-500 font-mono">Default: {proj.name_en}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-neutral-400 max-w-xs truncate">
                      {proj.seo_description_en || proj.description_en || "Default fallback description"}
                    </td>
                    <td className="px-4 py-3 text-neutral-400 font-mono text-[11px]">
                      {proj.seo_keywords_en || "-"}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Link
                        href="/dashboard-admin/projects"
                        className="inline-flex items-center gap-1 px-3 py-1 bg-[#1e1e1e] hover:bg-accent hover:text-black rounded text-neutral-300 text-xs transition-colors"
                      >
                        <span>Edit on Project</span>
                        <ExternalLink size={11} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
