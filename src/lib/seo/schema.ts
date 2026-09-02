import React from "react";
import type { PropertyRow, ProjectRow, SiteSettingsRow } from "@/lib/supabase/types";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/+$/, "");

/**
 * Universal JSON-LD React Component
 */
export function JsonLd({ data }: { data: Record<string, any> }) {
  return React.createElement("script", {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: JSON.stringify(data) },
  });
}

/**
 * Base Organization Node (#organization)
 */
export function buildOrganizationNode(settings?: Partial<SiteSettingsRow>) {
  return {
    "@type": "RealEstateAgent",
    "@id": `${SITE_URL}/#organization`,
    name: settings?.brand_name_en || "SPEC Home Dubai",
    alternateName: settings?.brand_name_ar || "سبيك هوم دبي",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      "@id": `${SITE_URL}/#logo`,
      url: settings?.logo_path?.startsWith("http")
        ? settings.logo_path
        : `${SITE_URL}/icon.svg`,
      caption: settings?.brand_name_en || "SPEC Home Dubai",
    },
    telephone: settings?.contact_phone || "+971 4 800 7732",
    email: settings?.contact_email || "concierge@spechome.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: settings?.office_address_en || "Level 42, Al Saada Tower",
      addressLocality: "Downtown Dubai",
      addressRegion: "Dubai",
      addressCountry: "AE",
    },
    founder: {
      "@type": "Person",
      name: "Mohamed Hamdou",
      jobTitle: "Chief Executive Officer",
    },
    sameAs: [
      settings?.instagram_url || "https://instagram.com/spechomedubai",
      settings?.linkedin_url || "https://linkedin.com/company/spechomedubai",
      settings?.youtube_url || "https://youtube.com/@spechomedubai",
    ].filter(Boolean),
  };
}

/**
 * Base WebSite Node (#website)
 */
export function buildWebsiteNode() {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: "SPEC Home Dubai",
    description: "Ultra-luxury Dubai real estate, penthouses, and branded residences.",
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: ["en", "ar"],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/en/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * BreadcrumbList Generator
 */
export function buildBreadcrumbs(items: { name: string; url: string }[]) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${items[items.length - 1]?.url || SITE_URL}/#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Schema Generator for Homepage (T01)
 */
export function buildHomepageSchema(locale: string, settings?: Partial<SiteSettingsRow>) {
  const isAr = locale === "ar";
  const url = `${SITE_URL}/${locale}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      buildOrganizationNode(settings),
      buildWebsiteNode(),
      {
        "@type": "WebPage",
        "@id": `${url}/#webpage`,
        url,
        name: isAr
          ? settings?.brand_name_ar || "سبيك هوم دبي | عقارات فاخرة ومساكن حصرية"
          : settings?.brand_name_en || "SPEC Home Dubai | Ultra-Luxury Real Estate",
        description: isAr
          ? "محفظة مختارة بعناية من العقارات الشاطئية الفاخرة، والبنتهاوس المعلق في دبي."
          : "Curated portfolio of prime waterfront estates, sky penthouses, and branded residences in Dubai.",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
        inLanguage: locale,
      },
    ],
  };
}

/**
 * Schema Generator for Category & Listing Hubs (T02, T03)
 */
export function buildCollectionSchema({
  title,
  description,
  url,
  locale,
  breadcrumbs,
  items,
}: {
  title: string;
  description: string;
  url: string;
  locale: string;
  breadcrumbs: { name: string; url: string }[];
  items?: { name: string; url: string; price?: number; currency?: string }[];
}) {
  const graph: any[] = [
    buildOrganizationNode(),
    buildWebsiteNode(),
    buildBreadcrumbs(breadcrumbs),
    {
      "@type": "CollectionPage",
      "@id": `${url}/#webpage`,
      url,
      name: title,
      description,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      breadcrumb: { "@id": `${url}/#breadcrumb` },
      inLanguage: locale,
    },
  ];

  if (items && items.length > 0) {
    graph.push({
      "@type": "ItemList",
      "@id": `${url}/#itemlist`,
      itemListElement: items.slice(0, 24).map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: item.url,
        name: item.name,
      })),
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

/**
 * Schema Generator for Property Detail (T09)
 */
export function buildPropertySchema({
  property,
  locale,
}: {
  property: PropertyRow & { cover_image?: string };
  locale: string;
}) {
  const isAr = locale === "ar";
  const url = `${SITE_URL}/${locale}/properties/${property.slug}`;
  const title = isAr
    ? property.seo_title_ar || property.title_ar || property.title_en
    : property.seo_title_en || property.title_en;
  const description = isAr
    ? property.seo_description_ar || property.description_ar || property.description_en || ""
    : property.seo_description_en || property.description_en || "";

  const propertyType = property.property_type_en || "Apartment";
  const schemaType = propertyType.toLowerCase().includes("villa")
    ? "House"
    : propertyType.toLowerCase().includes("penthouse")
    ? "Apartment"
    : "Accommodation";

  return {
    "@context": "https://schema.org",
    "@graph": [
      buildOrganizationNode(),
      buildWebsiteNode(),
      buildBreadcrumbs([
        { name: isAr ? "الرئيسية" : "Home", url: `${SITE_URL}/${locale}` },
        { name: isAr ? "العقارات" : "Properties", url: `${SITE_URL}/${locale}/properties` },
        { name: title, url },
      ]),
      {
        "@type": ["WebPage", "RealEstateListing"],
        "@id": `${url}/#webpage`,
        url,
        name: title,
        description,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        breadcrumb: { "@id": `${url}/#breadcrumb` },
        inLanguage: locale,
        mainEntity: {
          "@type": schemaType,
          "@id": `${url}/#property`,
          name: title,
          description,
          numberOfRooms: property.bedrooms || undefined,
          numberOfBathroomsTotal: property.bathrooms || undefined,
          floorSize: property.area_sqft
            ? {
                "@type": "QuantitativeValue",
                value: property.area_sqft,
                unitCode: "FTK",
              }
            : undefined,
          address: {
            "@type": "PostalAddress",
            addressLocality: property.location || "Dubai",
            addressRegion: "Dubai",
            addressCountry: "AE",
          },
          image: property.cover_image || property.og_image_path || undefined,
          offers: property.price
            ? {
                "@type": "Offer",
                price: property.price,
                priceCurrency: property.currency || "AED",
                availability:
                  property.status === "available"
                    ? "https://schema.org/InStock"
                    : property.status === "reserved"
                    ? "https://schema.org/PreOrder"
                    : "https://schema.org/SoldOut",
                url,
                seller: { "@id": `${SITE_URL}/#organization` },
              }
            : undefined,
        },
      },
    ],
  };
}

/**
 * Schema Generator for Project Detail (T08)
 */
export function buildProjectSchema({
  project,
  locale,
}: {
  project: ProjectRow;
  locale: string;
}) {
  const isAr = locale === "ar";
  const url = `${SITE_URL}/${locale}/projects/${project.slug}`;
  const title = isAr
    ? project.seo_title_ar || project.name_ar || project.name_en
    : project.seo_title_en || project.name_en;
  const description = isAr
    ? project.seo_description_ar || project.description_ar || project.description_en || ""
    : project.seo_description_en || project.description_en || "";

  return {
    "@context": "https://schema.org",
    "@graph": [
      buildOrganizationNode(),
      buildWebsiteNode(),
      buildBreadcrumbs([
        { name: isAr ? "الرئيسية" : "Home", url: `${SITE_URL}/${locale}` },
        { name: isAr ? "المشاريع" : "Projects", url: `${SITE_URL}/${locale}/projects` },
        { name: title, url },
      ]),
      {
        "@type": ["WebPage", "RealEstateListing"],
        "@id": `${url}/#webpage`,
        url,
        name: title,
        description,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        breadcrumb: { "@id": `${url}/#breadcrumb` },
        inLanguage: locale,
        mainEntity: {
          "@type": "ApartmentComplex",
          "@id": `${url}/#project`,
          name: title,
          description,
          address: {
            "@type": "PostalAddress",
            addressLocality: (isAr ? project.location_ar : project.location_en) || "Dubai",
            addressRegion: "Dubai",
            addressCountry: "AE",
          },
          image: project.cover_image_path || project.og_image_path || undefined,
          ...(project.starting_price
            ? {
                offers: {
                  "@type": "AggregateOffer",
                  lowPrice: project.starting_price,
                  priceCurrency: project.currency || "AED",
                  offerCount: project.total_units || 1,
                  url,
                  seller: { "@id": `${SITE_URL}/#organization` },
                },
              }
            : {}),
        },
      },
    ],
  };
}

/**
 * Schema Generator for About Page (T13)
 */
export function buildAboutSchema(locale: string, settings?: Partial<SiteSettingsRow>) {
  const isAr = locale === "ar";
  const url = `${SITE_URL}/${locale}/about`;
  const title = isAr
    ? "عن سبيك هوم دبي | استشارات ووساطة عقارية نخبوية"
    : "About SPEC Home Dubai | Elite Real Estate Advisory & Brokerage";
  const description = isAr
    ? "تعرف على سبيك هوم دبي، الشريك الاستشاري الرائد لأصحاب الثروات في شراء العقارات الفاخرة، والمساكن الشاطئية، وإدارة المحافظ الاستثمارية."
    : "Learn about SPEC Home Dubai, your premier boutique advisory for high-net-worth real estate acquisition, private waterfront estates, and portfolio management.";

  return {
    "@context": "https://schema.org",
    "@graph": [
      buildOrganizationNode(settings),
      buildWebsiteNode(),
      buildBreadcrumbs([
        { name: isAr ? "الرئيسية" : "Home", url: `${SITE_URL}/${locale}` },
        { name: isAr ? "من نحن" : "About Us", url },
      ]),
      {
        "@type": "AboutPage",
        "@id": `${url}/#webpage`,
        url,
        name: title,
        description,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        breadcrumb: { "@id": `${url}/#breadcrumb` },
        inLanguage: locale,
        mainEntity: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };
}

/**
 * Schema Generator for Contact Page (T13)
 */
export function buildContactSchema(locale: string, settings?: Partial<SiteSettingsRow>) {
  const isAr = locale === "ar";
  const url = `${SITE_URL}/${locale}/contact`;
  const title = isAr
    ? "اتصل بسبيك هوم دبي | استشارات كبار العملاء والاستفسارات"
    : "Contact SPEC Home Dubai | Private Client Advisory & Inquiries";
  const description = isAr
    ? "تواصل مع مستشاري العقارات الخاصة في دبي. احجز استشارة خاصة أو جولة معاينة حصرية لأفخم العقارات في دبي بكل سرية واحترافية."
    : "Connect with our private client real estate advisors in Dubai. Schedule a confidential consultation or private viewing for prime Dubai residences.";

  return {
    "@context": "https://schema.org",
    "@graph": [
      buildOrganizationNode(settings),
      buildWebsiteNode(),
      buildBreadcrumbs([
        { name: isAr ? "الرئيسية" : "Home", url: `${SITE_URL}/${locale}` },
        { name: isAr ? "اتصل بنا" : "Contact", url },
      ]),
      {
        "@type": "ContactPage",
        "@id": `${url}/#webpage`,
        url,
        name: title,
        description,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        breadcrumb: { "@id": `${url}/#breadcrumb` },
        inLanguage: locale,
        mainEntity: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };
}

