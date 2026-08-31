"use client";

import React, { useState, useEffect } from "react";
import {
  SlidersHorizontal,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Edit2,
  Sparkles,
  Building2,
  Star,
  X,
  Layers,
  Zap,
} from "lucide-react";
import { AdminStore, PropertySpec, Property } from "@/lib/adminStore";

const specPresets = [
  { key: "Smart Home Automation", value: "Crestron Home + Lutron Palladiom", category: "Smart Home" as const },
  { key: "Ceiling Height", value: "4.8m Double Volume Living", category: "Architecture & Design" as const },
  { key: "Private Pool", value: "Infinity Edge Temperature Controlled", category: "Luxury Features" as const },
  { key: "Italian Marble Flooring", value: "Book-matched Calacatta Borghini", category: "Architecture & Design" as const },
  { key: "Kitchen Appliances", value: "Miele & Sub-Zero Integrated Suite", category: "Luxury Features" as const },
  { key: "Private Yacht Berth", value: "Direct 90ft Deep-Water Mooring", category: "Luxury Features" as const },
  { key: "Private High-Speed Lift", value: "Biometric Direct Penthouse Access", category: "Technical" as const },
  { key: "24/7 Concierge", value: "White Glove In-Residence Hospitality", category: "Facilities & Amenities" as const },
];

export default function PropertySpecsPage() {
  const [specs, setSpecs] = useState<PropertySpec[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpec, setEditingSpec] = useState<PropertySpec | null>(null);

  // Form State
  const [propertyId, setPropertyId] = useState("");
  const [category, setCategory] = useState<PropertySpec["category"]>("Architecture & Design");
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");
  const [highlight, setHighlight] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setSpecs(AdminStore.getPropertySpecs());
    const props = AdminStore.getProperties();
    setProperties(props);
    if (props.length > 0 && !propertyId) {
      setPropertyId(props[0].id);
    }
  };

  const openAddModal = () => {
    setEditingSpec(null);
    setSpecKey("");
    setSpecValue("");
    setCategory("Architecture & Design");
    setHighlight(true);
    setIsModalOpen(true);
  };

  const openEditModal = (spec: PropertySpec) => {
    setEditingSpec(spec);
    setPropertyId(spec.propertyId);
    setCategory(spec.category);
    setSpecKey(spec.specKey);
    setSpecValue(spec.specValue);
    setHighlight(spec.highlight);
    setIsModalOpen(true);
  };

  const handleApplyPreset = (preset: typeof specPresets[0]) => {
    setSpecKey(preset.key);
    setSpecValue(preset.value);
    setCategory(preset.category);
    setHighlight(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!specKey || !specValue || !propertyId) return;

    const prop = properties.find((p) => p.id === propertyId);

    if (editingSpec) {
      AdminStore.updateSpec(editingSpec.id, {
        propertyId,
        propertyTitle: prop?.title || "Property",
        category,
        specKey,
        specValue,
        highlight,
      });
    } else {
      AdminStore.addSpec({
        propertyId,
        propertyTitle: prop?.title || "Property",
        category,
        specKey,
        specValue,
        highlight,
      });
    }

    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this specification?")) {
      AdminStore.deleteSpec(id);
      loadData();
    }
  };

  const toggleHighlight = (spec: PropertySpec) => {
    AdminStore.updateSpec(spec.id, { highlight: !spec.highlight });
    loadData();
  };

  const filteredSpecs = specs.filter((s) => {
    const matchesProperty = selectedPropertyId === "All" || s.propertyId === selectedPropertyId;
    const matchesCategory = selectedCategory === "All" || s.category === selectedCategory;
    const matchesSearch =
      s.specKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.specValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesProperty && matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#222222]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-accent font-semibold">table: property_specs</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <SlidersHorizontal className="text-accent" size={24} />
            Property Architectural & Luxury Specs
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Manage bespoke luxury attributes, smart home systems, finishings, and key marketing highlights.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent text-black font-semibold text-xs rounded-lg hover:bg-[#e5c158] transition-all shadow-[0_0_15px_rgba(212,175,55,0.25)] self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add New Specification</span>
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
            placeholder="Search specs by attribute or value..."
            className="w-full bg-[#1c1c1c] border border-[#2f2f2f] rounded-lg pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Property Dropdown */}
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

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#1c1c1c] border border-[#2f2f2f] text-neutral-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="Architecture & Design">Architecture & Design</option>
            <option value="Luxury Features">Luxury Features</option>
            <option value="Smart Home">Smart Home</option>
            <option value="Facilities & Amenities">Facilities & Amenities</option>
            <option value="Technical">Technical</option>
          </select>
        </div>
      </div>

      {/* Specs Matrix Table */}
      <div className="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#191919] text-[11px] uppercase font-mono text-neutral-400 border-b border-[#262626]">
              <tr>
                <th className="px-5 py-3.5">Property</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Specification Key</th>
                <th className="px-5 py-3.5">Specification Value</th>
                <th className="px-5 py-3.5">Key Highlight</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222222]">
              {filteredSpecs.map((spec) => (
                <tr key={spec.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-accent shrink-0" />
                      <span className="font-semibold text-white">{spec.propertyTitle}</span>
                    </div>
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-neutral-800 text-neutral-300 border border-neutral-700">
                      {spec.category}
                    </span>
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap font-medium text-neutral-200">
                    {spec.specKey}
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap font-mono text-accent">
                    {spec.specValue}
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleHighlight(spec)}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                        spec.highlight
                          ? "bg-accent/20 text-accent border border-accent/40"
                          : "bg-neutral-800 text-neutral-500 border border-neutral-700"
                      }`}
                    >
                      <Star size={11} className={spec.highlight ? "fill-accent" : ""} />
                      {spec.highlight ? "Featured Tag" : "Standard"}
                    </button>
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2 text-neutral-400">
                      <button
                        onClick={() => openEditModal(spec)}
                        className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                        title="Edit Specification"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(spec.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        title="Delete Specification"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredSpecs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                    No specifications match your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Spec Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626] bg-[#181818]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="text-accent" size={18} />
                <h3 className="font-bold text-white text-base">
                  {editingSpec ? "Edit Specification" : "Add Specification"}
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
              {/* Quick Presets for fast entry */}
              {!editingSpec && (
                <div>
                  <label className="block text-neutral-400 font-mono text-[11px] uppercase mb-1.5">
                    Quick Luxury Presets
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-[#1a1a1a] rounded-lg border border-[#262626]">
                    {specPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className="text-[11px] px-2 py-1 bg-[#222222] hover:bg-accent hover:text-black rounded text-neutral-300 transition-colors font-mono"
                      >
                        + {preset.key}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Target Property *</label>
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
                <label className="block text-neutral-300 font-medium mb-1">Spec Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PropertySpec["category"])}
                  className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent cursor-pointer"
                >
                  <option value="Architecture & Design">Architecture & Design</option>
                  <option value="Luxury Features">Luxury Features</option>
                  <option value="Smart Home">Smart Home</option>
                  <option value="Facilities & Amenities">Facilities & Amenities</option>
                  <option value="Technical">Technical</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Attribute Name *</label>
                  <input
                    type="text"
                    required
                    value={specKey}
                    onChange={(e) => setSpecKey(e.target.value)}
                    placeholder="e.g. Smart Automation"
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Value / Feature *</label>
                  <input
                    type="text"
                    required
                    value={specValue}
                    onChange={(e) => setSpecValue(e.target.value)}
                    placeholder="e.g. Crestron Home"
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={highlight}
                    onChange={(e) => setHighlight(e.target.checked)}
                    className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-accent focus:ring-accent"
                  />
                  <span>Feature as Key Marketing Highlight</span>
                </label>
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
                  {editingSpec ? "Save Changes" : "Create Specification"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
