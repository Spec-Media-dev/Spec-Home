import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SmoothScrolling from "@/components/SmoothScrolling";

const inter = Inter({ subsets: ["latin"] });

import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "SPEC Home Dubai | Premium Real Estate",
  description: "Awwwards-caliber visual experience for SPEC Home Dubai.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground antialiased transition-colors duration-300`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <SmoothScrolling>
            {children}
          </SmoothScrolling>
        </ThemeProvider>
      </body>
    </html>
  );
}
