"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  MessageSquareText,
  FolderKanban,
  Building2,
  Image as ImageIcon,
  SlidersHorizontal,
  Settings2,
  ExternalLink,
  RotateCcw,
  LogOut,
  Menu,
  X,
  Database,
  Globe,
  Sparkles,
} from "lucide-react";
import clsx from "clsx";
import { AdminStore } from "@/lib/adminStore";

export const dbNavItems = [
  {
    href: "/dashboard-admin/admin-profiles",
    aliases: ["/dashboard-admin/admin_profiles"],
    label: "admin_profiles",
    displayLabel: "Admin Profiles",
    icon: Users,
    getBadge: () => AdminStore.getAdmins().length,
  },
  {
    href: "/dashboard-admin/enquiries",
    aliases: [],
    label: "enquiries",
    displayLabel: "Enquiries / Leads",
    icon: MessageSquareText,
    getBadge: () => AdminStore.getEnquiries().filter((e) => e.status === "New").length,
    badgeColor: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  },
  {
    href: "/dashboard-admin/projects",
    aliases: [],
    label: "projects",
    displayLabel: "Projects",
    icon: FolderKanban,
    getBadge: () => AdminStore.getProjects().length,
  },
  {
    href: "/dashboard-admin/properties",
    aliases: [],
    label: "properties",
    displayLabel: "Properties",
    icon: Building2,
    getBadge: () => AdminStore.getProperties().length,
  },
  {
    href: "/dashboard-admin/property-images",
    aliases: ["/dashboard-admin/property_images"],
    label: "property_images",
    displayLabel: "Property Images",
    icon: ImageIcon,
    getBadge: () => AdminStore.getPropertyImages().length,
  },
  {
    href: "/dashboard-admin/property-specs",
    aliases: ["/dashboard-admin/property_specs"],
    label: "property_specs",
    displayLabel: "Property Specs",
    icon: SlidersHorizontal,
    getBadge: () => AdminStore.getPropertySpecs().length,
  },
  {
    href: "/dashboard-admin/site-settings",
    aliases: ["/dashboard-admin/site_settings", "/dashboard-admin/settings"],
    label: "site_settings",
    displayLabel: "Site Settings",
    icon: Settings2,
    getBadge: () => null,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [counts, setCounts] = useState<{ [key: string]: number | null }>({});

  useEffect(() => {
    // Initial fetch of badges
    const updated: { [key: string]: number | null } = {};
    dbNavItems.forEach((item) => {
      try {
        updated[item.label] = item.getBadge();
      } catch {
        updated[item.label] = null;
      }
    });
    setCounts(updated);
  }, [pathname]);

  const handleResetData = () => {
    if (confirm("Reset demo data to initial seed?")) {
      AdminStore.resetAll();
      window.location.reload();
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open Sidebar Menu"
        className="md:hidden fixed bottom-6 right-6 z-50 p-3.5 bg-accent text-accent-foreground rounded-full shadow-2xl border border-white/20 active:scale-95 transition-transform"
      >
        <Menu size={22} />
      </button>

      {/* Mobile Overlay Backdrop */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40 animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={clsx(
          "fixed md:static inset-y-0 left-0 z-50 w-72 bg-[#111111] border-r border-[#262626] flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 select-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[#262626] flex items-center justify-between bg-[#141414]">
          <Link
            href="/dashboard-admin"
            className="flex items-center gap-3 group"
            onClick={() => setIsOpen(false)}
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent to-[#735702] flex items-center justify-center text-black font-black text-sm tracking-wider shadow-[0_0_15px_rgba(212,175,55,0.3)]">
              S
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                SPEC <span className="text-accent font-semibold">STUDIO</span>
              </div>
              <div className="text-[11px] text-neutral-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Control Hub
              </div>
            </div>
          </Link>
          <button
            className="md:hidden text-neutral-400 hover:text-white p-1"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 py-4 flex flex-col gap-1 px-3 overflow-y-auto custom-scrollbar">
          {/* Main Dashboard Link */}
          <Link
            href="/dashboard-admin"
            onClick={() => setIsOpen(false)}
            className={clsx(
              "flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group",
              pathname === "/dashboard-admin"
                ? "bg-accent/15 text-accent border border-accent/30 shadow-[0_0_12px_rgba(212,175,55,0.15)]"
                : "text-neutral-300 hover:text-white hover:bg-white/5"
            )}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard
                size={18}
                className={clsx(
                  "transition-colors",
                  pathname === "/dashboard-admin" ? "text-accent" : "text-neutral-400 group-hover:text-white"
                )}
              />
              <span>Dashboard Overview</span>
            </div>
            <Sparkles size={14} className={pathname === "/dashboard-admin" ? "text-accent" : "opacity-0"} />
          </Link>

          {/* Database Schema Section Heading */}
          <div className="mt-5 mb-2 px-3 flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
              <Database size={12} className="text-accent" />
              Collections
            </span>
            <span className="text-[10px] bg-neutral-800/80 text-neutral-400 px-1.5 py-0.5 rounded font-mono">
              7 Tables
            </span>
          </div>

          {/* 7 Database Collections matching the user's schema */}
          {dbNavItems.map((item) => {
            const Icon = item.icon;
            const isMatch =
              pathname === item.href ||
              item.aliases.some((alias) => pathname === alias) ||
              pathname.startsWith(`${item.href}/`);
            const badgeValue = counts[item.label];

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={clsx(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-mono transition-all group",
                  isMatch
                    ? "bg-white/10 text-white font-medium border-l-2 border-accent shadow-sm"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={clsx(
                      "w-6 h-6 rounded flex items-center justify-center transition-colors",
                      isMatch
                        ? "bg-accent/20 text-accent"
                        : "bg-neutral-800/60 text-neutral-400 group-hover:text-neutral-200 group-hover:bg-neutral-800"
                    )}
                  >
                    <Icon size={14} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs tracking-tight font-mono text-neutral-200 group-hover:text-white">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-sans leading-none">
                      {item.displayLabel}
                    </span>
                  </div>
                </div>

                {/* Badge Count or Globe Icon */}
                <div className="flex items-center gap-1.5">
                  <Globe size={11} className="text-neutral-500 opacity-60 group-hover:opacity-100" />
                  {typeof badgeValue === "number" && (
                    <span
                      className={clsx(
                        "text-[10px] font-mono px-1.5 py-0.5 rounded-md min-w-[20px] text-center",
                        item.badgeColor
                          ? item.badgeColor
                          : "bg-neutral-800 text-neutral-300 border border-neutral-700/60"
                      )}
                    >
                      {badgeValue}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}

          {/* External Site Preview Link */}
          <div className="mt-4 pt-4 border-t border-[#222222]">
            <Link
              href="/en"
              target="_blank"
              className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs text-neutral-400 hover:text-accent hover:bg-accent/5 transition-colors font-medium"
            >
              <div className="flex items-center gap-2">
                <ExternalLink size={14} />
                <span>View Live Site</span>
              </div>
              <span className="text-[10px] bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-400">
                /en
              </span>
            </Link>
          </div>
        </nav>

        {/* Footer Admin Bar */}
        <div className="p-3 border-t border-[#262626] bg-[#141414] flex flex-col gap-2">
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-bold text-accent">
                AW
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Alexander Wright</div>
                <div className="text-[10px] text-neutral-400">Super Admin</div>
              </div>
            </div>
            <button
              onClick={handleResetData}
              title="Reset to Initial Seed Data"
              className="p-1.5 rounded-md text-neutral-500 hover:text-amber-400 hover:bg-neutral-800 transition-colors"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          <button
            onClick={async () => {
              const { logoutAdmin } = await import("@/app/actions/auth");
              await logoutAdmin();
              window.location.href = "/dashboard-admin/login";
            }}
            className="flex items-center justify-center gap-2 py-1.5 text-xs text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors w-full"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
