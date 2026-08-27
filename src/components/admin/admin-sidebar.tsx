"use client";

import {
  Building2,
  Home,
  Inbox,
  LayoutDashboard,
  LogOut,
  Settings,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";

import { AdminAvatar } from "@/components/admin/admin-identity";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

type AdminNavItem = {
  href: string;
  /** Indexes the `nav` namespace so the rail translates with the UI. */
  labelKey: "overview" | "projects" | "properties" | "enquiries" | "settings";
  Icon: typeof LayoutDashboard;
  /** Overview would otherwise match every nested admin path. */
  exact?: boolean;
};

export const adminNav: readonly AdminNavItem[] = [
  {
    href: "/dashboard-admin",
    labelKey: "overview",
    Icon: LayoutDashboard,
    exact: true,
  },
  { href: "/dashboard-admin/projects", labelKey: "projects", Icon: Building2 },
  { href: "/dashboard-admin/properties", labelKey: "properties", Icon: Home },
  { href: "/dashboard-admin/enquiries", labelKey: "enquiries", Icon: Inbox },
  { href: "/dashboard-admin/settings", labelKey: "settings", Icon: Settings },
];

type AdminSidebarProps = {
  name: string;
  email: string;
  avatarUrl: string | null;
  logoUrl: string | null;
  onNavigate?: () => void;
};

export function AdminSidebar({
  name,
  email,
  avatarUrl,
  logoUrl,
  onNavigate,
}: AdminSidebarProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <Link
        href="/dashboard-admin"
        className="px-2 py-2"
        aria-label={t("brandHome")}
        onClick={onNavigate}
      >
        {/* Honours site_settings.logo_path, exactly like the public header. */}
        <BrandLogo logoUrl={logoUrl} />
      </Link>

      <nav className="flex-1 space-y-1" aria-label={t("landmark")}>
        {adminNav.map(({ href, labelKey, Icon, exact }) => (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={isActive(href, exact) ? "page" : undefined}
            className={cn(
              "flex h-12 items-center gap-3 rounded-lg px-4 text-sm font-medium transition-colors",
              isActive(href, exact)
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {t(labelKey)}
          </Link>
        ))}
      </nav>

      <div className="space-y-2 border-t border-sidebar-border pt-4">
        <Link
          href="/dashboard-admin/settings/profile"
          onClick={onNavigate}
          aria-label={t("yourProfile")}
          className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-sidebar-accent/60"
        >
          <AdminAvatar avatarUrl={avatarUrl} alt="" size={32} />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">{name}</span>
            {/* Addresses stay LTR even in an Arabic console. */}
            <span
              dir="ltr"
              className="block truncate text-start text-xs text-muted-foreground"
            >
              {email}
            </span>
          </span>
        </Link>

        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground"
          disabled={pending}
          onClick={() => startTransition(() => void signOut())}
        >
          <LogOut className="size-4" aria-hidden />
          {t("signOut")}
        </Button>
      </div>
    </div>
  );
}
