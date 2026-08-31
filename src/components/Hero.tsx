"use client";

import { useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring, Variants } from "framer-motion";
import { MousePointerClick } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function Hero() {
  const { locale, t } = useI18n();

  // Parallax & Scale Scroll
  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, [0, 800], [1, 0.85]);
  const borderRadius = useTransform(scrollY, [0, 800], ["0rem", "4rem"]);
  const y = useTransform(scrollY, [0, 1000], [0, 200]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  // Mouse Parallax for background
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const backgroundX = useTransform(smoothMouseX, [-1, 1], ["-2%", "2%"]);
  const backgroundY = useTransform(smoothMouseY, [-1, 1], ["-2%", "2%"]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth) * 2 - 1;
      const y = (e.clientY / innerHeight) * 2 - 1;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Text Animation Variants
  const textContainer: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.5,
      }
    }
  };

  const textItem: Variants = {
    hidden: { opacity: 0, y: 100, rotateX: -90 },
    show: { 
      opacity: 1, 
      y: 0, 
      rotateX: 0,
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  const actionsAnimation: Variants = {
    hidden: { opacity: 0, y: 50 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 1, delay: 1.2, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.1 } 
    }
  };

  const actionItem: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <section 
      ref={containerRef}
      className="relative w-full h-[100svh] min-h-[800px] flex flex-col justify-center overflow-hidden bg-background"
    >
      {/* Scroll-scaling wrapper */}
      <motion.div 
        style={{ scale, borderRadius, y }}
        className="absolute inset-0 w-full h-full overflow-hidden origin-top z-0"
      >
        {/* Background Image with Mouse Parallax */}
        <motion.div 
          style={{ x: backgroundX, y: backgroundY }}
          className="absolute inset-[-5%] w-[110%] h-[110%] z-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2000&auto=format&fit=crop"
            alt="Dubai Skyline"
            className="w-full h-full object-cover scale-[1.05]"
          />
          {/* Cool, comfortable overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80 mix-blend-multiply" />
          <div className="absolute inset-0 bg-background/30" />
        </motion.div>
      </motion.div>

      {/* Main Content */}
      <motion.div 
        style={{ opacity }}
        className="relative z-10 container mx-auto px-6 max-w-7xl flex flex-col items-center text-center"
      >
        <motion.div 
          variants={textContainer}
          initial="hidden"
          animate="show"
          className="perspective-1000 mb-12"
        >
          <div className="overflow-hidden pb-4">
            <motion.h1 
              variants={textItem}
              className="text-6xl md:text-8xl lg:text-[7rem] font-bold text-white tracking-tighter leading-[0.9]"
            >
              {t.hero.titleLine1}
            </motion.h1>
          </div>
          <div className="overflow-hidden pb-4">
            <motion.h1 
              variants={textItem}
              className="text-6xl md:text-8xl lg:text-[7rem] font-bold text-white tracking-tighter leading-[0.9]"
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
          className="flex justify-center mt-12"
        >
          <motion.div variants={actionItem}>
            <Link 
              href={`/${locale}/properties`}
              className="group relative h-16 w-16 hover:w-64 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:border-accent/50 hover:bg-white/10 transition-all duration-500 overflow-hidden flex items-center justify-center gap-4 cursor-pointer shadow-2xl"
            >
              <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/10 transition-colors duration-500" />
              
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
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1 }}
        style={{ opacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 mix-blend-difference"
      >
        <span className="text-[10px] uppercase tracking-[0.2em] font-semibold">{t.hero.scrollDiscover}</span>
        <motion.div 
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <MousePointerClick className="w-4 h-4" />
        </motion.div>
      </motion.div>
    </section>
  );
}
