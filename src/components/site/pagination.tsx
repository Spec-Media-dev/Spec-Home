import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { cn } from "@/lib/utils";

type PaginationProps = {
  basePath: string;
  page: number;
  totalPages: number;
  query?: Record<string, string | undefined>;
};

/**
 * Real anchors rather than buttons, so pagination is crawlable and works
 * without JavaScript.
 */
export async function Pagination({
  basePath,
  page,
  totalPages,
  query = {},
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const t = await getTranslations("common");

  const hrefFor = (target: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value) params.set(key, value);
    }
    if (target > 1) params.set("page", String(target));
    const search = params.toString();
    return search ? `${basePath}?${search}` : basePath;
  };

  const pages = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  ).filter(
    (value) =>
      value === 1 || value === totalPages || Math.abs(value - page) <= 1,
  );

  const linkClass =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-border px-3 text-sm transition-colors hover:bg-muted";

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center gap-2">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={linkClass} rel="prev">
          {t("previous")}
        </Link>
      ) : null}

      {pages.map((value, index) => {
        const previous = pages[index - 1];
        const gap = previous !== undefined && value - previous > 1;
        return (
          <span key={value} className="flex items-center gap-2">
            {gap ? (
              <span className="px-1 text-muted-foreground" aria-hidden>
                …
              </span>
            ) : null}
            <Link
              href={hrefFor(value)}
              aria-current={value === page ? "page" : undefined}
              className={cn(
                linkClass,
                value === page &&
                  "border-primary bg-primary text-primary-foreground hover:bg-primary",
              )}
            >
              {value}
            </Link>
          </span>
        );
      })}

      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className={linkClass} rel="next">
          {t("next")}
        </Link>
      ) : null}
    </nav>
  );
}
