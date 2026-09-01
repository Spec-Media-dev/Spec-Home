"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ProjectRow } from "@/lib/supabase/types";

export default function NewPropertyPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [langTab, setLangTab] = useState<"en" | "ar">("en");

  // Form state matching PropertyRow schema
  const [projectId, setProjectId] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [propertyTypeEn, setPropertyTypeEn] = useState("");
  const [propertyTypeAr, setPropertyTypeAr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [currency] = useState("AED");
  const [status, setStatus] = useState<"available" | "reserved" | "sold">("available");
  const [bedrooms, setBedrooms] = useState<number | "">("");
  const [bathrooms, setBathrooms] = useState<number | "">("");
  const [areaSqft, setAreaSqft] = useState<number | "">("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  // Load projects for the dropdown
  useEffect(() => {
    supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setProjects(data);
      });
  }, [supabase]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn || !projectId) {
      alert("Title and Project are required.");
      return;
    }

    setSaving(true);
    const slug = titleEn.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const refCode = `SHP-${Math.floor(10000 + Math.random() * 90000)}`;

    const { error } = await supabase.from("properties").insert({
      project_id: projectId,
      slug,
      reference_code: refCode,
      title_en: titleEn,
      title_ar: titleAr || titleEn,
      property_type_en: propertyTypeEn || "Apartment",
      property_type_ar: propertyTypeAr || propertyTypeEn || "شقة",
      description_en: descriptionEn || null,
      description_ar: descriptionAr || null,
      price: Number(price) || 0,
      bedrooms: Number(bedrooms) || 0,
      bathrooms: Number(bathrooms) || 0,
      area_sqft: Number(areaSqft) || 0,
      status,
      is_featured: isFeatured,
      is_published: isPublished,
    });

    setSaving(false);

    if (error) {
      alert(`Error: ${error.message}`);
      return;
    }

    router.push("/dashboard-admin/properties");
  };

  const inputClass =
    "w-full bg-[#1c1c1c] border border-[#333] rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-accent placeholder:text-neutral-600";
  const labelClass = "block text-sm font-medium text-neutral-300 mb-1.5";
  const hintClass = "text-xs text-neutral-500 mt-1";
  const cardClass = "bg-[#141414] border border-[#262626] rounded-xl p-6 space-y-5";

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-white">New property</h1>
        <p className="text-sm text-neutral-400 mt-0.5">
          Reference code and URL slug are generated automatically.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Project Section */}
        <div className={cardClass}>
          <h2 className="text-base font-semibold text-white">Project</h2>
          <p className="text-xs text-neutral-500 -mt-3">Every property must belong to a project.</p>
          <div>
            <label className={labelClass}>
              Project <span className="text-red-400">*</span>
            </label>
            <select
              required
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="">Select a project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name_en}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Basic Information */}
        <div className={cardClass}>
          <h2 className="text-base font-semibold text-white">Basic information</h2>

          {/* Language Tabs */}
          <div className="flex gap-1 bg-[#1a1a1a] rounded-lg p-1 w-fit">
            <button
              type="button"
              onClick={() => setLangTab("en")}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                langTab === "en"
                  ? "bg-[#2a2a2a] text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLangTab("ar")}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                langTab === "ar"
                  ? "bg-[#2a2a2a] text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              العربية
            </button>
          </div>

          {langTab === "en" ? (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  className={inputClass}
                  placeholder="e.g., The Sapphire Penthouse"
                />
              </div>
              <div>
                <label className={labelClass}>
                  Property type <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={propertyTypeEn}
                  onChange={(e) => setPropertyTypeEn(e.target.value)}
                  className={inputClass}
                  placeholder="e.g., Apartment, Villa, Townhouse"
                />
                <p className={hintClass}>
                  For example: Apartment, Villa, Townhouse
                </p>
              </div>
              <div>
                <label className={labelClass}>
                  Description <span className="text-neutral-600 text-xs font-normal">Optional</span>
                </label>
                <textarea
                  rows={4}
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  className={inputClass}
                  placeholder="Describe the property..."
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4" dir="rtl">
              <div>
                <label className={`${labelClass} text-right`}>
                  العنوان <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  className={`${inputClass} text-right`}
                  placeholder="مثال: بنتهاوس الياقوت"
                />
              </div>
              <div>
                <label className={`${labelClass} text-right`}>
                  نوع العقار
                </label>
                <input
                  type="text"
                  value={propertyTypeAr}
                  onChange={(e) => setPropertyTypeAr(e.target.value)}
                  className={`${inputClass} text-right`}
                  placeholder="مثال: شقة، فيلا، تاون هاوس"
                />
              </div>
              <div>
                <label className={`${labelClass} text-right`}>
                  الوصف <span className="text-neutral-600 text-xs font-normal">اختياري</span>
                </label>
                <textarea
                  rows={4}
                  value={descriptionAr}
                  onChange={(e) => setDescriptionAr(e.target.value)}
                  className={`${inputClass} text-right`}
                  placeholder="وصف العقار..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Pricing and Size */}
        <div className={cardClass}>
          <h2 className="text-base font-semibold text-white">Pricing and size</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Price</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
                className={inputClass}
                placeholder="0"
              />
              <p className={hintClass}>Leave empty for price on request.</p>
            </div>
            <div>
              <label className={labelClass}>Currency</label>
              <input
                type="text"
                value={currency}
                readOnly
                className={`${inputClass} opacity-60 cursor-not-allowed`}
              />
              <p className={hintClass}>Three-letter code, e.g. AED.</p>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="sold">Sold</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>
                Bedrooms <span className="text-neutral-600 text-xs font-normal">Optional</span>
              </label>
              <input
                type="number"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value ? Number(e.target.value) : "")}
                className={inputClass}
                placeholder="0"
              />
            </div>
            <div>
              <label className={labelClass}>
                Bathrooms <span className="text-neutral-600 text-xs font-normal">Optional</span>
              </label>
              <input
                type="number"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value ? Number(e.target.value) : "")}
                className={inputClass}
                placeholder="0"
              />
            </div>
            <div>
              <label className={labelClass}>
                Size (sqft) <span className="text-neutral-600 text-xs font-normal">Optional</span>
              </label>
              <input
                type="number"
                value={areaSqft}
                onChange={(e) => setAreaSqft(e.target.value ? Number(e.target.value) : "")}
                className={inputClass}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Publishing */}
        <div className={cardClass}>
          <h2 className="text-base font-semibold text-white">Publishing</h2>

          <div className="flex items-center gap-8">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#333] rounded-full peer-checked:bg-accent transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" />
              </div>
              <span className="text-sm font-medium text-neutral-300 group-hover:text-white transition-colors">
                Featured
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#333] rounded-full peer-checked:bg-accent transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" />
              </div>
              <span className="text-sm font-medium text-neutral-300 group-hover:text-white transition-colors">
                Published
              </span>
            </label>
          </div>

          <p className="text-xs text-neutral-500">
            Save as a draft first, then add images to publish.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 text-sm font-semibold text-black bg-accent rounded-lg hover:bg-[#e5c158] transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save as draft"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm text-neutral-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
