"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Building2,
  Image as ImageIcon,
  SlidersHorizontal,
  MessageSquareText,
  Globe2,
  Users,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import clsx from "clsx";
import { useRealtimeDashboard } from "@/lib/supabase/useRealtimeDashboard";
import { FriesIcon } from "./AdminHeader";

export default function AdminSidebar() {
  const { enquiries } = useRealtimeDashboard();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    window.addEventListener("toggle-admin-sidebar", handleToggle);
    return () => window.removeEventListener("toggle-admin-sidebar", handleToggle);
  }, []);

  const newLeadsCount = enquiries.filter(
    (e) => (e.status || "").trim().toLowerCase() === "new"
  ).length;

  const navItems = [
    {
      href: "/dashboard-admin",
      label: "Overview",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: "/dashboard-admin/projects",
      label: "Master Projects",
      icon: FolderKanban,
    },
    {
      href: "/dashboard-admin/properties",
      label: "Properties",
      icon: Building2,
    },
    {
      href: "/dashboard-admin/property-images",
      label: "Media Gallery",
      icon: ImageIcon,
    },
    {
      href: "/dashboard-admin/property-specs",
      label: "Specifications",
      icon: SlidersHorizontal,
    },
    {
      href: "/dashboard-admin/enquiries",
      label: "Lead Inbox",
      icon: MessageSquareText,
      badge: newLeadsCount > 0 ? newLeadsCount : undefined,
    },
    {
      href: "/dashboard-admin/seo",
      label: "SEO Management",
      icon: Globe2,
    },
    {
      href: "/dashboard-admin/admin-profiles",
      label: "Admin Access",
      icon: Users,
    },
    {
      href: "/dashboard-admin/settings",
      label: "Site Settings",
      icon: Settings,
    },
  ];

  const isActive = (item: (typeof navItems)[0]) => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  return (
    <>
      {/* Mobile Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open Menu"
        className="md:hidden fixed bottom-6 right-6 z-50 p-3.5 bg-accent text-black rounded-full shadow-2xl border border-white/20 active:scale-95 transition-transform"
      >
        <FriesIcon size={22} />
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed md:static inset-y-0 left-0 z-50 w-60 bg-[#111111] border-r border-[#262626] flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 select-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="p-5 border-b border-[#262626] flex items-center justify-between">
          <Link
            href="/dashboard-admin"
            className="flex items-center gap-2.5 group"
            onClick={() => setIsOpen(false)}
          >
            <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center p-1 shadow-md group-hover:border-accent/50 transition-colors">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.svg" alt="SPEC Home" className="w-full h-full object-contain" />
            </div>
            <span className="text-base font-bold tracking-tight text-white">
              SPEC <span className="text-accent">Home</span>
            </span>
          </Link>
          <button
            className="md:hidden text-neutral-400 hover:text-white p-1"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={clsx(
                  "flex items-center justify-between px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all group",
                  active
                    ? "bg-accent/10 text-accent font-semibold"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={17}
                    className={clsx(
                      active ? "text-accent" : "text-neutral-500 group-hover:text-neutral-300"
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 && (
                  <span className="text-[10px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-[#262626]">
          <button
            onClick={async () => {
              const { logoutAdmin } = await import("@/app/actions/auth");
              await logoutAdmin();
              window.location.href = "/dashboard-admin/login";
            }}
            className="flex items-center justify-center gap-2 py-2.5 text-xs text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors w-full font-medium"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
