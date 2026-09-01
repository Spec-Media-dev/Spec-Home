"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Building2, Home, ArrowRight, Loader2, Compass, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { liveSearch, type SearchResultItem } from "@/app/actions/search";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { locale, t } = useI18n();
  const [query, setQuery] = useState("");
  const [properties, setProperties] = useState<SearchResultItem[]>([]);
  const [projects, setProjects] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setQuery("");
      setProperties([]);
      setProjects([]);
      setSearched(false);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced Live Search
  useEffect(() => {
    if (!query.trim()) {
      setProperties([]);
      setProjects([]);
      setSearched(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      const results = await liveSearch(query, locale);
      setProperties(results.properties);
      setProjects(results.projects);
      setSearched(true);
      setLoading(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [query, locale]);

  if (!isOpen) return null;

  const totalResults = properties.length + projects.length;
  const isArabic = locale === "ar";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 pb-6">
        {/* Backdrop blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-2xl bg-[#111111]/95 border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[80vh] z-10"
        >
          {/* Search Header Input */}
          <div className="flex items-center px-4 sm:px-6 py-4 border-b border-white/10 gap-3 bg-white/[0.02]">
            <Search className="w-5 h-5 text-accent shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                isArabic
                  ? "ابحث عن عقار، مشروع، موقع، أو كود..."
                  : "Search luxury properties, projects, locations, or reference codes..."
              }
              className="w-full bg-transparent text-white text-sm sm:text-base placeholder-neutral-500 outline-none"
            />
            {loading && <Loader2 className="w-4 h-4 text-accent animate-spin shrink-0" />}
            {query && !loading && (
              <button
                onClick={() => setQuery("")}
                className="text-neutral-400 hover:text-white transition-colors text-xs bg-white/10 px-2 py-0.5 rounded"
              >
                {isArabic ? "مسح" : "Clear"}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors shrink-0"
              aria-label="Close search"
            >
              <X size={18} />
            </button>
          </div>

          {/* Results List */}
          <div className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1 custom-scrollbar">
            {/* Initial State: Quick Suggestions */}
            {!query.trim() && !searched && (
              <div className="space-y-4 py-2">
                <div className="flex items-center justify-between text-xs font-mono tracking-wider text-neutral-400 uppercase">
                  <span>{isArabic ? "استكشاف سريع" : "Quick Navigation"}</span>
                  <span>ESC {isArabic ? "للإغلاق" : "to close"}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <Link
                    href={`/${locale}/properties`}
                    onClick={onClose}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-accent/40 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent group-hover:scale-105 transition-transform">
                      <Home size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white group-hover:text-accent transition-colors">
                        {isArabic ? "جميع العقارات المتاحة" : "Browse All Properties"}
                      </h4>
                      <p className="text-xs text-neutral-400">
                        {isArabic ? "فلل، بنتهاوس، وشقق فاخرة" : "Villas, penthouses & luxury residences"}
                      </p>
                    </div>
                  </Link>

                  <Link
                    href={`/${locale}/projects`}
                    onClick={onClose}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-accent/40 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent group-hover:scale-105 transition-transform">
                      <Building2 size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white group-hover:text-accent transition-colors">
                        {isArabic ? "المشاريع الرئيسية" : "Master Developments"}
                      </h4>
                      <p className="text-xs text-neutral-400">
                        {isArabic ? "مشاريع التطوير الأيقونية" : "Signature architectural landmarks"}
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            )}

            {/* Results: Properties Section */}
            {properties.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono tracking-widest text-accent uppercase flex items-center gap-2">
                    <Home size={14} />
                    {isArabic ? "العقارات المطابقة" : "Matching Properties"} ({properties.length})
                  </h3>
                </div>
                <div className="space-y-2">
                  {properties.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={onClose}
                      className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-accent/40 transition-all group"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl}
                        alt={item.title_en}
                        className="w-16 h-16 rounded-lg object-cover border border-white/10 shrink-0 group-hover:scale-105 transition-transform"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-white group-hover:text-accent transition-colors truncate">
                            {isArabic ? item.title_ar : item.title_en}
                          </h4>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/10 text-neutral-300">
                            {item.badge_en}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-0.5 truncate">
                          {isArabic ? item.subtitle_ar : item.subtitle_en}
                        </p>
                        {item.price && (
                          <p className="text-xs font-mono font-bold text-accent mt-1">
                            {item.currency} {Number(item.price).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <ArrowRight size={16} className="text-neutral-500 group-hover:text-accent group-hover:translate-x-1 transition-all shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Results: Projects Section */}
            {projects.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono tracking-widest text-accent uppercase flex items-center gap-2">
                    <Building2 size={14} />
                    {isArabic ? "المشاريع الرئيسية" : "Master Projects"} ({projects.length})
                  </h3>
                </div>
                <div className="space-y-2">
                  {projects.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={onClose}
                      className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-accent/40 transition-all group"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl}
                        alt={item.title_en}
                        className="w-16 h-16 rounded-lg object-cover border border-white/10 shrink-0 group-hover:scale-105 transition-transform"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-white group-hover:text-accent transition-colors truncate">
                            {isArabic ? item.title_ar : item.title_en}
                          </h4>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-accent/20 text-accent">
                            {item.badge_en}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-0.5 truncate">
                          {isArabic ? item.subtitle_ar : item.subtitle_en}
                        </p>
                        {item.price && (
                          <p className="text-xs font-mono text-neutral-300 mt-1">
                            {isArabic ? "يبدأ من" : "From"} <span className="text-accent font-bold">{item.currency} {Number(item.price).toLocaleString()}</span>
                          </p>
                        )}
                      </div>
                      <ArrowRight size={16} className="text-neutral-500 group-hover:text-accent group-hover:translate-x-1 transition-all shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Empty Not Found State */}
            {searched && totalResults === 0 && !loading && (
              <div className="text-center py-10 px-4 space-y-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mx-auto">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white tracking-tight">
                    {isArabic ? "لم يتم العثور على نتائج" : "No Matching Properties or Projects"}
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                    {isArabic
                      ? `لم نجد أي عقار أو مشروع يطابق "${query}". جرب البحث باسم المنطقة أو المطور.`
                      : `No database listings matched "${query}". Try searching by location, property type, or developer.`}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <Link
                    href={`/${locale}/properties`}
                    onClick={onClose}
                    className="px-4 py-2 bg-accent text-black text-xs font-semibold rounded-lg hover:bg-[#e5c158] transition-colors"
                  >
                    {isArabic ? "تصفح جميع العقارات" : "Browse Properties"}
                  </Link>
                  <Link
                    href={`/${locale}/projects`}
                    onClick={onClose}
                    className="px-4 py-2 bg-white/10 text-white text-xs font-semibold rounded-lg hover:bg-white/20 transition-colors"
                  >
                    {isArabic ? "المشاريع الرئيسية" : "Explore Projects"}
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-6 py-3 border-t border-white/10 bg-black/40 flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Database Search</span>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <span>Navigate: ↵ to open</span>
              <span>Close: ESC</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
