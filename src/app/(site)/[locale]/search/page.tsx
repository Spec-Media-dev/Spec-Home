import { getTranslations, setRequestLocale } from "next-intl/server";

import { PageHeader } from "@/components/site/page-header";
import { ProjectCard } from "@/components/site/project-card";
import { PropertyCard } from "@/components/site/property-card";
import { SearchField } from "@/components/site/search-field";
import type { Locale } from "@/i18n/routing";
import { searchAll } from "@/lib/data/search";
import {
  buildLocalizedMetadata,
  localizedPath,
  noindexFollow,
} from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/search">) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "search" });

  return buildLocalizedMetadata({
    locale: locale as Locale,
    path: "/search",
    title: t("metaTitle"),
    description: t("metaDescription"),
    // Search result states are user queries, never landing pages.
    robots: noindexFollow,
  });
}

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export default async function SearchPage({
  params,
  searchParams,
}: PageProps<"/[locale]/search">) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(locale);

  const query = await searchParams;
  const term = first(query.q).trim();

  const t = await getTranslations("search");
  const results = term
    ? await searchAll(term)
    : { projects: [], properties: [] };
  const hasResults =
    results.projects.length > 0 || results.properties.length > 0;

  return (
    <>
      <PageHeader title={t("title")}>
        <div className="mt-6 max-w-2xl">
          <SearchField
            basePath={localizedPath("/search", locale)}
            defaultValue={term}
          />
        </div>
      </PageHeader>

      <section className="container-content space-y-12 py-12 pb-20">
        {!term ? (
          <p className="text-sm text-muted-foreground">{t("emptyPrompt")}</p>
        ) : !hasResults ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <p className="font-medium">{t("noResults", { query: term })}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("noResultsHint")}
            </p>
          </div>
        ) : (
          <>
            {/* Projects lead: they are a first-class discovery path, not a filter. */}
            {results.projects.length > 0 ? (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">
                  {t("projectsHeading")}
                </h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {results.projects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      locale={locale}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {results.properties.length > 0 ? (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">
                  {t("propertiesHeading")}
                </h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {results.properties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      locale={locale}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </>
        )}
      </section>
    </>
  );
}
