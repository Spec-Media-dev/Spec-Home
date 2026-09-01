"use client";

import React, { useState, useEffect } from "react";
import {
  SlidersHorizontal,
  Plus,
  Search,
  Trash2,
  Edit2,
  X,
  RefreshCw,
} from "lucide-react";
import { useRealtimeDashboard } from "@/lib/supabase/useRealtimeDashboard";
import { createPropertySpec, updatePropertySpec, deletePropertySpec } from "@/app/actions/property-specs";
import type { PropertySpecRow } from "@/lib/supabase/types";

export default function PropertySpecsPage() {
  const { specs, properties, loading, refreshData } = useRealtimeDashboard();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpec, setEditingSpec] = useState<PropertySpecRow | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [propertyId, setPropertyId] = useState("");
  const [labelEn, setLabelEn] = useState("Handover");
  const [labelAr, setLabelAr] = useState("موعد التسليم");
  const [valueEn, setValueEn] = useState("Q4 2026");
  const [valueAr, setValueAr] = useState("الربع الرابع 2026");

  useEffect(() => {
    if (properties.length > 0 && !propertyId) {
      setPropertyId(properties[0].id);
    }
  }, [properties, propertyId]);

  const openAddModal = () => {
    setEditingSpec(null);
    if (properties.length > 0) setPropertyId(properties[0].id);
    setLabelEn("Payment Plan");
    setLabelAr("خطة الدفع");
    setValueEn("50 / 50");
    setValueAr("50 / 50");
    setIsModalOpen(true);
  };

  const openEditModal = (spec: PropertySpecRow) => {
    setEditingSpec(spec);
    setPropertyId(spec.property_id);
    setLabelEn(spec.label_en || spec.key_en || "");
    setLabelAr(spec.label_ar || spec.key_ar || "");
    setValueEn(spec.value_en || "");
    setValueAr(spec.value_ar || "");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this specification attribute?")) {
      const res = await deletePropertySpec(id);
      if (!res.success) {
        alert(res.error || "Failed to delete spec");
      } else {
        refreshData();
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!labelEn || !valueEn || !propertyId) {
      alert("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    try {
      if (editingSpec) {
        const res = await updatePropertySpec(editingSpec.id, {
          label_en: labelEn,
          label_ar: labelAr || labelEn,
          value_en: valueEn,
          value_ar: valueAr || valueEn,
        });
        if (!res.success) {
          alert(res.error || "Failed to update spec");
          setSaving(false);
          return;
        }
      } else {
        const res = await createPropertySpec({
          property_id: propertyId,
          label_en: labelEn,
          label_ar: labelAr || labelEn,
          value_en: valueEn,
          value_ar: valueAr || valueEn,
        });
        if (!res.success) {
          alert(res.error || "Failed to create spec");
          setSaving(false);
          return;
        }
      }

      setIsModalOpen(false);
      refreshData();
    } catch (err: any) {
      console.error("Spec save error:", err);
      alert(`Error: ${err?.message}`);
    } finally {
      setSaving(false);
    }
  };

  const filteredSpecs = specs.filter((spec) => {
    const matchesProperty = selectedPropertyId === "All" || spec.property_id === selectedPropertyId;
    const propTitle = (properties.find((p) => p.id === spec.property_id)?.title_en || "").toLowerCase();
    const lEn = (spec.label_en || spec.key_en || "").toLowerCase();
    const lAr = (spec.label_ar || spec.key_ar || "").toLowerCase();
    const vEn = (spec.value_en || "").toLowerCase();
    const vAr = (spec.value_ar || "").toLowerCase();
    const sTerm = (searchTerm || "").toLowerCase();

    const matchesSearch =
      !sTerm ||
      lEn.includes(sTerm) ||
      lAr.includes(sTerm) ||
      vEn.includes(sTerm) ||
      vAr.includes(sTerm) ||
      propTitle.includes(sTerm);

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
            Property Specifications & Attributes
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Manage dynamic technical specs, architectural highlights, and custom bilingual features per property.
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
            <span>Add Specification</span>
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
            placeholder="Search specs by label, value, property..."
            className="w-full bg-[#1c1c1c] border border-[#2f2f2f] rounded-lg pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="bg-[#1c1c1c] border border-[#2f2f2f] text-neutral-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-accent cursor-pointer max-w-[240px] truncate"
          >
            <option value="All">All Properties ({properties.length})</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title_en} ({p.reference_code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Specifications Table */}
      <div className="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#191919] text-[11px] uppercase font-mono text-neutral-400 border-b border-[#262626]">
              <tr>
                <th className="px-5 py-3.5">Property</th>
                <th className="px-5 py-3.5">Label (English)</th>
                <th className="px-5 py-3.5">Label (Arabic)</th>
                <th className="px-5 py-3.5">Value (English)</th>
                <th className="px-5 py-3.5">Value (Arabic)</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222222]">
              {filteredSpecs.map((spec) => {
                const prop = properties.find((p) => p.id === spec.property_id);
                const displayLabelEn = spec.label_en || spec.key_en || "Spec";
                const displayLabelAr = spec.label_ar || spec.key_ar || displayLabelEn;
                const displayValueEn = spec.value_en || "-";
                const displayValueAr = spec.value_ar || displayValueEn;

                return (
                  <tr key={spec.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="font-semibold text-white">{prop?.title_en || "Unassigned"}</div>
                      <div className="text-xs text-neutral-500 font-mono">{prop?.reference_code}</div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-neutral-200 font-medium">
                      {displayLabelEn}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-neutral-300 dir-ltr font-medium">
                      {displayLabelAr}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-accent font-mono font-semibold">
                      {displayValueEn}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-neutral-300 dir-ltr font-mono">
                      {displayValueAr}
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
                );
              })}

              {filteredSpecs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                    No specifications configured yet.
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
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626] bg-[#181818]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="text-accent" size={18} />
                <h3 className="font-bold text-white text-base">
                  {editingSpec ? "Edit Specification Attribute" : "Add Property Specification"}
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
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Target Property *</label>
                <select
                  disabled={!!editingSpec}
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent cursor-pointer disabled:opacity-60"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title_en} ({p.reference_code})
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
                    placeholder="Handover"
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Label (Arabic)</label>
                  <input
                    type="text"
                    value={labelAr}
                    onChange={(e) => setLabelAr(e.target.value)}
                    placeholder="موعد التسليم"
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent dir-ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Value (English) *</label>
                  <input
                    type="text"
                    required
                    value={valueEn}
                    onChange={(e) => setValueEn(e.target.value)}
                    placeholder="Q4 2026"
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Value (Arabic)</label>
                  <input
                    type="text"
                    value={valueAr}
                    onChange={(e) => setValueAr(e.target.value)}
                    placeholder="الربع الرابع 2026"
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent dir-ltr"
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
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-accent text-black font-semibold text-xs hover:bg-[#e5c158] transition-all disabled:opacity-50"
                >
                  {saving ? "Saving to Database..." : editingSpec ? "Save Changes" : "Create Specification"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
