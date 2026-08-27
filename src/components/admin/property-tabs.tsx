import Link from "next/link";

import { getAdminTranslations } from "@/lib/admin-i18n";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "edit", labelKey: "tabDetails", path: "edit" },
  { key: "images", labelKey: "tabImages", path: "images" },
  { key: "specs", labelKey: "tabSpecs", path: "specs" },
] as const;

export async function PropertyTabs({
  id,
  active,
}: {
  id: string;
  active: (typeof TABS)[number]["key"];
}) {
  const t = await getAdminTranslations("properties");

  return (
    <nav
      className="flex gap-1 border-b border-border"
      aria-label={t("sections")}
    >
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={`/dashboard-admin/properties/${id}/${tab.path}`}
          aria-current={tab.key === active ? "page" : undefined}
          className={cn(
            "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
            tab.key === active
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          {t(tab.labelKey)}
        </Link>
      ))}
    </nav>
  );
}
