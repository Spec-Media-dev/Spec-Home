"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Scope = "properties" | "projects";

/**
 * Design #1 supplies the offset search bar; Design #2 contributes the explicit
 * Projects/Properties segmentation, since Projects must be a first-class
 * discovery path rather than a secondary filter.
 */
export function HeroSearch({ className }: { className?: string }) {
  const t = useTranslations("home");
  const common = useTranslations("common");
  const router = useRouter();
  const [scope, setScope] = useState<Scope>("properties");
  const [query, setQuery] = useState("");

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    const params = new URLSearchParams({ type: scope });
    if (trimmed) params.set("q", trimmed);
    router.push(`/search?${params.toString()}`);
  }

  const scopes: { id: Scope; label: string }[] = [
    { id: "properties", label: t("searchProperties") },
    { id: "projects", label: t("searchProjects") },
  ];

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      className={cn(
        "w-full rounded-xl border border-border bg-card/95 p-2 shadow-xl backdrop-blur",
        className,
      )}
    >
      <div
        className="flex gap-1 p-1"
        role="tablist"
        aria-label={common("search")}
      >
        {scopes.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={scope === item.id}
            onClick={() => setScope(item.id)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              scope === item.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 p-1 sm:flex-row">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchPlaceholder")}
          className="h-12 flex-1 border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
        />
        <Button type="submit" size="lg" className="h-12 gap-2 sm:w-auto">
          <Search className="size-4" aria-hidden />
          {common("search")}
        </Button>
      </div>
    </form>
  );
}
