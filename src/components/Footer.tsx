"use client";

import React from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';

export default function Footer() {
  const { locale, t } = useI18n();

  return (
    <footer className="border-t border-border py-12 px-6 lg:px-12 bg-background text-foreground/70">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <h2 className="text-2xl font-light text-foreground mb-4 tracking-tighter">SPEC <span className="font-semibold">HOME</span></h2>
          <p className="max-w-md text-sm text-foreground/50 leading-relaxed mb-6">
            {t.footer.brandDesc}
          </p>
        </div>
        
        <div>
          <h3 className="text-foreground font-medium mb-4">{t.footer.properties}</h3>
          <ul className="flex flex-col gap-2 text-sm">
            <li><Link href={`/${locale}/properties`} className="hover:text-foreground transition-colors">{t.footer.allProperties}</Link></li>
            <li><Link href={`/${locale}/projects`} className="hover:text-foreground transition-colors">{t.footer.ourProjects}</Link></li>
            <li><Link href={`/${locale}/search`} className="hover:text-foreground transition-colors">{t.footer.searchMap}</Link></li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-foreground font-medium mb-4">{t.footer.company}</h3>
          <ul className="flex flex-col gap-2 text-sm">
            <li><Link href={`/${locale}/about`} className="hover:text-foreground transition-colors">{t.footer.aboutUs}</Link></li>
            <li><Link href={`/${locale}/contact`} className="hover:text-foreground transition-colors">{t.footer.contact}</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between text-xs text-foreground/40">
        <p>© {new Date().getFullYear()} {t.footer.copyright}</p>
        <div className="flex gap-4 mt-4 md:mt-0">
          <Link href="#" className="hover:text-foreground transition-colors">{t.footer.privacy}</Link>
          <Link href="#" className="hover:text-foreground transition-colors">{t.footer.terms}</Link>
        </div>
      </div>
    </footer>
  );
}
