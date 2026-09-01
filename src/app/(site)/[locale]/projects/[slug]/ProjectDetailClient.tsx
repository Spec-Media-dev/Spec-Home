"use client";

import React, { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { MapPin, ArrowLeft, ArrowRight, Building2, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { getStorageUrl } from "@/lib/supabase/storage";
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

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

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
  const coverImage = getStorageUrl(project.cover_image_path, "media");

  return (
    <div className="bg-background min-h-screen text-foreground pb-24 transition-colors duration-300">
      {/* Hero Image Section */}
      <div className="relative h-[75vh] min-h-[550px] w-full overflow-hidden">
        <motion.div style={{ y: y1 }} className="absolute inset-0 w-full h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Cinematic Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/30 z-10" />

        {/* Back Button */}
        <div className="absolute top-24 start-6 md:top-28 md:start-12 z-20">
          <Link
            href={`/${locale}/projects`}
            className="inline-flex items-center gap-2 text-white hover:text-accent transition-all bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-sm border border-white/20 hover:border-accent/60 shadow-xl"
          >
            {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />} {t.detailPage.backToListings}
          </Link>
        </div>

        {/* Hero Content Overlay */}
        <motion.div
          style={{ opacity }}
          className="absolute bottom-0 start-0 w-full p-8 md:p-16 lg:px-24 flex flex-col justify-end z-20"
        >
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 text-white/90 mb-3">
              <MapPin size={18} className="text-accent" />
              <span className="text-sm uppercase tracking-widest font-semibold">
                {location}
              </span>
              <span className="text-white/40">•</span>
              <span className="text-sm uppercase tracking-widest text-accent font-semibold">
                {developer}
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tighter drop-shadow-md">
              {title}
            </h1>

            <div className="flex flex-wrap gap-8 items-center border-t border-white/20 pt-6 mt-4">
              <div>
                <p className="text-xs text-white/70 uppercase tracking-widest font-semibold mb-1">
                  {t.detailPage.startingPrice}
                </p>
                <p className="text-2xl md:text-3xl font-bold text-accent font-mono">
                  {formatPrice(project.starting_price, project.currency || "AED")}
                </p>
              </div>

              <div className="hidden md:block w-px h-12 bg-white/20" />

              <div>
                <p className="text-xs text-white/70 uppercase tracking-widest font-semibold mb-1">
                  {t.detailPage.handover}
                </p>
                <p className="text-2xl md:text-3xl font-light text-white font-mono">
                  {handover}
                </p>
              </div>

              <div className="hidden md:block w-px h-12 bg-white/20" />

              <div>
                <p className="text-xs text-white/70 uppercase tracking-widest font-semibold mb-1">
                  {t.detailPage.paymentPlan}
                </p>
                <p className="text-2xl md:text-3xl font-light text-white font-mono">
                  {paymentPlan}
                </p>
              </div>

              {project.total_units ? (
                <>
                  <div className="hidden md:block w-px h-12 bg-white/20" />
                  <div>
                    <p className="text-xs text-white/70 uppercase tracking-widest font-semibold mb-1">
                      {locale === "ar" ? "إجمالي الوحدات" : "Total Units"}
                    </p>
                    <p className="text-2xl md:text-3xl font-light text-white font-mono">
                      {project.total_units} {locale === "ar" ? "وحدة" : "Units"}
                    </p>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Body Section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-16 lg:mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-16">
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">{t.detailPage.overview}</h2>
              <p className="text-foreground/70 text-lg font-light leading-relaxed whitespace-pre-line">
                {description || (locale === "ar" ? "مشروع سكني فاخر في قلب دبي." : "Exclusive master planned residential development in Dubai.")}
              </p>
            </section>

            {/* Units and Properties in this Project */}
            <section>
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
                  <p>{locale === "ar" ? "المساكن والفلل الحصرية قيد الطرح قريباً." : "Residences currently in private preview. Contact our advisory for off-market allocations."}</p>
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
    </div>
  );
}
