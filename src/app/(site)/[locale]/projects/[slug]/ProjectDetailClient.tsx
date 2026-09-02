"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  MapPin,
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { getStorageUrl, getStorageUrls } from "@/lib/supabase/storage";
import { submitEnquiry } from "@/app/actions/enquiries";
import PropertyCard from "@/components/PropertyCard";
import type { ProjectRow, PropertyRow } from "@/lib/supabase/types";

interface Props {
  locale: string;
  project: ProjectRow;
  properties: PropertyRow[];
}

export default function ProjectDetailClient({ locale, project, properties }: Props) {
  const { t, isRTL } = useI18n();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  // Extract all available project images (supports multi-image comma-separated or json arrays)
  const projectImages = React.useMemo(() => {
    const list: string[] = [];
    if (project.cover_image_path) {
      list.push(...getStorageUrls(project.cover_image_path, "media"));
    }
    if (project.og_image_path) {
      const ogUrls = getStorageUrls(project.og_image_path, "media");
      for (const u of ogUrls) {
        if (!list.includes(u)) list.push(u);
      }
    }
    if (list.length === 0) {
      list.push(
        "https://images.unsplash.com/photo-1546412414-e1885259563a?q=80&w=1200&auto=format&fit=crop"
      );
    }
    return list;
  }, [project.cover_image_path, project.og_image_path]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleNextImage = useCallback(() => {
    setActiveImageIndex((prev) => (prev + 1) % projectImages.length);
  }, [projectImages.length]);

  const handlePrevImage = useCallback(() => {
    setActiveImageIndex((prev) => (prev - 1 + projectImages.length) % projectImages.length);
  }, [projectImages.length]);

  const openLightbox = (idx: number) => {
    setLightboxIndex(idx);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") {
        setLightboxIndex((prev) => (prev + 1) % projectImages.length);
      }
      if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) => (prev - 1 + projectImages.length) % projectImages.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, projectImages.length]);

  const formatPrice = (price: number | null | undefined, currency: string = "AED") => {
    if (!price || price === 0) {
      return locale === "ar" ? "الأسعار عند الطلب" : "Price on Request";
    }
    if (price >= 1000000) {
      return locale === "ar"
        ? `ابتداءً من ${(price / 1000000).toFixed(1)} مليون ${currency === "AED" ? "درهم" : currency}`
        : `From ${currency} ${(price / 1000000).toFixed(1)}M`;
    }
    return locale === "ar"
      ? `ابتداءً من ${price.toLocaleString()} ${currency === "AED" ? "درهم" : currency}`
      : `From ${currency} ${price.toLocaleString()}`;
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
      project_id: project.id,
      message: `Inquiry registered for master project: ${project.name_en}`,
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

  const title = locale === "ar" ? project.name_ar || project.name_en : project.name_en;
  const location = locale === "ar" ? project.location_ar || project.location_en || "دبي" : project.location_en || "Dubai";
  const developer = locale === "ar" ? project.developer_ar || project.developer_en || "سبيك للتطوير العقاري" : project.developer_en || "SPEC Signature Developments";
  const description = locale === "ar" ? project.description_ar || project.description_en || "" : project.description_en || "";
  const handover = locale === "ar" ? project.handover_ar || project.handover_en || "الربع الرابع 2027" : project.handover_en || "Q4 2027";
  const paymentPlan = locale === "ar" ? project.payment_plan_ar || project.payment_plan_en || "60 / 40" : project.payment_plan_en || "60 / 40";

  return (
    <div className="bg-background min-h-screen text-foreground pb-24 transition-colors duration-300">
      {/* Hero Image Section */}
      <div className="relative h-[65vh] sm:h-[75vh] min-h-[460px] sm:min-h-[580px] w-full overflow-hidden bg-black">
        <motion.div style={{ y: y1 }} className="absolute inset-0 w-full h-full">
          <AnimatePresence mode="wait">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img
              key={activeImageIndex}
              src={projectImages[activeImageIndex]}
              alt={`${title} - View ${activeImageIndex + 1}`}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-full h-full object-cover"
            />
          </AnimatePresence>
        </motion.div>

        {/* Cinematic Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/30 z-10 pointer-events-none" />

        {/* Top Controls: Back Button & Image Counter */}
        <div className="absolute top-20 start-4 sm:top-28 sm:start-12 z-20">
          <Link
            href={`/${locale}/projects`}
            className="inline-flex items-center gap-2 text-white hover:text-accent transition-all bg-black/60 backdrop-blur-md px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm border border-white/20 hover:border-accent/60 shadow-xl"
          >
            {isRTL ? <ArrowRight size={14} /> : <ArrowLeft size={14} />} {t.detailPage.backToListings}
          </Link>
        </div>

        {projectImages.length > 1 && (
          <div className="absolute top-20 end-4 sm:top-28 sm:end-12 z-20 flex items-center gap-2">
            <div className="px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] sm:text-xs font-mono flex items-center gap-1.5 sm:gap-2 shadow-lg">
              <ImageIcon size={13} className="text-accent" />
              <span>{activeImageIndex + 1} / {projectImages.length}</span>
            </div>
            <button
              onClick={() => openLightbox(activeImageIndex)}
              className="p-1.5 sm:p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:text-accent transition-colors shadow-lg"
              title="Fullscreen Gallery"
              aria-label="Fullscreen Gallery"
            >
              <Maximize2 size={15} />
            </button>
          </div>
        )}

        {/* Hero Carousel Navigation Arrows */}
        {projectImages.length > 1 && (
          <div className="absolute top-1/2 -translate-y-1/2 w-full px-2 sm:px-4 md:px-8 flex justify-between z-20 pointer-events-none">
            <button
              onClick={handlePrevImage}
              className="pointer-events-auto p-2.5 sm:p-3 rounded-full bg-black/50 text-white hover:bg-accent hover:text-black transition-all backdrop-blur-md border border-white/20 shadow-2xl hover:scale-110 active:scale-95"
              aria-label="Previous view"
            >
              {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
            <button
              onClick={handleNextImage}
              className="pointer-events-auto p-2.5 sm:p-3 rounded-full bg-black/50 text-white hover:bg-accent hover:text-black transition-all backdrop-blur-md border border-white/20 shadow-2xl hover:scale-110 active:scale-95"
              aria-label="Next view"
            >
              {isRTL ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
          </div>
        )}

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
              <span className="text-xs sm:text-sm uppercase tracking-widest text-accent font-semibold">
                {developer}
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
                  {formatPrice(project.starting_price, project.currency || "AED")}
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

              {project.total_units ? (
                <>
                  <div className="hidden md:block w-px h-12 bg-white/20" />
                  <div>
                    <p className="text-[10px] sm:text-xs text-white/70 uppercase tracking-widest font-semibold mb-1">
                      {locale === "ar" ? "إجمالي الوحدات" : "Total Units"}
                    </p>
                    <p className="text-xl sm:text-2xl md:text-3xl font-light text-white font-mono">
                      {project.total_units} {locale === "ar" ? "وحدة" : "Units"}
                    </p>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Gallery Thumbnails Strip */}
      {projectImages.length > 1 && (
        <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-6">
          <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 scrollbar-none">
            {projectImages.map((imgUrl, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative h-20 w-32 rounded-2xl overflow-hidden shrink-0 border-2 transition-all shadow-md ${
                  activeImageIndex === idx
                    ? "border-accent ring-2 ring-accent/30 scale-105"
                    : "border-border/60 opacity-60 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imgUrl}
                  alt={`View ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Main Body Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 mt-8 sm:mt-12 lg:mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10 sm:space-y-16">
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">{t.detailPage.overview}</h2>
              <p className="text-foreground/70 text-lg font-light leading-relaxed whitespace-pre-line">
                {description ||
                  (locale === "ar"
                    ? "مشروع سكني فاخر في قلب دبي يجمع بين التصميم المعماري المبتكر والموقع الاستراتيجي."
                    : "Exclusive master planned residential development in Dubai offering iconic architecture and prime connectivity.")}
              </p>
            </section>

            {/* Architectural Gallery Showcase */}
            {projectImages.length > 1 && (
              <section className="border-t border-border pt-12">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                      <Sparkles size={22} className="text-accent" />
                      <span>
                        {locale === "ar"
                          ? "معرض الصور والتصاميم المعمارية"
                          : "Architectural Gallery & Visuals"}
                      </span>
                    </h2>
                    <p className="text-foreground/60 text-sm mt-1">
                      {locale === "ar"
                        ? "اضغط على أي صورة لتكبير العرض بجودة عالية"
                        : "Click on any image for high-resolution fullscreen preview"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {projectImages.map((imgUrl, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                      onClick={() => openLightbox(idx)}
                      className="group relative aspect-[16/10] rounded-2xl overflow-hidden bg-card border border-border cursor-pointer shadow-md"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgUrl}
                        alt={`${title} visual ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                        <span className="text-white text-xs font-mono uppercase tracking-wider">
                          {title} • {idx + 1}
                        </span>
                        <div className="p-2 rounded-full bg-accent text-black shadow-lg">
                          <Maximize2 size={14} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Units and Properties in this Project */}
            <section className="border-t border-border pt-12">
              <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-3">
                <Building2 className="text-accent" size={24} />
                <span>{locale === "ar" ? "الوحدات والمساكن المتاحة" : "Available Residences & Units"}</span>
              </h2>

              {properties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {properties.map((prop) => (
                    <PropertyCard
                      key={prop.id}
                      title={locale === "ar" ? prop.title_ar || prop.title_en : prop.title_en}
                      location={locale === "ar" ? prop.property_type_ar || prop.property_type_en : prop.property_type_en}
                      price={formatPrice(Number(prop.price), prop.currency || "AED")}
                      plan={locale === "ar" ? prop.payment_plan_ar || prop.payment_plan_en || "50 / 50" : prop.payment_plan_en || "50 / 50"}
                      image={getStorageUrl(prop.og_image_path, "property-images")}
                      href={`/${locale}/properties/${prop.slug}`}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-card border border-border text-foreground/50 text-center">
                  <p>
                    {locale === "ar"
                      ? "المساكن والفلل الحصرية قيد الطرح الخاص. تواصل مع مستشارنا لحجز الوحدات الحصرية."
                      : "Residences currently in private preview. Contact our advisory for off-market allocations."}
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Sticky Registration Form Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 p-8 bg-card border border-border rounded-3xl shadow-2xl">
              <h3 className="text-xl font-bold mb-2 text-foreground">{t.detailPage.registerInterest}</h3>
              <p className="text-xs text-foreground/60 mb-6">
                {locale === "ar" ? "احصل على الكتيب التعريفي وخطة السداد الخاصة بالمشروع." : "Receive full floor plans, pricing sheets, and private viewing schedules."}
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

      {/* Fullscreen Interactive Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 md:p-8"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between text-white z-10">
              <div className="flex items-center gap-3">
                <span className="font-medium text-sm text-white/90">{title}</span>
                <span className="text-xs font-mono text-accent px-2.5 py-1 rounded-full bg-white/10">
                  {lightboxIndex + 1} / {projectImages.length}
                </span>
              </div>
              <button
                onClick={closeLightbox}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Close fullscreen"
              >
                <X size={20} />
              </button>
            </div>

            {/* Main Lightbox Image View with Transition */}
            <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
              <AnimatePresence mode="wait">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <motion.img
                  key={lightboxIndex}
                  src={projectImages[lightboxIndex]}
                  alt={`${title} view ${lightboxIndex + 1}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl"
                />
              </AnimatePresence>

              {/* Prev / Next Controls in Lightbox */}
              {projectImages.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setLightboxIndex((prev) => (prev - 1 + projectImages.length) % projectImages.length)
                    }
                    className="absolute start-2 md:start-6 p-3.5 rounded-full bg-black/60 text-white hover:bg-accent hover:text-black transition-all backdrop-blur-md border border-white/20"
                    aria-label="Previous view"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={() =>
                      setLightboxIndex((prev) => (prev + 1) % projectImages.length)
                    }
                    className="absolute end-2 md:end-6 p-3.5 rounded-full bg-black/60 text-white hover:bg-accent hover:text-black transition-all backdrop-blur-md border border-white/20"
                    aria-label="Next view"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Thumbnails in Lightbox */}
            {projectImages.length > 1 && (
              <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 z-10">
                {projectImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setLightboxIndex(idx)}
                    className={`relative h-14 w-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      lightboxIndex === idx ? "border-accent scale-105" : "border-transparent opacity-50 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgUrl} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
