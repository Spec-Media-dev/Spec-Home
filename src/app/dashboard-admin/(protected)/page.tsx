"use client";

import React from "react";
import Link from "next/link";
import { useRealtimeDashboard } from "@/lib/supabase/useRealtimeDashboard";

export default function AdminDashboardOverviewPage() {
  const {
    projects,
    properties,
    enquiries,
    loading,
    updateEnquiryStatus,
  } = useRealtimeDashboard();

  const publishedCount = properties.filter((p) => p.is_published).length;
  const featuredCount = properties.filter((p) => p.is_featured).length;
  const newEnquiriesCount = enquiries.filter((e) => e.status === "new").length;

  const stats = [
    { label: "PROJECTS", value: projects.length },
    { label: "PROPERTIES", value: properties.length },
    { label: "PUBLISHED", value: publishedCount },
    { label: "FEATURED", value: featuredCount },
    { label: "NEW ENQUIRIES", value: newEnquiriesCount, highlight: newEnquiriesCount > 0 },
  ];

  // Show the 5 most recent enquiries
  const recentEnquiries = enquiries.slice(0, 5);

  const statusColors: Record<string, string> = {
    new: "bg-red-500/15 text-red-400 border border-red-500/30",
    contacted: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    in_progress: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
    closed: "bg-neutral-700/40 text-neutral-400 border border-neutral-600/30",
    spam: "bg-neutral-700/40 text-neutral-500 border border-neutral-600/30",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Overview</h1>
          <p className="text-sm text-neutral-400 mt-0.5">
            A snapshot of your portfolio and incoming leads.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard-admin/projects"
            className="px-4 py-2 text-xs font-medium text-neutral-300 bg-[#1a1a1a] border border-[#333] rounded-lg hover:bg-[#252525] transition-colors"
          >
            New project
          </Link>
          <Link
            href="/dashboard-admin/properties/new"
            className="px-4 py-2 text-xs font-medium text-black bg-accent rounded-lg hover:bg-[#e5c158] transition-colors"
          >
            New property
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-[#141414] border border-[#262626] rounded-xl p-5"
          >
            <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">
              {stat.label}
            </div>
            <div
              className={`text-2xl font-bold ${
                stat.highlight ? "text-accent" : "text-white"
              }`}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Enquiries */}
      <div className="bg-[#141414] border border-[#262626] rounded-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626]">
          <h2 className="text-sm font-semibold text-white">Recent enquiries</h2>
          <Link
            href="/dashboard-admin/enquiries"
            className="text-xs text-neutral-400 hover:text-accent transition-colors"
          >
            View all
          </Link>
        </div>

        {recentEnquiries.length === 0 ? (
          <div className="px-6 py-12 text-center text-neutral-500 text-sm">
            No enquiries yet.
          </div>
        ) : (
          <div className="divide-y divide-[#222]">
            {recentEnquiries.map((enq) => (
              <div
                key={enq.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {enq.name}
                  </div>
                  <div className="text-xs text-neutral-500 truncate">
                    {enq.id.slice(0, 8)}-{enq.email}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  {enq.status === "new" ? (
                    <button
                      onClick={() => updateEnquiryStatus(enq.id, "contacted")}
                      className={`text-[11px] font-medium px-3 py-1 rounded-full ${statusColors.new}`}
                    >
                      New
                    </button>
                  ) : (
                    <span
                      className={`text-[11px] font-medium px-3 py-1 rounded-full capitalize ${
                        statusColors[enq.status] || statusColors.closed
                      }`}
                    >
                      {enq.status.replace("_", " ")}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
