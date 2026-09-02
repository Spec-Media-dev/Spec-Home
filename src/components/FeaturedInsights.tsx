"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/theme/animations";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function FeaturedInsights() {
  const { locale, t, isRTL } = useI18n();

  const fallbackImage = "https://images.unsplash.com/photo-1546412414-e1885259563a?q=80&w=1200&auto=format&fit=crop";

  const insights = [
    {
      category: t.featuredInsights.article1Cat,
      title: t.featuredInsights.article1Title,
      date: locale === "ar" ? "15 أغسطس 2026" : "August 15, 2026",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop"
    },
    {
      category: t.featuredInsights.article2Cat,
      title: t.featuredInsights.article2Title,
      date: locale === "ar" ? "28 يوليو 2026" : "July 28, 2026",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop"
    },
    {
      category: t.featuredInsights.article3Cat,
      title: t.featuredInsights.article3Title,
      date: locale === "ar" ? "12 يوليو 2026" : "July 12, 2026",
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop"
    }
  ];

  return (
    <section className="py-20 md:py-32 bg-card relative transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-16 gap-4 sm:gap-6">
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tighter text-foreground mb-3 sm:mb-4">
              {t.featuredInsights.title.split(".")[0]} <span className="text-accent">.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-foreground/60 max-w-2xl text-base sm:text-lg font-light">
              {t.featuredInsights.subtitle}
            </motion.p>
          </motion.div>
          <Link 
            href={`/${locale}/about`} 
            className="inline-flex items-center gap-2 text-accent font-medium hover:text-accent/80 transition-colors uppercase tracking-widest text-xs sm:text-sm whitespace-nowrap"
          >
            {t.featuredInsights.viewAll} {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
          </Link>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
        >
          {insights.map((insight, index) => (
            <motion.div 
              key={index}
              variants={fadeUp}
              className="group cursor-pointer"
            >
              <div className="w-full h-64 rounded-3xl overflow-hidden mb-6 relative bg-muted/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={insight.image} 
                  alt={insight.title}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== fallbackImage) {
                      target.src = fallbackImage;
                    }
                  }}
                  className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-widest text-accent mb-3">
                <span>{insight.category}</span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span className="text-foreground/50">{insight.date}</span>
              </div>
              <h3 className="text-2xl font-bold text-foreground leading-snug group-hover:text-accent transition-colors">
                {insight.title}
              </h3>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
