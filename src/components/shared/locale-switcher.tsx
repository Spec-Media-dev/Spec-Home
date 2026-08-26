"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export function LocaleSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [pending, startTransition] = useTransition();

  const target: Locale = locale === "ar" ? "en" : "ar";

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      aria-label={t("switchLanguage")}
      onClick={() =>
        startTransition(() => {
          // `params` carries dynamic segments (e.g. slug) that the localized
          // pathname still needs when switching language.
          router.replace(
            // @ts-expect-error -- pathname is validated by the router at runtime
            { pathname, params },
            { locale: target },
          );
        })
      }
    >
      {target === "ar" ? "العربية" : "English"}
    </Button>
  );
}
