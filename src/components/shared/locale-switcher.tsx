"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { buttonVariants } from "@/components/ui/button";
import { usePathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

function LocaleSwitcherLink({
  localizedPath,
  target,
  label,
}: {
  localizedPath: string;
  target: Locale;
  label: string;
}) {
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const href = query ? `${localizedPath}?${query}` : localizedPath;

  return (
    <a
      href={href}
      lang={target}
      aria-label={label}
      className={buttonVariants({ variant: "ghost", size: "sm" })}
    >
      {target === "ar" ? "العربية" : "English"}
    </a>
  );
}

export function LocaleSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale() as Locale;
  const pathname = usePathname();

  const target: Locale = locale === "ar" ? "en" : "ar";
  const localizedPath =
    target === "ar"
      ? pathname === "/"
        ? "/ar"
        : `/ar${pathname}`
      : pathname;

  return (
    // A locale change replaces the root document (`lang`, `dir`, and the
    // next-themes bootstrap), so this intentionally remains a hard link.
    <Suspense
      fallback={
        <span
          aria-hidden
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          {target === "ar" ? "العربية" : "English"}
        </span>
      }
    >
      <LocaleSwitcherLink
        localizedPath={localizedPath}
        target={target}
        label={t("switchLanguage")}
      />
    </Suspense>
  );
}
