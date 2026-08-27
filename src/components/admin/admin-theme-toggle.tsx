"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function AdminThemeToggle() {
  const t = useTranslations("theme");
  const { resolvedTheme, setTheme } = useTheme();

  const next = resolvedTheme === "dark" ? "light" : "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={t("toggleTo", { mode: t(next) })}
      title={t("toggleTo", { mode: t(next) })}
      onClick={() => setTheme(next)}
    >
      <Sun className="size-4 scale-100 dark:scale-0" aria-hidden />
      <Moon className="absolute size-4 scale-0 dark:scale-100" aria-hidden />
    </Button>
  );
}
