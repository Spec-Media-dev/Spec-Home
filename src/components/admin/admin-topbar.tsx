"use client";

import { Menu } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";

import { AdminAvatar } from "@/components/admin/admin-identity";
import { AdminLocaleSwitcher } from "@/components/admin/admin-locale-switcher";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminThemeToggle } from "@/components/admin/admin-theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type AdminTopbarProps = {
  name: string;
  email: string;
  avatarUrl: string | null;
  logoUrl: string | null;
};

export function AdminTopbar({
  name,
  email,
  avatarUrl,
  logoUrl,
}: AdminTopbarProps) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const [open, setOpen] = useState(false);

  // `side` is a physical edge, so it must mirror: the drawer always enters
  // from the same side the sidebar occupies on desktop.
  const side = locale === "ar" ? "right" : "left";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur sm:px-6">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label={t("openNavigation")}
            >
              <Menu className="size-5" aria-hidden />
            </Button>
          }
        />
        <SheetContent side={side} className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>{t("navigationTitle")}</SheetTitle>
          </SheetHeader>
          <AdminSidebar
            name={name}
            email={email}
            avatarUrl={avatarUrl}
            logoUrl={logoUrl}
            onNavigate={() => setOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="ms-auto flex items-center gap-1 sm:gap-2">
        <AdminLocaleSwitcher />
        <AdminThemeToggle />
        <Link
          href="/dashboard-admin/settings/profile"
          aria-label={t("yourProfile")}
          className="rounded-full ring-offset-background transition-opacity hover:opacity-80"
        >
          <AdminAvatar avatarUrl={avatarUrl} alt={t("avatarAlt")} size={32} />
        </Link>
      </div>
    </header>
  );
}
