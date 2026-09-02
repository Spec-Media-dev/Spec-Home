import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // 1. SRS 6.2 / 6.8 Canonical Sale Hub Redirects
      {
        source: "/properties-for-sale-in-dubai",
        destination: "/en/properties",
        permanent: true,
      },
      {
        source: "/:locale(en|ar)/properties-for-sale-in-dubai",
        destination: "/:locale/properties",
        permanent: true,
      },
      // 2. SRS 6.2 / SH-SP-001 Dynamic Property URL Redirects (/property/... -> /properties/...)
      {
        source: "/property/:slug*",
        destination: "/en/properties/:slug*",
        permanent: true,
      },
      {
        source: "/:locale(en|ar)/property/:slug*",
        destination: "/:locale/properties/:slug*",
        permanent: true,
      },
      // 3. SRS 6.8 Category Hub Redirects to verified active hubs
      {
        source: "/dubai/apartments-for-sale",
        destination: "/en/properties",
        permanent: true,
      },
      {
        source: "/:locale(en|ar)/dubai/apartments-for-sale",
        destination: "/:locale/properties",
        permanent: true,
      },
      {
        source: "/dubai/villas-for-sale",
        destination: "/en/properties",
        permanent: true,
      },
      {
        source: "/:locale(en|ar)/dubai/villas-for-sale",
        destination: "/:locale/properties",
        permanent: true,
      },
      {
        source: "/dubai/townhouses-for-sale",
        destination: "/en/properties",
        permanent: true,
      },
      {
        source: "/:locale(en|ar)/dubai/townhouses-for-sale",
        destination: "/:locale/properties",
        permanent: true,
      },
      {
        source: "/dubai/luxury-real-estate",
        destination: "/en/properties",
        permanent: true,
      },
      {
        source: "/:locale(en|ar)/dubai/luxury-real-estate",
        destination: "/:locale/properties",
        permanent: true,
      },
      {
        source: "/dubai/off-plan-properties",
        destination: "/en/projects",
        permanent: true,
      },
      {
        source: "/:locale(en|ar)/dubai/off-plan-properties",
        destination: "/:locale/projects",
        permanent: true,
      },
      {
        source: "/dubai/property-investment",
        destination: "/en/contact",
        permanent: true,
      },
      {
        source: "/:locale(en|ar)/dubai/property-investment",
        destination: "/:locale/contact",
        permanent: true,
      },
      {
        source: "/dubai",
        destination: "/en/properties",
        permanent: true,
      },
      {
        source: "/:locale(en|ar)/dubai",
        destination: "/:locale/properties",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
