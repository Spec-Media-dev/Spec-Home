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
} from "lucide-react";
import { useRealtimeDashboard } from "@/lib/supabase/useRealtimeDashboard";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ProjectRow } from "@/lib/supabase/types";

export default function ProjectsPage() {
  const {
    projects,
    loading,
    isConnected,
    deleteProject,
    refreshData,
  } = useRealtimeDashboard();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectRow | null>(null);

  // Form state
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [locationEn, setLocationEn] = useState("");
  const [coverImagePath, setCoverImagePath] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(true);

  const supabase = getSupabaseBrowserClient();

  const openAddModal = () => {
    setEditingProject(null);
    setNameEn("");
    setNameAr("");
    setLocationEn("Downtown Dubai");
    setCoverImagePath("https://images.unsplash.com/photo-1546412414-e1885259563a?q=80&w=1200&auto=format&fit=crop");
    setDescriptionEn("");
    setDescriptionAr("");
    setIsPublished(true);
    setIsFeatured(true);
    setIsModalOpen(true);
  };

  const openEditModal = (proj: ProjectRow) => {
    setEditingProject(proj);
    setNameEn(proj.name_en);
    setNameAr(proj.name_ar || proj.name_en);
    setLocationEn(proj.location_en || "");
    setCoverImagePath(proj.cover_image_path || "");
    setDescriptionEn(proj.description_en || "");
    setDescriptionAr(proj.description_ar || "");
    setIsPublished(proj.is_published);
    setIsFeatured(proj.is_featured);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn) return;

    const slug = nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    try {
      if (editingProject) {
        await supabase
          .from("projects")
          .update({
            name_en: nameEn,
            name_ar: nameAr || nameEn,
            location_en: locationEn,
            location_ar: locationEn,
            cover_image_path: coverImagePath,
            description_en: descriptionEn,
            description_ar: descriptionAr,
            is_published: isPublished,
            is_featured: isFeatured,
          })
          .eq("id", editingProject.id);
      } else {
        await supabase.from("projects").insert({
          slug,
          name_en: nameEn,
          name_ar: nameAr || nameEn,
          location_en: locationEn,
          location_ar: locationEn,
          cover_image_path: coverImagePath,
          description_en: descriptionEn,
          description_ar: descriptionAr,
          is_published: isPublished,
          is_featured: isFeatured,
        });
      }
    } catch (err) {
      console.error("Failed to save project:", err);
    }

    setIsModalOpen(false);
    refreshData();
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this master project from the database?")) {
      deleteProject(id);
    }
  };

  const filteredProjects = projects.filter((proj) => {
    const matchesSearch =
      proj.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (proj.name_ar && proj.name_ar.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (proj.location_en && proj.location_en.toLowerCase().includes(searchTerm.toLowerCase()));
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
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.2 rounded border border-emerald-500/20">
              {isConnected ? "● Realtime Live" : "Syncing..."}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <FolderKanban className="text-accent" size={24} />
            Master Projects & Developments
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Manage iconic residential developments and live database master portfolios.
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
            placeholder="Search projects by name, location..."
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
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              className="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden hover:border-accent/40 transition-all flex flex-col group shadow-sm"
            >
              {/* Cover Image */}
              <div className="h-48 relative overflow-hidden bg-[#1f1f1f]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={proj.cover_image_path || "https://images.unsplash.com/photo-1546412414-e1885259563a?q=80&w=1200&auto=format&fit=crop"}
                  alt={proj.name_en}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-black/40" />

                <div className="absolute top-3 left-3">
                  <span
                    className={`text-[10px] font-mono font-medium px-2.5 py-1 rounded-full shadow-md ${
                      proj.is_published
                        ? "bg-emerald-500/90 text-black font-semibold"
                        : "bg-neutral-800 text-neutral-300"
                    }`}
                  >
                    {proj.is_published ? "PUBLISHED" : "DRAFT"}
                  </span>
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(proj)}
                    className="p-2 rounded-lg bg-black/60 backdrop-blur-md text-neutral-200 hover:text-white hover:bg-black/80 transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(proj.id)}
                    className="p-2 rounded-lg bg-black/60 backdrop-blur-md text-neutral-200 hover:text-red-400 hover:bg-black/80 transition-colors"
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
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-neutral-400 line-clamp-2">
                  {proj.description_en || "Master planned architectural statement in Dubai."}
                </p>

                <div className="py-2 px-3 rounded-lg bg-[#181818] border border-[#222222] text-xs flex justify-between">
                  <span className="text-neutral-400 font-mono text-[11px]">SLUG:</span>
                  <span className="text-accent font-mono text-[11px]">{proj.slug}</span>
                </div>
              </div>
            </div>
          ))}
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
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]">
                {filteredProjects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="font-semibold text-white">{proj.name_en}</div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-neutral-300 dir-ltr">{proj.name_ar}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-neutral-300">{proj.location_en}</td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`text-xs font-mono px-2.5 py-0.5 rounded-full ${
                        proj.is_published ? "bg-emerald-500/10 text-emerald-400" : "bg-neutral-800 text-neutral-400"
                      }`}>
                        {proj.is_published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2 text-neutral-400">
                        <button
                          onClick={() => openEditModal(proj)}
                          className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(proj.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626] bg-[#181818]">
              <div className="flex items-center gap-2">
                <FolderKanban className="text-accent" size={18} />
                <h3 className="font-bold text-white text-base">
                  {editingProject ? "Edit Master Project" : "New Master Project"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs sm:text-sm">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Location</label>
                  <input
                    type="text"
                    value={locationEn}
                    onChange={(e) => setLocationEn(e.target.value)}
                    placeholder="Downtown Dubai"
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Cover Image URL</label>
                  <input
                    type="text"
                    value={coverImagePath}
                    onChange={(e) => setCoverImagePath(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent font-mono text-xs"
                  />
                </div>
              </div>

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

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#262626]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#222222] text-neutral-300 hover:text-white text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-accent text-black font-semibold text-xs hover:bg-[#e5c158]"
                >
                  {editingProject ? "Save Changes" : "Create Master Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
