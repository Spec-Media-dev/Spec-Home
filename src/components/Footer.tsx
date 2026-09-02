"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useSiteSettings } from "@/lib/context/SiteSettingsContext";
import { useTheme } from "./ThemeProvider";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const LinkedinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const YoutubeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </svg>
);

export default function Footer() {
  const { locale, t } = useI18n();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const {
    brandName,
    logoUrl,
    tagline,
    officeAddress,
    contactEmail,
    contactPhone,
    whatsappNumber,
    instagramUrl,
    linkedinUrl,
    youtubeUrl,
  } = useSiteSettings();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <footer className="border-t border-border py-14 px-6 lg:px-12 bg-background text-foreground/70">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="col-span-1 md:col-span-2 space-y-4">
          <Link href={`/${locale}`} className="inline-block">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={brandName}
                className={cn(
                  "h-9 max-w-[160px] object-contain mb-2 transition-all duration-300",
                  mounted &&
                    theme === "light" &&
                    !logoUrl.toLowerCase().endsWith(".svg") &&
                    (logoUrl.toLowerCase().includes("white") || logoUrl.toLowerCase().includes("branding")) &&
                    "filter invert contrast-125"
                )}
              />
            ) : (
              <h2 className="text-2xl font-bold tracking-tighter text-foreground">
                {brandName}
              </h2>
            )}
          </Link>
          <p className="max-w-md text-sm text-foreground/60 leading-relaxed font-light">
            {tagline || t.footer.brandDesc}
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-3 pt-2">
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full border border-border text-foreground/70 hover:text-accent hover:border-accent transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
            )}
            {linkedinUrl && (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full border border-border text-foreground/70 hover:text-accent hover:border-accent transition-colors"
                aria-label="LinkedIn"
              >
                <LinkedinIcon />
              </a>
            )}
            {youtubeUrl && (
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full border border-border text-foreground/70 hover:text-accent hover:border-accent transition-colors"
                aria-label="YouTube"
              >
                <YoutubeIcon />
              </a>
            )}
            {whatsappNumber && (
              <a
                href={`https://wa.me/${whatsappNumber.replace(/[^\d]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full border border-border text-foreground/70 hover:text-accent hover:border-accent transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle size={16} />
              </a>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-foreground font-semibold mb-4 text-sm tracking-wider uppercase">{t.footer.properties}</h3>
          <ul className="flex flex-col gap-2.5 text-sm">
            <li><Link href={`/${locale}/properties`} className="hover:text-foreground transition-colors">{t.footer.allProperties}</Link></li>
            <li><Link href={`/${locale}/projects`} className="hover:text-foreground transition-colors">{t.footer.ourProjects}</Link></li>
            <li><Link href={`/${locale}/about`} className="hover:text-foreground transition-colors">{t.footer.aboutUs}</Link></li>
            <li><Link href={`/${locale}/contact`} className="hover:text-foreground transition-colors">{t.footer.contact}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-foreground font-semibold mb-4 text-sm tracking-wider uppercase">{t.contactPage.contactInfo}</h3>
          <ul className="flex flex-col gap-3 text-xs text-foreground/65">
            {officeAddress && (
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-accent shrink-0 mt-0.5" />
                <span className="leading-snug">{officeAddress}</span>
              </li>
            )}
            {contactPhone && (
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-accent shrink-0" />
                <a href={`tel:${contactPhone.replace(/\s+/g, "")}`} className="hover:text-foreground transition-colors dir-ltr">
                  {contactPhone}
                </a>
              </li>
            )}
            {contactEmail && (
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-accent shrink-0" />
                <a href={`mailto:${contactEmail}`} className="hover:text-foreground transition-colors">
                  {contactEmail}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between text-xs text-foreground/40">
        <p>© {new Date().getFullYear()} {brandName}. {t.footer.copyright}</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <Link href={`/${locale}/properties`} className="hover:text-foreground transition-colors">{t.footer.privacy}</Link>
          <Link href={`/${locale}/contact`} className="hover:text-foreground transition-colors">{t.footer.terms}</Link>
        </div>
      </div>
    </footer>
  );
}
