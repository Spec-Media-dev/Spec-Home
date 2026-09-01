"use client";

import React, { useRef, useEffect, memo } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring, Variants } from "framer-motion";
import { MousePointerClick } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useSiteSettings } from "@/lib/context/SiteSettingsContext";

const SPRING_MOUSE = { damping: 30, stiffness: 120, mass: 0.2 };

// Text Animation Variants (pure GPU opacity + transform)
const textContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.3,
    }
  }
};

const textItem: Variants = {
  hidden: { opacity: 0, y: 60 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } 
  }
};

const actionsAnimation: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] } 
  }
};

function HeroComponent() {
  const { locale, t } = useI18n();
  const { heroImageUrl } = useSiteSettings();

  // Parallax & Scale Scroll — GPU composite only
  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, [0, 800], [1, 0.92]);
  const y = useTransform(scrollY, [0, 1000], [0, 150]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  // Mouse Parallax for background (compositor-only updates)
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothMouseX = useSpring(mouseX, SPRING_MOUSE);
  const smoothMouseY = useSpring(mouseY, SPRING_MOUSE);

  const backgroundX = useTransform(smoothMouseX, [-1, 1], ["-1.5%", "1.5%"]);
  const backgroundY = useTransform(smoothMouseY, [-1, 1], ["-1.5%", "1.5%"]);

  useEffect(() => {
    let ticking = false;
    const handleMouseMove = (e: MouseEvent) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const { innerWidth, innerHeight } = window;
          const x = (e.clientX / innerWidth) * 2 - 1;
          const y = (e.clientY / innerHeight) * 2 - 1;
          mouseX.set(x);
          mouseY.set(y);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <section 
      ref={containerRef}
      className="relative w-full h-[100svh] min-h-[750px] flex flex-col justify-center overflow-hidden bg-background gpu-layer"
    >
      {/* Scroll-scaling wrapper - GPU accelerated scale + translateY */}
      <motion.div 
        style={{ scale, y, willChange: "transform" }}
        className="absolute inset-0 w-full h-full overflow-hidden origin-top z-0"
      >
        {/* Background Image with Mouse Parallax */}
        <motion.div 
          style={{ x: backgroundX, y: backgroundY, willChange: "transform" }}
          className="absolute inset-[-4%] w-[108%] h-[108%] z-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImageUrl || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2000&auto=format&fit=crop"}
            alt="Dubai Skyline"
            className="w-full h-full object-cover scale-[1.03]"
            loading="eager"
            decoding="async"
          />
          {/* Contrast overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-black/85 mix-blend-multiply" />
          <div className="absolute inset-0 bg-background/25" />
        </motion.div>
      </motion.div>

      {/* Main Content */}
      <motion.div 
        style={{ opacity, willChange: "opacity" }}
        className="relative z-10 container mx-auto px-6 max-w-7xl flex flex-col items-center text-center"
      >
        <motion.div 
          variants={textContainer}
          initial="hidden"
          animate="show"
          className="mb-10"
        >
          <div className="overflow-hidden pb-3">
            <motion.h1 
              variants={textItem}
              className="text-6xl md:text-8xl lg:text-[7rem] font-bold text-white tracking-tighter leading-[0.92]"
            >
              {t.hero.titleLine1}
            </motion.h1>
          </div>
          <div className="overflow-hidden pb-3">
            <motion.h1 
              variants={textItem}
              className="text-6xl md:text-8xl lg:text-[7rem] font-bold text-white tracking-tighter leading-[0.92]"
            >
              {t.hero.titleLine2}
            </motion.h1>
          </div>
        </motion.div>

        {/* Elegant Minimal Search Pill */}
        <motion.div 
          variants={actionsAnimation}
          initial="hidden"
          animate="show"
          className="flex justify-center mt-8"
        >
          <Link 
            href={`/${locale}/properties`}
            className="group relative h-16 w-16 hover:w-64 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 hover:border-accent/60 hover:bg-white/15 transition-all duration-500 overflow-hidden flex items-center justify-center gap-4 cursor-pointer shadow-2xl gpu-layer"
          >
            <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/15 transition-colors duration-500" />
            
            {/* Icon */}
            <div className="relative z-10 flex items-center justify-center min-w-[64px]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white group-hover:text-accent transition-colors duration-500">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>

            {/* Expanding Text */}
            <span className="relative z-10 text-white font-medium tracking-widest uppercase text-sm opacity-0 group-hover:opacity-100 whitespace-nowrap -ml-4 pr-6 transition-opacity duration-500">
              {t.hero.searchPill}
            </span>
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.8 }}
        style={{ opacity, willChange: "opacity" }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50"
      >
        <span className="text-[10px] uppercase tracking-[0.2em] font-semibold">{t.hero.scrollDiscover}</span>
        <motion.div 
          animate={{ y: [0, 4, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
        >
          <MousePointerClick className="w-4 h-4" />
        </motion.div>
      </motion.div>
    </section>
  );
}

export default memo(HeroComponent);
