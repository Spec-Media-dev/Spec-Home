"use client";

import { X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Locale } from "@/i18n/routing";

export type FilterOption = { value: string; label: string };

type PropertyFiltersProps = {
  basePath: string;
  projects: FilterOption[];
  types: FilterOption[];
  current: {
    project?: string;
    type?: string;
    beds?: string;
    status?: string;
    min?: string;
    max?: string;
  };
};

const ANY = "__any";
const BEDROOM_CHOICES = ["0", "1", "2", "3", "4", "5"];
const STATUS_CHOICES = ["available", "reserved", "sold"];

/**
 * All filter state lives in the URL, so results are shareable, crawlable as
 * links, and survive a reload. Navigation uses the plain router because the
 * localized prefix is already baked into `basePath`.
 */
export function PropertyFilters({
  basePath,
  projects,
  types,
  current,
}: PropertyFiltersProps) {
  const t = useTranslations("properties");
  const common = useTranslations("common");
  const statusT = useTranslations("propertyStatus");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const hasFilters = Object.values(current).some(Boolean);

  function apply(next: Partial<PropertyFiltersProps["current"]>) {
    const merged = { ...current, ...next };
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(merged)) {
      if (value) params.set(key, value);
    }
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${basePath}?${query}` : basePath, { scroll: false });
    });
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <Label htmlFor="filter-project">{t("filterProject")}</Label>
          <Select
            value={current.project ?? ANY}
            onValueChange={(value) =>
              apply({ project: value === ANY ? undefined : String(value) })
            }
          >
            <SelectTrigger id="filter-project">
              <SelectValue placeholder={t("filterAny")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>{t("filterAny")}</SelectItem>
              {projects.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filter-type">{t("filterType")}</Label>
          <Select
            value={current.type ?? ANY}
            onValueChange={(value) =>
              apply({ type: value === ANY ? undefined : String(value) })
            }
          >
            <SelectTrigger id="filter-type">
              <SelectValue placeholder={t("filterAny")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>{t("filterAny")}</SelectItem>
              {types.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filter-beds">{t("filterBedrooms")}</Label>
          <Select
            value={current.beds ?? ANY}
            onValueChange={(value) =>
              apply({ beds: value === ANY ? undefined : String(value) })
            }
          >
            <SelectTrigger id="filter-beds">
              <SelectValue placeholder={t("filterAny")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>{t("filterAny")}</SelectItem>
              {BEDROOM_CHOICES.map((value) => (
                <SelectItem key={value} value={value}>
                  {new Intl.NumberFormat(
                    locale === "ar" ? "ar-AE-u-nu-latn" : "en-AE",
                  ).format(Number(value))}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filter-status">{t("filterStatus")}</Label>
          <Select
            value={current.status ?? ANY}
            onValueChange={(value) =>
              apply({ status: value === ANY ? undefined : String(value) })
            }
          >
            <SelectTrigger id="filter-status">
              <SelectValue placeholder={t("filterAny")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>{t("filterAny")}</SelectItem>
              {STATUS_CHOICES.map((value) => (
                <SelectItem key={value} value={value}>
                  {statusT(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <form
        className="mt-4 flex flex-wrap items-end gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          apply({
            min: String(data.get("min") ?? "") || undefined,
            max: String(data.get("max") ?? "") || undefined,
          });
        }}
      >
        <div className="w-full space-y-1.5 sm:w-36">
          <Label htmlFor="filter-min">{t("minPrice")}</Label>
          <Input
            id="filter-min"
            name="min"
            type="number"
            min={0}
            inputMode="numeric"
            dir="ltr"
            defaultValue={current.min ?? ""}
          />
        </div>
        <div className="w-full space-y-1.5 sm:w-36">
          <Label htmlFor="filter-max">{t("maxPrice")}</Label>
          <Input
            id="filter-max"
            name="max"
            type="number"
            min={0}
            inputMode="numeric"
            dir="ltr"
            defaultValue={current.max ?? ""}
          />
        </div>
        <Button type="submit" variant="secondary" disabled={pending}>
          {common("apply")}
        </Button>
        {hasFilters ? (
          <Button
            type="button"
            variant="ghost"
            disabled={pending}
            onClick={() =>
              startTransition(() => router.push(basePath, { scroll: false }))
            }
          >
            <X className="size-4" aria-hidden />
            {common("clearAll")}
          </Button>
        ) : null}
      </form>
    </div>
  );
}
