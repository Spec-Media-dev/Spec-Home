"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search as SearchIcon, ArrowRight, ArrowLeft, Loader2, Building2, Layers, AlertCircle } from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import { searchProperties } from "@/lib/queries/properties";
import { getStorageUrl } from "@/lib/supabase/storage";
import type { PropertyRow } from "@/lib/supabase/types";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";

function SearchContent() {
  const { locale, t, isRTL } = useI18n();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || searchParams.get("slug") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<(PropertyRow & { cover_image?: string })[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const popularTags =
    locale === "ar"
      ? ["نخلة جميرا", "دبي مارينا", "وسط المدينة", "شقق فاخرة", "بنتهاوس"]
      : ["Palm Jumeirah", "Dubai Marina", "Downtown", "Luxury Villa", "Penthouse"];

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setQuery(searchQuery);
    setLoading(true);
    setSearched(true);

    try {
      const data = await searchProperties(searchQuery);
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery, handleSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const formatPrice = (price: number, currency: string = "AED") => {
    if (price >= 1000000) {
      return locale === "ar"
        ? `${(price / 1000000).toFixed(1)} مليون ${currency === "AED" ? "درهم" : currency}`
        : `${currency} ${(price / 1000000).toFixed(1)}M`;
    }
    return locale === "ar"
      ? `${price.toLocaleString()} ${currency === "AED" ? "درهم" : currency}`
      : `${currency} ${price.toLocaleString()}`;
  };

  return (
    <div className="bg-background min-h-screen text-foreground pt-32 pb-24 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-light tracking-tighter mb-8 text-foreground"
          >
            {t.searchPage.title.split(" ")[0]}{" "}
            <span className="font-bold text-accent">
              {t.searchPage.title.split(" ").slice(1).join(" ")}
            </span>
          </motion.h1>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
            onSubmit={handleSubmit}
          >
            <SearchIcon className="absolute start-6 top-1/2 -translate-y-1/2 text-foreground/40" size={24} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchPage.placeholder}
              className="w-full bg-card border border-border rounded-full ps-16 pe-8 py-6 text-lg text-foreground focus:outline-none focus:border-accent shadow-2xl transition-all"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute end-3 top-1/2 -translate-y-1/2 p-3.5 bg-foreground text-background rounded-full hover:opacity-80 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : isRTL ? (
                <ArrowLeft size={20} />
              ) : (
                <ArrowRight size={20} />
              )}
            </button>
          </motion.form>

          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <span className="text-sm text-foreground/50 mr-2 self-center">{t.searchPage.popular}</span>
            {popularTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleSearch(tag)}
                className="px-4 py-1.5 rounded-full border border-border bg-card text-xs text-foreground/70 hover:text-foreground hover:border-accent transition-colors shadow-sm"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results / Not Found Area */}
        {searched && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-16">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
              </div>
            ) : results.length > 0 ? (
              <>
                <h2 className="text-xl font-medium mb-8 text-foreground">
                  {results.length} {t.searchPage.resultsCount} &quot;{query}&quot;
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {results.map((property) => (
                    <PropertyCard
                      key={property.id}
                      title={locale === "ar" ? property.title_ar || property.title_en : property.title_en}
                      location={locale === "ar" ? property.property_type_ar || property.property_type_en : property.property_type_en}
                      price={formatPrice(property.price, property.currency || "AED")}
                      plan={property.status}
                      image={
                        property.cover_image
                          ? getStorageUrl(property.cover_image, "property-images")
                          : "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80"
                      }
                      href={`/${locale}/properties/${property.slug}`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="max-w-2xl mx-auto text-center py-12 px-6 bg-card rounded-3xl border border-border/80 shadow-2xl">
                <div className="w-16 h-16 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto mb-6">
                  <AlertCircle size={32} />
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background border border-border mb-3">
                  <span className="text-xs font-mono text-accent uppercase">404 • NOT FOUND</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                  {locale === "ar" ? `لم يتم العثور على نتائج لـ "${query}"` : `No Results or Slug Matching "${query}"`}
                </h2>
                <p className="text-foreground/60 text-sm sm:text-base mb-8 max-w-md mx-auto">
                  {locale === "ar"
                    ? "الرمز التعريفي أو العنوان الذي تبحث عنه غير مسجل في قاعدة بياناتنا. يمكنك استكشاف كامل محفظتنا العقارية أدناه."
                    : "The slug or keywords you entered do not match any published properties or projects in our catalog."}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href={`/${locale}/properties`}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-black font-semibold text-xs hover:bg-[#e5c158] transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                  >
                    <Building2 size={16} />
                    <span>{locale === "ar" ? "تصفح كل العقارات" : "Browse All Properties"}</span>
                  </Link>

                  <Link
                    href={`/${locale}/projects`}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-background border border-border text-foreground font-medium text-xs hover:border-accent hover:text-accent transition-all"
                  >
                    <Layers size={16} className="text-accent" />
                    <span>{locale === "ar" ? "المشاريع الرئيسية" : "Explore Master Projects"}</span>
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
