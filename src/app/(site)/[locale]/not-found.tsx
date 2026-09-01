"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Home, Building2, Layers, Search } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function LocalizedNotFound() {
  const { locale, isRTL } = useI18n();
  const isAr = locale === "ar";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6 relative overflow-hidden pt-20 pb-16 selection:bg-accent selection:text-black">
      {/* Ambient Luxury Lighting Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-accent/[0.05] rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-foreground/[0.02] rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      <div className="text-center max-w-3xl mx-auto relative z-10">
        {/* Subtle Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card border border-border mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-xs font-mono tracking-widest text-accent uppercase font-semibold">
            {isAr ? "خطأ 404 • الصفحة غير موجودة" : "ERROR 404 • RESIDENCE NOT FOUND"}
          </span>
        </div>

        {/* Big 404 Headline */}
        <h1 className="text-[120px] sm:text-[180px] md:text-[220px] font-extrabold tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-foreground/20 via-foreground/5 to-transparent select-none">
          404
        </h1>

        <div className="relative -mt-16 sm:-mt-24 md:-mt-32 space-y-6">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-light tracking-tight text-foreground">
            {isAr ? (
              <>
                عفواً، هذه الصفحة <span className="font-bold text-accent">غير متاحة</span>
              </>
            ) : (
              <>
                Page & Property <span className="font-bold text-accent">Not Found</span>
              </>
            )}
          </h2>

          <p className="text-foreground/60 text-base sm:text-lg md:text-xl max-w-xl mx-auto leading-relaxed font-light">
            {isAr
              ? "العنوان الذي طلبته غير موجود أو تم نقله. يمكنك العودة إلى الصفحة الرئيسية أو استكشاف مشاريعنا وعقاراتنا الحصرية."
              : "The luxury residence, master development, or private page you requested cannot be located. Let us guide you back to our curated Dubai collection."}
          </p>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
            <Link
              href={`/${locale}`}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-accent text-black font-semibold text-sm hover:bg-[#e5c158] transition-all duration-300 shadow-[0_0_25px_rgba(212,175,55,0.2)] hover:scale-105"
            >
              <Home size={17} />
              <span>{isAr ? "الرئيسية" : "Return to Homepage"}</span>
              {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
            </Link>

            <Link
              href={`/${locale}/properties`}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-card border border-border text-foreground font-medium text-sm hover:border-accent hover:text-accent transition-all duration-300 shadow-sm"
            >
              <Building2 size={17} className="text-accent" />
              <span>{isAr ? "استكشاف العقارات" : "Browse Residences"}</span>
            </Link>

            <Link
              href={`/${locale}/projects`}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-card border border-border text-foreground font-medium text-sm hover:border-accent hover:text-accent transition-all duration-300 shadow-sm"
            >
              <Layers size={17} className="text-accent" />
              <span>{isAr ? "المشاريع الرئيسية" : "Master Projects"}</span>
            </Link>

            <Link
              href={`/${locale}/search`}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-card border border-border text-foreground font-medium text-sm hover:border-accent hover:text-accent transition-all duration-300 shadow-sm"
            >
              <Search size={17} className="text-accent" />
              <span>{isAr ? "بحث متقدم" : "Search Properties"}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
