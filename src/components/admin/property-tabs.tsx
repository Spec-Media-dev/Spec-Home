import Link from "next/link";

import { cn } from "@/lib/utils";

const TABS = [
  { key: "edit", label: "Details", path: "edit" },
  { key: "images", label: "Images", path: "images" },
  { key: "specs", label: "Specifications", path: "specs" },
] as const;

export function PropertyTabs({
  id,
  active,
}: {
  id: string;
  active: (typeof TABS)[number]["key"];
}) {
  return (
    <nav
      className="flex gap-1 border-b border-border"
      aria-label="Property sections"
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
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
