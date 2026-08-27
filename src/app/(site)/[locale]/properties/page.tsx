import { SearchX } from "lucide-react";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PageHeader } from "@/components/site/page-header";
import { Pagination } from "@/components/site/pagination";
import { PropertyCard } from "@/components/site/property-card";
import { PropertyFilters } from "@/components/site/property-filters";
import { Button } from "@/components/ui/button";
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
  const hasActiveFilters = Object.values(current).some(Boolean);

  return (
    <>
      <JsonLd data={graph} />
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <section className="container-content space-y-8 py-10 pb-24 sm:py-14">
        <PropertyFilters
          key={JSON.stringify(current)}
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

        <p
          className="border-b border-border pb-4 text-sm font-medium text-muted-foreground"
          aria-live="polite"
        >
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
          <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center shadow-sm">
            <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-muted text-brand-navy dark:text-brand-gold">
              <SearchX className="size-5" aria-hidden />
            </span>
            <p className="mt-5 text-lg font-semibold">{t("empty")}</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              {t("emptyHint")}
            </p>
            {hasActiveFilters ? (
              <Button
                className="mt-6"
                nativeButton={false}
                render={<Link href={basePath} />}
              >
                {t("clearFilters")}
              </Button>
            ) : null}
          </div>
        )}
      </section>
    </>
  );
}
