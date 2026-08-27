"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchField({
  basePath,
  defaultValue = "",
}: {
  basePath: string;
  defaultValue?: string;
}) {
  const t = useTranslations("search");
  const common = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // Controlled for the same reason as the profile name field: `defaultValue`
  // seeds only the first render, so navigating between two result pages would
  // leave the previous query in the box and warn about a changed default.
  const [query, setQuery] = useState(defaultValue);
  const [syncedValue, setSyncedValue] = useState(defaultValue);

  if (defaultValue !== syncedValue) {
    setSyncedValue(defaultValue);
    setQuery(defaultValue);
  }

  return (
    <form
      role="search"
      className="flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        const value = query.trim();
        startTransition(() => {
          router.push(
            value ? `${basePath}?q=${encodeURIComponent(value)}` : basePath,
          );
        });
      }}
    >
      <Input
        name="q"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t("placeholder")}
        aria-label={t("placeholder")}
        className="h-11"
      />
      <Button type="submit" className="h-11 gap-2" disabled={pending}>
        <Search className="size-4" aria-hidden />
        <span className="hidden sm:inline">{common("search")}</span>
      </Button>
    </form>
  );
}
