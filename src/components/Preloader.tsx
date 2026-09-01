"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useSiteSettings } from "@/lib/context/SiteSettingsContext";

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const { logoUrl, brandName } = useSiteSettings();

  // Only show on the root landing page (e.g., /en or /ar or /)
  const isHomePage = pathname === "/en" || pathname === "/ar" || pathname === "/" || pathname === "/en/" || pathname === "/ar/";

  useEffect(() => {
    if (!isHomePage) {
      setIsLoading(false);
      return;
    }

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setIsLoading(false), 800); // Wait briefly at 100%
          return 100;
        }
        return prev + Math.floor(Math.random() * 12) + 2; // Random jumps for realistic feel
      });
    }, 80); // Sped up slightly for better UX

    return () => clearInterval(timer);
  }, [isHomePage]);

  if (!isHomePage) return null;

  const letterAnimation = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0, transition: { duration: 1 } }
  };

  const displayText = brandName || "SPEC Home Dubai";

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden pointer-events-none"
        >
          {/* Logo / Text & Counter Layer */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none px-6">
            <motion.div
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, scale: 1.08, filter: "blur(12px)", transition: { duration: 0.8, ease: "easeInOut" } }}
              className="flex flex-col items-center gap-6"
            >
              {logoUrl ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  className="relative flex items-center justify-center"
                >
                  {/* Subtle ambient luxury glow behind logo */}
                  <div className="absolute -inset-4 bg-accent/20 rounded-full blur-xl animate-pulse" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoUrl}
                    alt={brandName}
                    className="relative z-10 max-h-20 md:max-h-28 max-w-[240px] md:max-w-[320px] object-contain drop-shadow-2xl"
                  />
                </motion.div>
              ) : (
                <div className="flex overflow-hidden perspective-1000">
                  {displayText.split("").map((char, index) => (
                    <motion.h1
                      key={index}
                      variants={letterAnimation}
                      initial="hidden"
                      animate="show"
                      transition={{ delay: index * 0.04 }}
                      className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white"
                    >
                      {char === " " ? "\u00A0" : char}
                    </motion.h1>
                  ))}
                </div>
              )}

              {/* Progress percentage & Luxury Loading Bar */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="flex flex-col items-center gap-3"
              >
                <span className="text-sm md:text-base font-light tracking-[0.25em] tabular-nums text-accent">
                  {progress > 100 ? 100 : progress}%
                </span>
                <div className="w-40 md:w-52 h-[2px] bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-accent via-amber-400 to-accent"
                    style={{ width: `${progress > 100 ? 100 : progress}%` }}
                    transition={{ ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Cinematic Shutter Backgrounds */}
          <div className="absolute inset-0 z-10 flex h-full w-full">
            {[0, 1, 2, 3].map((index) => (
              <motion.div
                key={index}
                initial={{ y: "0%" }}
                exit={{ y: index % 2 === 0 ? "-100%" : "100%", transition: { duration: 1.2, delay: index * 0.1 } }}
                className="w-1/4 h-full bg-black pointer-events-auto"
              />
            ))}
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
