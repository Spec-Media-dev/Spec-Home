"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { useSiteSettings } from "@/lib/context/SiteSettingsContext";
import { Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PageAnnouncementBar() {
  const pathname = usePathname();
  const { locale } = useI18n();
  const { announcement } = useSiteSettings();
  const [dismissed, setDismissed] = useState(false);

  if (!announcement || dismissed) return null;

  // Determine if currently on the landing / home page
  const normalizedPath = pathname?.replace(/\/$/, "") || "";
  const isLandingPage =
    normalizedPath === "" ||
    normalizedPath === "/" ||
    normalizedPath === `/${locale}` ||
    normalizedPath === `/${locale}/`;

  // Do not show on the landing / home page
  if (isLandingPage) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4 }}
        className="pt-24 md:pt-28 pb-0 px-6 max-w-7xl mx-auto w-full relative z-30"
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent/15 via-card to-accent/15 border border-accent/30 shadow-md backdrop-blur-md px-5 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-1.5 rounded-full bg-accent/20 text-accent shrink-0">
              <Sparkles size={16} />
            </div>
            <p className="text-xs md:text-sm font-medium text-foreground/90 leading-relaxed truncate">
              {announcement}
            </p>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-full text-foreground/50 hover:text-foreground hover:bg-foreground/10 transition-colors shrink-0 cursor-pointer"
            aria-label="Dismiss Announcement"
          >
            <X size={15} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
