"use client";

import React, { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Star,
  X,
  ExternalLink,
  Building2,
  Sparkles,
} from "lucide-react";
import { AdminStore, PropertyImage, Property } from "@/lib/adminStore";

export default function PropertyImagesPage() {
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [propertyId, setPropertyId] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState<PropertyImage["category"]>("Exterior");
  const [caption, setCaption] = useState("");
  const [isCover, setIsCover] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setImages(AdminStore.getPropertyImages());
    const props = AdminStore.getProperties();
    setProperties(props);
    if (props.length > 0 && !propertyId) {
      setPropertyId(props[0].id);
    }
  };

  const handleSetCover = (img: PropertyImage) => {
    // Make this cover for its property and unset others
    const allImages = AdminStore.getPropertyImages().map((i) => {
      if (i.propertyId === img.propertyId) {
        return { ...i, isCover: i.id === img.id };
      }
      return i;
    });
    AdminStore.savePropertyImages(allImages);
    loadData();
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this image from the gallery?")) {
      AdminStore.deleteImage(id);
      loadData();
    }
  };

  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !propertyId) return;

    const prop = properties.find((p) => p.id === propertyId);

    AdminStore.addImage({
      propertyId,
      propertyTitle: prop?.title || "Luxury Property",
      url,
      category,
      caption: caption || `${category} photograph of ${prop?.title}`,
      isCover,
      order: images.length + 1,
    });

    setIsModalOpen(false);
    setUrl("");
    setCaption("");
    setIsCover(false);
    loadData();
  };

  const filteredImages = images.filter((img) => {
    const matchesProperty = selectedPropertyId === "All" || img.propertyId === selectedPropertyId;
    const matchesCategory = selectedCategory === "All" || img.category === selectedCategory;
    const matchesSearch =
      img.caption.toLowerCase().includes(searchTerm.toLowerCase()) ||
      img.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesProperty && matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#222222]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-accent font-semibold">table: property_images</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <ImageIcon className="text-accent" size={24} />
            Property Media & Image Galleries
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Manage high-resolution architectural photography, cover image assignments, and category tags.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent text-black font-semibold text-xs rounded-lg hover:bg-[#e5c158] transition-all shadow-[0_0_15px_rgba(212,175,55,0.25)] self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Upload Image Asset</span>
        </button>
      </div>

      {/* Filters & Property Selector */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#141414] p-3 rounded-xl border border-[#262626]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={15} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search images by caption, title..."
            className="w-full bg-[#1c1c1c] border border-[#2f2f2f] rounded-lg pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Property Dropdown Filter */}
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="bg-[#1c1c1c] border border-[#2f2f2f] text-neutral-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-accent cursor-pointer max-w-[200px] truncate"
          >
            <option value="All">All Properties ({properties.length})</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>

          {/* Category Dropdown Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#1c1c1c] border border-[#2f2f2f] text-neutral-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="Exterior">Exterior</option>
            <option value="Interior">Interior</option>
            <option value="Living Room">Living Room</option>
            <option value="Master Suite">Master Suite</option>
            <option value="Pool & Garden">Pool & Garden</option>
            <option value="View">View</option>
            <option value="Floorplan">Floorplan</option>
          </select>
        </div>
      </div>

      {/* Image Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredImages.map((img) => (
          <div
            key={img.id}
            className="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden group hover:border-accent/40 transition-all flex flex-col shadow-sm"
          >
            {/* Image Thumbnail Container */}
            <div className="h-44 relative overflow-hidden bg-[#1a1a1a]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.caption}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

              {/* Cover badge */}
              <div className="absolute top-2.5 left-2.5">
                {img.isCover ? (
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-accent text-black flex items-center gap-1 shadow-md">
                    <Star size={11} className="fill-current" /> Cover Image
                  </span>
                ) : (
                  <button
                    onClick={() => handleSetCover(img)}
                    className="text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity px-2 py-0.5 rounded-full bg-black/70 hover:bg-accent hover:text-black text-neutral-300 border border-white/20"
                  >
                    Set as Cover
                  </button>
                )}
              </div>

              {/* Delete button */}
              <div className="absolute top-2.5 right-2.5">
                <button
                  onClick={() => handleDelete(img.id)}
                  className="p-1.5 rounded-lg bg-black/70 hover:bg-red-500/80 text-neutral-300 hover:text-white transition-colors"
                  title="Delete Image"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Category tag */}
              <div className="absolute bottom-2.5 left-2.5">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#161616]/90 text-accent border border-accent/30 backdrop-blur-sm">
                  {img.category}
                </span>
              </div>
            </div>

            {/* Info Body */}
            <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
              <div>
                <div className="text-[11px] text-neutral-500 font-mono flex items-center gap-1 truncate">
                  <Building2 size={11} className="text-accent" />
                  {img.propertyTitle}
                </div>
                <div className="text-xs font-semibold text-neutral-200 mt-1 line-clamp-2">
                  {img.caption}
                </div>
              </div>

              <div className="pt-2 border-t border-[#222222] flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                <a
                  href={img.url}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-accent flex items-center gap-1 truncate max-w-[180px]"
                >
                  <ExternalLink size={10} />
                  <span>View 4K Source</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredImages.length === 0 && (
        <div className="bg-[#141414] border border-[#262626] rounded-xl p-12 text-center text-neutral-500">
          No images found in this gallery filter.
        </div>
      )}

      {/* Add Image Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626] bg-[#181818]">
              <div className="flex items-center gap-2">
                <ImageIcon className="text-accent" size={18} />
                <h3 className="font-bold text-white text-base">Add Media Asset</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddImage} className="p-6 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Select Property *</label>
                <select
                  required
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent cursor-pointer"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Image URL *</label>
                <input
                  type="text"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as PropertyImage["category"])}
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="Exterior">Exterior</option>
                    <option value="Interior">Interior</option>
                    <option value="Living Room">Living Room</option>
                    <option value="Master Suite">Master Suite</option>
                    <option value="Pool & Garden">Pool & Garden</option>
                    <option value="View">View</option>
                    <option value="Floorplan">Floorplan</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCover}
                      onChange={(e) => setIsCover(e.target.checked)}
                      className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-accent focus:ring-accent"
                    />
                    <span>Set as Primary Cover</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Caption / Description</label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="e.g. Sunset view over private infinity pool & beach"
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
                  Upload & Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
