"use client";

import React, { useState } from "react";
import {
  MessageSquareText,
  Search,
  Plus,
  Mail,
  Trash2,
  Eye,
  Send,
  X,
  Building,
  RefreshCw,
} from "lucide-react";
import { useRealtimeDashboard } from "@/lib/supabase/useRealtimeDashboard";
import { submitEnquiry } from "@/app/actions/enquiries";
import type { EnquiryRow } from "@/lib/supabase/types";

export default function EnquiriesPage() {
  const {
    enquiries,
    loading,
    isConnected,
    updateEnquiryStatus,
    deleteEnquiry,
    refreshData,
  } = useRealtimeDashboard();

  const [activeTab, setActiveTab] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryRow | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New enquiry form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+971 ");
  const [message, setMessage] = useState("");

  const handleAddManualLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    try {
      await submitEnquiry({
        name,
        email,
        phone,
        message: message || "Direct client enquiry registered via admin portal.",
      });
    } catch (err) {
      console.error("Failed to insert lead:", err);
    }

    setIsAddModalOpen(false);
    setName("");
    setEmail("");
    setMessage("");
    refreshData();
  };

  const filteredEnquiries = enquiries.filter((enq) => {
    const sTerm = (searchTerm || "").toLowerCase();
    const eStatus = (enq.status || "").toLowerCase();
    const eName = (enq.name || "").toLowerCase();
    const eEmail = (enq.email || "").toLowerCase();
    const ePhone = (enq.phone || "").toLowerCase();
    const eMsg = (enq.message || "").toLowerCase();

    const matchesTab = activeTab === "All" || eStatus === activeTab.toLowerCase();
    const matchesSearch =
      !sTerm ||
      eName.includes(sTerm) ||
      eEmail.includes(sTerm) ||
      ePhone.includes(sTerm) ||
      eMsg.includes(sTerm);
    return matchesTab && matchesSearch;
  });

  const countByStatus = (status: string) => {
    if (status === "All") return enquiries.length;
    return enquiries.filter((e) => e.status === status.toLowerCase()).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#222222]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-accent font-semibold">table: enquiries</span>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.2 rounded border border-emerald-500/20">
              {isConnected ? "● Realtime Live" : "Syncing..."}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <MessageSquareText className="text-accent" size={24} />
            Client Enquiries & VIP Inbound Leads
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Track inquiries, viewing requests, and direct VIP buyer communications live from the database.
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
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent text-black font-semibold text-xs rounded-lg hover:bg-[#e5c158] transition-all shadow-[0_0_15px_rgba(212,175,55,0.25)] self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>Record New Lead</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#141414] p-3 rounded-xl border border-[#262626]">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {["All", "New", "In_Progress", "Contacted", "Closed"].map((tab) => {
            const displayLabel = tab.replace("_", " ");
            const isSelected = activeTab.toLowerCase() === tab.toLowerCase();
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-accent text-black font-semibold shadow-sm"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>{displayLabel}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? "bg-black/20 text-black" : "bg-neutral-800 text-neutral-400"
                  }`}
                >
                  {countByStatus(tab)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={15} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search leads by name, email, phone..."
            className="w-full bg-[#1c1c1c] border border-[#2f2f2f] rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#191919] text-[11px] uppercase font-mono text-neutral-400 border-b border-[#262626]">
              <tr>
                <th className="px-5 py-3.5">Client Lead</th>
                <th className="px-5 py-3.5">Message / Inquiry</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Received Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222222]">
              {filteredEnquiries.map((enq) => (
                <tr
                  key={enq.id}
                  className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                  onClick={() => setSelectedEnquiry(enq)}
                >
                  {/* Client Info */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-semibold text-white group-hover:text-accent transition-colors flex items-center gap-2">
                        {enq.name}
                        {enq.status === "new" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        )}
                      </div>
                      <div className="text-xs text-neutral-400 font-mono mt-0.5">{enq.email}</div>
                      <div className="text-[11px] text-neutral-500 font-mono">{enq.phone}</div>
                    </div>
                  </td>

                  {/* Message */}
                  <td className="px-5 py-4 max-w-xs">
                    <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
                      {enq.message}
                    </p>
                  </td>

                  {/* Status Dropdown */}
                  <td
                    className="px-5 py-4 whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <select
                      value={enq.status}
                      onChange={(e) =>
                        updateEnquiryStatus(enq.id, e.target.value as EnquiryRow["status"])
                      }
                      className="bg-[#1c1c1c] border border-[#333333] text-xs text-neutral-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-accent cursor-pointer"
                    >
                      <option value="new">🟢 New</option>
                      <option value="in_progress">🟡 In Progress</option>
                      <option value="contacted">🔵 Contacted</option>
                      <option value="closed">⚪ Closed</option>
                      <option value="spam">🔴 Spam</option>
                    </select>
                  </td>

                  {/* Received */}
                  <td className="px-5 py-4 whitespace-nowrap text-xs text-neutral-400 font-mono">
                    {new Date(enq.created_at).toLocaleString()}
                  </td>

                  {/* Actions */}
                  <td
                    className="px-5 py-4 whitespace-nowrap text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-2 text-neutral-400">
                      <button
                        onClick={() => setSelectedEnquiry(enq)}
                        className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                        title="View Details"
                      >
                        <Eye size={15} />
                      </button>
                      <a
                        href={`mailto:${enq.email}`}
                        className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                        title="Send Email"
                      >
                        <Mail size={15} />
                      </a>
                      <button
                        onClick={() => {
                          if (confirm("Delete this client enquiry from the database?")) {
                            deleteEnquiry(enq.id);
                          }
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        title="Delete Enquiry"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredEnquiries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                    No inquiries match your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enquiry Detail Modal / Drawer */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626] bg-[#181818]">
              <div className="flex items-center gap-2">
                <MessageSquareText className="text-accent" size={18} />
                <h3 className="font-bold text-white text-base">Enquiry Details</h3>
              </div>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
                <div>
                  <h4 className="font-bold text-lg text-white">{selectedEnquiry.name}</h4>
                  <p className="text-xs text-neutral-400 font-mono mt-0.5">{selectedEnquiry.email}</p>
                  <p className="text-xs text-neutral-400 font-mono">{selectedEnquiry.phone}</p>
                </div>
                <span className="text-xs font-mono bg-accent/15 text-accent px-2.5 py-1 rounded-md border border-accent/30 uppercase">
                  {selectedEnquiry.status}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider block mb-1">
                  Client Message
                </span>
                <div className="p-3.5 rounded-lg bg-[#1a1a1a] border border-[#2c2c2c] text-neutral-200 leading-relaxed font-sans">
                  &quot;{selectedEnquiry.message}&quot;
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="text-[11px] font-mono text-neutral-500 block mb-1">Status</span>
                  <select
                    value={selectedEnquiry.status}
                    onChange={(e) => {
                      updateEnquiryStatus(selectedEnquiry.id, e.target.value as EnquiryRow["status"]);
                      setSelectedEnquiry({ ...selectedEnquiry, status: e.target.value as EnquiryRow["status"] });
                    }}
                    className="w-full bg-[#1c1c1c] border border-[#333333] text-xs text-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="new">🟢 New</option>
                    <option value="in_progress">🟡 In Progress</option>
                    <option value="contacted">🔵 Contacted</option>
                    <option value="closed">⚪ Closed</option>
                    <option value="spam">🔴 Spam</option>
                  </select>
                </div>
                <div>
                  <span className="text-[11px] font-mono text-neutral-500 block mb-1">Received Time</span>
                  <div className="p-2 rounded-lg bg-[#1c1c1c] border border-[#333333] text-neutral-300 font-mono text-xs">
                    {new Date(selectedEnquiry.created_at).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#262626]">
                <a
                  href={`mailto:${selectedEnquiry.email}?subject=Regarding Your SPEC Home Dubai Inquiry`}
                  className="px-4 py-2 rounded-lg bg-accent text-black font-semibold text-xs hover:bg-[#e5c158] transition-colors flex items-center gap-1.5"
                >
                  <Send size={13} />
                  <span>Reply via Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Record Lead Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626] bg-[#181818]">
              <h3 className="font-bold text-white text-base">Record Inbound Lead</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddManualLead} className="p-6 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Client Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sheikha Al Mansoori"
                  className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@domain.com"
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Notes / Inbound Inquiry</label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Requirements, budget, specific requests..."
                  className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#262626]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#222222] text-neutral-300 hover:text-white text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-accent text-black font-semibold text-xs hover:bg-[#e5c158]"
                >
                  Save Inbound Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
