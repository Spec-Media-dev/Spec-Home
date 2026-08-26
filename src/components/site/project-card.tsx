import { Building2, MapPin } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { ProjectWithCount } from "@/lib/data/projects";
import type { Project } from "@/lib/supabase/types";
import { formatPriceRange } from "@/lib/format";
import { localizeProject } from "@/lib/localized";
import { storageUrl } from "@/lib/storage";

type ProjectCardProps = {
  /** Search results have no per-project count, so it stays optional. */
  project: ProjectWithCount | Project;
  locale: Locale;
  priority?: boolean;
};

export async function ProjectCard({
  project,
  locale,
  priority = false,
}: ProjectCardProps) {
  const t = await getTranslations("projects");
  const common = await getTranslations("common");
  const statusT = await getTranslations("projectStatus");

  const { name, developer, location, type } = localizeProject(project, locale);
  const coverUrl = storageUrl(project.cover_image_path);
  const priceRange = formatPriceRange(
    project.price_min,
    project.price_max,
    project.currency,
    locale,
  );

  const statusKey = project.status as
    "under_construction" | "ready" | "sold_out";
  const hasStatusLabel = ["under_construction", "ready", "sold_out"].includes(
    statusKey,
  );

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-lg">
      <Link
        href={`/projects/${project.slug}`}
        className="relative block aspect-[16/10] overflow-hidden bg-muted"
      >
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={name}
            fill
            priority={priority}
            loading={priority ? undefined : "lazy"}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {common("brandShort")}
          </div>
        )}
        {hasStatusLabel ? (
          <Badge variant="secondary" className="absolute end-3 top-3">
            {statusT(statusKey)}
          </Badge>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold leading-snug">
            <Link
              href={`/projects/${project.slug}`}
              className="hover:underline"
            >
              {name}
            </Link>
          </h3>
          {developer ? (
            <p className="text-sm text-muted-foreground">{developer}</p>
          ) : null}
        </div>

        <dl className="space-y-1.5 text-sm text-muted-foreground">
          {location ? (
            <div className="flex items-center gap-1.5">
              <MapPin className="size-4 shrink-0" aria-hidden />
              <dd>{location}</dd>
            </div>
          ) : null}
          {type ? (
            <div className="flex items-center gap-1.5">
              <Building2 className="size-4 shrink-0" aria-hidden />
              <dd>{type}</dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-auto flex flex-wrap items-baseline justify-between gap-2 border-t border-border pt-3">
          {priceRange ? (
            <p className="text-sm font-semibold text-primary dark:text-brand-gold">
              <span className="font-normal text-muted-foreground">
                {common("from")}{" "}
              </span>
              {priceRange}
            </p>
          ) : (
            <span className="text-sm text-muted-foreground">
              {common("priceOnRequest")}
            </span>
          )}
          {"propertyCount" in project ? (
            <p className="text-xs text-muted-foreground">
              {t("propertyCount", { count: project.propertyCount })}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
