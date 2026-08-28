import { Eye, Handshake, Home, Landmark, Target } from "lucide-react";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { Button } from "@/components/ui/button";
import { brand } from "@/config/brand";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { buildAboutGraph } from "@/lib/seo/graphs";
import { JsonLd } from "@/lib/seo/json-ld";
import { buildLocalizedMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });

  return buildLocalizedMetadata({
    locale: locale as Locale,
    path: "/about",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default async function AboutPage({
  params,
}: PageProps<"/[locale]/about">) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(locale);

  const [t, nav] = await Promise.all([
    getTranslations("about"),
    getTranslations("nav"),
  ]);

  const pillars = [
    { Icon: Target, title: t("expertiseTitle"), body: t("expertiseBody") },
    {
      Icon: Eye,
      title: t("transparencyTitle"),
      body: t("transparencyBody"),
    },
    { Icon: Handshake, title: t("clientTitle"), body: t("clientBody") },
  ];

  return (
    <>
      <JsonLd data={await buildAboutGraph(locale)} />

      <section className="relative isolate overflow-hidden bg-brand-navy text-white">
        <Image
          src={brand.hero.image}
          alt=""
          aria-hidden
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-navy via-brand-navy/90 to-brand-navy/65 rtl:bg-gradient-to-l" />
        <div className="container-content py-16 sm:py-20 lg:py-28">
          <div className="max-w-3xl space-y-6">
            <Breadcrumbs
              items={[
                { label: nav("home"), href: "/" },
                { label: nav("about") },
              ]}
            />
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-gold">
              {t("eyebrow")}
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              {t("title")}
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
              {t("heroBody")}
            </p>
          </div>
        </div>
      </section>

      <section className="container-content grid gap-10 py-16 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.8fr)] lg:items-center">
        <div className="space-y-5">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("whoTitle")}
          </h2>
          <p className="text-base leading-8 text-muted-foreground">
            {t("whoBody")}
          </p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
          <Image
            src={brand.gradient.image}
            alt=""
            aria-hidden
            fill
            sizes="(max-width: 1024px) 100vw, 42vw"
            className="object-cover"
          />
        </div>
      </section>

      <section className="border-y border-border bg-muted/40 py-16 sm:py-20">
        <div className="container-content space-y-10">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
              {t("approachEyebrow")}
            </p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("approachTitle")}
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {pillars.map(({ Icon, title, body }) => (
              <article
                key={title}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-full bg-brand-gold/15 text-brand-navy dark:text-brand-gold">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container-content space-y-10 py-16 sm:py-20">
        <div className="max-w-3xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
            {t("focusEyebrow")}
          </p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("focusTitle")}
          </h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-border bg-card p-7 shadow-sm sm:p-8">
            <Home className="size-7 text-brand-gold" aria-hidden />
            <h3 className="mt-5 text-xl font-semibold">
              {t("residentialTitle")}
            </h3>
            <p className="mt-3 leading-7 text-muted-foreground">
              {t("residentialBody")}
            </p>
          </article>
          <article className="rounded-2xl border border-border bg-card p-7 shadow-sm sm:p-8">
            <Landmark className="size-7 text-brand-gold" aria-hidden />
            <h3 className="mt-5 text-xl font-semibold">
              {t("investmentTitle")}
            </h3>
            <p className="mt-3 leading-7 text-muted-foreground">
              {t("investmentBody")}
            </p>
          </article>
        </div>
        <div className="rounded-2xl bg-brand-navy px-6 py-8 text-white sm:px-10">
          <h2 className="text-2xl font-semibold">{t("audienceTitle")}</h2>
          <p className="mt-3 max-w-3xl leading-7 text-white/80">
            {t("audienceBody")}
          </p>
        </div>
      </section>

      <section className="border-t border-border bg-muted/40 py-16 sm:py-20">
        <div className="container-content text-center">
          <div className="mx-auto max-w-3xl space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("ctaTitle")}
            </h2>
            <p className="text-muted-foreground">{t("ctaBody")}</p>
          </div>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
            <Button size="lg" nativeButton={false} render={<Link href="/properties" />}>
              {t("browseProperties")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              render={<Link href="/projects" />}
            >
              {t("exploreProjects")}
            </Button>
            <Button
              size="lg"
              variant="ghost"
              nativeButton={false}
              render={<Link href="/contact" />}
            >
              {t("contactUs")}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
