import { Bath, BedDouble, Maximize } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { PropertyWithProject } from "@/lib/data/properties";
import { formatArea, formatPrice } from "@/lib/format";
import { localizeProject, localizeProperty } from "@/lib/localized";
import { storageUrl } from "@/lib/storage";
import { cn } from "@/lib/utils";

type PropertyCardProps = {
  property: PropertyWithProject;
  locale: Locale;
  /** Featured cards are larger and lead the homepage grid. */
  featured?: boolean;
  priority?: boolean;
};

export async function PropertyCard({
  property,
  locale,
  featured = false,
  priority = false,
}: PropertyCardProps) {
  const t = await getTranslations("common");
  const units = await getTranslations("units");
  const statusT = await getTranslations("propertyStatus");

  const { title, propertyType } = localizeProperty(property, locale);
  const cover = property.property_images[0];
  const coverUrl = storageUrl(cover?.image_url);
  const price = formatPrice(property.price, property.currency, locale);
  const area = formatArea(property.size_sqft, locale);
  const projectName = property.projects
    ? localizeProject(property.projects as never, locale).name
    : null;

  const statusKey = property.status as "available" | "reserved" | "sold";
  const hasStatusLabel = ["available", "reserved", "sold"].includes(statusKey);

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-lg",
        featured && "sm:rounded-xl",
      )}
    >
      <Link
        href={`/properties/${property.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-muted"
      >
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={title}
            fill
            priority={priority}
            loading={priority ? undefined : "lazy"}
            sizes={
              featured
                ? "(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            }
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {t("brandShort")}
          </div>
        )}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          {property.is_featured ? (
            <Badge className="bg-brand-gold text-brand-charcoal hover:bg-brand-gold">
              {t("featured")}
            </Badge>
          ) : (
            <span />
          )}
          {hasStatusLabel ? (
            <Badge variant="secondary">{statusT(statusKey)}</Badge>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1">
          {projectName ? (
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {projectName}
            </p>
          ) : null}
          <h3 className="line-clamp-2 text-base font-semibold leading-snug">
            <Link
              href={`/properties/${property.slug}`}
              className="hover:underline"
            >
              {title}
            </Link>
          </h3>
          {propertyType ? (
            <p className="text-sm text-muted-foreground">{propertyType}</p>
          ) : null}
        </div>

        <p className="text-lg font-semibold text-primary dark:text-brand-gold">
          {price ?? t("priceOnRequest")}
        </p>

        <dl className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3 text-sm text-muted-foreground">
          {property.bedrooms !== null ? (
            <div className="flex items-center gap-1.5">
              <BedDouble className="size-4" aria-hidden />
              <dd>{units("bedrooms", { count: property.bedrooms })}</dd>
            </div>
          ) : null}
          {property.bathrooms !== null ? (
            <div className="flex items-center gap-1.5">
              <Bath className="size-4" aria-hidden />
              <dd>{units("bathrooms", { count: property.bathrooms })}</dd>
            </div>
          ) : null}
          {area ? (
            <div className="flex items-center gap-1.5">
              <Maximize className="size-4" aria-hidden />
              <dd>{units("sqft", { value: area })}</dd>
            </div>
          ) : null}
        </dl>
      </div>
    </article>
  );
}
