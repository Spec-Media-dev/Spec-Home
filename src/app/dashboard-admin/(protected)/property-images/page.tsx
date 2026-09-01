"use client";

import React, { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Star,
  X,
  Upload,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useRealtimeDashboard } from "@/lib/supabase/useRealtimeDashboard";
import { addPropertyImageUrl, uploadPropertyImage, deletePropertyImage, setCoverImage } from "@/app/actions/property-images";
import { getStorageUrl } from "@/lib/supabase/storage";
import type { PropertyImageRow } from "@/lib/supabase/types";

export default function PropertyImagesPage() {
  const { images, properties, loading, refreshData } = useRealtimeDashboard();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [propertyId, setPropertyId] = useState("");
  const [url, setUrl] = useState("");
  const [isCover, setIsCover] = useState(false);

  useEffect(() => {
    if (properties.length > 0 && !propertyId) {
      setPropertyId(properties[0].id);
    }
  }, [properties, propertyId]);

  const handleSetCover = async (img: PropertyImageRow) => {
    const res = await setCoverImage(img.id, img.property_id);
    if (!res.success) {
      alert(res.error || "Failed to set cover image");
    } else {
      refreshData();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Permanently delete this image asset from database and storage?")) {
      const res = await deletePropertyImage(id);
      if (!res.success) {
        alert(res.error || "Failed to delete image");
      } else {
        refreshData();
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !propertyId) {
      alert("Please select a target property first.");
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const res = await uploadPropertyImage(propertyId, base64, file.name);
      if (res.success) {
        refreshData();
        setIsModalOpen(false);
        setUrl("");
      } else {
        alert(res.error || "Failed to upload image.");
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAddImageUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !propertyId) {
      alert("Please enter a valid image URL and select a property.");
      return;
    }

    setSaving(true);
    const res = await addPropertyImageUrl(propertyId, url, isCover);
    setSaving(false);

    if (res.success) {
      setIsModalOpen(false);
      setUrl("");
      setIsCover(false);
      refreshData();
    } else {
      alert(res.error || "Failed to add image.");
    }
  };

  const filteredImages = images.filter((img) => {
    const matchesProperty = selectedPropertyId === "All" || img.property_id === selectedPropertyId;
    const propertyTitle = properties.find((p) => p.id === img.property_id)?.title_en || "";
    const matchesSearch = !searchTerm || propertyTitle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesProperty && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#222222]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-accent font-semibold">table: property_images</span>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              ● Storage Bucket: property-images
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <ImageIcon className="text-accent" size={24} />
            Property Media & Image Galleries
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Manage high-resolution photography, primary cover images, and galleries for every listing.
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
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent text-black font-semibold text-xs rounded-lg hover:bg-[#e5c158] transition-all shadow-[0_0_15px_rgba(212,175,55,0.25)] self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>Upload Image Asset</span>
          </button>
        </div>
      </div>

      {/* Filters & Property Selector */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#141414] p-3 rounded-xl border border-[#262626]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={15} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search gallery by property name..."
            className="w-full bg-[#1c1c1c] border border-[#2f2f2f] rounded-lg pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="bg-[#1c1c1c] border border-[#2f2f2f] text-neutral-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-accent cursor-pointer max-w-[240px] truncate"
          >
            <option value="All">All Properties ({properties.length})</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title_en}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Image Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredImages.map((img) => {
          const prop = properties.find((p) => p.id === img.property_id);
          const displayUrl = getStorageUrl(img.image_url, "property-images");

          return (
            <div
              key={img.id}
              className={`bg-[#141414] border rounded-xl overflow-hidden group hover:border-accent/60 transition-all flex flex-col shadow-sm ${
                img.is_cover ? "border-accent ring-1 ring-accent/30" : "border-[#262626]"
              }`}
            >
              {/* Image Thumbnail Container */}
              <div className="h-48 relative overflow-hidden bg-[#1a1a1a]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displayUrl}
                  alt={prop?.title_en || "Property Image"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-black/40" />

                {/* Cover Badge */}
                {img.is_cover && (
                  <div className="absolute top-2.5 left-2.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-accent text-black shadow-md">
                      <Star size={10} className="fill-black" />
                      PRIMARY COVER
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                  {!img.is_cover && (
                    <button
                      onClick={() => handleSetCover(img)}
                      className="p-1.5 rounded-lg bg-black/70 backdrop-blur-md text-neutral-300 hover:text-accent hover:bg-black transition-colors text-xs"
                      title="Set as Primary Cover Image"
                    >
                      <Star size={13} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(img.id)}
                    className="p-1.5 rounded-lg bg-black/70 backdrop-blur-md text-neutral-300 hover:text-red-400 hover:bg-black transition-colors text-xs"
                    title="Delete Image"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <div className="absolute bottom-2.5 left-3 right-3">
                  <span className="text-[11px] font-semibold text-white truncate block">
                    {prop?.title_en || "Unassigned Property"}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono block">
                    {prop?.reference_code || "Ref"}
                  </span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-3 bg-[#161616] border-t border-[#222222] flex items-center justify-between text-xs">
                <span className="text-neutral-500 font-mono text-[10px]">
                  Order: #{img.display_order}
                </span>
                {!img.is_cover ? (
                  <button
                    onClick={() => handleSetCover(img)}
                    className="text-accent hover:underline font-medium text-[11px]"
                  >
                    Make Cover
                  </button>
                ) : (
                  <span className="text-emerald-400 text-[11px] font-mono flex items-center gap-1">
                    <CheckCircle2 size={11} /> Cover Active
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredImages.length === 0 && (
        <div className="py-20 text-center bg-[#141414] rounded-2xl border border-[#262626]">
          <ImageIcon className="mx-auto text-neutral-600 mb-3" size={36} />
          <h3 className="text-sm font-semibold text-white">No images found</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Upload images for your properties using the button above.
          </p>
        </div>
      )}

      {/* Upload / Add Image Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626] bg-[#181818]">
              <div className="flex items-center gap-2">
                <ImageIcon className="text-accent" size={18} />
                <h3 className="font-bold text-white text-base">Add Property Image Asset</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs sm:text-sm">
              {/* Select Property */}
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Target Property *</label>
                <select
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent cursor-pointer"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title_en} ({p.reference_code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Option 1: File Upload */}
              <div className="p-4 bg-[#181818] border border-[#262626] rounded-xl text-center space-y-3">
                <div className="flex flex-col items-center justify-center">
                  <Upload className={`mx-auto text-accent mb-2 ${uploading ? "animate-spin" : ""}`} size={24} />
                  <p className="text-xs font-semibold text-white">Upload from Computer</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">Directly upload to Supabase Storage Bucket</p>
                </div>
                <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-black font-bold text-xs rounded-lg hover:bg-[#e5c158] cursor-pointer transition-all">
                  <span>{uploading ? "Uploading to Storage..." : "Browse Image File"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="relative text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#262626]" />
                </div>
                <span className="relative bg-[#141414] px-3 text-[10px] uppercase font-mono text-neutral-500">
                  Or enter image URL
                </span>
              </div>

              {/* Option 2: Image URL Form */}
              <form onSubmit={handleAddImageUrl} className="space-y-4">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Image Web URL</label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or CDN link"
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent font-mono text-xs"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCover}
                    onChange={(e) => setIsCover(e.target.checked)}
                    className="rounded accent-accent w-4 h-4 cursor-pointer"
                  />
                  <span className="text-neutral-300 text-xs">Set as Primary Cover Image</span>
                </label>

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
                    disabled={saving || !url}
                    className="px-5 py-2 rounded-lg bg-accent text-black font-semibold text-xs hover:bg-[#e5c158] transition-all disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Image URL"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
