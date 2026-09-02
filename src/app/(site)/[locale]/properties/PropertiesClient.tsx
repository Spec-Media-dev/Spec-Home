"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PropertyCard from "@/components/PropertyCard";
import { Search, Filter, Building2 } from "lucide-react";
import { getProperties } from "@/lib/queries/properties";
import { getStorageUrl } from "@/lib/supabase/storage";
import type { PropertyRow } from "@/lib/supabase/types";
import { useI18n } from "@/lib/i18n";

export default function PropertiesClient() {
  const { locale, t } = useI18n();
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [dbProperties, setDbProperties] = useState<(PropertyRow & { cover_image?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getProperties();
        setDbProperties(data || []);
      } catch (err) {
        console.error("Failed to load properties:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const formatPrice = (price: number, currency: string = "AED") => {
    if (!price || price === 0) {
      return locale === "ar" ? "السعر عند الطلب" : "Price on Request";
    }
    if (price >= 1000000) {
      return locale === "ar"
        ? `${(price / 1000000).toFixed(1)} مليون ${currency === "AED" ? "درهم" : currency}`
        : `${currency} ${(price / 1000000).toFixed(1)}M`;
    }
    return locale === "ar"
      ? `${price.toLocaleString()} ${currency === "AED" ? "درهم" : currency}`
      : `${currency} ${price.toLocaleString()}`;
  };

  const getStatusLabel = (status: string) => {
    if (status === "available") return t.propertiesPage.available;
    if (status === "reserved") return t.propertiesPage.reserved;
    if (status === "sold") return t.propertiesPage.sold;
    return status;
  };

  // Derive unique property types from database
  const uniqueTypes = Array.from(
    new Set(dbProperties.map((p) => p.property_type_en).filter(Boolean))
  );

  const filterOptions = [
    { key: "All", label: t.propertiesPage.all },
    ...uniqueTypes.map((type) => ({
      key: type,
      label: type,
    })),
  ];

  const displayItems = dbProperties.map((p) => ({
    id: p.id,
    title: locale === "ar" ? p.title_ar || p.title_en : p.title_en,
    location:
      locale === "ar"
        ? p.property_type_ar || p.property_type_en
        : p.property_type_en,
    price: formatPrice(Number(p.price), p.currency || "AED"),
    plan:
      locale === "ar"
        ? p.payment_plan_ar || p.payment_plan_en || getStatusLabel(p.status)
        : p.payment_plan_en || getStatusLabel(p.status),
    type: p.property_type_en,
    image: getStorageUrl(p.cover_image, "property-images"),
    href: `/${locale}/properties/${p.slug}`,
  }));

  const filteredProperties = displayItems.filter((p) => {
    const matchesFilter =
      activeFilter === "All" || p.type.toLowerCase().includes(activeFilter.toLowerCase());
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-background min-h-screen text-foreground pt-28 sm:pt-32 pb-16 sm:pb-24 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-10 sm:mb-16"
        >
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-light tracking-tighter mb-4 sm:mb-6 text-foreground">
            {t.propertiesPage.title.split(" ")[0]}{" "}
            <span className="font-bold text-accent">
              {t.propertiesPage.title.split(" ").slice(1).join(" ")}
            </span>
          </h1>
          <p className="text-base sm:text-xl text-foreground/60 max-w-2xl font-light">
            {t.propertiesPage.subtitle}
          </p>
        </motion.div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 sm:gap-6 mb-8 sm:mb-12 border-b border-border pb-6">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                  activeFilter === filter.key
                    ? "bg-foreground text-background shadow-md"
                    : "bg-card text-foreground/70 hover:bg-foreground/10 hover:text-foreground border border-border"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-auto flex items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-foreground/40" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.propertiesPage.searchPlaceholder}
                className="w-full bg-card border border-border rounded-full ps-12 pe-4 py-2.5 sm:py-3 text-sm text-foreground focus:outline-none focus:border-accent shadow-sm transition-colors"
              />
            </div>
            <button className="p-2.5 sm:p-3 bg-card rounded-full border border-border text-foreground hover:bg-foreground/10 transition-colors shadow-sm shrink-0">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Property Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="w-full h-[400px] sm:h-[450px] rounded-3xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : filteredProperties.length > 0 ? (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProperties.map((property) => (
                <motion.div
                  key={property.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <PropertyCard
                    title={property.title}
                    location={property.location}
                    price={property.price}
                    plan={property.plan}
                    image={property.image}
                    href={property.href}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="py-24 text-center text-foreground/50 border border-dashed border-border rounded-3xl bg-card/20">
            <Building2 className="mx-auto text-foreground/30 mb-3" size={40} />
            <p className="text-lg font-medium">{t.propertiesPage.noResults}</p>
          </div>
        )}
      </div>
    </div>
  );
}
