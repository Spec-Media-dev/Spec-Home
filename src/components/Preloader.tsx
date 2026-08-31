"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  // Only show on the root landing page (e.g., /en or /ar)
  const isHomePage = pathname === "/en" || pathname === "/ar" || pathname === "/";

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

  const text = "Spec Home.";

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden pointer-events-none"
        >
          {/* Text & Counter Layer */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
            <motion.div
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)", transition: { duration: 0.8, ease: "easeInOut" } }}
              className="flex flex-col items-center"
            >
              <div className="flex overflow-hidden mb-4 perspective-1000">
                {text.split("").map((char, index) => (
                  <motion.h1
                    key={index}
                    variants={letterAnimation}
                    initial="hidden"
                    animate="show"
                    transition={{ delay: index * 0.05 }}
                    className="text-5xl md:text-7xl font-bold tracking-tighter text-white"
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.h1>
                ))}
              </div>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="text-xl md:text-3xl font-light tracking-widest tabular-nums text-accent flex items-center gap-2"
              >
                <span>{progress > 100 ? 100 : progress}%</span>
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
