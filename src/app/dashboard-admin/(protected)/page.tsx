"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building2,
  FolderKanban,
  MessageSquareText,
  Users,
  Image as ImageIcon,
  SlidersHorizontal,
  Settings2,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Database,
  Mail,
  Activity,
  RefreshCw,
} from "lucide-react";
import { useRealtimeDashboard } from "@/lib/supabase/useRealtimeDashboard";

export default function AdminDashboardOverviewPage() {
  const {
    projects,
    properties,
    images,
    specs,
    admins,
    enquiries,
    siteSettings,
    loading,
    isConnected,
    lastSync,
    refreshData,
    updateEnquiryStatus,
  } = useRealtimeDashboard();

  // Calculate live portfolio value from database
  const totalPortfolioValue = properties.reduce(
    (acc, item) => acc + (Number(item.price) || 0),
    0
  );

  const formatAED = (num: number) => {
    if (num >= 1_000_000) {
      return `AED ${(num / 1_000_000).toFixed(1)}M`;
    }
    return `AED ${num.toLocaleString()}`;
  };

  // 7 Database tables catalog
  const databaseTables = [
    {
      name: "admin_profiles",
      title: "Admin Profiles",
      path: "/dashboard-admin/admin-profiles",
      count: admins.length,
      icon: Users,
      description: "Manage administrators, managers, access roles & security permissions.",
      iconColor: "text-blue-400",
    },
    {
      name: "enquiries",
      title: "Client Enquiries",
      path: "/dashboard-admin/enquiries",
      count: enquiries.length,
      badge: `${enquiries.filter((e) => e.status === "new").length} New`,
      icon: MessageSquareText,
      description: "Inbound VIP buyer leads, viewing schedules, and consultation requests.",
      iconColor: "text-amber-400",
    },
    {
      name: "projects",
      title: "Master Projects",
      path: "/dashboard-admin/projects",
      count: projects.length,
      icon: FolderKanban,
      description: "Signature master developments, construction statuses & developer portfolios.",
      iconColor: "text-emerald-400",
    },
    {
      name: "properties",
      title: "Property Listings",
      path: "/dashboard-admin/properties",
      count: properties.length,
      icon: Building2,
      description: "Ultra-luxury mansions, villas, penthouses, pricing and availability.",
      iconColor: "text-yellow-400",
    },
    {
      name: "property_images",
      title: "Image Galleries",
      path: "/dashboard-admin/property-images",
      count: images.length,
      icon: ImageIcon,
      description: "High-resolution architectural photography, category tags & cover images.",
      iconColor: "text-purple-400",
    },
    {
      name: "property_specs",
      title: "Property Specs",
      path: "/dashboard-admin/property-specs",
      count: specs.length,
      icon: SlidersHorizontal,
      description: "Luxury architectural specifications, smart home features and amenities.",
      iconColor: "text-cyan-400",
    },
    {
      name: "site_settings",
      title: "Site Settings",
      path: "/dashboard-admin/site-settings",
      count: siteSettings ? "Active" : "Ready",
      icon: Settings2,
      description: "Global brand settings, WhatsApp contact, SEO metadata and currency.",
      iconColor: "text-rose-400",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Welcome & Realtime Sync Indicator */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-[#222222]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold text-accent uppercase tracking-widest bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
              SPEC Core Admin v2.4
            </span>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {isConnected ? "Realtime WebSocket: Connected" : "Syncing..."}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Executive Control Center
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Full real-time management oversight across all 7 platform database entities.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={refreshData}
            title="Force re-sync"
            className="p-2 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] text-neutral-300 border border-[#333333] transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-accent" : ""} />
          </button>
          <Link
            href="/dashboard-admin/properties"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-accent text-black font-semibold text-xs hover:bg-[#e5c158] transition-colors shadow-[0_0_15px_rgba(212,175,55,0.2)]"
          >
            <Plus size={15} />
            <span>Add Property</span>
          </Link>
          <Link
            href="/dashboard-admin/projects"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] text-white border border-[#333333] text-xs font-medium transition-colors"
          >
            <Plus size={15} />
            <span>New Project</span>
          </Link>
          <Link
            href="/dashboard-admin/property-images"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] text-white border border-[#333333] text-xs font-medium transition-colors"
          >
            <ImageIcon size={15} />
            <span>Upload Image</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Portfolio */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#141414] border border-[#262626] rounded-xl p-5 relative overflow-hidden group hover:border-accent/40 transition-all shadow-sm"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-[#1a1a1a] border border-[#2f2f2f] rounded-lg text-accent">
              <Building2 size={20} />
            </div>
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <TrendingUp size={11} /> Live DB
            </span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight mb-0.5">
            {formatAED(totalPortfolioValue)}
          </div>
          <div className="text-xs text-neutral-400">Total Portfolio Value</div>
          <div className="text-[11px] text-neutral-500 mt-2 font-mono">
            {properties.length} active luxury assets
          </div>
        </motion.div>

        {/* Metric 2: Master Projects */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-[#141414] border border-[#262626] rounded-xl p-5 relative overflow-hidden group hover:border-accent/40 transition-all shadow-sm"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-[#1a1a1a] border border-[#2f2f2f] rounded-lg text-emerald-400">
              <FolderKanban size={20} />
            </div>
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {projects.filter(p => p.is_published).length} Published
            </span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight mb-0.5">
            {projects.length} Master Projects
          </div>
          <div className="text-xs text-neutral-400">Developments Under Care</div>
          <div className="text-[11px] text-neutral-500 mt-2 font-mono">
            Prime Dubai developments
          </div>
        </motion.div>

        {/* Metric 3: Inbound Enquiries */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#141414] border border-[#262626] rounded-xl p-5 relative overflow-hidden group hover:border-accent/40 transition-all shadow-sm"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-[#1a1a1a] border border-[#2f2f2f] rounded-lg text-amber-400">
              <MessageSquareText size={20} />
            </div>
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
              {enquiries.filter((e) => e.status === "new").length} New Leads
            </span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight mb-0.5">
            {enquiries.length} Inbound Leads
          </div>
          <div className="text-xs text-neutral-400">Real-Time Inquiries</div>
          <div className="text-[11px] text-neutral-500 mt-2 font-mono">
            Direct viewing & VIP leads
          </div>
        </motion.div>

        {/* Metric 4: Media & Specs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-[#141414] border border-[#262626] rounded-xl p-5 relative overflow-hidden group hover:border-accent/40 transition-all shadow-sm"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-[#1a1a1a] border border-[#2f2f2f] rounded-lg text-purple-400">
              <ImageIcon size={20} />
            </div>
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              {specs.length} Specs
            </span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight mb-0.5">
            {images.length} Curated Media
          </div>
          <div className="text-xs text-neutral-400">Digital Assets in Bucket</div>
          <div className="text-[11px] text-neutral-500 mt-2 font-mono">
            Architectural assets
          </div>
        </motion.div>
      </div>

      {/* DATABASE TABLES HUB */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="text-accent" size={18} />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Database Tables & Collections
            </h2>
          </div>
          <span className="text-xs text-neutral-400 font-mono">
            7 Tables • Realtime WebSocket Stream
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {databaseTables.map((table, i) => {
            const Icon = table.icon;
            return (
              <motion.div
                key={table.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-[#141414] border border-[#262626] hover:border-accent/50 rounded-xl p-4 flex flex-col justify-between transition-all group shadow-sm hover:shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg bg-[#1d1d1d] border border-[#2c2c2c] ${table.iconColor}`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <div className="font-mono text-sm font-semibold text-white group-hover:text-accent transition-colors">
                          {table.name}
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          {table.title}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-mono bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-full border border-neutral-700">
                      {table.count}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400 leading-relaxed mb-4 min-h-[32px]">
                    {table.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-[#222222]">
                  <Link
                    href={table.path}
                    className="flex-1 text-center py-1.5 px-3 rounded-lg bg-[#1c1c1c] hover:bg-white hover:text-black text-xs font-medium text-neutral-200 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Manage</span>
                    <ArrowUpRight size={13} />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Grid: Recent Leads & Top Properties */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Enquiries CRM Stream (2 cols) */}
        <div className="lg:col-span-2 bg-[#141414] border border-[#262626] rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#222222]">
            <div className="flex items-center gap-2">
              <MessageSquareText size={18} className="text-amber-400" />
              <h3 className="font-bold text-white text-base">Live Inbound Enquiries</h3>
            </div>
            <Link
              href="/dashboard-admin/enquiries"
              className="text-xs text-accent hover:underline flex items-center gap-1 font-medium"
            >
              View All Enquiries <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="space-y-3 flex-1 overflow-x-auto">
            {enquiries.slice(0, 4).map((enq) => (
              <div
                key={enq.id}
                className="p-3.5 rounded-lg bg-[#181818] border border-[#262626] hover:border-neutral-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">{enq.name}</span>
                    <span
                      className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full ${
                        enq.status === "new"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : enq.status === "in_progress"
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-blue-500/10 text-blue-400"
                      }`}
                    >
                      {enq.status.toUpperCase()}
                    </span>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      {new Date(enq.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-400 flex items-center gap-3">
                    <span className="font-mono">{enq.phone}</span>
                    <span>•</span>
                    <span className="font-mono">{enq.email}</span>
                  </div>
                  <p className="text-xs text-neutral-400 italic line-clamp-1">
                    &quot;{enq.message}&quot;
                  </p>
                </div>

                {/* Status Switcher */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <select
                    value={enq.status}
                    onChange={(e) =>
                      updateEnquiryStatus(enq.id, e.target.value as any)
                    }
                    className="bg-[#121212] border border-[#333333] text-xs text-neutral-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="new">🟢 New</option>
                    <option value="in_progress">🟡 In Progress</option>
                    <option value="contacted">🔵 Contacted</option>
                    <option value="closed">⚪ Closed</option>
                    <option value="spam">🔴 Spam</option>
                  </select>

                  <a
                    href={`mailto:${enq.email}`}
                    className="p-1.5 rounded-lg bg-[#222222] hover:bg-[#333333] text-neutral-300 hover:text-white"
                    title="Send Email"
                  >
                    <Mail size={14} />
                  </a>
                </div>
              </div>
            ))}

            {enquiries.length === 0 && (
              <div className="py-8 text-center text-xs text-neutral-500">
                No client inquiries in the database yet.
              </div>
            )}
          </div>
        </div>

        {/* Featured Properties Quick Summary (1 col) */}
        <div className="bg-[#141414] border border-[#262626] rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#222222]">
            <div className="flex items-center gap-2">
              <Building2 size={18} className="text-accent" />
              <h3 className="font-bold text-white text-base">Top Database Assets</h3>
            </div>
            <Link
              href="/dashboard-admin/properties"
              className="text-xs text-accent hover:underline flex items-center gap-1 font-medium"
            >
              All Listings <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="space-y-3 flex-1">
            {properties.slice(0, 3).map((prop) => (
              <div
                key={prop.id}
                className="p-3 rounded-lg bg-[#181818] border border-[#262626] flex gap-3 items-center group hover:border-accent/40 transition-colors"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80"
                  alt={prop.title_en}
                  className="w-14 h-14 rounded-lg object-cover border border-[#2f2f2f] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white truncate group-hover:text-accent transition-colors">
                    {prop.title_en}
                  </div>
                  <div className="text-[11px] text-neutral-400 truncate">
                    {prop.property_type_en}
                  </div>
                  <div className="text-xs font-bold text-accent mt-1">
                    AED {Number(prop.price).toLocaleString()}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono uppercase">
                    {prop.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 mt-2 border-t border-[#222222]">
            <Link
              href="/dashboard-admin/properties"
              className="w-full py-2 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-neutral-200 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus size={14} /> Add New Listing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
