import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";

import { EnquiryForm } from "@/components/site/enquiry-form";
import { HeroSearch } from "@/components/site/hero-search";
import { ProjectCard } from "@/components/site/project-card";
import { PropertyCard } from "@/components/site/property-card";
import { SectionHeading } from "@/components/site/section-heading";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { brand } from "@/config/brand";
import { getPublishedProjects } from "@/lib/data/projects";
import {
  getFeaturedProperties,
  getRecentProperties,
} from "@/lib/data/properties";
import { JsonLd } from "@/lib/seo/json-ld";
import { buildHomeGraph } from "@/lib/seo/graphs";
import { buildLocalizedMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });

  return buildLocalizedMetadata({
    locale: locale as Locale,
    path: "/",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const common = await getTranslations("common");

  const [featured, projects, recent] = await Promise.all([
    getFeaturedProperties(6),
    getPublishedProjects(6),
    getRecentProperties(8),
  ]);

  return (
    <>
      <JsonLd data={await buildHomeGraph(locale)} />

      {/* Hero — full-bleed background, contained content (Design #1) */}
      <section className="relative isolate">
        <div className="absolute inset-0 -z-10">
          <Image
            src={brand.hero.image}
            alt=""
            aria-hidden
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/85 via-brand-navy/70 to-brand-navy/90" />
        </div>

        <div className="container-content flex min-h-[36rem] flex-col justify-center py-20 lg:min-h-[44rem]">
          <div className="max-w-2xl space-y-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-gold">
              {t("heroEyebrow")}
            </p>
            <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              {t("heroTitle")}
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
              {t("heroSubtitle")}
            </p>
          </div>

          <HeroSearch className="mt-10 max-w-4xl" />
        </div>
      </section>

      {/* Featured — larger cards, gold badge (visually distinct from Recent) */}
      <section className="bg-muted/40 py-16 sm:py-20">
        <div className="container-content space-y-8">
          <SectionHeading
            eyebrow={common("featured")}
            title={t("featuredTitle")}
            subtitle={t("featuredSubtitle")}
            href="/properties"
            linkLabel={common("viewAll")}
          />
          {featured.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((property, index) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  locale={locale}
                  featured
                  priority={index < 3}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("noFeatured")}</p>
          )}
        </div>
      </section>

      {/* Browse by Project */}
      <section className="py-16 sm:py-20">
        <div className="container-content space-y-8">
          <SectionHeading
            title={t("projectsTitle")}
            subtitle={t("projectsSubtitle")}
            href="/projects"
            linkLabel={common("viewAll")}
          />
          {projects.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  locale={locale}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("noProjects")}</p>
          )}
        </div>
      </section>

      {/* Recently Added — tighter grid, no featured emphasis */}
      <section className="border-t border-border py-16 sm:py-20">
        <div className="container-content space-y-8">
          <SectionHeading
            title={t("recentTitle")}
            subtitle={t("recentSubtitle")}
            href="/properties"
            linkLabel={common("viewAll")}
          />
          {recent.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {recent.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  locale={locale}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("noRecent")}</p>
          )}
        </div>
      </section>

      {/* Brand story — sourced from the official Brand Guidelines */}
      <section className="bg-muted/40 py-16 sm:py-20">
        <div className="container-content grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
              {t("aboutEyebrow")}
            </p>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {t("aboutTitle")}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              {t("aboutBody")}
            </p>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/about" />}
            >
              {t("aboutLink")}
            </Button>
            <dl className="grid gap-5 sm:grid-cols-3">
              {[
                ["aboutPointExpertise", "aboutPointExpertiseBody"],
                ["aboutPointTransparency", "aboutPointTransparencyBody"],
                ["aboutPointService", "aboutPointServiceBody"],
              ].map(([titleKey, bodyKey]) => (
                <div key={titleKey} className="space-y-1">
                  <dt className="text-sm font-semibold">{t(titleKey)}</dt>
                  <dd className="text-sm text-muted-foreground">
                    {t(bodyKey)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
            <Image
              src={brand.gradient.image}
              alt=""
              aria-hidden
              fill
              loading="lazy"
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Enquiry CTA */}
      <section className="py-16 sm:py-20">
        <div className="container-content grid gap-10 lg:grid-cols-2 lg:items-start">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {t("ctaTitle")}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              {t("ctaBody")}
            </p>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/contact" />}
            >
              {common("enquire")}
            </Button>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <EnquiryForm />
          </div>
        </div>
      </section>
    </>
  );
}
