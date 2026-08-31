"use client";

import React, { useState, useEffect } from "react";
import {
  FolderKanban,
  Plus,
  Search,
  Building,
  Calendar,
  Layers,
  Edit2,
  Trash2,
  X,
  ExternalLink,
  MapPin,
  Sparkles,
  LayoutGrid,
  List,
} from "lucide-react";
import { AdminStore, Project } from "@/lib/adminStore";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [developer, setDeveloper] = useState("");
  const [location, setLocation] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [units, setUnits] = useState(24);
  const [completionDate, setCompletionDate] = useState("Q4 2027");
  const [status, setStatus] = useState<Project["status"]>("Under Construction");
  const [heroImage, setHeroImage] = useState("");
  const [description, setDescription] = useState("");
  const [featured, setFeatured] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    setProjects(AdminStore.getProjects());
  };

  const openAddModal = () => {
    setEditingProject(null);
    setTitle("");
    setDeveloper("SPEC Signature Developments");
    setLocation("Downtown Dubai");
    setStartingPrice("AED 12,000,000");
    setUnits(36);
    setCompletionDate("Q3 2027");
    setStatus("Under Construction");
    setHeroImage("https://images.unsplash.com/photo-1546412414-e1885259563a?q=80&w=1200&auto=format&fit=crop");
    setDescription("");
    setFeatured(true);
    setIsModalOpen(true);
  };

  const openEditModal = (proj: Project) => {
    setEditingProject(proj);
    setTitle(proj.title);
    setDeveloper(proj.developer);
    setLocation(proj.location);
    setStartingPrice(proj.startingPrice);
    setUnits(proj.units);
    setCompletionDate(proj.completionDate);
    setStatus(proj.status);
    setHeroImage(proj.heroImage);
    setDescription(proj.description);
    setFeatured(proj.featured);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !location) return;

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    if (editingProject) {
      AdminStore.updateProject(editingProject.id, {
        title,
        slug,
        developer,
        location,
        startingPrice,
        units: Number(units),
        completionDate,
        status,
        heroImage,
        description,
        featured,
      });
    } else {
      AdminStore.addProject({
        title,
        slug,
        developer,
        location,
        startingPrice,
        units: Number(units),
        completionDate,
        status,
        heroImage: heroImage || "https://images.unsplash.com/photo-1546412414-e1885259563a?q=80&w=1200&auto=format&fit=crop",
        description,
        featured,
      });
    }

    setIsModalOpen(false);
    loadProjects();
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this project development?")) {
      AdminStore.deleteProject(id);
      loadProjects();
    }
  };

  const filteredProjects = projects.filter((proj) => {
    const matchesSearch =
      proj.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proj.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proj.developer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || proj.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#222222]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-accent font-semibold">table: projects</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <FolderKanban className="text-accent" size={24} />
            Master Projects & Developments
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Manage iconic residential developments, developer partnerships, and completion milestones.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent text-black font-semibold text-xs rounded-lg hover:bg-[#e5c158] transition-all shadow-[0_0_15px_rgba(212,175,55,0.25)] self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>New Project</span>
        </button>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#141414] p-3 rounded-xl border border-[#262626]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={15} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects by name, location, developer..."
            className="w-full bg-[#1c1c1c] border border-[#2f2f2f] rounded-lg pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#1c1c1c] border border-[#2f2f2f] text-neutral-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Under Construction">Under Construction</option>
            <option value="Ready / Handover">Ready / Handover</option>
            <option value="Launching Soon">Launching Soon</option>
            <option value="Sold Out">Sold Out</option>
          </select>

          <div className="flex items-center border border-[#2f2f2f] rounded-lg bg-[#1c1c1c] p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded ${viewMode === "grid" ? "bg-white/10 text-white" : "text-neutral-500"}`}
              title="Grid View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded ${viewMode === "table" ? "bg-white/10 text-white" : "text-neutral-500"}`}
              title="Table View"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              className="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden hover:border-accent/40 transition-all flex flex-col group shadow-sm"
            >
              {/* Cover Image */}
              <div className="h-48 relative overflow-hidden bg-[#1f1f1f]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={proj.heroImage}
                  alt={proj.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-black/40" />

                <div className="absolute top-3 left-3">
                  <span
                    className={`text-[10px] font-mono font-medium px-2.5 py-1 rounded-full shadow-md ${
                      proj.status === "Ready / Handover"
                        ? "bg-emerald-500/90 text-black font-semibold"
                        : proj.status === "Under Construction"
                        ? "bg-blue-500/90 text-white"
                        : "bg-amber-500/90 text-black font-semibold"
                    }`}
                  >
                    {proj.status}
                  </span>
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(proj)}
                    className="p-2 rounded-lg bg-black/60 backdrop-blur-md text-neutral-200 hover:text-white hover:bg-black/80 transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(proj.id)}
                    className="p-2 rounded-lg bg-black/60 backdrop-blur-md text-neutral-200 hover:text-red-400 hover:bg-black/80 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                  <div>
                    <span className="text-[11px] text-accent uppercase tracking-wider font-semibold">
                      {proj.developer}
                    </span>
                    <h3 className="text-lg font-bold text-white leading-tight">
                      {proj.title}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-neutral-400 line-clamp-2">
                  {proj.description || "Master planned architectural statement in Dubai."}
                </p>

                <div className="grid grid-cols-3 gap-2 py-3 px-3 rounded-lg bg-[#181818] border border-[#222222] text-xs">
                  <div>
                    <div className="text-[10px] text-neutral-500 font-mono">LOCATION</div>
                    <div className="font-semibold text-white truncate">{proj.location}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-500 font-mono">FROM</div>
                    <div className="font-semibold text-accent truncate">{proj.startingPrice}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-500 font-mono">UNITS</div>
                    <div className="font-semibold text-white">{proj.units} Units</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <div className="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#191919] text-[11px] uppercase font-mono text-neutral-400 border-b border-[#262626]">
                <tr>
                  <th className="px-5 py-3.5">Project</th>
                  <th className="px-5 py-3.5">Developer</th>
                  <th className="px-5 py-3.5">Location</th>
                  <th className="px-5 py-3.5">Starting Price</th>
                  <th className="px-5 py-3.5">Units</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]">
                {filteredProjects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={proj.heroImage}
                          alt={proj.title}
                          className="w-10 h-10 rounded-lg object-cover border border-[#2f2f2f] shrink-0"
                        />
                        <div className="font-semibold text-white">{proj.title}</div>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-neutral-300">{proj.developer}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-neutral-300">{proj.location}</td>
                    <td className="px-5 py-4 whitespace-nowrap font-bold text-accent">{proj.startingPrice}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-neutral-300">{proj.units}</td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {proj.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2 text-neutral-400">
                        <button
                          onClick={() => openEditModal(proj)}
                          className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(proj.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626] bg-[#181818]">
              <div className="flex items-center gap-2">
                <FolderKanban className="text-accent" size={18} />
                <h3 className="font-bold text-white text-base">
                  {editingProject ? "Edit Master Project" : "New Master Project"}
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
                  <label className="block text-neutral-300 font-medium mb-1">Project Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="The Sapphire Residences"
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Developer Partner</label>
                  <input
                    type="text"
                    value={developer}
                    onChange={(e) => setDeveloper(e.target.value)}
                    placeholder="SPEC Signature Developments"
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  <label className="block text-neutral-300 font-medium mb-1">Starting Price</label>
                  <input
                    type="text"
                    value={startingPrice}
                    onChange={(e) => setStartingPrice(e.target.value)}
                    placeholder="AED 9,500,000"
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Total Units</label>
                  <input
                    type="number"
                    value={units}
                    onChange={(e) => setUnits(Number(e.target.value))}
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Construction Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Project["status"])}
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="Under Construction">Under Construction</option>
                    <option value="Ready / Handover">Ready / Handover</option>
                    <option value="Launching Soon">Launching Soon</option>
                    <option value="Sold Out">Sold Out</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Completion Target</label>
                  <input
                    type="text"
                    value={completionDate}
                    onChange={(e) => setCompletionDate(e.target.value)}
                    placeholder="Q4 2027"
                    className="w-full bg-[#1c1c1c] border border-[#333333] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Hero Image URL</label>
                <input
                  type="text"
                  value={heroImage}
                  onChange={(e) => setHeroImage(e.target.value)}
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
                  placeholder="Architectural overview, key amenities, and development profile..."
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
                  {editingProject ? "Save Changes" : "Create Master Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
