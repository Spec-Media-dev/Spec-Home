import { getTranslations, setRequestLocale } from "next-intl/server";

import { PageHeader } from "@/components/site/page-header";
import { Pagination } from "@/components/site/pagination";
import { PropertyCard } from "@/components/site/property-card";
import { PropertyFilters } from "@/components/site/property-filters";
import type { Locale } from "@/i18n/routing";
import { getProjectOptions } from "@/lib/data/projects";
import { getPropertyTypes, listProperties } from "@/lib/data/properties";
import { localizeProperty } from "@/lib/localized";
import { JsonLd } from "@/lib/seo/json-ld";
import { buildListingGraph } from "@/lib/seo/graphs";
import {
  absoluteUrl,
  buildAlternates,
  localizedPath,
  noindexFollow,
} from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
  searchParams,
}: PageProps<"/[locale]/properties">) {
  const { locale } = await params;
  const query = await searchParams;
  const t = await getTranslations({ locale, namespace: "properties" });

  // A filtered view is a user state, not a landing page: keep it out of the
  // index while still letting crawlers follow through to detail pages.
  const isFiltered = Object.keys(query).length > 0;

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: buildAlternates("/properties", locale as Locale),
    robots: isFiltered ? noindexFollow : undefined,
  };
}

function toNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PropertiesPage({
  params,
  searchParams,
}: PageProps<"/[locale]/properties">) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(locale);

  const query = await searchParams;
  const t = await getTranslations("properties");

  const current = {
    project: first(query.project),
    type: first(query.type),
    beds: first(query.beds),
    status: first(query.status),
    min: first(query.min),
    max: first(query.max),
  };

  const [projectOptions, types, result] = await Promise.all([
    getProjectOptions(),
    getPropertyTypes(),
    listProperties({
      projectId: current.project,
      type: current.type,
      bedrooms: toNumber(current.beds),
      status: current.status,
      minPrice: toNumber(current.min),
      maxPrice: toNumber(current.max),
      page: toNumber(first(query.page)) ?? 1,
    }),
  ]);

  const graph = await buildListingGraph(
    locale,
    "/properties",
    "properties",
    result.items.map((property) => ({
      name: localizeProperty(property, locale).title,
      url: absoluteUrl(`/properties/${property.slug}`, locale),
    })),
  );

  const basePath = localizedPath("/properties", locale);

  return (
    <>
      <JsonLd data={graph} />
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <section className="container-content space-y-8 py-10 pb-20">
        <PropertyFilters
          basePath={basePath}
          current={current}
          projects={projectOptions.map((project) => ({
            value: project.id,
            label: locale === "ar" ? project.name_ar : project.name_en,
          }))}
          types={types.map((type) => ({
            value: type.en,
            label: locale === "ar" ? type.ar : type.en,
          }))}
        />

        <p className="text-sm text-muted-foreground" aria-live="polite">
          {t("count", { count: result.total })}
        </p>

        {result.items.length > 0 ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {result.items.map((property, index) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  locale={locale}
                  priority={index < 3}
                />
              ))}
            </div>
            <Pagination
              basePath={basePath}
              page={result.page}
              totalPages={result.totalPages}
              query={current}
            />
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <p className="font-medium">{t("empty")}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("emptyHint")}
            </p>
          </div>
        )}
      </section>
    </>
  );
}
