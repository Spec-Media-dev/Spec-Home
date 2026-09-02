"use client";

import React, { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { MapPin, ArrowLeft, ArrowRight, Bed, Bath, Maximize, Check, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { getStorageUrl } from "@/lib/supabase/storage";
import { submitEnquiry } from "@/app/actions/enquiries";
import type { PropertyWithDetails } from "@/lib/supabase/types";

interface Props {
  locale: string;
  property: PropertyWithDetails;
}

export default function PropertyDetailClient({ locale, property }: Props) {
  const { t, isRTL } = useI18n();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  // Gallery state
  const images = property.images && property.images.length > 0
    ? property.images
    : [{ id: "def", image_url: property.cover_image || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=100", is_cover: true, display_order: 1, created_at: "", property_id: property.id }];

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

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

  const handleRegisterInterest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) return;

    setStatus("loading");
    setErrorMsg("");

    const res = await submitEnquiry({
      name,
      email,
      phone,
      property_id: property.id,
      project_id: property.project_id,
      message: `Inquiry for property listing: ${property.title_en} (${property.reference_code})`,
    });

    if (res.success) {
      setStatus("success");
      setName("");
      setEmail("");
      setPhone("");
    } else {
      setStatus("error");
      setErrorMsg(res.error || "Failed to submit enquiry.");
    }
  };

  const title = locale === "ar" ? property.title_ar || property.title_en : property.title_en;
  const projectTitle = locale === "ar"
    ? property.project?.name_ar || property.project?.name_en || "دبي"
    : property.project?.name_en || "Dubai";
  const location = locale === "ar"
    ? property.project?.location_ar || property.project?.location_en || property.property_type_ar
    : property.project?.location_en || property.property_type_en;
  const description = locale === "ar"
    ? property.description_ar || property.description_en || ""
    : property.description_en || "";
  const handover = locale === "ar"
    ? property.handover_ar || property.handover_en || property.project?.handover_ar || "الربع الرابع 2026"
    : property.handover_en || property.project?.handover_en || "Q4 2026";
  const paymentPlan = locale === "ar"
    ? property.payment_plan_ar || property.payment_plan_en || property.project?.payment_plan_ar || "50 / 50"
    : property.payment_plan_en || property.project?.payment_plan_en || "50 / 50";

  const activeImgUrl = getStorageUrl(images[activeImageIndex]?.image_url, "media");

  return (
    <div className="bg-background min-h-screen text-foreground pb-24 transition-colors duration-300">
      {/* Hero Image Section */}
      <div className="relative h-[60vh] sm:h-[70vh] lg:h-[75vh] min-h-[440px] sm:min-h-[520px] w-full overflow-hidden">
        <motion.div style={{ y: y1 }} className="absolute inset-0 w-full h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeImgUrl}
            alt={title}
            className="w-full h-full object-cover transition-all duration-700"
          />
        </motion.div>

        {/* Cinematic Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/30 z-10" />

        {/* Back Button */}
        <div className="absolute top-20 start-4 sm:top-28 sm:start-12 z-20 flex flex-wrap items-center gap-2 sm:gap-3">
          <Link
            href={`/${locale}/properties`}
            className="inline-flex items-center gap-2 text-white hover:text-accent transition-all bg-black/60 backdrop-blur-md px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm border border-white/20 hover:border-accent/60 shadow-xl"
          >
            {isRTL ? <ArrowRight size={14} /> : <ArrowLeft size={14} />} {t.detailPage.backToListings}
          </Link>

          {property.project && (
            <Link
              href={`/${locale}/projects/${property.project.slug}`}
              className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-all bg-black/40 backdrop-blur-md px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm border border-white/10"
            >
              <span>{locale === "ar" ? "المشروع:" : "Project:"} {projectTitle}</span>
            </Link>
          )}
        </div>

        {/* Hero Content Overlay */}
        <motion.div
          style={{ opacity }}
          className="absolute bottom-0 start-0 w-full p-4 sm:p-8 md:p-16 lg:px-24 flex flex-col justify-end z-20"
        >
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 text-white/90 mb-2 sm:mb-3">
              <MapPin size={16} className="text-accent" />
              <span className="text-xs sm:text-sm uppercase tracking-widest font-semibold">
                {location}
              </span>
              <span className="text-white/40">•</span>
              <span className="text-xs sm:text-sm font-mono text-accent">
                {property.reference_code}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-white mb-4 sm:mb-6 tracking-tighter drop-shadow-md">
              {title}
            </h1>

            <div className="flex flex-wrap gap-4 sm:gap-8 items-center border-t border-white/20 pt-4 sm:pt-6 mt-2 sm:mt-4">
              <div>
                <p className="text-[10px] sm:text-xs text-white/70 uppercase tracking-widest font-semibold mb-1">
                  {t.detailPage.startingPrice}
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-accent font-mono">
                  {formatPrice(Number(property.price), property.currency || "AED")}
                </p>
              </div>

              <div className="hidden md:block w-px h-12 bg-white/20" />

              <div>
                <p className="text-[10px] sm:text-xs text-white/70 uppercase tracking-widest font-semibold mb-1">
                  {t.detailPage.handover}
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl font-light text-white font-mono">
                  {handover}
                </p>
              </div>

              <div className="hidden md:block w-px h-12 bg-white/20" />

              <div>
                <p className="text-[10px] sm:text-xs text-white/70 uppercase tracking-widest font-semibold mb-1">
                  {t.detailPage.paymentPlan}
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl font-light text-white font-mono">
                  {paymentPlan}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Gallery Thumbnails */}
      {images.length > 1 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 mt-6">
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {images.map((img, idx) => {
              const thumbUrl = getStorageUrl(img.image_url, "property-images");
              return (
                <button
                  key={img.id}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative h-16 w-24 sm:h-20 sm:w-32 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    activeImageIndex === idx ? "border-accent scale-105 shadow-lg" : "border-border/60 opacity-60 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumbUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Body Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 mt-8 sm:mt-12 lg:mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10 sm:space-y-16">
            {/* Quick Specs Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 sm:p-6 bg-card rounded-2xl border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                  <Bed size={20} />
                </div>
                <div>
                  <span className="text-[11px] text-foreground/50 block uppercase font-medium">{locale === "ar" ? "غرف النوم" : "Bedrooms"}</span>
                  <span className="text-lg font-bold text-foreground">{property.bedrooms} {locale === "ar" ? "غرف" : "Beds"}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                  <Bath size={20} />
                </div>
                <div>
                  <span className="text-[11px] text-foreground/50 block uppercase font-medium">{locale === "ar" ? "الحمامات" : "Bathrooms"}</span>
                  <span className="text-lg font-bold text-foreground">{property.bathrooms} {locale === "ar" ? "حمامات" : "Baths"}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                  <Maximize size={20} />
                </div>
                <div>
                  <span className="text-[11px] text-foreground/50 block uppercase font-medium">{locale === "ar" ? "المساحة الإجمالية" : "Total Area"}</span>
                  <span className="text-lg font-bold text-foreground font-mono">{Number(property.area_sqft || property.size_sqft || 0).toLocaleString()} sqft</span>
                </div>
              </div>
            </div>

            {/* Overview */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">{t.detailPage.overview}</h2>
              <p className="text-foreground/70 text-lg font-light leading-relaxed whitespace-pre-line">
                {description || (locale === "ar" ? "عقار سكني فاخر بتصميم استثنائي وتشطيبات عالية الجودة في دبي." : "Bespoke luxury residence offering expansive living spaces, private terraces, and panoramic Dubai views.")}
              </p>
            </section>

            {/* Dynamic Specifications & Highlights from DB */}
            {property.specs && property.specs.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6 text-foreground">{t.detailPage.amenities}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {property.specs.map((spec) => {
                    const label = locale === "ar" ? spec.label_ar || spec.key_ar || spec.label_en || spec.key_en || "Spec" : spec.label_en || spec.key_en || "Spec";
                    const value = locale === "ar" ? spec.value_ar || spec.value_en || "-" : spec.value_en || "-";
                    return (
                      <div key={spec.id} className="p-4 bg-card rounded-2xl border border-border shadow-sm">
                        <span className="text-[11px] text-foreground/50 uppercase tracking-wider block font-semibold mb-1">
                          {label}
                        </span>
                        <span className="text-sm text-foreground font-bold font-mono text-accent">
                          {value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 p-8 bg-card border border-border rounded-3xl shadow-2xl">
              <h3 className="text-xl font-bold mb-2 text-foreground">{t.detailPage.registerInterest}</h3>
              <p className="text-xs text-foreground/60 mb-6">
                {locale === "ar" ? "سجل اهتمامك للحصول على ملف الوحدة وجدول المعاينة الحصري." : "Schedule a private viewing or request the comprehensive brochure."}
              </p>

              {status === "success" ? (
                <div className="py-8 text-center space-y-3 animate-fade-in">
                  <div className="w-12 h-12 rounded-full bg-accent/20 text-accent flex items-center justify-center mx-auto">
                    <Check size={24} />
                  </div>
                  <h4 className="font-bold text-foreground text-lg">{locale === "ar" ? "تم تسجيل اهتمامك بنجاح" : "Inquiry Received"}</h4>
                  <p className="text-xs text-foreground/60">{locale === "ar" ? "سيتواصل معك مستشارنا العقاري خلال وقت وجيز." : "Our senior portfolio advisor will contact you promptly."}</p>
                  <button
                    onClick={() => setStatus("idle")}
                    className="text-xs text-accent hover:underline font-semibold mt-2"
                  >
                    {locale === "ar" ? "إرسال طلب آخر" : "Submit another request"}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegisterInterest} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-foreground/70 mb-1">{t.detailPage.fullName} *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alexander Wright"
                      className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-accent shadow-sm transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground/70 mb-1">{t.detailPage.emailAddress} *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alexander@domain.com"
                      className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-accent shadow-sm transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground/70 mb-1">{t.detailPage.phoneNumber} *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+971 50 000 0000"
                      className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-accent shadow-sm transition-colors"
                    />
                  </div>

                  {status === "error" && (
                    <p className="text-xs text-red-500 text-center">{errorMsg}</p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full bg-foreground text-background font-semibold py-4 rounded-xl mt-4 hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {status === "loading" ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <span>{t.detailPage.submitEnquiry}</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
