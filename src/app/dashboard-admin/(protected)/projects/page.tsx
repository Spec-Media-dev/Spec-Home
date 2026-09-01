"use client";

import React, { useState } from "react";
import {
  FolderKanban,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  LayoutGrid,
  List,
  RefreshCw,
  Upload,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useRealtimeDashboard } from "@/lib/supabase/useRealtimeDashboard";
import { createProject, updateProject, deleteProject, toggleProjectPublished } from "@/app/actions/projects";
import { uploadMediaFile } from "@/app/actions/upload";
import { getStorageUrl } from "@/lib/supabase/storage";
import type { ProjectRow } from "@/lib/supabase/types";

export default function ProjectsPage() {
  const {
    projects,
    loading,
    isConnected,
    refreshData,
  } = useRealtimeDashboard();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [showSeo, setShowSeo] = useState(false);

  // Form state
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [developerEn, setDeveloperEn] = useState("");
  const [developerAr, setDeveloperAr] = useState("");
  const [locationEn, setLocationEn] = useState("");
  const [locationAr, setLocationAr] = useState("");
  const [propertyTypeEn, setPropertyTypeEn] = useState("Residential Tower");
  const [propertyTypeAr, setPropertyTypeAr] = useState("برج سكني فاخر");
  const [startingPrice, setStartingPrice] = useState<number | string>(9500000);
  const [currency, setCurrency] = useState("AED");
  const [handoverEn, setHandoverEn] = useState("Q4 2027");
  const [handoverAr, setHandoverAr] = useState("الربع الرابع 2027");
  const [paymentPlanEn, setPaymentPlanEn] = useState("60 / 40");
  const [paymentPlanAr, setPaymentPlanAr] = useState("60 / 40");
  const [totalUnits, setTotalUnits] = useState<number | string>(48);
  const [coverImagePath, setCoverImagePath] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(true);

  // SEO Fields
  const [seoTitleEn, setSeoTitleEn] = useState("");
  const [seoTitleAr, setSeoTitleAr] = useState("");
  const [seoDescEn, setSeoDescEn] = useState("");
  const [seoDescAr, setSeoDescAr] = useState("");
  const [seoKeywordsEn, setSeoKeywordsEn] = useState("");
  const [seoKeywordsAr, setSeoKeywordsAr] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");

  // File upload state
  const [uploadingImage, setUploadingImage] = useState(false);

  const openAddModal = () => {
    setEditingProject(null);
    setNameEn("");
    setNameAr("");
    setDeveloperEn("SPEC Signature Developments");
    setDeveloperAr("سبيك للتطوير العقاري");
    setLocationEn("Downtown Dubai");
    setLocationAr("وسط مدينة دبي");
    setPropertyTypeEn("Residential Tower");
    setPropertyTypeAr("برج سكني فاخر");
    setStartingPrice(9500000);
    setCurrency("AED");
    setHandoverEn("Q4 2027");
    setHandoverAr("الربع الرابع 2027");
    setPaymentPlanEn("60 / 40");
    setPaymentPlanAr("60 / 40");
    setTotalUnits(48);
    setCoverImagePath("https://images.unsplash.com/photo-1546412414-e1885259563a?q=80&w=1200&auto=format&fit=crop");
    setDescriptionEn("");
    setDescriptionAr("");
    setIsPublished(true);
    setIsFeatured(true);
    setSeoTitleEn("");
    setSeoTitleAr("");
    setSeoDescEn("");
    setSeoDescAr("");
    setSeoKeywordsEn("");
    setSeoKeywordsAr("");
    setCanonicalUrl("");
    setShowSeo(false);
    setIsModalOpen(true);
  };

  const openEditModal = (proj: ProjectRow) => {
    setEditingProject(proj);
    setNameEn(proj.name_en);
    setNameAr(proj.name_ar || proj.name_en);
    setDeveloperEn(proj.developer_en || "");
    setDeveloperAr(proj.developer_ar || "");
    setLocationEn(proj.location_en || "");
    setLocationAr(proj.location_ar || proj.location_en || "");
    setPropertyTypeEn(proj.property_type_en || "Residential Tower");
    setPropertyTypeAr(proj.property_type_ar || "برج سكني فاخر");
    setStartingPrice(proj.starting_price || 0);
    setCurrency(proj.currency || "AED");
    setHandoverEn(proj.handover_en || "");
    setHandoverAr(proj.handover_ar || "");
    setPaymentPlanEn(proj.payment_plan_en || "");
    setPaymentPlanAr(proj.payment_plan_ar || "");
    setTotalUnits(proj.total_units || 0);
    setCoverImagePath(proj.cover_image_path || "");
    setDescriptionEn(proj.description_en || "");
    setDescriptionAr(proj.description_ar || "");
    setIsPublished(proj.is_published);
    setIsFeatured(proj.is_featured);
    setSeoTitleEn(proj.seo_title_en || "");
    setSeoTitleAr(proj.seo_title_ar || "");
    setSeoDescEn(proj.seo_description_en || "");
    setSeoDescAr(proj.seo_description_ar || "");
    setSeoKeywordsEn(proj.seo_keywords_en || "");
    setSeoKeywordsAr(proj.seo_keywords_ar || "");
    setCanonicalUrl(proj.canonical_url || "");
    setShowSeo(false);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const res = await uploadMediaFile(base64, file.name, "project-covers");
      if (res.success && res.url) {
        setCoverImagePath(res.url);
      } else {
        alert(res.error || "Failed to upload image.");
      }
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn) {
      alert("Please enter the project name in English.");
      return;
    }

    setSaving(true);
    try {
      if (editingProject) {
        const res = await updateProject(editingProject.id, {
          name_en: nameEn,
          name_ar: nameAr || nameEn,
          developer_en: developerEn,
          developer_ar: developerAr || developerEn,
          location_en: locationEn,
          location_ar: locationAr || locationEn,
          property_type_en: propertyTypeEn,
          property_type_ar: propertyTypeAr || propertyTypeEn,
          starting_price: Number(startingPrice) || 0,
          currency,
          handover_en: handoverEn,
          handover_ar: handoverAr || handoverEn,
          payment_plan_en: paymentPlanEn,
          payment_plan_ar: paymentPlanAr || paymentPlanEn,
          total_units: Number(totalUnits) || 0,
          cover_image_path: coverImagePath,
          description_en: descriptionEn,
          description_ar: descriptionAr,
          is_published: isPublished,
          is_featured: isFeatured,
          seo_title_en: seoTitleEn || null,
          seo_title_ar: seoTitleAr || null,
          seo_description_en: seoDescEn || null,
          seo_description_ar: seoDescAr || null,
          seo_keywords_en: seoKeywordsEn || null,
          seo_keywords_ar: seoKeywordsAr || null,
          canonical_url: canonicalUrl || null,
        });

        if (!res.success) {
          alert(`Failed to update project: ${res.error}`);
          setSaving(false);
          return;
        }
      } else {
        const res = await createProject({
          name_en: nameEn,
          name_ar: nameAr || nameEn,
          developer_en: developerEn,
          developer_ar: developerAr || developerEn,
          location_en: locationEn,
          location_ar: locationAr || locationEn,
          property_type_en: propertyTypeEn,
          property_type_ar: propertyTypeAr || propertyTypeEn,
          starting_price: Number(startingPrice) || 0,
          currency,
          handover_en: handoverEn,
          handover_ar: handoverAr || handoverEn,
          payment_plan_en: paymentPlanEn,
          payment_plan_ar: paymentPlanAr || paymentPlanEn,
          total_units: Number(totalUnits) || 0,
          cover_image_path: coverImagePath,
          description_en: descriptionEn,
          description_ar: descriptionAr,
          is_published: isPublished,
          is_featured: isFeatured,
          seo_title_en: seoTitleEn || null,
          seo_title_ar: seoTitleAr || null,
          seo_description_en: seoDescEn || null,
          seo_description_ar: seoDescAr || null,
          seo_keywords_en: seoKeywordsEn || null,
          seo_keywords_ar: seoKeywordsAr || null,
          canonical_url: canonicalUrl || null,
        });

        if (!res.success) {
          alert(`Failed to create project: ${res.error}`);
          setSaving(false);
          return;
        }
      }

      setIsModalOpen(false);
      refreshData();
    } catch (err: any) {
      console.error("Save error:", err);
      alert(`Error saving project: ${err?.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (id: string) => {
    const res = await toggleProjectPublished(id);
    if (!res.success) {
      alert(res.error || "Failed to toggle publish status");
    } else {
      refreshData();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to permanently delete this master project? All attached units will also be deleted.")) {
      const res = await deleteProject(id);
      if (!res.success) {
        alert(res.error || "Failed to delete project");
      } else {
        refreshData();
      }
    }
  };

  const filteredProjects = projects.filter((proj) => {
    const nameEn = (proj.name_en || "").toLowerCase();
    const nameAr = (proj.name_ar || "").toLowerCase();
    const locEn = (proj.location_en || "").toLowerCase();
    const devEn = (proj.developer_en || "").toLowerCase();
    const sTerm = (searchTerm || "").toLowerCase();

    const matchesSearch =
      !sTerm ||
      nameEn.includes(sTerm) ||
      nameAr.includes(sTerm) ||
      locEn.includes(sTerm) ||
      devEn.includes(sTerm);

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Published" && proj.is_published) ||
      (statusFilter === "Draft" && !proj.is_published);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#222222]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-accent font-semibold">table: projects</span>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {isConnected ? "● Realtime Live" : "Syncing..."}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <FolderKanban className="text-accent" size={24} />
            Master Projects & Developments
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Create, edit, publish, and manage iconic residential master developments connected to Supabase.
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
            <span>New Master Project</span>
          </button>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#141414] p-3 rounded-xl border border-[#262626]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={15} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects by name, location, developer..."
            className="w-full bg-[#1c1c1c] border border-[#2f2f2f] rounded-lg pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#1c1c1c] border border-[#2f2f2f] text-neutral-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
          </select>

          <div className="flex items-center border border-[#2f2f2f] rounded-lg bg-[#1c1c1c] p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded ${viewMode === "grid" ? "bg-white/10 text-white" : "text-neutral-500"}`}
              title="Grid View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded ${viewMode === "table" ? "bg-white/10 text-white" : "text-neutral-500"}`}
              title="Table View"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
          {filteredProjects.map((proj) => {
            const displayImg = getStorageUrl(proj.cover_image_path, "project-covers");
            return (
              <div
                key={proj.id}
                className="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden hover:border-accent/40 transition-all flex flex-col group shadow-sm"
              >
                {/* Cover Image */}
                <div className="h-52 relative overflow-hidden bg-[#1f1f1f]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={displayImg}
                    alt={proj.name_en}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-black/50" />

                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePublish(proj.id)}
                      className={`text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full shadow-md transition-all flex items-center gap-1 ${
                        proj.is_published
                          ? "bg-emerald-500 text-black hover:bg-emerald-400"
                          : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                      }`}
                      title="Click to toggle publish status"
                    >
                      {proj.is_published ? <Eye size={11} /> : <EyeOff size={11} />}
                      {proj.is_published ? "PUBLISHED" : "DRAFT"}
                    </button>

                    {proj.is_featured && (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30">
                        FEATURED
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(proj)}
                      className="p-2 rounded-lg bg-black/60 backdrop-blur-md text-neutral-200 hover:text-white hover:bg-black/80 transition-colors"
                      title="Edit Project"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(proj.id)}
                      className="p-2 rounded-lg bg-black/60 backdrop-blur-md text-neutral-200 hover:text-red-400 hover:bg-black/80 transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                    <div>
                      <span className="text-[11px] text-accent uppercase tracking-wider font-semibold">
                        {proj.location_en || "Dubai"}
                      </span>
                      <h3 className="text-lg font-bold text-white leading-tight">
                        {proj.name_en}
                      </h3>
                      <p className="text-xs text-neutral-300 font-mono mt-0.5">{proj.name_ar}</p>
                    </div>

                    {proj.starting_price ? (
                      <div className="text-right">
                        <span className="text-[10px] text-neutral-400 uppercase font-mono block">Starting Price</span>
                        <span className="text-sm font-bold text-accent font-mono">
                          {proj.currency || "AED"} {Number(proj.starting_price).toLocaleString()}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs text-neutral-400 line-clamp-2">
                    {proj.description_en || "Master planned architectural statement in Dubai."}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-2 px-3 rounded-lg bg-[#181818] border border-[#222222] text-xs">
                    <div>
                      <span className="text-neutral-500 text-[10px] block font-mono">DEVELOPER</span>
                      <span className="text-neutral-200 font-medium truncate block">{proj.developer_en || "SPEC"}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 text-[10px] block font-mono">HANDOVER</span>
                      <span className="text-neutral-200 font-medium block">{proj.handover_en || "TBA"}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 text-[10px] block font-mono">PAYMENT PLAN</span>
                      <span className="text-accent font-semibold block">{proj.payment_plan_en || "50/50"}</span>
                    </div>
                  </div>

                  <div className="py-2 px-3 rounded-lg bg-[#181818] border border-[#222222] text-xs flex justify-between items-center">
                    <span className="text-neutral-400 font-mono text-[11px]">SLUG:</span>
                    <span className="text-accent font-mono text-[11px]">{proj.slug}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <div className="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#191919] text-[11px] uppercase font-mono text-neutral-400 border-b border-[#262626]">
                <tr>
                  <th className="px-5 py-3.5">Project</th>
                  <th className="px-5 py-3.5">Arabic Name</th>
                  <th className="px-5 py-3.5">Location</th>
                  <th className="px-5 py-3.5">Starting Price</th>
                  <th className="px-5 py-3.5">Handover</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]">
                {filteredProjects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="font-semibold text-white">{proj.name_en}</div>
                      <div className="text-xs text-neutral-500">{proj.developer_en}</div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-neutral-300 dir-ltr">{proj.name_ar}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-neutral-300">{proj.location_en}</td>
                    <td className="px-5 py-4 whitespace-nowrap font-mono text-accent font-bold">
                      {proj.currency || "AED"} {Number(proj.starting_price || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-neutral-300">{proj.handover_en || "-"}</td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleTogglePublish(proj.id)}
                        className={`text-xs font-mono px-2.5 py-0.5 rounded-full transition-colors ${
                          proj.is_published
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-neutral-800 text-neutral-400 border border-neutral-700"
                        }`}
                      >
                        {proj.is_published ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2 text-neutral-400">
                        <button
                          onClick={() => openEditModal(proj)}
                          className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(proj.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl w-full max-w-3xl my-8 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626] bg-[#181818]">
              <div className="flex items-center gap-2">
                <FolderKanban className="text-accent" size={18} />
                <h3 className="font-bold text-white text-base">
                  {editingProject ? `Edit Master Project — ${editingProject.name_en}` : "Create New Master Project"}
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
              {/* Project Names (Bilingual) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Project Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="The Sapphire Residences"
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Project Name (Arabic)</label>
                  <input
                    type="text"
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    placeholder="أبراج ذا سافاير ريزيدنسز"
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent dir-ltr"
                  />
                </div>
              </div>

              {/* Developer (Bilingual) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Developer (English)</label>
                  <input
                    type="text"
                    value={developerEn}
                    onChange={(e) => setDeveloperEn(e.target.value)}
                    placeholder="SPEC Signature Developments"
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Developer (Arabic)</label>
                  <input
                    type="text"
                    value={developerAr}
                    onChange={(e) => setDeveloperAr(e.target.value)}
                    placeholder="سبيك للتطوير العقاري"
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent dir-ltr"
                  />
                </div>
              </div>

              {/* Location (Bilingual) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Location (English)</label>
                  <input
                    type="text"
                    value={locationEn}
                    onChange={(e) => setLocationEn(e.target.value)}
                    placeholder="Downtown Dubai"
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Location (Arabic)</label>
                  <input
                    type="text"
                    value={locationAr}
                    onChange={(e) => setLocationAr(e.target.value)}
                    placeholder="وسط مدينة دبي"
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent dir-ltr"
                  />
                </div>
              </div>

              {/* Property Type & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Property Type</label>
                  <input
                    type="text"
                    value={propertyTypeEn}
                    onChange={(e) => setPropertyTypeEn(e.target.value)}
                    placeholder="Residential Tower"
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Starting Price (AED)</label>
                  <input
                    type="number"
                    value={startingPrice}
                    onChange={(e) => setStartingPrice(e.target.value)}
                    placeholder="9500000"
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Total Units</label>
                  <input
                    type="number"
                    value={totalUnits}
                    onChange={(e) => setTotalUnits(e.target.value)}
                    placeholder="48"
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
                      placeholder="Q4 2027"
                      className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent text-xs"
                    />
                    <input
                      type="text"
                      value={handoverAr}
                      onChange={(e) => setHandoverAr(e.target.value)}
                      placeholder="الربع الرابع 2027"
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
                      placeholder="60 / 40"
                      className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent text-xs"
                    />
                    <input
                      type="text"
                      value={paymentPlanAr}
                      onChange={(e) => setPaymentPlanAr(e.target.value)}
                      placeholder="60 / 40"
                      className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent text-xs dir-ltr"
                    />
                  </div>
                </div>
              </div>

              {/* Cover Image Upload / URL */}
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Cover Image Asset</label>
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      value={coverImagePath}
                      onChange={(e) => setCoverImagePath(e.target.value)}
                      placeholder="https://... or storage path"
                      className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent font-mono text-xs"
                    />
                  </div>
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#262626] hover:bg-[#333] text-white rounded-lg border border-[#3a3a3a] cursor-pointer transition-colors text-xs shrink-0">
                    <Upload size={14} className={uploadingImage ? "animate-spin" : ""} />
                    <span>{uploadingImage ? "Uploading..." : "Upload File"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
                {coverImagePath && (
                  <div className="mt-2 h-28 w-48 rounded-lg overflow-hidden border border-[#333] bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getStorageUrl(coverImagePath, "project-covers")}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Descriptions (Bilingual) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Description (English)</label>
                  <textarea
                    rows={3}
                    value={descriptionEn}
                    onChange={(e) => setDescriptionEn(e.target.value)}
                    placeholder="Architectural overview, key amenities, and development profile..."
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Description (Arabic)</label>
                  <textarea
                    rows={3}
                    value={descriptionAr}
                    onChange={(e) => setDescriptionAr(e.target.value)}
                    placeholder="وصف المشروع المعماري والمزايا الاستثمارية..."
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
                    <Sparkles size={12} /> Featured Project
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
                    <span className="font-semibold text-white text-xs">Project SEO & Meta Controls</span>
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
                          placeholder="The Sapphire Residences | Downtown Dubai"
                          className="w-full bg-[#1c1c1c] border border-[#333] rounded px-3 py-2 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-400 text-xs mb-1">SEO Title (AR)</label>
                        <input
                          type="text"
                          value={seoTitleAr}
                          onChange={(e) => setSeoTitleAr(e.target.value)}
                          placeholder="أبراج ذا سافاير | دبي"
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
                          placeholder="Discover luxury residences in Downtown Dubai..."
                          className="w-full bg-[#1c1c1c] border border-[#333] rounded px-3 py-2 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-400 text-xs mb-1">Meta Description (AR)</label>
                        <textarea
                          rows={2}
                          value={seoDescAr}
                          onChange={(e) => setSeoDescAr(e.target.value)}
                          placeholder="اكتشف شقق وبنتهاوس فاخر في وسط مدينة دبي..."
                          className="w-full bg-[#1c1c1c] border border-[#333] rounded px-3 py-2 text-white text-xs dir-ltr"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-neutral-400 text-xs mb-1">Keywords (Comma separated)</label>
                      <input
                        type="text"
                        value={seoKeywordsEn}
                        onChange={(e) => setSeoKeywordsEn(e.target.value)}
                        placeholder="dubai downtown, luxury penthouses, spec home"
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
                  {saving ? "Saving to Database..." : editingProject ? "Save Changes" : "Create Master Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
