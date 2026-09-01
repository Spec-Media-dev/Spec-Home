"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink, Bell } from "lucide-react";

export const FriesIcon = ({ size = 18, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="15" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export default function AdminHeader() {
  const toggleSidebar = () => {
    window.dispatchEvent(new Event("toggle-admin-sidebar"));
  };

  return (
    <header className="h-14 border-b border-[#222] bg-[#111] flex items-center px-4 sm:px-6 justify-between shrink-0 gap-3">
      {/* Mobile Menu Button & Brand */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          onClick={toggleSidebar}
          aria-label="Open Navigation Menu"
          className="p-2 text-neutral-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors border border-[#2a2a2a]"
        >
          <FriesIcon size={18} />
        </button>
        <Link href="/dashboard-admin" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-accent flex items-center justify-center text-black font-bold text-xs">
            S
          </div>
          <span className="text-sm font-bold text-white">
            SPEC <span className="text-accent">Home</span>
          </span>
        </Link>
      </div>

      {/* Right Side Links */}
      <div className="flex items-center gap-3 ml-auto">
        <Link
          href="/en"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#1a1a1a] hover:bg-[#252525] text-neutral-300 border border-[#333] rounded-lg transition-colors"
        >
          <ExternalLink size={13} />
          <span className="hidden xs:inline">Live Site</span>
        </Link>

        <Link
          href="/dashboard-admin/enquiries"
          className="relative p-2 rounded-lg bg-[#1a1a1a] text-neutral-300 hover:text-white hover:bg-[#252525] border border-[#2a2a2a] transition-colors"
          title="Enquiries"
        >
          <Bell size={16} />
        </Link>
      </div>
    </header>
  );
}
