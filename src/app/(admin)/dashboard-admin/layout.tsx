import type { Metadata } from "next";

import { ThemeProvider } from "@/components/shared/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { brandSans, mono } from "@/lib/fonts";

import "../../globals.css";

/**
 * Second root layout. The admin console is English/LTR only, so it sits
 * outside the `[locale]` segment and renders its own <html> — which is why the
 * app has no shared `app/layout.tsx`.
 */
export const metadata: Metadata = {
  title: { default: "SPEC Home Admin", template: "%s | SPEC Home Admin" },
  description: "SPEC Home Properties administration console.",
  icons: { icon: "/images/brand/favicon.svg" },
  // Belt and braces alongside robots.ts — admin must never be indexed.
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({
  children,
}: LayoutProps<"/dashboard-admin">) {
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className={`${brandSans.variable} ${mono.variable}`}
    >
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
