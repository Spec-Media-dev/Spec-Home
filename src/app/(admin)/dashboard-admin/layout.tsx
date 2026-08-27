import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";

import { ThemeProvider } from "@/components/shared/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import {
  ADMIN_TIME_ZONE,
  adminMessages,
  getAdminLocale,
} from "@/lib/admin-i18n";
import { adminLocaleDirection } from "@/lib/admin-locale";
import { brandSans, brandArabic, mono } from "@/lib/fonts";

import "../../globals.css";

/**
 * Second root layout. The admin console lives outside the public `[locale]`
 * segment and renders its own <html> — which is why the app has no shared
 * `app/layout.tsx`.
 *
 * Its language comes from a cookie rather than the URL, so `/dashboard-admin`
 * stays a single set of routes in both languages. `generateMetadata` and the
 * `dir` attribute both read that cookie, which makes this layout dynamic — the
 * console is behind auth and was never static.
 */
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getAdminLocale();
  const messages = adminMessages(locale);

  return {
    title: {
      default: messages.meta.title,
      template: messages.meta.titleTemplate,
    },
    description: messages.meta.description,
    icons: { icon: "/images/brand/favicon.svg" },
    // Belt and braces alongside robots.ts — admin must never be indexed.
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function AdminRootLayout({
  children,
}: LayoutProps<"/dashboard-admin">) {
  const locale = await getAdminLocale();
  const direction = adminLocaleDirection[locale];

  return (
    <html
      lang={locale}
      dir={direction}
      suppressHydrationWarning
      className={`${brandSans.variable} ${brandArabic.variable} ${mono.variable}`}
    >
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <NextIntlClientProvider
          locale={locale}
          messages={adminMessages(locale)}
          timeZone={ADMIN_TIME_ZONE}
        >
          <ThemeProvider>
            {children}
            {/* Sonner needs the direction explicitly; it renders in a portal. */}
            <Toaster dir={direction} />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
