import { Bath, BedDouble, Building2, Maximize, Tag } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { MobileContactBar } from "@/components/site/mobile-contact-bar";
import { PropertyGallery } from "@/components/site/property-gallery";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import {
  getPropertyBySlug,
  getPublishedPropertySlugs,
} from "@/lib/data/properties";
import { formatArea, formatPrice } from "@/lib/format";
import {
  localizeProjectName,
  localizeProperty,
  localizeSpec,
} from "@/lib/localized";
import { JsonLd } from "@/lib/seo/json-ld";
import { buildPropertyGraph } from "@/lib/seo/graphs";
import { buildLocalizedMetadata } from "@/lib/seo/metadata";
import { storageUrl } from "@/lib/storage";

export async function generateStaticParams() {
  const slugs = await getPublishedPropertySlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/properties/[slug]">) {
  const { locale, slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  const local = localizeProperty(property, locale as Locale);
  const cover = storageUrl(property.property_images[0]?.image_url);
  const price = formatPrice(
    property.price,
    property.currency,
    locale as Locale,
  );

  return buildLocalizedMetadata({
    locale: locale as Locale,
    path: `/properties/${slug}`,
    title: `${local.title} — ${property.reference_code}`,
    description:
      local.description?.slice(0, 180) ??
      [local.title, local.propertyType, price].filter(Boolean).join(" · "),
    image: cover,
  });
}

export default async function PropertyDetailPage({
  params,
}: PageProps<"/[locale]/properties/[slug]">) {
  const { locale: rawLocale, slug } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(locale);

  const property = await getPropertyBySlug(slug);
  // Unpublished, missing, or orphaned by an unpublished project ⇒ real 404.
  if (!property) notFound();

  const [t, common, nav, units, statusT] = await Promise.all([
    getTranslations("properties"),
    getTranslations("common"),
    getTranslations("nav"),
    getTranslations("units"),
    getTranslations("propertyStatus"),
  ]);

  const local = localizeProperty(property, locale);
  const projectName = property.projects
    ? localizeProjectName(property.projects, locale)
    : null;
  const price = formatPrice(property.price, property.currency, locale);
  const area = formatArea(property.size_sqft, locale);

  const images = property.property_images
    .map((image) => ({ id: image.id, url: storageUrl(image.image_url) }))
    .filter((image): image is { id: string; url: string } =>
      Boolean(image.url),
    );

  const specs = property.property_specs.map((spec) =>
    localizeSpec(spec, locale),
  );

  const statusKey = property.status as "available" | "reserved" | "sold";
  const hasStatus = ["available", "reserved", "sold"].includes(statusKey);

  const keyFacts = [
    property.bedrooms !== null
      ? {
          Icon: BedDouble,
          label: t("filterBedrooms"),
          value: units("bedrooms", { count: property.bedrooms }),
        }
      : null,
    property.bathrooms !== null
      ? {
          Icon: Bath,
          label: t("bathrooms"),
          value: units("bathrooms", { count: property.bathrooms }),
        }
      : null,
    area
      ? {
          Icon: Maximize,
          label: t("area"),
          value: units("sqft", { value: area }),
        }
      : null,
    local.propertyType
      ? { Icon: Building2, label: t("filterType"), value: local.propertyType }
      : null,
    {
      Icon: Tag,
      label: units("reference"),
      value: property.reference_code,
    },
  ].filter((fact): fact is NonNullable<typeof fact> => fact !== null);

  return (
    <>
      <JsonLd data={await buildPropertyGraph(locale, property)} />

      <div className="container-content space-y-8 py-8 pb-28 lg:pb-14">
        <Breadcrumbs
          items={[
            { label: nav("home"), href: "/" },
            { label: nav("properties"), href: "/properties" },
            ...(property.projects && projectName
              ? [
                  {
                    label: projectName,
                    href: `/projects/${property.projects.slug}`,
                  },
                ]
              : []),
            { label: local.title },
          ]}
        />

        {/* Above fold — title, project link, price (Design #1 order) */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {property.is_featured ? (
                <Badge className="bg-brand-gold text-brand-charcoal hover:bg-brand-gold">
                  {common("featured")}
                </Badge>
              ) : null}
              {hasStatus ? (
                <Badge variant="secondary">{statusT(statusKey)}</Badge>
              ) : null}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-4xl">
              {local.title}
            </h1>
            {property.projects && projectName ? (
              <p className="text-sm text-muted-foreground">
                {t("partOfProject")}{" "}
                <Link
                  href={`/projects/${property.projects.slug}`}
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  {projectName}
                </Link>
              </p>
            ) : null}
          </div>

          <p className="text-2xl font-semibold text-primary dark:text-brand-gold sm:text-3xl">
            {price ?? common("priceOnRequest")}
          </p>
        </header>

        {/* Key facts bar — Design #1's signature element */}
        <dl className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3 lg:grid-cols-5">
          {keyFacts.map((fact) => (
            <div key={fact.label + fact.value} className="bg-card p-4">
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                <fact.Icon className="size-3.5" aria-hidden />
                {fact.label}
              </dt>
              <dd className="mt-1.5 text-sm font-medium" dir="auto">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>

        <PropertyGallery images={images} title={local.title} />

        <div className="grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
          <div className="space-y-10">
            {local.description ? (
              <section
                aria-labelledby="property-description"
                className="space-y-3"
              >
                <h2 id="property-description" className="text-xl font-semibold">
                  {t("description")}
                </h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {local.description}
                </p>
              </section>
            ) : null}

            {specs.length > 0 ? (
              <section aria-labelledby="property-specs" className="space-y-4">
                <h2 id="property-specs" className="text-xl font-semibold">
                  {t("specifications")}
                </h2>
                <dl className="divide-y divide-border rounded-xl border border-border bg-card">
                  {specs.map((spec) => (
                    <div
                      key={spec.id}
                      className="flex flex-wrap items-baseline justify-between gap-2 p-4"
                    >
                      <dt className="text-sm text-muted-foreground">
                        {spec.key}
                      </dt>
                      <dd className="text-sm font-medium" dir="auto">
                        {spec.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}
          </div>

          <aside className="lg:sticky lg:top-28">
            <div className="rounded-xl border border-border bg-card p-6">
              <EnquiryForm
                propertyId={property.id}
                projectId={property.project_id}
              />
            </div>
          </aside>
        </div>
      </div>

      <MobileContactBar />
    </>
  );
}
