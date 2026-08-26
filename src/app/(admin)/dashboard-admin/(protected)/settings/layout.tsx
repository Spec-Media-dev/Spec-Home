import Link from "next/link";

import { AdminPageTitle } from "@/components/admin/page-title";

const TABS = [
  { href: "/dashboard-admin/settings", label: "Site" },
  { href: "/dashboard-admin/settings/profile", label: "Profile" },
  { href: "/dashboard-admin/settings/password", label: "Password" },
];

export default function SettingsLayout({
  children,
}: LayoutProps<"/dashboard-admin/settings">) {
  return (
    <div className="space-y-6">
      <AdminPageTitle title="Settings" />
      <nav className="flex flex-wrap gap-2" aria-label="Settings sections">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="rounded-full border border-border px-4 py-1.5 text-sm transition-colors hover:bg-muted"
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      <div className="max-w-2xl">{children}</div>
    </div>
  );
}
