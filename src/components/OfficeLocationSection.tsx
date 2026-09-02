"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import { MapPin, ExternalLink, MessageCircle, Navigation } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useSiteSettings } from "@/lib/context/SiteSettingsContext";

const MAP_EMBED_URL =
  "https://maps.google.com/maps?q=25.096834,55.176888&hl=en&z=15&output=embed";
const GOOGLE_MAPS_LINK = "https://maps.app.goo.gl/7mh3nYbk4BSytV167?g_st=ic";

function OfficeLocationSectionComponent() {
  const { locale, t } = useI18n();
  const { officeAddress, whatsappNumber, brandName } = useSiteSettings();
  const isAr = locale === "ar";

  const defaultAddress = isAr
    ? "الطابق 42، أبراج الإمارات، شارع الشيخ زايد، دبي، الإمارات العربية المتحدة"
    : "Level 42, Emirates Towers, Sheikh Zayed Road, Dubai, UAE";

  const displayAddress = officeAddress || defaultAddress;

  return (
    <section 
      id="office-location" 
      className="py-16 md:py-20 bg-background relative overflow-hidden transition-colors duration-300"
    >
      {/* Soft eye-comfort ambient glow in background */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[320px] rounded-full pointer-events-none opacity-15 dark:opacity-10 -z-10 blur-3xl"
        style={{
          background: "radial-gradient(circle, var(--color-accent) 0%, transparent 70%)",
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-border bg-card/60 backdrop-blur-sm text-xs font-mono text-accent uppercase tracking-widest mb-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            <span>{isAr ? "المقر الرئيسي في دبي" : "Dubai Headquarters"}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            {t.aboutPage.locationTitle} <span className="text-accent">.</span>
          </h2>
          <p className="text-foreground/60 text-sm sm:text-base max-w-xl mx-auto mt-2 font-light">
            {t.aboutPage.locationSubtitle}
          </p>
        </motion.div>

        {/* Small, Eye-Comfort Map Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="rounded-3xl bg-card/80 dark:bg-card/50 backdrop-blur-xl border border-border/80 hover:border-accent/40 shadow-xl overflow-hidden transition-all duration-300 group"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* Office Info Side */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-e border-border/60 bg-gradient-to-br from-background/40 via-card/20 to-card/50">
              <div className="space-y-5">
                {/* Brand & Status */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground leading-snug">
                        {brandName || "SPEC Home Dubai"}
                      </h3>
                      <span className="text-foreground/50 text-xs">
                        {isAr ? "دبي، الإمارات العربية المتحدة" : "Dubai, United Arab Emirates"}
                      </span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {isAr ? "متاح للزيارة" : "Open for Visits"}
                  </span>
                </div>

                {/* Address Line */}
                <div className="p-3.5 rounded-2xl bg-background/80 border border-border/60 text-xs text-foreground/80 leading-relaxed font-light flex items-start gap-2.5">
                  <Navigation size={14} className="text-accent shrink-0 mt-0.5" />
                  <span>{displayAddress}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 mt-6 border-t border-border/40 flex flex-wrap items-center gap-2.5">
                <a
                  href={GOOGLE_MAPS_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-accent text-black font-semibold text-xs hover:bg-[#e5c158] transition-all shadow-sm hover:shadow-md cursor-pointer"
                >
                  <MapPin size={13} />
                  <span>{t.aboutPage.openGoogleMaps}</span>
                  <ExternalLink size={12} />
                </a>

                {whatsappNumber && (
                  <a
                    href={`https://wa.me/${whatsappNumber.replace(/[^\d]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-full bg-background border border-border hover:border-accent text-foreground/80 hover:text-accent transition-all text-xs font-medium cursor-pointer"
                    aria-label="WhatsApp Concierge"
                  >
                    <MessageCircle size={14} className="text-emerald-500" />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>
            </div>

            {/* Comfort Eye-Friendly Map Side */}
            <div className="lg:col-span-7 relative min-h-[240px] sm:min-h-[280px] lg:min-h-[310px] bg-neutral-950 overflow-hidden">
              {/* Eye-comfort gentle filter:
                  Dark mode: muted charcoal luxury tone without harsh white glare
                  Light mode: soft contrast, warm brightness without blinding white saturation
              */}
              <iframe
                title="SPEC Home Office Location"
                src={MAP_EMBED_URL}
                width="100%"
                height="100%"
                style={{
                  border: 0,
                }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full min-h-[240px] sm:min-h-[280px] lg:min-h-[310px] transition-all duration-500 opacity-90 group-hover:opacity-100 dark:[filter:invert(90%)_hue-rotate(180deg)_brightness(85%)_contrast(92%)_saturate(70%)] [filter:brightness(96%)_contrast(95%)_saturate(85%)]"
              />

              {/* Edge Gradient Blends for visual comfort */}
              <div 
                aria-hidden="true" 
                className="pointer-events-none absolute inset-0 shadow-[inset_0_0_24px_rgba(0,0,0,0.35)] dark:shadow-[inset_0_0_28px_rgba(0,0,0,0.6)]" 
              />

              {/* Floating Quick Navigation Chip */}
              <div className="absolute bottom-3 end-3 z-10 pointer-events-auto">
                <a
                  href={GOOGLE_MAPS_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/90 dark:bg-black/85 backdrop-blur-md border border-border text-foreground text-[11px] font-medium hover:border-accent hover:text-accent transition-all shadow-lg"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span>Google Maps</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default memo(OfficeLocationSectionComponent);
