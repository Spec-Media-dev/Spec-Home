import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { PropertyCard } from "@/components/site/property-card";
import { Badge } from "@/components/ui/badge";
import type { Locale } from "@/i18n/routing";
import {
  getProjectBySlug,
  getPublishedProjectSlugs,
} from "@/lib/data/projects";
import { getPropertiesByProject } from "@/lib/data/properties";
import { formatArea, formatPriceRange } from "@/lib/format";
import { localizeProject } from "@/lib/localized";
import { JsonLd } from "@/lib/seo/json-ld";
import { buildProjectGraph } from "@/lib/seo/graphs";
import { buildLocalizedMetadata } from "@/lib/seo/metadata";
import { storageUrl } from "@/lib/storage";

export async function generateStaticParams() {
  const slugs = await getPublishedProjectSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/projects/[slug]">) {
  const { locale, slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const local = localizeProject(project, locale as Locale);
  const cover = storageUrl(project.cover_image_path);

  return buildLocalizedMetadata({
    locale: locale as Locale,
    path: `/projects/${slug}`,
    title: local.name,
    description:
      local.description?.slice(0, 180) ??
      `${local.name}${local.developer ? ` — ${local.developer}` : ""}`,
    image: cover,
  });
}

export default async function ProjectDetailPage({
  params,
}: PageProps<"/[locale]/projects/[slug]">) {
  const { locale: rawLocale, slug } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(locale);

  const project = await getProjectBySlug(slug);
  // A missing or unpublished project must be a real 404, never a 200 shell.
  if (!project) notFound();

  const [t, common, nav, statusT, properties] = await Promise.all([
    getTranslations("projects"),
    getTranslations("common"),
    getTranslations("nav"),
    getTranslations("projectStatus"),
    getPropertiesByProject(project.id),
  ]);

  const local = localizeProject(project, locale);
  const cover = storageUrl(project.cover_image_path);
  const priceRange = formatPriceRange(
    project.price_min,
    project.price_max,
    project.currency,
    locale,
  );
  const areaMin = formatArea(project.area_min_sqft, locale);
  const areaMax = formatArea(project.area_max_sqft, locale);
  const areaRange =
    areaMin && areaMax
      ? areaMin === areaMax
        ? areaMin
        : `${areaMin} – ${areaMax}`
      : (areaMin ?? areaMax);

  const statusKey = project.status as
    "under_construction" | "ready" | "sold_out";
  const hasStatus = ["under_construction", "ready", "sold_out"].includes(
    statusKey,
  );

  const overview = [
    { label: t("developer"), value: local.developer },
    { label: t("location"), value: local.location },
    { label: t("type"), value: local.type },
    { label: t("handover"), value: local.handover },
    { label: t("priceRange"), value: priceRange },
    { label: t("areaRange"), value: areaRange ? `${areaRange} sqft` : null },
    { label: t("portfolio"), value: project.portfolio },
  ].filter((item) => Boolean(item.value));

  const payment = [
    { label: t("installment"), value: local.installment },
    { label: t("downPayment"), value: local.downPayment },
    { label: t("monthlyInstallment"), value: local.monthlyInstallment },
    { label: t("cashDiscount"), value: local.cashDiscount },
  ].filter((item) => Boolean(item.value));

  return (
    <>
      <JsonLd data={await buildProjectGraph(locale, project, properties)} />

      {/* Hero — full-bleed image, contained copy (Design #1) */}
      <section className="relative isolate">
        <div className="absolute inset-0 -z-10 bg-brand-navy">
          {cover ? (
            <>
              <Image
                src={cover}
                alt=""
                aria-hidden
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/95 via-brand-navy/70 to-brand-navy/60" />
            </>
          ) : null}
        </div>

        <div className="container-content flex min-h-[24rem] flex-col justify-end py-12 text-white sm:min-h-[30rem]">
          <Breadcrumbs
            items={[
              { label: nav("home"), href: "/" },
              { label: nav("projects"), href: "/projects" },
              { label: local.name },
            ]}
          />
          <div className="mt-6 space-y-3">
            {hasStatus ? (
              <Badge className="bg-brand-gold text-brand-charcoal hover:bg-brand-gold">
                {statusT(statusKey)}
              </Badge>
            ) : null}
            <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
              {local.name}
            </h1>
            {local.developer ? (
              <p className="text-base text-white/85">{local.developer}</p>
            ) : null}
          </div>
        </div>
      </section>

      <div className="container-content grid gap-12 py-14 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
        <div className="space-y-12">
          {/* Overview bento — Design #1's strongest project pattern */}
          {overview.length > 0 ? (
            <section aria-labelledby="project-overview" className="space-y-5">
              <h2 id="project-overview" className="text-xl font-semibold">
                {t("overview")}
              </h2>
              <dl className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
                {overview.map((item) => (
                  <div key={item.label} className="bg-card p-5">
                    <dt className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      {item.label}
                    </dt>
                    <dd className="mt-1.5 text-sm font-medium">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          {payment.length > 0 ? (
            <section aria-labelledby="project-payment" className="space-y-5">
              <h2 id="project-payment" className="text-xl font-semibold">
                {t("paymentTitle")}
              </h2>
              <dl className="divide-y divide-border rounded-xl border border-border bg-card">
                {payment.map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-wrap items-baseline justify-between gap-2 p-5"
                  >
                    <dt className="text-sm text-muted-foreground">
                      {item.label}
                    </dt>
                    <dd className="text-sm font-medium">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          {local.description ? (
            <section
              aria-labelledby="project-description"
              className="space-y-4"
            >
              <h2 id="project-description" className="text-xl font-semibold">
                {t("description")}
              </h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">
                {local.description}
              </p>
            </section>
          ) : null}

          {local.notes ? (
            <section aria-labelledby="project-notes" className="space-y-3">
              <h2 id="project-notes" className="text-xl font-semibold">
                {t("notes")}
              </h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {local.notes}
              </p>
            </section>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-28">
          <div className="rounded-xl border border-border bg-card p-6">
            <EnquiryForm
              projectId={project.id}
              defaultMessage={common("enquire")}
            />
          </div>
        </aside>
      </div>

      {/* Only this project's published units — the core relationship rule */}
      <section className="border-t border-border py-14">
        <div className="container-content space-y-8">
          <h2 className="text-2xl font-semibold tracking-tight">
            {t("availableProperties")}
          </h2>
          {properties.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  locale={locale}
                />
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              {t("noProperties")}
            </p>
          )}
        </div>
      </section>
    </>
  );
}
