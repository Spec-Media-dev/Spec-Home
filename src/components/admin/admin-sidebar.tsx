"use client";

import {
  Building2,
  Inbox,
  LayoutDashboard,
  LogOut,
  Settings,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";

import { BrandLogo } from "@/components/shared/brand-logo";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

export const adminNav = [
  {
    href: "/dashboard-admin",
    label: "Overview",
    Icon: LayoutDashboard,
    exact: true,
  },
  { href: "/dashboard-admin/projects", label: "Projects", Icon: Building2 },
  {
    href: "/dashboard-admin/properties",
    label: "Properties",
    Icon: LayoutDashboard,
  },
  { href: "/dashboard-admin/enquiries", label: "Lead Inbox", Icon: Inbox },
  { href: "/dashboard-admin/settings", label: "Settings", Icon: Settings },
];

type AdminSidebarProps = {
  name: string;
  email: string;
  avatarUrl: string | null;
  onNavigate?: () => void;
};

export function AdminSidebar({ name, email, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <Link href="/dashboard-admin" className="px-2 py-2" onClick={onNavigate}>
        <BrandLogo />
      </Link>

      <nav className="flex-1 space-y-1" aria-label="Admin">
        {adminNav.map(({ href, label, Icon, exact }) => (
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
            {label}
          </Link>
        ))}
      </nav>

      <div className="space-y-2 border-t border-sidebar-border pt-4">
        <Link
          href="/dashboard-admin/settings/profile"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-sidebar-accent/60"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
            <UserRound className="size-4" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">{name}</span>
            <span className="block truncate text-xs text-muted-foreground">
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
          Sign out
        </Button>
      </div>
    </div>
  );
}
