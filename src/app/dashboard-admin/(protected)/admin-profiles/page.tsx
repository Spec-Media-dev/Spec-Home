"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  Shield,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  X,
  Sparkles,
} from "lucide-react";
import { AdminStore, AdminProfile } from "@/lib/adminStore";

export default function AdminProfilesPage() {
  const [admins, setAdmins] = useState<AdminProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminProfile | null>(null);

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminProfile["role"]>("Property Manager");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = () => {
    setAdmins(AdminStore.getAdmins());
  };

  const openAddModal = () => {
    setEditingAdmin(null);
    setFullName("");
    setEmail("");
    setRole("Property Manager");
    setPhone("+971 50 ");
    setAvatar("https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop");
    setStatus("Active");
    setIsModalOpen(true);
  };

  const openEditModal = (admin: AdminProfile) => {
    setEditingAdmin(admin);
    setFullName(admin.fullName);
    setEmail(admin.email);
    setRole(admin.role);
    setPhone(admin.phone || "");
    setAvatar(admin.avatar);
    setStatus(admin.status);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    if (editingAdmin) {
      AdminStore.updateAdmin(editingAdmin.id, {
        fullName,
        email,
        role,
        phone,
        avatar,
        status,
      });
    } else {
      AdminStore.addAdmin({
        fullName,
        email,
        role,
        phone,
        avatar: avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300&auto=format&fit=crop",
        status,
        lastActive: "Just now",
      });
    }
    setIsModalOpen(false);
    loadAdmins();
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this administrator?")) {
      AdminStore.deleteAdmin(id);
      loadAdmins();
    }
  };

  const toggleStatus = (admin: AdminProfile) => {
    const nextStatus = admin.status === "Active" ? "Inactive" : "Active";
    AdminStore.updateAdmin(admin.id, { status: nextStatus });
    loadAdmins();
  };

  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch =
      admin.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "All" || admin.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#222222]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-accent font-semibold">table: admin_profiles</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Users className="text-accent" size={24} />
            Admin Profiles & Permissions
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Manage system operators, role-based access controls, and administrative team members.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent text-black font-semibold text-xs rounded-lg hover:bg-[#e5c158] transition-all shadow-[0_0_15px_rgba(212,175,55,0.25)] self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add Admin Profile</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-[#141414] p-3 rounded-xl border border-[#262626]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={15} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by admin name, email..."
            className="w-full bg-[#1c1c1c] border border-[#2f2f2f] rounded-lg pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-[#1c1c1c] border border-[#2f2f2f] text-neutral-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="All">All Roles</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Property Manager">Property Manager</option>
            <option value="Sales Agent">Sales Agent</option>
            <option value="Content Editor">Content Editor</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#191919] text-[11px] uppercase font-mono text-neutral-400 border-b border-[#262626]">
              <tr>
                <th className="px-5 py-3.5">Admin Member</th>
                <th className="px-5 py-3.5">Assigned Role</th>
                <th className="px-5 py-3.5">Contact Details</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Last Active</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222222]">
              {filteredAdmins.map((admin) => (
                <tr key={admin.id} className="hover:bg-white/[0.02] transition-colors">
                  {/* Member Name & Avatar */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={admin.avatar}
                        alt={admin.fullName}
                        className="w-10 h-10 rounded-full object-cover border border-neutral-700 shrink-0"
                      />
                      <div>
                        <div className="font-semibold text-white text-sm">{admin.fullName}</div>
                        <div className="text-xs text-neutral-400 font-mono">{admin.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        admin.role === "Super Admin"
                          ? "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                          : admin.role === "Property Manager"
                          ? "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                          : admin.role === "Sales Agent"
                          ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                          : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                      }`}
                    >
                      <Shield size={12} />
                      {admin.role}
                    </span>
                  </td>

                  {/* Contact */}
                  <td className="px-5 py-4 whitespace-nowrap text-xs text-neutral-400 font-mono">
                    <div className="flex flex-col gap-0.5">
                      <span>{admin.phone || "No phone listed"}</span>
                    </div>
                  </td>

                  {/* Status Toggle */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleStatus(admin)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        admin.status === "Active"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                          : "bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700"
                      }`}
                    >
                      {admin.status === "Active" ? (
                        <>
                          <CheckCircle2 size={12} /> Active
                        </>
                      ) : (
                        <>
                          <XCircle size={12} /> Inactive
                        </>
                      )}
                    </button>
                  </td>

                  {/* Last Active */}
                  <td className="px-5 py-4 whitespace-nowrap text-xs text-neutral-400 font-mono">
                    {admin.lastActive}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2 text-neutral-400">
                      <button
                        onClick={() => openEditModal(admin)}
                        className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                        title="Edit Admin"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(admin.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        title="Delete Admin"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredAdmins.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                    No administrators found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626] bg-[#181818]">
              <div className="flex items-center gap-2">
                <Users className="text-accent" size={18} />
                <h3 className="font-bold text-white text-base">
                  {editingAdmin ? "Edit Admin Profile" : "Add New Admin Profile"}
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
                <label className="block text-neutral-300 font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Tariq Mansoor"
                  className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tariq@spechome.com"
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+971 50 123 4567"
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Assigned Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as AdminProfile["role"])}
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Property Manager">Property Manager</option>
                    <option value="Sales Agent">Sales Agent</option>
                    <option value="Content Editor">Content Editor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "Active" | "Inactive")}
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Avatar Photo URL</label>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent font-mono text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#262626]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#222222] text-neutral-300 hover:text-white text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-accent text-black font-semibold text-xs hover:bg-[#e5c158] transition-colors"
                >
                  {editingAdmin ? "Save Changes" : "Create Admin Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
