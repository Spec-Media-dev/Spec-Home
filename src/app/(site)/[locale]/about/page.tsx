"use client";
import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useI18n } from '@/lib/i18n';

export default function AboutPage() {
  const { locale, t } = useI18n();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

  const leadership = [
    { name: locale === "ar" ? "ألكسندر رايت" : "Alexander Wright", role: locale === "ar" ? "الرئيس التنفيذي للمجموعة" : "Chief Executive Officer" },
    { name: locale === "ar" ? "إلينا روستوفا" : "Elena Rostova", role: locale === "ar" ? "رئيس العمليات العقارية" : "Chief Operating Officer" },
    { name: locale === "ar" ? "طارق منصور" : "Tariq Mansoor", role: locale === "ar" ? "رئيس قطاع الاستثمار والمبيعات" : "Head of Investments" },
  ];

  return (
    <div className="bg-background min-h-screen text-foreground overflow-hidden transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center pt-20">
        <motion.div style={{ y }} className="absolute inset-0 opacity-40 dark:opacity-30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=100" 
            alt="Dubai Skyline" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        </motion.div>
        
        <div className="relative z-10 text-center px-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-5xl md:text-8xl font-light tracking-tighter mb-6 text-foreground"
          >
            {t.aboutPage.heroTitle.split(" ")[0]} <span className="font-bold text-accent">{t.aboutPage.heroTitle.split(" ").slice(1).join(" ")}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto font-light"
          >
            {t.aboutPage.heroSubtitle}
          </motion.p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-32 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-6 text-foreground">{t.aboutPage.visionTitle}</h2>
            <p className="text-foreground/70 leading-relaxed mb-6 text-lg font-light">
              {t.aboutPage.visionText1}
            </p>
            <p className="text-foreground/70 leading-relaxed text-lg font-light">
              {t.aboutPage.visionText2}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="aspect-square bg-card rounded-3xl overflow-hidden relative border border-border shadow-xl"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80" 
              alt="Vision" 
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-32 bg-card text-card-foreground px-6 lg:px-12 border-t border-border">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-light mb-16 tracking-tighter text-foreground">
            {t.aboutPage.leadershipTitle.split(" ")[0]} <span className="font-bold text-accent">{t.aboutPage.leadershipTitle.split(" ").slice(1).join(" ")}</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {leadership.map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="text-start p-6 rounded-3xl bg-background border border-border shadow-md"
              >
                <div className="aspect-[3/4] bg-muted rounded-2xl mb-6 overflow-hidden flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xl font-bold">
                    {item.name.split(" ").map(n => n[0]).join("")}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-1 text-foreground">{item.name}</h3>
                <p className="text-accent uppercase tracking-widest text-xs font-semibold">{item.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
