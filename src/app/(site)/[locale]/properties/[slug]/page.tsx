"use client";
import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MapPin, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';

export default function DetailPage() {
  const { locale, t, isRTL } = useI18n();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  const amenities = locale === "ar"
    ? ['مسبح إنفينيتي', 'نادي صحي ورياضي متطور', 'سبا وعناية متكاملة', 'سينما خاصة', 'خدمة كونسيرج 24/7', 'خدمة صف السيارات']
    : ['Infinity Pool', 'State-of-the-art Gym', 'Spa & Wellness', 'Private Cinema', 'Concierge Service', 'Valet Parking'];

  return (
    <div className="bg-background min-h-screen text-foreground pb-24 transition-colors duration-300">
      {/* Hero Image Section */}
      <div className="relative h-[75vh] min-h-[550px] w-full overflow-hidden">
        <motion.div 
          style={{ y: y1 }}
          className="absolute inset-0 w-full h-full"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=100" 
            alt="Property" 
            className="w-full h-full object-cover"
          />
        </motion.div>
        
        {/* Dark Cinematic Gradient Overlay - Guarantees pristine contrast in both light & dark mode */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/30 z-10" />
        
        {/* Back Button - Positioned safely below the fixed header */}
        <div className="absolute top-24 start-6 md:top-28 md:start-12 z-20">
          <Link 
            href={`/${locale}/properties`} 
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
            <div className="flex items-center gap-2 text-white/90 mb-4">
              <MapPin size={18} className="text-accent" />
              <span className="text-sm uppercase tracking-widest font-semibold">
                {locale === 'ar' ? 'دبي مارينا' : 'Dubai Marina'}
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tighter drop-shadow-md">
              {locale === 'ar' ? 'ذا سافاير' : 'The Sapphire'}
            </h1>
            
            <div className="flex flex-wrap gap-8 items-center border-t border-white/20 pt-6 mt-4">
              <div>
                <p className="text-xs text-white/70 uppercase tracking-widest font-semibold mb-1">
                  {t.detailPage.startingPrice}
                </p>
                <p className="text-2xl md:text-3xl font-bold text-accent">
                  {locale === 'ar' ? '4,500,000 درهم' : 'AED 4,500,000'}
                </p>
              </div>
              
              <div className="hidden md:block w-px h-12 bg-white/20" />
              
              <div>
                <p className="text-xs text-white/70 uppercase tracking-widest font-semibold mb-1">
                  {t.detailPage.handover}
                </p>
                <p className="text-2xl md:text-3xl font-light text-white">
                  {locale === 'ar' ? 'الربع الرابع 2026' : 'Q4 2026'}
                </p>
              </div>
              
              <div className="hidden md:block w-px h-12 bg-white/20" />
              
              <div>
                <p className="text-xs text-white/70 uppercase tracking-widest font-semibold mb-1">
                  {t.detailPage.paymentPlan}
                </p>
                <p className="text-2xl md:text-3xl font-light text-white">
                  50 / 50
                </p>
              </div>
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
              <p className="text-foreground/70 text-lg font-light leading-relaxed">
                {locale === 'ar'
                  ? 'عش تجربة فخامة لا مثيل لها في ذا سافاير. تقدم هذه التحفة المعمارية إطلالات بانورامية خلابة على أفق دبي مارينا والخليج العربي. صُممت كل وحدة بعناية فائقة للتفاصيل مع تشطيبات متميزة ونوافذ ممتدة من الأرض حتى السقف وتراسات خارجية رحبة.'
                  : 'Experience unparalleled luxury at The Sapphire. This architectural masterpiece offers breathtaking panoramic views of the Dubai Marina skyline and the Arabian Gulf. Designed with meticulous attention to detail, every residence features premium finishes, expansive floor-to-ceiling windows, and spacious outdoor terraces.'
                }
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">{t.detailPage.amenities}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {amenities.map((amenity, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border shadow-sm">
                    <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                    <span className="text-sm text-foreground/80 font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 p-8 bg-card border border-border rounded-3xl shadow-2xl">
              <h3 className="text-xl font-bold mb-6 text-foreground">{t.detailPage.registerInterest}</h3>
              <form className="space-y-4">
                <input 
                  type="text" 
                  placeholder={t.detailPage.fullName} 
                  className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-accent shadow-sm transition-colors" 
                />
                <input 
                  type="email" 
                  placeholder={t.detailPage.emailAddress} 
                  className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-accent shadow-sm transition-colors" 
                />
                <input 
                  type="tel" 
                  placeholder={t.detailPage.phoneNumber} 
                  className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-accent shadow-sm transition-colors" 
                />
                <button 
                  type="submit" 
                  className="w-full bg-foreground text-background font-semibold py-4 rounded-xl mt-4 hover:opacity-90 transition-all shadow-lg"
                >
                  {t.detailPage.submitEnquiry}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
