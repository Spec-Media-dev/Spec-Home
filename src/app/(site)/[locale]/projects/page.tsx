import { getTranslations, setRequestLocale } from "next-intl/server";

import { ProjectCard } from "@/components/site/project-card";
import { PageHeader } from "@/components/site/page-header";
import type { Locale } from "@/i18n/routing";
import { getPublishedProjects } from "@/lib/data/projects";
import { localizeProject } from "@/lib/localized";
import { JsonLd } from "@/lib/seo/json-ld";
import { buildListingGraph } from "@/lib/seo/graphs";
import { absoluteUrl, buildAlternates } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/projects">) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "projects" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: buildAlternates("/projects", locale as Locale),
  };
}

export default async function ProjectsPage({
  params,
}: PageProps<"/[locale]/projects">) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(locale);

  const t = await getTranslations("projects");
  const projects = await getPublishedProjects();

  const graph = await buildListingGraph(
    locale,
    "/projects",
    "projects",
    projects.map((project) => ({
      name: localizeProject(project, locale).name,
      url: absoluteUrl(`/projects/${project.slug}`, locale),
    })),
  );

  return (
    <>
      <JsonLd data={graph} />
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <section className="container-content pb-20">
        {projects.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                locale={locale}
                priority={index < 3}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            {t("empty")}
          </p>
        )}
      </section>
    </>
  );
}
