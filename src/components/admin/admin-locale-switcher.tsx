"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setAdminLocale } from "@/lib/actions/admin-locale";
import { ADMIN_LOCALES, type AdminLocale } from "@/lib/admin-locale";

/**
 * Switches the console language without navigating.
 *
 * `router.refresh()` re-renders the server tree — picking up the new `lang`
 * and `dir` on <html> — while every client component keeps its state. An admin
 * halfway through a bilingual form does not lose what they have typed.
 */
export function AdminLocaleSwitcher() {
  const t = useTranslations("locale");
  const current = useLocale() as AdminLocale;
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function choose(locale: AdminLocale) {
    if (locale === current || pending) return;
    startTransition(async () => {
      await setAdminLocale(locale);
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={pending}
            aria-label={t("switchTo")}
          >
            <Languages className="size-5" aria-hidden />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {ADMIN_LOCALES.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => choose(locale)}
            aria-current={locale === current ? "true" : undefined}
          >
            {t(locale)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
