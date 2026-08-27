import Link from "next/link";

import { AdminPageTitle } from "@/components/admin/page-title";
import { getAdminTranslations } from "@/lib/admin-i18n";

const TABS = [
  { href: "/dashboard-admin/settings", labelKey: "tabSite" },
  { href: "/dashboard-admin/settings/profile", labelKey: "tabProfile" },
  { href: "/dashboard-admin/settings/account", labelKey: "tabAccount" },
] as const;

export default async function SettingsLayout({
  children,
}: LayoutProps<"/dashboard-admin/settings">) {
  const t = await getAdminTranslations("settings");

  return (
    <div className="space-y-6">
      <AdminPageTitle title={t("title")} />
      <nav className="flex flex-wrap gap-2" aria-label={t("sections")}>
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="rounded-full border border-border px-4 py-1.5 text-sm transition-colors hover:bg-muted"
          >
            {t(tab.labelKey)}
          </Link>
        ))}
      </nav>
      <div className="max-w-2xl">{children}</div>
    </div>
  );
}
