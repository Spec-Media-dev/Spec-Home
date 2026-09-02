"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer } from "@/theme/animations";
import PropertyCard from "./PropertyCard";
import { useI18n } from "@/lib/i18n";
import { getFeaturedProperties } from "@/lib/queries/properties";
import { getStorageUrl } from "@/lib/supabase/storage";
import type { PropertyRow } from "@/lib/supabase/types";

export default function SelectedOpportunities() {
  const { locale, t } = useI18n();
  const [properties, setProperties] = useState<(PropertyRow & { cover_image?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const data = await getFeaturedProperties();
        setProperties(data || []);
      } catch (err) {
        console.error("Failed to load featured properties:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

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
    <section id="buy" className="py-20 md:py-32 bg-background w-full relative transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4">
            {t.selectedOpportunities.title}
          </h2>
          <p className="text-foreground/60 text-base sm:text-lg max-w-2xl font-light">
            {t.selectedOpportunities.subtitle}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-full h-[400px] sm:h-[450px] rounded-3xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : properties.length > 0 ? (
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8"
          >
            {properties.map((prop) => (
              <PropertyCard
                key={prop.id}
                title={locale === "ar" ? prop.title_ar || prop.title_en : prop.title_en}
                location={
                  locale === "ar"
                    ? prop.property_type_ar || prop.property_type_en
                    : prop.property_type_en
                }
                price={formatPrice(Number(prop.price), prop.currency || "AED")}
                plan={
                  locale === "ar"
                    ? prop.payment_plan_ar || prop.payment_plan_en || "50 / 50"
                    : prop.payment_plan_en || "50 / 50"
                }
                image={getStorageUrl(prop.cover_image, "property-images")}
                href={`/${locale}/properties/${prop.slug}`}
              />
            ))}
          </motion.div>
        ) : (
          <div className="py-16 text-center text-foreground/50 border border-dashed border-border rounded-3xl bg-card/30">
            <p className="text-base">{locale === "ar" ? "لا توجد عقارات مميزة حالياً." : "No featured opportunities currently available."}</p>
          </div>
        )}
      </div>
    </section>
  );
}
