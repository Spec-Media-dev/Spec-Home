import type { Metadata } from "next";
import AdminSidebar from "@/components/AdminSidebar";
import Link from "next/link";
import {
  ExternalLink,
  Bell,
  Search,
  CheckCircle2,
  Database,
  Sliders,
} from "lucide-react";

export const metadata: Metadata = {
  title: "SPEC Home | Pro Admin Dashboard",
  description: "Administrative control center for SPEC Home Dubai luxury real estate platform.",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex font-sans antialiased overflow-hidden">
      {/* Sidebar Navigation */}
      <AdminSidebar />

      {/* Main Panel */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0d0d0d]">
        {/* Top Control Bar */}
        <header className="h-16 border-b border-[#222222] bg-[#111111] flex items-center px-6 lg:px-8 justify-between shrink-0 z-20">
          {/* Left Breadcrumb & Database Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
              <Database size={13} className="text-accent" />
              <span className="text-neutral-500">spechome_db</span>
              <span className="text-neutral-600">/</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                Live Store Synced
              </span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* View Live Website Button */}
            <Link
              href="/en"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-[#1a1a1a] hover:bg-[#252525] text-neutral-200 hover:text-accent border border-[#333333] rounded-lg transition-colors"
            >
              <ExternalLink size={13} />
              <span>Live Website</span>
            </Link>

            {/* Notifications badge */}
            <Link
              href="/dashboard-admin/enquiries"
              className="relative p-2 rounded-lg bg-[#1a1a1a] text-neutral-300 hover:text-white hover:bg-[#252525] border border-[#2a2a2a] transition-colors"
              title="Recent Enquiries"
            >
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent animate-ping" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent" />
            </Link>

            {/* Admin Avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#262626]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent to-[#5a4401] p-0.5 shadow-md">
                <div className="w-full h-full rounded-full bg-[#141414] flex items-center justify-center text-xs font-bold text-accent">
                  AW
                </div>
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-medium text-white leading-tight">Alexander</div>
                <div className="text-[10px] text-neutral-400 leading-tight font-mono">Superadmin</div>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Viewport Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#0a0a0a]">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
