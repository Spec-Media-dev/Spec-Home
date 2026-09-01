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
import { useRealtimeDashboard } from "@/lib/supabase/useRealtimeDashboard";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { PropertySpecRow, PropertyRow } from "@/lib/supabase/types";

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
  const { specs, properties, deleteSpec, refreshData } = useRealtimeDashboard();
  const supabase = getSupabaseBrowserClient();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpec, setEditingSpec] = useState<PropertySpecRow | null>(null);

  // Form State
  const [propertyId, setPropertyId] = useState("");
  const [labelEn, setLabelEn] = useState("");
  const [labelAr, setLabelAr] = useState("");
  const [valueEn, setValueEn] = useState("");
  const [valueAr, setValueAr] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (properties.length > 0 && !propertyId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPropertyId(properties[0].id);
    }
  }, [properties]);

  const openAddModal = () => {
    setEditingSpec(null);
    setLabelEn("");
    setLabelAr("");
    setValueEn("");
    setValueAr("");
    setIsModalOpen(true);
  };

  const openEditModal = (spec: PropertySpecRow) => {
    setEditingSpec(spec);
    setPropertyId(spec.property_id);
    setLabelEn(spec.label_en || "");
    setLabelAr(spec.label_ar || "");
    setValueEn(spec.value_en || "");
    setValueAr(spec.value_ar || "");
    setIsModalOpen(true);
  };

  const handleApplyPreset = (preset: { key: string; value: string; category?: string }) => {
    setLabelEn(preset.key);
    setValueEn(preset.value);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!labelEn || !valueEn || !propertyId) return;

    if (editingSpec) {
      await supabase.from('property_specs').update({
        property_id: propertyId,
        label_en: labelEn,
        value_en: valueEn,
        label_ar: labelAr,
        value_ar: valueAr
      }).eq('id', editingSpec.id);
    } else {
      await supabase.from('property_specs').insert({
        property_id: propertyId,
        label_en: labelEn,
        value_en: valueEn,
        label_ar: labelAr,
        value_ar: valueAr
      });
    }

    setIsModalOpen(false);
    refreshData();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this specification?")) {
      await deleteSpec(id);
    }
  };

  const filteredSpecs = specs.filter((s) => {
    const matchesProperty = selectedPropertyId === "All" || s.property_id === selectedPropertyId;
    const matchesSearch =
      (s.label_en || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.value_en || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (properties.find(p => p.id === s.property_id)?.title_en || "Property").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesProperty && matchesSearch;
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
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="bg-[#1c1c1c] border border-[#2f2f2f] text-neutral-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-accent cursor-pointer max-w-[200px] truncate"
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

      {/* Specs Matrix Table */}
      <div className="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[#222222] bg-[#1a1a1a]">
                <th className="px-4 py-3 text-left font-medium text-neutral-400">Label (EN)</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-400">Label (AR)</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-400">Value (EN)</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-400">Value (AR)</th>
                <th className="px-4 py-3 text-right font-medium text-neutral-400 w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSpecs.map((spec) => (
                <tr key={spec.id} className="group hover:bg-[#1a1a1a] transition-colors">
                  <td className="px-4 py-3 border-b border-[#222222]">
                    <span className="text-white font-medium">{spec.label_en}</span>
                  </td>
                  <td className="px-4 py-3 border-b border-[#222222]">
                    <span className="text-neutral-300" dir="rtl">{spec.label_ar}</span>
                  </td>
                  <td className="px-4 py-3 border-b border-[#222222]">
                    <span className="text-neutral-300">{spec.value_en}</span>
                  </td>
                  <td className="px-4 py-3 border-b border-[#222222]">
                    <span className="text-neutral-300" dir="rtl">{spec.value_ar}</span>
                  </td>
                  <td className="px-4 py-3 border-b border-[#222222] text-right">
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
                  <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
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
                      {p.title_en} ({p.location})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Label (English) *</label>
                  <input
                    type="text"
                    required
                    value={labelEn}
                    onChange={(e) => setLabelEn(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Value (English) *</label>
                  <input
                    type="text"
                    required
                    value={valueEn}
                    onChange={(e) => setValueEn(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Label (Arabic)</label>
                  <input
                    type="text"
                    value={labelAr}
                    onChange={(e) => setLabelAr(e.target.value)}
                    dir="rtl"
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Value (Arabic)</label>
                  <input
                    type="text"
                    value={valueAr}
                    onChange={(e) => setValueAr(e.target.value)}
                    dir="rtl"
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent"
                  />
                </div>
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
