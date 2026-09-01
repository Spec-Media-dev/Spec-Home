"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  Search,
  Bed,
  Bath,
  Maximize,
  Edit2,
  Trash2,
  Image as ImageIcon,
  SlidersHorizontal,
  X,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useRealtimeDashboard } from "@/lib/supabase/useRealtimeDashboard";
import { createProperty, updateProperty, deleteProperty, togglePropertyPublished } from "@/app/actions/properties";
import type { PropertyRow } from "@/lib/supabase/types";

export default function PropertiesPage() {
  const {
    properties,
    projects,
    images,
    loading,
    isConnected,
    refreshData,
  } = useRealtimeDashboard();

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [projectFilter, setProjectFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<PropertyRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [showSeo, setShowSeo] = useState(false);

  // Form State
  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [projectId, setProjectId] = useState("");
  const [propertyTypeEn, setPropertyTypeEn] = useState("Villa");
  const [propertyTypeAr, setPropertyTypeAr] = useState("فيلا فاخرة");
  const [price, setPrice] = useState<number | string>(15000000);
  const [currency, setCurrency] = useState("AED");
  const [bedrooms, setBedrooms] = useState<number | string>(5);
  const [bathrooms, setBathrooms] = useState<number | string>(6);
  const [areaSqFt, setAreaSqFt] = useState<number | string>(7500);
  const [status, setStatus] = useState<"available" | "reserved" | "sold">("available");
  const [handoverEn, setHandoverEn] = useState("Q4 2026");
  const [handoverAr, setHandoverAr] = useState("الربع الرابع 2026");
  const [paymentPlanEn, setPaymentPlanEn] = useState("50 / 50");
  const [paymentPlanAr, setPaymentPlanAr] = useState("50 / 50");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(true);

  // SEO
  const [seoTitleEn, setSeoTitleEn] = useState("");
  const [seoTitleAr, setSeoTitleAr] = useState("");
  const [seoDescEn, setSeoDescEn] = useState("");
  const [seoDescAr, setSeoDescAr] = useState("");
  const [seoKeywordsEn, setSeoKeywordsEn] = useState("");

  const openAddModal = () => {
    setEditingProperty(null);
    setTitleEn("");
    setTitleAr("");
    setProjectId(projects[0]?.id || "");
    setPropertyTypeEn("Villa");
    setPropertyTypeAr("فيلا فاخرة");
    setPrice(18500000);
    setCurrency("AED");
    setBedrooms(5);
    setBathrooms(6);
    setAreaSqFt(8200);
    setStatus("available");
    setHandoverEn("Q4 2026");
    setHandoverAr("الربع الرابع 2026");
    setPaymentPlanEn("50 / 50");
    setPaymentPlanAr("50 / 50");
    setDescriptionEn("");
    setDescriptionAr("");
    setIsPublished(true);
    setIsFeatured(true);
    setSeoTitleEn("");
    setSeoTitleAr("");
    setSeoDescEn("");
    setSeoDescAr("");
    setSeoKeywordsEn("");
    setShowSeo(false);
    setIsModalOpen(true);
  };

  const openEditModal = (prop: PropertyRow) => {
    setEditingProperty(prop);
    setTitleEn(prop.title_en || "");
    setTitleAr(prop.title_ar || prop.title_en || "");
    setProjectId(prop.project_id || "");
    setPropertyTypeEn(prop.property_type_en || "apartment");
    setPropertyTypeAr(prop.property_type_ar || prop.property_type_en || "عقار");
    setPrice(Number(prop.price) || 0);
    setCurrency(prop.currency || "AED");
    setBedrooms(Number(prop.bedrooms) || 1);
    setBathrooms(Number(prop.bathrooms) || 1);
    setAreaSqFt(Number(prop.area_sqft || prop.size_sqft || 0));
    setStatus(prop.status || "available");
    setHandoverEn(prop.handover_en || "");
    setHandoverAr(prop.handover_ar || "");
    setPaymentPlanEn(prop.payment_plan_en || "");
    setPaymentPlanAr(prop.payment_plan_ar || "");
    setDescriptionEn(prop.description_en || "");
    setDescriptionAr(prop.description_ar || "");
    setIsPublished(prop.is_published ?? true);
    setIsFeatured(prop.is_featured ?? false);
    setSeoTitleEn(prop.seo_title_en || "");
    setSeoTitleAr(prop.seo_title_ar || "");
    setSeoDescEn(prop.seo_description_en || "");
    setSeoDescAr(prop.seo_description_ar || "");
    setSeoKeywordsEn(prop.seo_keywords_en || "");
    setShowSeo(false);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn) {
      alert("Please enter the property title.");
      return;
    }
    if (!projectId) {
      alert("Please select a master project.");
      return;
    }

    setSaving(true);
    try {
      if (editingProperty) {
        const res = await updateProperty(editingProperty.id, {
          project_id: projectId,
          title_en: titleEn,
          title_ar: titleAr || titleEn,
          property_type_en: propertyTypeEn,
          property_type_ar: propertyTypeAr || propertyTypeEn,
          price: Number(price),
          currency,
          bedrooms: Number(bedrooms),
          bathrooms: Number(bathrooms),
          area_sqft: Number(areaSqFt),
          status,
          handover_en: handoverEn,
          handover_ar: handoverAr || handoverEn,
          payment_plan_en: paymentPlanEn,
          payment_plan_ar: paymentPlanAr || paymentPlanEn,
          description_en: descriptionEn,
          description_ar: descriptionAr,
          is_published: isPublished,
          is_featured: isFeatured,
          seo_title_en: seoTitleEn || null,
          seo_title_ar: seoTitleAr || null,
          seo_description_en: seoDescEn || null,
          seo_description_ar: seoDescAr || null,
          seo_keywords_en: seoKeywordsEn || null,
        });

        if (!res.success) {
          alert(`Failed to update property: ${res.error}`);
          setSaving(false);
          return;
        }
      } else {
        const res = await createProperty({
          project_id: projectId,
          title_en: titleEn,
          title_ar: titleAr || titleEn,
          property_type_en: propertyTypeEn,
          property_type_ar: propertyTypeAr || propertyTypeEn,
          price: Number(price),
          currency,
          bedrooms: Number(bedrooms),
          bathrooms: Number(bathrooms),
          area_sqft: Number(areaSqFt),
          status,
          handover_en: handoverEn,
          handover_ar: handoverAr || handoverEn,
          payment_plan_en: paymentPlanEn,
          payment_plan_ar: paymentPlanAr || paymentPlanEn,
          description_en: descriptionEn,
          description_ar: descriptionAr,
          is_published: isPublished,
          is_featured: isFeatured,
          seo_title_en: seoTitleEn || null,
          seo_title_ar: seoTitleAr || null,
          seo_description_en: seoDescEn || null,
          seo_description_ar: seoDescAr || null,
          seo_keywords_en: seoKeywordsEn || null,
        });

        if (!res.success) {
          alert(`Failed to create property: ${res.error}`);
          setSaving(false);
          return;
        }
      }

      setIsModalOpen(false);
      refreshData();
    } catch (err: any) {
      console.error("Property save error:", err);
      alert(`Error saving property: ${err?.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (id: string) => {
    const res = await togglePropertyPublished(id);
    if (!res.success) {
      alert(res.error || "Failed to toggle publish status");
    } else {
      refreshData();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to permanently delete this property listing?")) {
      const res = await deleteProperty(id);
      if (!res.success) {
        alert(res.error || "Failed to delete property");
      } else {
        refreshData();
      }
    }
  };

  const filteredProperties = properties.filter((prop) => {
    const titleEn = (prop.title_en || "").toLowerCase();
    const titleAr = (prop.title_ar || "").toLowerCase();
    const refCode = (prop.reference_code || "").toLowerCase();
    const sTerm = (searchTerm || "").toLowerCase();

    const matchesSearch =
      !sTerm ||
      titleEn.includes(sTerm) ||
      titleAr.includes(sTerm) ||
      refCode.includes(sTerm);
    const matchesType = typeFilter === "All" || prop.property_type_en === typeFilter;
    const matchesStatus = statusFilter === "All" || (prop.status || "").toLowerCase() === statusFilter.toLowerCase();
    const matchesProject = projectFilter === "All" || prop.project_id === projectFilter;
    return matchesSearch && matchesType && matchesStatus && matchesProject;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#222222]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-accent font-semibold">table: properties</span>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {isConnected ? "● Realtime Live" : "Syncing..."}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Building2 className="text-accent" size={24} />
            Property Inventory Listings
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Manage signature mansions, beachfront villas, sky penthouses, and units linked to master projects.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshData}
            title="Refresh from DB"
            className="p-2.5 bg-[#1c1c1c] text-neutral-300 hover:text-white rounded-lg border border-[#2f2f2f] transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-accent" : ""} />
          </button>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent text-black font-semibold text-xs rounded-lg hover:bg-[#e5c158] transition-all shadow-[0_0_15px_rgba(212,175,55,0.25)] self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>Add New Property</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#141414] p-3 rounded-xl border border-[#262626]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={15} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search properties by title, reference code..."
            className="w-full bg-[#1c1c1c] border border-[#2f2f2f] rounded-lg pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="bg-[#1c1c1c] border border-[#2f2f2f] text-neutral-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-accent cursor-pointer max-w-[170px] truncate"
          >
            <option value="All">All Projects</option>
            {projects.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.name_en}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#1c1c1c] border border-[#2f2f2f] text-neutral-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="All">All Types</option>
            <option value="Villa">Villa</option>
            <option value="Penthouse">Penthouse</option>
            <option value="Apartment">Apartment</option>
            <option value="Mansion">Mansion</option>
            <option value="Townhouse">Townhouse</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#1c1c1c] border border-[#2f2f2f] text-neutral-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
          </select>
        </div>
      </div>

      {/* Properties Data Table */}
      <div className="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#191919] text-[11px] uppercase font-mono text-neutral-400 border-b border-[#262626]">
              <tr>
                <th className="px-5 py-3.5">Property Listing</th>
                <th className="px-5 py-3.5">Project & Ref</th>
                <th className="px-5 py-3.5">Price</th>
                <th className="px-5 py-3.5">Specs</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Media & Specs</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222222]">
              {filteredProperties.map((prop) => {
                const parentProject = projects.find((p) => p.id === prop.project_id);
                const propImagesCount = images.filter((img) => img.property_id === prop.id).length;

                return (
                  <tr key={prop.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Property Title */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-semibold text-white text-sm flex items-center gap-2">
                          {prop.title_en}
                          {prop.is_featured && (
                            <span className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.2 rounded font-mono">
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-neutral-400 font-mono mt-0.5">{prop.title_ar}</div>
                      </div>
                    </td>

                    {/* Type & Ref */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="font-medium text-neutral-200">{parentProject?.name_en || "Independent Listing"}</div>
                      <div className="text-xs text-neutral-500 font-mono flex items-center gap-2">
                        <span>{prop.property_type_en}</span>
                        <span>•</span>
                        <span className="text-accent">{prop.reference_code}</span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="font-bold text-accent text-sm font-mono">
                        {prop.currency || "AED"} {Number(prop.price).toLocaleString()}
                      </span>
                    </td>

                    {/* Specs Summary */}
                    <td className="px-5 py-4 whitespace-nowrap text-xs text-neutral-300 font-mono">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1" title="Bedrooms">
                          <Bed size={13} className="text-neutral-500" /> {prop.bedrooms}
                        </span>
                        <span className="flex items-center gap-1" title="Bathrooms">
                          <Bath size={13} className="text-neutral-500" /> {prop.bathrooms}
                        </span>
                        <span className="flex items-center gap-1" title="Area Sqft">
                          <Maximize size={13} className="text-neutral-500" /> {Number(prop.area_sqft || prop.size_sqft || 0).toLocaleString()} sqft
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTogglePublish(prop.id)}
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full transition-colors flex items-center gap-1 ${
                            prop.is_published
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : "bg-neutral-800 text-neutral-400 border border-neutral-700"
                          }`}
                          title="Click to toggle publish status"
                        >
                          {prop.is_published ? <Eye size={10} /> : <EyeOff size={10} />}
                          {prop.is_published ? "PUBLISHED" : "DRAFT"}
                        </button>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                            prop.status === "available"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : prop.status === "reserved"
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-blue-500/10 text-blue-400"
                          }`}
                        >
                          {prop.status}
                        </span>
                      </div>
                    </td>

                    {/* Linked DB shortcuts */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard-admin/property-images`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1e1e1e] hover:bg-accent hover:text-black rounded text-[11px] text-neutral-300 transition-colors font-mono"
                          title="Manage Media"
                        >
                          <ImageIcon size={12} />
                          <span>{propImagesCount} images</span>
                        </Link>
                        <Link
                          href={`/dashboard-admin/property-specs`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1e1e1e] hover:bg-accent hover:text-black rounded text-[11px] text-neutral-300 transition-colors font-mono"
                          title="Manage Specifications"
                        >
                          <SlidersHorizontal size={12} />
                          <span>specs</span>
                        </Link>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2 text-neutral-400">
                        <button
                          onClick={() => openEditModal(prop)}
                          className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                          title="Edit Listing"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(prop.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          title="Delete Listing"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProperties.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-neutral-500">
                    No properties found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Property Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl w-full max-w-3xl my-8 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626] bg-[#181818]">
              <div className="flex items-center gap-2">
                <Building2 className="text-accent" size={18} />
                <h3 className="font-bold text-white text-base">
                  {editingProperty ? `Edit Property Listing — ${editingProperty.title_en}` : "Add New Property Listing"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5 text-xs sm:text-sm max-h-[80vh] overflow-y-auto">
              {/* Title (Bilingual) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Title (English) *</label>
                  <input
                    type="text"
                    required
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    placeholder="Palm Signature Villa 12"
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Title (Arabic)</label>
                  <input
                    type="text"
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                    placeholder="فيلا نخلة جميرا سيغنتشر 12"
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent dir-ltr"
                  />
                </div>
              </div>

              {/* Master Project & Property Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Associated Master Project *</label>
                  <select
                    required
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="">Select Master Project</option>
                    {projects.map((proj) => (
                      <option key={proj.id} value={proj.id}>
                        {proj.name_en} ({proj.location_en})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Property Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={propertyTypeEn}
                      onChange={(e) => setPropertyTypeEn(e.target.value)}
                      placeholder="Villa / Penthouse"
                      className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-accent"
                    />
                    <input
                      type="text"
                      value={propertyTypeAr}
                      onChange={(e) => setPropertyTypeAr(e.target.value)}
                      placeholder="فيلا فاخرة"
                      className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-accent dir-ltr"
                    />
                  </div>
                </div>
              </div>

              {/* Price, Currency, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Price</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="15000000"
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent font-mono"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Currency</label>
                  <input
                    type="text"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    placeholder="AED"
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent font-mono"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Availability Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>
              </div>

              {/* Bedrooms, Bathrooms, Area */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Bedrooms</label>
                  <input
                    type="number"
                    min={0}
                    value={bedrooms === "" ? "" : isNaN(Number(bedrooms)) ? 0 : bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent font-mono"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Bathrooms</label>
                  <input
                    type="number"
                    min={0}
                    value={bathrooms === "" ? "" : isNaN(Number(bathrooms)) ? 0 : bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent font-mono"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Area (Sq. Ft.)</label>
                  <input
                    type="number"
                    min={0}
                    value={areaSqFt === "" ? "" : isNaN(Number(areaSqFt)) ? 0 : areaSqFt}
                    onChange={(e) => setAreaSqFt(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent font-mono"
                  />
                </div>
              </div>

              {/* Handover & Payment Plan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Handover Info (EN / AR)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={handoverEn}
                      onChange={(e) => setHandoverEn(e.target.value)}
                      placeholder="Q4 2026"
                      className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent text-xs"
                    />
                    <input
                      type="text"
                      value={handoverAr}
                      onChange={(e) => setHandoverAr(e.target.value)}
                      placeholder="الربع الرابع 2026"
                      className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent text-xs dir-ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Payment Plan (EN / AR)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={paymentPlanEn}
                      onChange={(e) => setPaymentPlanEn(e.target.value)}
                      placeholder="50 / 50"
                      className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent text-xs"
                    />
                    <input
                      type="text"
                      value={paymentPlanAr}
                      onChange={(e) => setPaymentPlanAr(e.target.value)}
                      placeholder="50 / 50"
                      className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent text-xs dir-ltr"
                    />
                  </div>
                </div>
              </div>

              {/* Descriptions (Bilingual) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Description (English)</label>
                  <textarea
                    rows={3}
                    value={descriptionEn}
                    onChange={(e) => setDescriptionEn(e.target.value)}
                    placeholder="Full residential overview, bespoke architectural details, private amenities..."
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Description (Arabic)</label>
                  <textarea
                    rows={3}
                    value={descriptionAr}
                    onChange={(e) => setDescriptionAr(e.target.value)}
                    placeholder="وصف تفصيلي للوحدة السكنية والمواصفات المعمارية والإطلالات..."
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent dir-ltr"
                  />
                </div>
              </div>

              {/* Status Toggles */}
              <div className="flex flex-wrap items-center gap-6 p-3 rounded-lg bg-[#181818] border border-[#262626]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="rounded accent-accent w-4 h-4 cursor-pointer"
                  />
                  <span className="text-white text-xs font-medium">Published on Website</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded accent-accent w-4 h-4 cursor-pointer"
                  />
                  <span className="text-accent text-xs font-medium flex items-center gap-1">
                    <Sparkles size={12} /> Featured Property
                  </span>
                </label>
              </div>

              {/* SEO Collapsible Section */}
              <div className="border border-[#262626] rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowSeo(!showSeo)}
                  className="w-full flex items-center justify-between p-3.5 bg-[#181818] hover:bg-[#1f1f1f] text-left transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-xs">Property SEO & Metadata</span>
                    <span className="text-[10px] text-accent font-mono bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                      Optional
                    </span>
                  </div>
                  {showSeo ? <ChevronUp size={16} className="text-neutral-400" /> : <ChevronDown size={16} className="text-neutral-400" />}
                </button>

                {showSeo && (
                  <div className="p-4 space-y-4 bg-[#141414]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-neutral-400 text-xs mb-1">SEO Title (EN)</label>
                        <input
                          type="text"
                          value={seoTitleEn}
                          onChange={(e) => setSeoTitleEn(e.target.value)}
                          placeholder="Palm Signature Villa 12 | Palm Jumeirah"
                          className="w-full bg-[#1c1c1c] border border-[#333] rounded px-3 py-2 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-400 text-xs mb-1">SEO Title (AR)</label>
                        <input
                          type="text"
                          value={seoTitleAr}
                          onChange={(e) => setSeoTitleAr(e.target.value)}
                          placeholder="فيلا نخلة جميرا 12 | دبي"
                          className="w-full bg-[#1c1c1c] border border-[#333] rounded px-3 py-2 text-white text-xs dir-ltr"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-neutral-400 text-xs mb-1">Meta Description (EN)</label>
                        <textarea
                          rows={2}
                          value={seoDescEn}
                          onChange={(e) => setSeoDescEn(e.target.value)}
                          placeholder="Ultra luxury beachfront villa on Palm Jumeirah..."
                          className="w-full bg-[#1c1c1c] border border-[#333] rounded px-3 py-2 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-400 text-xs mb-1">Meta Description (AR)</label>
                        <textarea
                          rows={2}
                          value={seoDescAr}
                          onChange={(e) => setSeoDescAr(e.target.value)}
                          placeholder="فيلا شاطئية فائقة الفخامة على نخلة جميرا..."
                          className="w-full bg-[#1c1c1c] border border-[#333] rounded px-3 py-2 text-white text-xs dir-ltr"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-neutral-400 text-xs mb-1">Keywords</label>
                      <input
                        type="text"
                        value={seoKeywordsEn}
                        onChange={(e) => setSeoKeywordsEn(e.target.value)}
                        placeholder="palm jumeirah villa, waterfront mansion, spec home"
                        className="w-full bg-[#1c1c1c] border border-[#333] rounded px-3 py-2 text-white text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#262626]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-lg bg-[#222222] text-neutral-300 hover:text-white text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-lg bg-accent text-black font-semibold text-xs hover:bg-[#e5c158] transition-all disabled:opacity-50"
                >
                  {saving ? "Saving to Database..." : editingProperty ? "Save Changes" : "Create Property Listing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
