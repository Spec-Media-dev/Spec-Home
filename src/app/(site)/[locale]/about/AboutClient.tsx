"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Building2, Compass, ArrowRight, ArrowLeft, MapPin, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function AboutClient() {
  const { locale, t, isRTL } = useI18n();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div className="bg-background min-h-screen text-foreground overflow-hidden transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center pt-32 pb-20">
        <motion.div style={{ y }} className="absolute inset-0 opacity-30 dark:opacity-20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=100" 
            alt="Dubai Skyline" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/60 to-background" />
        </motion.div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full border border-border bg-card/60 backdrop-blur-md text-xs font-mono text-accent uppercase tracking-widest mb-4 sm:mb-6">
              SPEC Home Dubai
            </span>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-light tracking-tighter mb-6 sm:mb-8 text-foreground leading-[1.1]">
              {t.aboutPage.heroTitle}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto font-light leading-relaxed">
              {t.aboutPage.heroSubtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Philosophy & Approach Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto border-t border-border/40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 40 : -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 space-y-6"
          >
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-light tracking-tight text-foreground">
              {t.aboutPage.philosophyTitle}
            </h2>

            <p className="text-foreground/80 leading-relaxed text-base md:text-lg font-light">
              {t.aboutPage.text1}
            </p>

            <div className="p-5 sm:p-6 rounded-2xl bg-card border-s-4 border-accent border border-border/60 shadow-sm">
              <p className="text-foreground font-medium text-base sm:text-lg leading-relaxed italic">
                &ldquo;{t.aboutPage.text2}&rdquo;
              </p>
            </div>

            <p className="text-foreground/80 leading-relaxed text-base md:text-lg font-light">
              {t.aboutPage.text3}
            </p>

            <p className="text-foreground/80 leading-relaxed text-base md:text-lg font-light">
              {t.aboutPage.text4}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5"
          >
            <div className="aspect-[4/5] bg-card rounded-3xl overflow-hidden relative border border-border shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80" 
                alt="Dubai Architectural Vision" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 sm:p-8">
                <span className="text-accent text-xs font-mono uppercase tracking-widest mb-1">Our Commitment</span>
                <p className="text-white text-sm sm:text-base font-light">Knowledge, access, and guidance to decide with confidence.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-16 sm:py-24 bg-card/50 text-card-foreground px-4 sm:px-6 lg:px-12 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-light tracking-tight text-foreground mb-4 sm:mb-6">
              {t.aboutPage.whatWeDoTitle}
            </h2>
            <p className="text-foreground/70 text-base sm:text-lg font-light leading-relaxed">
              {t.aboutPage.whatWeDoSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="p-6 sm:p-8 md:p-10 rounded-3xl bg-background border border-border shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-6">
                  <Building2 size={26} />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-foreground">
                  {locale === "ar" ? "شراكات موثوقة مع كبرى المطورين" : "Trusted Developer Partnerships"}
                </h3>
                <p className="text-foreground/70 leading-relaxed font-light text-base">
                  {locale === "ar"
                    ? "نمكنك من الوصول المباشر إلى باقة مختارة من أفضل المشاريع السكنية الفاخرة، سواء قيد الإنشاء أو الجاهزة للتسليم، مع أفضل المطورين المعتمدين في دبي."
                    : "Direct access to Dubai's foremost residential communities, off-plan launches, and ready-to-move-in properties with leading master developers."}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="p-8 md:p-10 rounded-3xl bg-background border border-border shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-6">
                  <Compass size={26} />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-foreground">
                  {t.aboutPage.beyondConnection}
                </h3>
                <p className="text-foreground/70 leading-relaxed font-light text-base">
                  {t.aboutPage.beyondConnectionText}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Executive Leadership Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 p-8 md:p-12 rounded-3xl bg-background border border-border/80 shadow-sm text-center max-w-xl mx-auto"
          >
            <span className="inline-block px-3.5 py-1 rounded-full bg-card border border-border text-xs font-mono text-accent uppercase tracking-widest mb-4">
              {t.aboutPage.leadershipTitle}
            </span>
            <h3 className="text-3xl md:text-4xl font-light text-foreground mb-2 tracking-tight">
              {t.aboutPage.ceoName}
            </h3>
            <p className="text-accent font-medium text-xs sm:text-sm uppercase tracking-widest">
              {t.aboutPage.ceoRole}
            </p>
          </motion.div>

          {/* Office Location Map Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -3 }}
            className="mb-16 max-w-2xl mx-auto rounded-3xl bg-card border border-border/80 hover:border-accent/40 overflow-hidden shadow-lg transition-all duration-300 group"
          >
            <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between gap-4 bg-background/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
                  <MapPin size={15} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground leading-none">
                    SPEC Home Dubai
                  </h4>
                  <p className="text-foreground/50 text-[11px] font-light mt-0.5">
                    {t.aboutPage.locationTitle} • Dubai, UAE
                  </p>
                </div>
              </div>

              <a
                href="https://maps.app.goo.gl/7mh3nYbk4BSytV167?g_st=ic"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-accent text-black font-semibold text-xs hover:bg-[#e5c158] transition-all shadow-sm shrink-0"
              >
                <span>{t.aboutPage.openGoogleMaps}</span>
                <ExternalLink size={11} />
              </a>
            </div>

            <div className="relative w-full h-48 sm:h-60 bg-neutral-950 overflow-hidden">
              <iframe
                title="SPEC Home Office Location"
                src="https://maps.google.com/maps?q=25.096834,55.176888&hl=en&z=15&output=embed"
                width="100%"
                height="100%"
                style={{
                  border: 0,
                }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full opacity-90 group-hover:opacity-100 transition-opacity dark:[filter:invert(90%)_hue-rotate(180deg)_brightness(85%)_contrast(92%)_saturate(70%)] [filter:brightness(96%)_contrast(95%)_saturate(85%)]"
              />
              <div 
                aria-hidden="true" 
                className="pointer-events-none absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.3)] dark:shadow-[inset_0_0_24px_rgba(0,0,0,0.5)]" 
              />
            </div>
          </motion.div>

          {/* Closing Highlight Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="p-10 md:p-14 rounded-3xl bg-gradient-to-br from-card via-background to-card border border-accent/30 text-center shadow-xl relative overflow-hidden"
          >
            <div className="max-w-2xl mx-auto space-y-6">
              <h3 className="text-2xl sm:text-4xl font-light tracking-tight text-foreground leading-snug">
                &ldquo;{t.aboutPage.closingQuote}&rdquo;
              </h3>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href={`/${locale}/contact`}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-accent text-black font-semibold text-sm hover:bg-[#e5c158] transition-all shadow-[0_0_25px_rgba(212,175,55,0.25)]"
                >
                  <span>{t.aboutPage.ctaButton}</span>
                  {isRTL ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                </Link>

                <Link
                  href={`/${locale}/projects`}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-background border border-border text-foreground font-medium text-sm hover:border-accent hover:text-accent transition-all"
                >
                  <span>{locale === "ar" ? "استكشف المشاريع" : "Explore Master Projects"}</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
