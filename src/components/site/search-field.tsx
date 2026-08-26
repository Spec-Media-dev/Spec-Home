"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

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

  return (
    <form
      role="search"
      className="flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        const value = String(
          new FormData(event.currentTarget).get("q") ?? "",
        ).trim();
        startTransition(() => {
          router.push(
            value ? `${basePath}?q=${encodeURIComponent(value)}` : basePath,
          );
        });
      }}
    >
      <Input
        name="q"
        defaultValue={defaultValue}
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
