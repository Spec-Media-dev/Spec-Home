"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function AreaGuides() {
  const { locale, t, isRTL } = useI18n();

  const areas = [
    {
      id: "marina",
      name: locale === "ar" ? "دبي مارينا" : "Dubai Marina",
      properties: 45,
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2500&auto=format&fit=crop"
    },
    {
      id: "palm",
      name: locale === "ar" ? "نخلة جميرا" : "Palm Jumeirah",
      properties: 28,
      image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2500&auto=format&fit=crop"
    },
    {
      id: "downtown",
      name: locale === "ar" ? "وسط مدينة دبي (داون تاون)" : "Downtown Dubai",
      properties: 62,
      image: "https://images.unsplash.com/photo-1546412414-e1885259563a?q=80&w=2500&auto=format&fit=crop"
    },
    {
      id: "hills",
      name: locale === "ar" ? "دبي هيلز" : "Dubai Hills",
      properties: 15,
      image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2500&auto=format&fit=crop"
    }
  ];

  const [activeArea, setActiveArea] = useState(areas[0]);

  return (
    <section id="intel" className="py-32 w-full relative min-h-[800px] flex items-center overflow-hidden">
      {/* Background Image Reveal */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeArea.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 z-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeArea.image}
            alt={activeArea.name}
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-background/90 md:bg-background/80 z-10" />

      <div className="container mx-auto px-6 max-w-7xl relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 text-foreground">
              {t.areaGuides.title.split(".")[0]} <span className="text-accent">.</span>
            </h2>
            <p className="text-foreground/60 text-lg max-w-md mb-8">
              {t.areaGuides.subtitle}
            </p>
            <Link 
              href={`/${locale}/properties`} 
              className="inline-flex items-center gap-2 text-accent font-medium hover:text-accent/80 transition-colors uppercase tracking-widest text-sm"
            >
              {t.areaGuides.exploreAll} {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
            </Link>
          </div>

          <div className="flex flex-col gap-6">
            {areas.map((area) => (
              <div 
                key={area.id}
                onMouseEnter={() => setActiveArea(area)}
                className="group cursor-pointer border-b border-border pb-6 flex items-center justify-between transition-colors"
              >
                <h3 className={`text-3xl md:text-5xl font-light tracking-tighter transition-all duration-300 ${activeArea.id === area.id ? 'text-accent translate-x-4' : 'text-foreground/40 group-hover:text-foreground group-hover:translate-x-2'}`}>
                  {area.name}
                </h3>
                <span className={`text-sm tracking-widest uppercase transition-colors duration-300 ${activeArea.id === area.id ? 'text-foreground' : 'text-foreground/30'}`}>
                  {area.properties} {t.areaGuides.properties}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
