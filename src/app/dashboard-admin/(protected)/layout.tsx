import type { Metadata } from "next";
import AdminSidebar from "@/components/AdminSidebar";
import Link from "next/link";
import { ExternalLink, Bell } from "lucide-react";

export const metadata: Metadata = {
  title: "SPEC Home | Admin Dashboard",
  description: "Administrative control center for SPEC Home Dubai luxury real estate platform.",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex font-sans antialiased overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0d0d0d]">
        {/* Top Bar */}
        <header className="h-14 border-b border-[#222] bg-[#111] flex items-center px-6 justify-end shrink-0 gap-3">
          <Link
            href="/en"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-[#1a1a1a] hover:bg-[#252525] text-neutral-300 border border-[#333] rounded-lg transition-colors"
          >
            <ExternalLink size={13} />
            <span>Live Site</span>
          </Link>

          <Link
            href="/dashboard-admin/enquiries"
            className="relative p-2 rounded-lg bg-[#1a1a1a] text-neutral-300 hover:text-white hover:bg-[#252525] border border-[#2a2a2a] transition-colors"
            title="Enquiries"
          >
            <Bell size={16} />
          </Link>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#0a0a0a]">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
