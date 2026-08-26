import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { Analytics } from "@/components/analytics";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { brandArabic, brandSans, mono } from "@/lib/fonts";
import { siteUrl } from "@/lib/env";
import { localeDirection, locales, routing } from "@/i18n/routing";

import "../../globals.css";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  const common = await getTranslations({ locale, namespace: "common" });

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${common("brandName")} — ${t("metaTitle")}`,
      template: `%s | ${common("brandShort")}`,
    },
    description: t("metaDescription"),
    icons: { icon: "/images/brand/favicon.svg" },
    openGraph: {
      type: "website",
      siteName: common("brandName"),
      locale: locale === "ar" ? "ar_AE" : "en_AE",
    },
  };
}

export default async function SiteLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const dir = localeDirection[locale];

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={`${brandSans.variable} ${brandArabic.variable} ${mono.variable}`}
    >
      <body className="flex min-h-dvh flex-col overflow-x-hidden">
        <ThemeProvider>
          <NextIntlClientProvider>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
            >
              <SkipLabel />
            </a>
            <SiteHeader />
            <main id="main" className="flex-1">
              {children}
            </main>
            <SiteFooter />
            <Toaster />
          </NextIntlClientProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}

async function SkipLabel() {
  const t = await getTranslations("common");
  return <>{t("skipToContent")}</>;
}
