import { Alexandria, Outfit, Geist_Mono } from "next/font/google";

/**
 * The brand's primary face is Nohemi, which is commercially licensed and not
 * distributable from any package source. Outfit is the closest freely licensed
 * geometric sans and preserves the brand's character until licensed Nohemi
 * web files are supplied, at which point only this module changes.
 */
export const brandSans = Outfit({
  variable: "--font-brand-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

/** Alexandria is the official secondary face and covers Arabic and Latin. */
export const brandArabic = Alexandria({
  variable: "--font-brand-arabic",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});
