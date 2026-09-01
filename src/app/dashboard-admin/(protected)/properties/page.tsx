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
} from "lucide-react";
import { useRealtimeDashboard } from "@/lib/supabase/useRealtimeDashboard";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { PropertyRow } from "@/lib/supabase/types";

export default function PropertiesPage() {
  const {
    properties,
    projects,
    loading,
    isConnected,
    deleteProperty,
    refreshData,
  } = useRealtimeDashboard();

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<PropertyRow | null>(null);

  // Form State
  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [propertyTypeEn, setPropertyTypeEn] = useState("Villa");
  const [price, setPrice] = useState(15000000);
  const [bedrooms, setBedrooms] = useState(5);
  const [bathrooms, setBathrooms] = useState(6);
  const [areaSqFt, setAreaSqFt] = useState(7500);
  const [status, setStatus] = useState<"available" | "reserved" | "sold">("available");
  const [projectId, setProjectId] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(true);

  const supabase = getSupabaseBrowserClient();

  const openAddModal = () => {
    setEditingProperty(null);
    setTitleEn("");
    setTitleAr("");
    setPropertyTypeEn("Villa");
    setPrice(25000000);
    setBedrooms(5);
    setBathrooms(6);
    setAreaSqFt(8500);
    setStatus("available");
    setProjectId(projects[0]?.id || "");
    setDescriptionEn("");
    setDescriptionAr("");
    setIsPublished(true);
    setIsFeatured(true);
    setIsModalOpen(true);
  };

  const openEditModal = (prop: PropertyRow) => {
    setEditingProperty(prop);
    setTitleEn(prop.title_en);
    setTitleAr(prop.title_ar || prop.title_en);
    setPropertyTypeEn(prop.property_type_en);
    setPrice(Number(prop.price));
    setBedrooms(prop.bedrooms);
    setBathrooms(prop.bathrooms);
    setAreaSqFt(Number(prop.area_sqft));
    setStatus(prop.status);
    setProjectId(prop.project_id || "");
    setDescriptionEn(prop.description_en || "");
    setDescriptionAr(prop.description_ar || "");
    setIsPublished(prop.is_published);
    setIsFeatured(prop.is_featured);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn || !projectId) {
      alert("Please enter a title and select an associated project.");
      return;
    }

    const slug = titleEn.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const refCode = `SHP-${Math.floor(10000 + Math.random() * 90000)}`;

    try {
      if (editingProperty) {
        const { error } = await supabase
          .from("properties")
          .update({
            title_en: titleEn,
            title_ar: titleAr || titleEn,
            property_type_en: propertyTypeEn,
            property_type_ar: propertyTypeEn,
            price,
            bedrooms: Number(bedrooms),
            bathrooms: Number(bathrooms),
            area_sqft: Number(areaSqFt),
            status,
            project_id: projectId,
            description_en: descriptionEn,
            description_ar: descriptionAr,
            is_published: isPublished,
            is_featured: isFeatured,
          })
          .eq("id", editingProperty.id);

        if (error) {
          alert(`Database Error: ${error.message}\n\nPlease ensure your Supabase RLS policies allow admin operations.`);
          return;
        }
      } else {
        const { error } = await supabase.from("properties").insert({
          project_id: projectId,
          slug,
          reference_code: refCode,
          title_en: titleEn,
          title_ar: titleAr || titleEn,
          property_type_en: propertyTypeEn,
          property_type_ar: propertyTypeEn,
          price,
          bedrooms: Number(bedrooms),
          bathrooms: Number(bathrooms),
          area_sqft: Number(areaSqFt),
          status,
          description_en: descriptionEn,
          description_ar: descriptionAr,
          is_published: isPublished,
          is_featured: isFeatured,
        });

        if (error) {
          alert(`Database Error: ${error.message}\n\nPlease ensure your Supabase RLS policies allow admin operations.`);
          return;
        }
      }
    } catch (err: unknown) {
      console.error("Failed to save property:", err);
      alert(`Database Error: ${err instanceof Error ? err.message : "Unknown error"}`);
      return;
    }

    setIsModalOpen(false);
    refreshData();
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this property listing from the database?")) {
      deleteProperty(id);
    }
  };

  const filteredProperties = properties.filter((prop) => {
    const matchesSearch =
      prop.title_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prop.title_ar && prop.title_ar.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === "All" || prop.property_type_en === typeFilter;
    const matchesStatus = statusFilter === "All" || prop.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#222222]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-accent font-semibold">table: properties</span>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.2 rounded border border-emerald-500/20">
              {isConnected ? "● Realtime Live" : "Syncing..."}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Building2 className="text-accent" size={24} />
            Property Inventory Listings
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Manage signature mansions, beachfront villas, sky penthouses, and live database configurations.
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
            placeholder="Search properties by title..."
            className="w-full bg-[#1c1c1c] border border-[#2f2f2f] rounded-lg pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-2">
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
                <th className="px-5 py-3.5">Type & Ref</th>
                <th className="px-5 py-3.5">Price (AED)</th>
                <th className="px-5 py-3.5">Specs</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Linked Tables</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222222]">
              {filteredProperties.map((prop) => (
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
                    <div className="font-medium text-neutral-200">{prop.property_type_en}</div>
                    <div className="text-xs text-neutral-500 font-mono">
                      {prop.reference_code || "SHP-001"}
                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="font-bold text-accent text-sm font-mono">
                      AED {Number(prop.price).toLocaleString()}
                    </span>
                  </td>

                  {/* Specs Summary */}
                  <td className="px-5 py-4 whitespace-nowrap text-xs text-neutral-300 font-mono">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Bed size={13} className="text-neutral-500" /> {prop.bedrooms}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath size={13} className="text-neutral-500" /> {prop.bathrooms}
                      </span>
                      <span className="flex items-center gap-1">
                        <Maximize size={13} className="text-neutral-500" /> {Number(prop.area_sqft).toLocaleString()} sqft
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium ${
                        prop.status === "available"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : prop.status === "reserved"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      }`}
                    >
                      {prop.status.toUpperCase()}
                    </span>
                  </td>

                  {/* Linked DB table shortcuts */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard-admin/property-images`}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-[#1e1e1e] hover:bg-accent hover:text-black rounded text-[11px] text-neutral-300 transition-colors font-mono"
                        title="Manage Images"
                      >
                        <ImageIcon size={12} />
                        <span>images</span>
                      </Link>
                      <Link
                        href={`/dashboard-admin/property-specs`}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-[#1e1e1e] hover:bg-accent hover:text-black rounded text-[11px] text-neutral-300 transition-colors font-mono"
                        title="Manage Specs"
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
              ))}

              {filteredProperties.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-neutral-500">
                    No properties match your filter criteria.
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
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl w-full max-w-2xl my-8 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626] bg-[#181818]">
              <div className="flex items-center gap-2">
                <Building2 className="text-accent" size={18} />
                <h3 className="font-bold text-white text-base">
                  {editingProperty ? "Edit Property Listing" : "Add New Property"}
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
                  <label className="block text-neutral-300 font-medium mb-1">Title (English) *</label>
                  <input
                    type="text"
                    required
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    placeholder="e.g. Palm Signature Villa 12"
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Title (Arabic)</label>
                  <input
                    type="text"
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                    placeholder="مثال: فيلا نخلة جميرا سيغنتشر"
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent dir-ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Associated Master Project *</label>
                  <select
                    required
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="">Select Project</option>
                    {projects.map((proj) => (
                      <option key={proj.id} value={proj.id}>
                        {proj.name_en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Price in AED *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Bedrooms</label>
                  <input
                    type="number"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(Number(e.target.value))}
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Bathrooms</label>
                  <input
                    type="number"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(Number(e.target.value))}
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Built-up Area (Sq.Ft)</label>
                  <input
                    type="number"
                    value={areaSqFt}
                    onChange={(e) => setAreaSqFt(Number(e.target.value))}
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Property Type</label>
                  <select
                    value={propertyTypeEn}
                    onChange={(e) => setPropertyTypeEn(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="Villa">Villa</option>
                    <option value="Penthouse">Penthouse</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Mansion">Mansion</option>
                    <option value="Townhouse">Townhouse</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as PropertyRow["status"])}
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Description (English)</label>
                <textarea
                  rows={2}
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  placeholder="Luxury architectural features, oceanfront views, finishes..."
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
                  {editingProperty ? "Save Changes" : "Create Property Listing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
