import { getTranslations } from "next-intl/server";

import { BrandLogo } from "@/components/shared/brand-logo";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { MobileNav } from "@/components/site/mobile-nav";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getSiteSettings } from "@/lib/data/settings";
import { storageUrl } from "@/lib/storage";

export const navItems = [
  { href: "/", key: "home" },
  { href: "/projects", key: "projects" },
  { href: "/properties", key: "properties" },
  { href: "/search", key: "search" },
  { href: "/contact", key: "contact" },
] as const;

export async function SiteHeader() {
  const t = await getTranslations("nav");
  const common = await getTranslations("common");
  const settings = await getSiteSettings();
  const logoUrl = storageUrl(settings?.logo_path);

  const links = navItems.map((item) => ({
    href: item.href,
    label: t(item.key),
  }));

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container-content flex h-20 items-center gap-4">
        <Link href="/" className="shrink-0" aria-label={common("brandName")}>
          <BrandLogo logoUrl={logoUrl} priority />
        </Link>

        <nav
          aria-label={common("brandShort")}
          className="ms-auto hidden items-center gap-8 lg:flex"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-1 lg:ms-0 lg:gap-2">
          <div className="hidden sm:flex sm:items-center sm:gap-1">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
          <Button
            size="sm"
            className="hidden lg:inline-flex"
            nativeButton={false}
            render={<Link href="/contact" />}
          >
            {common("enquire")}
          </Button>
          <MobileNav links={links} />
        </div>
      </div>
    </header>
  );
}
