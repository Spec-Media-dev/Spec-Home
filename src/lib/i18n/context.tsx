"use client";

import React, { createContext, useContext, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { en, Dictionary } from "./dictionaries/en";
import { ar } from "./dictionaries/ar";

export type Locale = "en" | "ar";

export const dictionaries: Record<Locale, Dictionary> = {
  en,
  ar,
};

export function getDictionary(locale: string): Dictionary {
  return dictionaries[locale as Locale] || en;
}

interface I18nContextType {
  locale: Locale;
  t: Dictionary;
  isRTL: boolean;
  toggleLocale: () => void;
}

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  t: en,
  isRTL: false,
  toggleLocale: () => {},
});

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const isRTL = locale === "ar";
  const t = useMemo(() => getDictionary(locale), [locale]);

  const toggleLocale = () => {
    const newLocale: Locale = locale === "en" ? "ar" : "en";
    let newPath = pathname;
    if (pathname.startsWith("/ar")) {
      newPath = pathname.replace(/^\/ar/, `/${newLocale}`);
    } else if (pathname.startsWith("/en")) {
      newPath = pathname.replace(/^\/en/, `/${newLocale}`);
    } else {
      newPath = `/${newLocale}${pathname}`;
    }
    router.push(newPath);
  };

  return (
    <I18nContext.Provider value={{ locale, t, isRTL, toggleLocale }}>
      <div dir={isRTL ? "rtl" : "ltr"} className={isRTL ? "font-sans rtl" : "font-sans ltr"}>
        {children}
      </div>
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    return {
      locale: "en" as Locale,
      t: en,
      isRTL: false,
      toggleLocale: () => {},
    };
  }
  return context;
}
