"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquareText,
  Search,
  Plus,
  Mail,
  Phone,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Send,
  X,
  Sparkles,
  Building,
  User,
} from "lucide-react";
import { AdminStore, Enquiry } from "@/lib/adminStore";

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [activeTab, setActiveTab] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New enquiry form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+971 ");
  const [propertyTitle, setPropertyTitle] = useState("");
  const [type, setType] = useState<Enquiry["type"]>("Property Viewing");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<Enquiry["priority"]>("High");

  useEffect(() => {
    loadEnquiries();
  }, []);

  const loadEnquiries = () => {
    setEnquiries(AdminStore.getEnquiries());
  };

  const handleStatusChange = (id: string, newStatus: Enquiry["status"]) => {
    AdminStore.updateEnquiryStatus(id, newStatus);
    loadEnquiries();
    if (selectedEnquiry && selectedEnquiry.id === id) {
      setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this client enquiry?")) {
      AdminStore.deleteEnquiry(id);
      loadEnquiries();
      if (selectedEnquiry?.id === id) setSelectedEnquiry(null);
    }
  };

  const handleAddManualLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    AdminStore.addEnquiry({
      name,
      email,
      phone,
      propertyTitle: propertyTitle || undefined,
      type,
      message: message || "Direct client enquiry registered via admin portal.",
      status: "New",
      priority,
    });

    setIsAddModalOpen(false);
    setName("");
    setEmail("");
    setMessage("");
    loadEnquiries();
  };

  const filteredEnquiries = enquiries.filter((enq) => {
    const matchesTab = activeTab === "All" || enq.status === activeTab;
    const matchesSearch =
      enq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enq.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (enq.propertyTitle && enq.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (enq.projectTitle && enq.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const countByStatus = (status: string) => {
    if (status === "All") return enquiries.length;
    return enquiries.filter((e) => e.status === status).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#222222]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-accent font-semibold">table: enquiries</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <MessageSquareText className="text-accent" size={24} />
            Client Enquiries & VIP Inbound Leads
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Track inquiries, viewing requests, VIP buyer portfolios, and direct advisory leads.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent text-black font-semibold text-xs rounded-lg hover:bg-[#e5c158] transition-all shadow-[0_0_15px_rgba(212,175,55,0.25)] self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Record New Lead</span>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#141414] p-3 rounded-xl border border-[#262626]">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {["All", "New", "In Progress", "Contacted", "Closed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === tab
                  ? "bg-accent text-black font-semibold shadow-sm"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>{tab}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeTab === tab ? "bg-black/20 text-black" : "bg-neutral-800 text-neutral-400"
                }`}
              >
                {countByStatus(tab)}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={15} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search leads by name, email..."
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
                <th className="px-5 py-3.5">Property / Project</th>
                <th className="px-5 py-3.5">Request Type</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Received</th>
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
                        {enq.priority === "High" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                        )}
                      </div>
                      <div className="text-xs text-neutral-400 font-mono mt-0.5">{enq.email}</div>
                      <div className="text-[11px] text-neutral-500 font-mono">{enq.phone}</div>
                    </div>
                  </td>

                  {/* Asset of Interest */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="text-neutral-200 font-medium">
                      {enq.propertyTitle || enq.projectTitle || "General Portfolio"}
                    </span>
                  </td>

                  {/* Type */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="text-xs font-mono bg-neutral-800 text-neutral-300 px-2.5 py-1 rounded-md border border-neutral-700">
                      {enq.type}
                    </span>
                  </td>

                  {/* Status Dropdown */}
                  <td
                    className="px-5 py-4 whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <select
                      value={enq.status}
                      onChange={(e) =>
                        handleStatusChange(enq.id, e.target.value as Enquiry["status"])
                      }
                      className="bg-[#1c1c1c] border border-[#333333] text-xs text-neutral-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-accent cursor-pointer"
                    >
                      <option value="New">🟢 New</option>
                      <option value="In Progress">🟡 In Progress</option>
                      <option value="Contacted">🔵 Contacted</option>
                      <option value="Closed">⚪ Closed</option>
                    </select>
                  </td>

                  {/* Received */}
                  <td className="px-5 py-4 whitespace-nowrap text-xs text-neutral-400 font-mono">
                    {enq.date}
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
                        onClick={() => handleDelete(enq.id)}
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
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                    No enquiries found.
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
                <span className="text-xs font-mono bg-accent/15 text-accent px-2.5 py-1 rounded-md border border-accent/30">
                  {selectedEnquiry.type}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider block mb-1">
                  Property or Project of Interest
                </span>
                <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#2c2c2c] text-white font-medium flex items-center gap-2">
                  <Building size={15} className="text-accent" />
                  {selectedEnquiry.propertyTitle || selectedEnquiry.projectTitle || "General Portfolio"}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider block mb-1">
                  Client Message
                </span>
                <div className="p-3.5 rounded-lg bg-[#1a1a1a] border border-[#2c2c2c] text-neutral-200 leading-relaxed font-sans italic">
                  "{selectedEnquiry.message}"
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="text-[11px] font-mono text-neutral-500 block mb-1">Status</span>
                  <select
                    value={selectedEnquiry.status}
                    onChange={(e) =>
                      handleStatusChange(selectedEnquiry.id, e.target.value as Enquiry["status"])
                    }
                    className="w-full bg-[#1c1c1c] border border-[#333333] text-xs text-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="New">🟢 New</option>
                    <option value="In Progress">🟡 In Progress</option>
                    <option value="Contacted">🔵 Contacted</option>
                    <option value="Closed">⚪ Closed</option>
                  </select>
                </div>
                <div>
                  <span className="text-[11px] font-mono text-neutral-500 block mb-1">Received Time</span>
                  <div className="p-2 rounded-lg bg-[#1c1c1c] border border-[#333333] text-neutral-300 font-mono text-xs">
                    {selectedEnquiry.date}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Request Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as Enquiry["type"])}
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="Property Viewing">Property Viewing</option>
                    <option value="VIP Request">VIP Request</option>
                    <option value="Investment Consultation">Investment Consultation</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Enquiry["priority"])}
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Property or Project Interest</label>
                <input
                  type="text"
                  value={propertyTitle}
                  onChange={(e) => setPropertyTitle(e.target.value)}
                  placeholder="e.g. Palm Signature Villa 12"
                  className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent"
                />
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
