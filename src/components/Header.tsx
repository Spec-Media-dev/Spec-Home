"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { staggerContainer, fadeUp } from "@/theme/animations";
import MagneticButton from "./MagneticButton";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Sun, Moon, Globe, Search, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const FriesIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="15" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export default function Header() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { locale, t, toggleLocale } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  const links = [
    { name: t.nav.properties, href: `/${locale}/properties` },
    { name: t.nav.projects, href: `/${locale}/projects` },
    { name: t.nav.about, href: `/${locale}/about` },
    { name: t.nav.contact, href: `/${locale}/contact` },
  ];

  return (
    <>
      <motion.header
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className={cn(
          "fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 transition-all duration-500",
          isScrolled
            ? "bg-background/85 backdrop-blur-md border-b border-border py-3.5 shadow-sm"
            : "bg-background/40 dark:bg-black/30 backdrop-blur-md border-b border-border/20 py-4.5"
        )}
      >
        <motion.div variants={fadeUp} className="text-xl font-bold tracking-tighter text-foreground">
          <Link href={`/${locale}`}>{t.nav.brand}</Link>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <motion.div key={link.href} variants={fadeUp}>
              <Link
                href={link.href}
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                {link.name}
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Header Action Buttons */}
        <motion.div variants={fadeUp} className="flex items-center gap-2 md:gap-4">
          <Link
            href={`/${locale}/search`}
            className="p-2 rounded-full hover:bg-foreground/10 transition-colors text-foreground"
            aria-label={t.nav.search}
            id="nav-search-icon"
          >
            <Search size={18} />
          </Link>

          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full hover:bg-foreground/10 transition-colors text-foreground"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}

          <button
            onClick={toggleLocale}
            className="flex items-center gap-1.5 p-2 rounded-full hover:bg-foreground/10 transition-colors text-foreground text-xs font-semibold tracking-wider uppercase"
          >
            <Globe size={16} />
            {locale === "en" ? "AR" : "EN"}
          </button>

          <Link href={`/${locale}/contact`}>
            <MagneticButton className="bg-foreground text-background hover:opacity-85 hidden md:block text-xs font-semibold px-5 py-2.5">
              {t.nav.talkAdvisor}
            </MagneticButton>
          </Link>

          {/* Mobile Menu Toggle Button (Fries Icon) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-full hover:bg-foreground/10 transition-colors text-foreground md:hidden flex items-center justify-center"
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <FriesIcon size={20} />}
          </button>
        </motion.div>
      </motion.header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-background/95 dark:bg-black/95 backdrop-blur-xl md:hidden pt-24 px-8 pb-12 flex flex-col justify-between"
          >
            <div className="flex flex-col gap-6 mt-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-2xl font-bold text-foreground hover:text-accent transition-colors tracking-tight"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="space-y-4 pt-8 border-t border-border/40">
              <Link href={`/${locale}/contact`} onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full bg-foreground text-background py-3.5 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
                  {t.nav.talkAdvisor}
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
