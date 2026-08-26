"use client";

import { Menu } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link } from "@/i18n/navigation";

type MobileNavProps = {
  links: { href: string; label: string }[];
};

export function MobileNav({ links }: MobileNavProps) {
  const t = useTranslations("common");
  const locale = useLocale();
  const [open, setOpen] = useState(false);

  // `side` is physical, so it must mirror for RTL to slide in from the start edge.
  const side = locale === "ar" ? "left" : "right";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={t("openMenu")}
          >
            <Menu className="size-5" aria-hidden />
          </Button>
        }
      />
      <SheetContent side={side} className="w-[min(20rem,85vw)]">
        <SheetHeader>
          <SheetTitle>{t("openMenu")}</SheetTitle>
        </SheetHeader>
        <nav className="mt-2 flex flex-col gap-1 px-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-3 text-base font-medium transition-colors hover:bg-muted"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-4 flex items-center gap-2 border-t border-border px-4 pt-4 sm:hidden">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </SheetContent>
    </Sheet>
  );
}
