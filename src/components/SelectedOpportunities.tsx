"use client";

import { motion } from "framer-motion";
import { staggerContainer } from "@/theme/animations";
import PropertyCard from "./PropertyCard";
import { useI18n } from "@/lib/i18n";

export default function SelectedOpportunities() {
  const { locale, t } = useI18n();

  const properties = [
    {
      title: locale === "ar" ? "بنتهاوس سيغنتشر" : "Signature Penthouse",
      location: locale === "ar" ? "نخلة جميرا" : "Palm Jumeirah",
      price: locale === "ar" ? "25,000,000 درهم" : "AED 25,000,000",
      plan: "60/40",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200&auto=format&fit=crop",
      href: `/${locale}/properties/signature-penthouse`
    },
    {
      title: locale === "ar" ? "فيلا غولف إستيت" : "Golf Estate Villa",
      location: locale === "ar" ? "دبي هيلز إستيت" : "Dubai Hills Estate",
      price: locale === "ar" ? "18,500,000 درهم" : "AED 18,500,000",
      plan: "70/30",
      image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1200&auto=format&fit=crop",
      href: `/${locale}/properties/golf-estate-villa`
    },
    {
      title: locale === "ar" ? "سكاي مانشن" : "Sky Mansion",
      location: locale === "ar" ? "الخليج التجاري" : "Business Bay",
      price: locale === "ar" ? "12,000,000 درهم" : "AED 12,000,000",
      plan: "50/50",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop",
      href: `/${locale}/properties/sky-mansion`
    },
    {
      title: locale === "ar" ? "واجهة مائية فاخرة" : "Luxury Waterfront",
      location: locale === "ar" ? "دبي مارينا" : "Dubai Marina",
      price: locale === "ar" ? "8,900,000 درهم" : "AED 8,900,000",
      plan: "80/20",
      image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1200&auto=format&fit=crop",
      href: `/${locale}/properties/luxury-waterfront`
    }
  ];

  return (
    <section id="buy" className="py-32 bg-background w-full relative">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{t.selectedOpportunities.title}</h2>
          <p className="text-foreground/60 text-lg max-w-2xl">
            {t.selectedOpportunities.subtitle}
          </p>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {properties.map((prop, idx) => (
            <PropertyCard key={idx} {...prop} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
