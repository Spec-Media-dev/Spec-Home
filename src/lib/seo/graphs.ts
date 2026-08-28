import "server-only";

import { getTranslations } from "next-intl/server";

import { brand } from "@/config/brand";
import { contact } from "@/config/contact";
import { siteUrl } from "@/lib/env";
import type { Locale } from "@/i18n/routing";
import type { PropertyDetail, PropertyWithProject } from "@/lib/data/properties";
import {
  localizeProject,
  localizeProjectName,
  localizeProperty,
} from "@/lib/localized";
import { absoluteUrl } from "@/lib/seo/metadata";
import { storageUrl } from "@/lib/storage";
import type { Project } from "@/lib/supabase/types";

/**
 * One @graph per page, generated from exactly the facts the page renders.
 * Nothing is emitted that the database cannot support — no invented ratings,
 * geo coordinates, or offers without a real visible price.
 */
type Node = Record<string, unknown>;

const ORG_ID = `${siteUrl}/#organization`;
const SITE_ID = `${siteUrl}/#website`;

function organizationNode(): Node {
  const node: Node = {
    "@type": "RealEstateAgent",
    "@id": ORG_ID,
    name: brand.name,
    url: siteUrl,
    logo: `${siteUrl}${brand.logo.mark}`,
    image: `${siteUrl}${brand.hero.image}`,
    email: contact.email,
    areaServed: { "@type": "City", name: "Dubai" },
    address: {
      "@type": "PostalAddress",
      addressLocality: contact.address.locality,
      addressCountry: contact.address.country,
    },
  };
  if (contact.phone) node.telephone = contact.phone;
  return node;
}

function websiteNode(locale: Locale): Node {
  return {
    "@type": "WebSite",
    "@id": SITE_ID,
    url: siteUrl,
    name: brand.name,
    inLanguage: locale,
    publisher: { "@id": ORG_ID },
  };
}

function webPageNode(
  url: string,
  name: string,
  description: string,
  locale: Locale,
  extra: Node = {},
): Node {
  return {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: locale,
    isPartOf: { "@id": SITE_ID },
    ...extra,
  };
}

export function breadcrumbNode(
  url: string,
  items: { name: string; url: string }[],
): Node {
  return {
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function graph(nodes: Node[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}

export async function buildHomeGraph(locale: Locale) {
  const t = await getTranslations({ locale, namespace: "home" });
  const url = absoluteUrl("/", locale);

  return graph([
    organizationNode(),
    websiteNode(locale),
    webPageNode(url, t("metaTitle"), t("metaDescription"), locale, {
      about: { "@id": ORG_ID },
    }),
  ]);
}

export async function buildAboutGraph(locale: Locale) {
  const t = await getTranslations({ locale, namespace: "about" });
  const nav = await getTranslations({ locale, namespace: "nav" });
  const url = absoluteUrl("/about", locale);

  return graph([
    organizationNode(),
    websiteNode(locale),
    {
      "@type": "AboutPage",
      "@id": `${url}#webpage`,
      url,
      name: t("metaTitle"),
      description: t("metaDescription"),
      inLanguage: locale,
      isPartOf: { "@id": SITE_ID },
      about: { "@id": ORG_ID },
    },
    breadcrumbNode(url, [
      { name: nav("home"), url: absoluteUrl("/", locale) },
      { name: nav("about"), url },
    ]),
  ]);
}

export async function buildListingGraph(
  locale: Locale,
  path: string,
  namespace: "projects" | "properties",
  items: { name: string; url: string }[],
) {
  const t = await getTranslations({ locale, namespace });
  const nav = await getTranslations({ locale, namespace: "nav" });
  const url = absoluteUrl(path, locale);

  const nodes: Node[] = [
    organizationNode(),
    websiteNode(locale),
    {
      "@type": "CollectionPage",
      "@id": `${url}#webpage`,
      url,
      name: t("metaTitle"),
      description: t("metaDescription"),
      inLanguage: locale,
      isPartOf: { "@id": SITE_ID },
    },
    breadcrumbNode(url, [
      { name: nav("home"), url: absoluteUrl("/", locale) },
      { name: t("title"), url },
    ]),
  ];

  // ItemList only reflects items actually rendered on the page.
  if (items.length > 0) {
    nodes.push({
      "@type": "ItemList",
      "@id": `${url}#itemlist`,
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: item.url,
      })),
    });
  }

  return graph(nodes);
}

export async function buildProjectGraph(
  locale: Locale,
  project: Project,
  properties: PropertyWithProject[],
) {
  const nav = await getTranslations({ locale, namespace: "nav" });
  const projectsT = await getTranslations({ locale, namespace: "projects" });
  const url = absoluteUrl(`/projects/${project.slug}`, locale);
  const local = localizeProject(project, locale);
  const cover = storageUrl(project.cover_image_path);

  const listing: Node = {
    "@type": "RealEstateListing",
    "@id": `${url}#listing`,
    url,
    name: local.name,
    inLanguage: locale,
    provider: { "@id": ORG_ID },
    about: { "@id": `${url}#development` },
  };

  if (local.description) listing.description = local.description;
  if (cover) listing.image = cover;
  if (local.developer) {
    listing.additionalProperty = {
      "@type": "PropertyValue",
      name: projectsT("developer"),
      value: local.developer,
    };
  }

  // AggregateOffer only when a real price range is displayed.
  if (project.price_min !== null || project.price_max !== null) {
    listing.offers = {
      "@type": "AggregateOffer",
      priceCurrency: project.currency,
      ...(project.price_min !== null ? { lowPrice: project.price_min } : {}),
      ...(project.price_max !== null ? { highPrice: project.price_max } : {}),
      ...(properties.length > 0 ? { offerCount: properties.length } : {}),
    };
  }

  const place: Node = {
    "@type": "Place",
    "@id": `${url}#development`,
    name: local.name,
  };
  if (local.location) {
    place.address = {
      "@type": "PostalAddress",
      addressLocality: local.location,
      addressCountry: contact.address.country,
    };
  }

  return graph([
    organizationNode(),
    websiteNode(locale),
    webPageNode(url, local.name, local.description ?? local.name, locale, {
      primaryImageOfPage: cover ?? undefined,
    }),
    listing,
    place,
    breadcrumbNode(url, [
      { name: nav("home"), url: absoluteUrl("/", locale) },
      { name: nav("projects"), url: absoluteUrl("/projects", locale) },
      { name: local.name, url },
    ]),
  ]);
}

export async function buildPropertyGraph(
  locale: Locale,
  property: PropertyDetail,
) {
  const nav = await getTranslations({ locale, namespace: "nav" });
  const url = absoluteUrl(`/properties/${property.slug}`, locale);
  const local = localizeProperty(property, locale);
  const images = property.property_images
    .map((image) => storageUrl(image.image_url))
    .filter((value): value is string => Boolean(value));

  const listing: Node = {
    "@type": "RealEstateListing",
    "@id": `${url}#listing`,
    url,
    name: local.title,
    inLanguage: locale,
    provider: { "@id": ORG_ID },
    identifier: property.reference_code,
    about: { "@id": `${url}#accommodation` },
  };
  if (local.description) listing.description = local.description;
  if (images.length > 0) listing.image = images;

  // Offer requires a genuine, visible price.
  if (property.price !== null) {
    const availability =
      property.status === "available"
        ? "https://schema.org/InStock"
        : property.status === "sold"
          ? "https://schema.org/SoldOut"
          : undefined;
    listing.offers = {
      "@type": "Offer",
      price: property.price,
      priceCurrency: property.currency,
      ...(availability ? { availability } : {}),
    };
  }

  const accommodation: Node = {
    "@type": "Accommodation",
    "@id": `${url}#accommodation`,
    name: local.title,
  };
  const projectPlaceId = property.projects
    ? `${absoluteUrl(`/projects/${property.projects.slug}`, locale)}#development`
    : null;
  if (projectPlaceId) {
    accommodation.containedInPlace = { "@id": projectPlaceId };
  }
  if (property.bedrooms !== null) {
    accommodation.numberOfBedrooms = property.bedrooms;
  }
  if (property.bathrooms !== null) {
    accommodation.numberOfBathroomsTotal = property.bathrooms;
  }
  if (property.size_sqft !== null) {
    accommodation.floorSize = {
      "@type": "QuantitativeValue",
      value: property.size_sqft,
      unitCode: "FTK",
    };
  }

  const crumbs = [
    { name: nav("home"), url: absoluteUrl("/", locale) },
    { name: nav("properties"), url: absoluteUrl("/properties", locale) },
  ];
  if (property.projects) {
    const projectName = localizeProjectName(property.projects, locale);
    crumbs.push({
      name: projectName,
      url: absoluteUrl(`/projects/${property.projects.slug}`, locale),
    });
  }
  crumbs.push({ name: local.title, url });

  const nodes: Node[] = [
    organizationNode(),
    websiteNode(locale),
    webPageNode(url, local.title, local.description ?? local.title, locale, {
      primaryImageOfPage: images[0],
    }),
    listing,
    accommodation,
    breadcrumbNode(url, crumbs),
  ];

  if (property.projects && projectPlaceId) {
    nodes.splice(nodes.length - 1, 0, {
      "@type": "Place",
      "@id": projectPlaceId,
      name: localizeProjectName(property.projects, locale),
      url: absoluteUrl(`/projects/${property.projects.slug}`, locale),
    });
  }

  return graph(nodes);
}

export async function buildContactGraph(locale: Locale) {
  const t = await getTranslations({ locale, namespace: "contact" });
  const nav = await getTranslations({ locale, namespace: "nav" });
  const url = absoluteUrl("/contact", locale);

  return graph([
    organizationNode(),
    websiteNode(locale),
    {
      "@type": "ContactPage",
      "@id": `${url}#webpage`,
      url,
      name: t("metaTitle"),
      description: t("metaDescription"),
      inLanguage: locale,
      isPartOf: { "@id": SITE_ID },
      about: { "@id": ORG_ID },
    },
    breadcrumbNode(url, [
      { name: nav("home"), url: absoluteUrl("/", locale) },
      { name: nav("contact"), url },
    ]),
  ]);
}
