"use client";

import React, { useState, useEffect } from "react";
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
  CheckCircle2,
  ExternalLink,
  Sparkles,
  DollarSign,
  Tag,
} from "lucide-react";
import { AdminStore, Property, Project } from "@/lib/adminStore";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [type, setType] = useState<Property["type"]>("Villa");
  const [location, setLocation] = useState("");
  const [numericPrice, setNumericPrice] = useState(15000000);
  const [bedrooms, setBedrooms] = useState(5);
  const [bathrooms, setBathrooms] = useState(6);
  const [areaSqFt, setAreaSqFt] = useState(7500);
  const [status, setStatus] = useState<Property["status"]>("Published");
  const [projectId, setProjectId] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [description, setDescription] = useState("");
  const [featured, setFeatured] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setProperties(AdminStore.getProperties());
    setProjects(AdminStore.getProjects());
  };

  const openAddModal = () => {
    setEditingProperty(null);
    setTitle("");
    setType("Villa");
    setLocation("Palm Jumeirah");
    setNumericPrice(25000000);
    setBedrooms(5);
    setBathrooms(6);
    setAreaSqFt(8500);
    setStatus("Published");
    setProjectId(projects[0]?.id || "");
    setCoverImage("https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop");
    setDescription("");
    setFeatured(true);
    setIsModalOpen(true);
  };

  const openEditModal = (prop: Property) => {
    setEditingProperty(prop);
    setTitle(prop.title);
    setType(prop.type);
    setLocation(prop.location);
    setNumericPrice(prop.numericPrice);
    setBedrooms(prop.bedrooms);
    setBathrooms(prop.bathrooms);
    setAreaSqFt(prop.areaSqFt);
    setStatus(prop.status);
    setProjectId(prop.projectId || "");
    setCoverImage(prop.coverImage);
    setDescription(prop.description);
    setFeatured(prop.featured);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !location) return;

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const formattedPrice = `AED ${numericPrice.toLocaleString()}`;
    const selectedProject = projects.find((p) => p.id === projectId);

    if (editingProperty) {
      AdminStore.updateProperty(editingProperty.id, {
        title,
        slug,
        type,
        location,
        price: formattedPrice,
        numericPrice,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        areaSqFt: Number(areaSqFt),
        status,
        projectId: projectId || undefined,
        projectName: selectedProject?.title || undefined,
        coverImage,
        description,
        featured,
      });
    } else {
      AdminStore.addProperty({
        title,
        slug,
        type,
        location,
        price: formattedPrice,
        numericPrice,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        areaSqFt: Number(areaSqFt),
        status,
        projectId: projectId || undefined,
        projectName: selectedProject?.title || undefined,
        coverImage: coverImage || "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop",
        description,
        featured,
      });
    }

    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this property listing?")) {
      AdminStore.deleteProperty(id);
      loadData();
    }
  };

  const filteredProperties = properties.filter((prop) => {
    const matchesSearch =
      prop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "All" || prop.type === typeFilter;
    const matchesStatus = statusFilter === "All" || prop.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#222222]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-accent font-semibold">table: properties</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Building2 className="text-accent" size={24} />
            Property Inventory Listings
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Manage signature mansions, beachfront villas, sky penthouses, and pricing configurations.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent text-black font-semibold text-xs rounded-lg hover:bg-[#e5c158] transition-all shadow-[0_0_15px_rgba(212,175,55,0.25)] self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add New Property</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#141414] p-3 rounded-xl border border-[#262626]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={15} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search properties by title, location..."
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
            <option value="Luxury Apartment">Luxury Apartment</option>
            <option value="Mansion">Mansion</option>
            <option value="Townhouse">Townhouse</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#1c1c1c] border border-[#2f2f2f] text-neutral-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Sold">Sold</option>
            <option value="Reserved">Reserved</option>
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
                <th className="px-5 py-3.5">Type & Project</th>
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
                  {/* Property Title & Image */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={prop.coverImage}
                        alt={prop.title}
                        className="w-12 h-12 rounded-lg object-cover border border-neutral-700 shrink-0"
                      />
                      <div>
                        <div className="font-semibold text-white text-sm flex items-center gap-2">
                          {prop.title}
                          {prop.featured && (
                            <span className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.2 rounded font-mono">
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-neutral-400 font-mono mt-0.5">{prop.location}</div>
                      </div>
                    </div>
                  </td>

                  {/* Type & Project */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="font-medium text-neutral-200">{prop.type}</div>
                    <div className="text-xs text-neutral-500 font-mono">
                      {prop.projectName || "Independent Estate"}
                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="font-bold text-accent text-sm font-mono">{prop.price}</span>
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
                        <Maximize size={13} className="text-neutral-500" /> {prop.areaSqFt.toLocaleString()} sqft
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium ${
                        prop.status === "Published"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : prop.status === "Draft"
                          ? "bg-neutral-800 text-neutral-400 border border-neutral-700"
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      }`}
                    >
                      {prop.status}
                    </span>
                  </td>

                  {/* Linked DB table shortcuts */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard-admin/property-images`}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-[#1e1e1e] hover:bg-accent hover:text-black rounded text-[11px] text-neutral-300 transition-colors font-mono"
                        title="Manage Images for this property"
                      >
                        <ImageIcon size={12} />
                        <span>images</span>
                      </Link>
                      <Link
                        href={`/dashboard-admin/property-specs`}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-[#1e1e1e] hover:bg-accent hover:text-black rounded text-[11px] text-neutral-300 transition-colors font-mono"
                        title="Manage Specs for this property"
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
                  <label className="block text-neutral-300 font-medium mb-1">Property Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Palm Signature Villa 12"
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Property Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as Property["type"])}
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="Villa">Villa</option>
                    <option value="Penthouse">Penthouse</option>
                    <option value="Luxury Apartment">Luxury Apartment</option>
                    <option value="Mansion">Mansion</option>
                    <option value="Townhouse">Townhouse</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Palm Jumeirah, Frond N"
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Price in AED *</label>
                  <input
                    type="number"
                    required
                    value={numericPrice}
                    onChange={(e) => setNumericPrice(Number(e.target.value))}
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
                  <label className="block text-neutral-300 font-medium mb-1">Associated Master Project</label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="">Standalone / Independent</option>
                    {projects.map((proj) => (
                      <option key={proj.id} value={proj.id}>
                        {proj.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Property["status"])}
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                    <option value="Sold">Sold</option>
                    <option value="Reserved">Reserved</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Cover Image URL</label>
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
