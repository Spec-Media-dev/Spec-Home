"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { staggerContainer, fadeUp } from "@/theme/animations";
import MagneticButton from "./MagneticButton";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Sun, Moon, Globe, Search } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function Header() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { locale, t, toggleLocale } = useI18n();

  // Handle hydration mismatch
  useEffect(() => setMounted(true), []);

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

      <motion.div variants={fadeUp} className="flex items-center gap-3 md:gap-4">
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
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-foreground/10 transition-colors text-foreground"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        )}
        
        <button 
          onClick={toggleLocale}
          className="flex items-center gap-1.5 p-2 rounded-full hover:bg-foreground/10 transition-colors text-foreground text-xs font-semibold tracking-wider uppercase"
        >
          <Globe size={16} />
          {locale === 'en' ? 'AR' : 'EN'}
        </button>

        <Link href={`/${locale}/contact`}>
          <MagneticButton className="bg-foreground text-background hover:opacity-85 hidden md:block text-xs font-semibold px-5 py-2.5">
            {t.nav.talkAdvisor}
          </MagneticButton>
        </Link>
      </motion.div>
    </motion.header>
  );
}
