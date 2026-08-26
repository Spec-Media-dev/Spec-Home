import { ChevronLeft, ChevronRight } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

type Crumb = { label: string; href?: string };

/**
 * Rendered server-side so the crawl path exists without JavaScript, and mirrored
 * by BreadcrumbList in the page's JSON-LD graph.
 */
export async function Breadcrumbs({ items }: { items: Crumb[] }) {
  const t = await getTranslations("common");
  const locale = await getLocale();
  const Chevron = locale === "ar" ? ChevronLeft : ChevronRight;

  return (
    <nav aria-label={t("breadcrumb")}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        {items.map((item, index) => (
          <li
            key={`${item.label}-${index}`}
            className="flex items-center gap-1.5"
          >
            {index > 0 ? (
              <Chevron className="size-3.5 shrink-0 opacity-60" aria-hidden />
            ) : null}
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-foreground hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-foreground">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
