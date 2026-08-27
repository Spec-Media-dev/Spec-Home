"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

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
import {
  propertyFilterQuery,
  toPropertyFilterState,
  type PropertyFilterState,
} from "@/lib/property-filter-state";

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
  const [draft, setDraft] = useState<PropertyFilterState>(() =>
    toPropertyFilterState(current),
  );

  const hasFilters = Object.values(current).some(Boolean);
  const hasDraftFilters = Object.values(draft).some(
    (value) => value !== "" && value !== null,
  );
  const projectItems = [
    { value: null, label: t("allProjects") },
    ...projects,
  ];
  const typeItems = [
    { value: null, label: t("allPropertyTypes") },
    ...types,
  ];
  const bedroomItems = [
    { value: null, label: t("anyBedrooms") },
    ...BEDROOM_CHOICES.map((value) => ({
      value,
      label: new Intl.NumberFormat(
        locale === "ar" ? "ar-AE-u-nu-latn" : "en-AE",
      ).format(Number(value)),
    })),
  ];
  const statusItems = [
    { value: null, label: t("allStatuses") },
    ...STATUS_CHOICES.map((value) => ({ value, label: statusT(value) })),
  ];

  function apply() {
    const query = propertyFilterQuery(draft);
    startTransition(() => {
      router.push(query ? `${basePath}?${query}` : basePath, { scroll: false });
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm ring-1 ring-brand-navy/5 sm:p-6 dark:ring-white/5">
      <div className="mb-6 flex items-start gap-3 border-b border-border pb-5">
        <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-gold/15 text-brand-navy dark:text-brand-gold">
          <SlidersHorizontal className="size-4" aria-hidden />
        </span>
        <div>
          <h2 className="font-semibold text-brand-navy dark:text-foreground">
            {t("filtersTitle")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("filtersHint")}
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-1.5">
          <Label htmlFor="filter-project">{t("filterProject")}</Label>
          <Select
            items={projectItems}
            value={draft.project}
            onValueChange={(value) =>
              setDraft((previous) => ({
                ...previous,
                project: value === null ? null : String(value),
              }))
            }
          >
            <SelectTrigger id="filter-project" className="h-11 w-full">
              <SelectValue placeholder={t("allProjects")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>{t("allProjects")}</SelectItem>
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
            items={typeItems}
            value={draft.type}
            onValueChange={(value) =>
              setDraft((previous) => ({
                ...previous,
                type: value === null ? null : String(value),
              }))
            }
          >
            <SelectTrigger id="filter-type" className="h-11 w-full">
              <SelectValue placeholder={t("allPropertyTypes")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>{t("allPropertyTypes")}</SelectItem>
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
            items={bedroomItems}
            value={draft.beds}
            onValueChange={(value) =>
              setDraft((previous) => ({
                ...previous,
                beds: value === null ? null : String(value),
              }))
            }
          >
            <SelectTrigger id="filter-beds" className="h-11 w-full">
              <SelectValue placeholder={t("anyBedrooms")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>{t("anyBedrooms")}</SelectItem>
              {bedroomItems.slice(1).map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filter-status">{t("filterStatus")}</Label>
          <Select
            items={statusItems}
            value={draft.status}
            onValueChange={(value) =>
              setDraft((previous) => ({
                ...previous,
                status: value === null ? null : String(value),
              }))
            }
          >
            <SelectTrigger id="filter-status" className="h-11 w-full">
              <SelectValue placeholder={t("allStatuses")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>{t("allStatuses")}</SelectItem>
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
        className="mt-6 grid items-end gap-4 border-t border-border pt-5 sm:grid-cols-2 lg:grid-cols-[minmax(0,11rem)_minmax(0,11rem)_auto_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          apply();
        }}
      >
        <div className="w-full space-y-1.5">
          <Label htmlFor="filter-min">{t("minPrice")}</Label>
          <Input
            id="filter-min"
            name="min"
            type="number"
            min={0}
            inputMode="numeric"
            dir="ltr"
            placeholder={t("minPricePlaceholder")}
            className="h-11"
            value={draft.min}
            onChange={(event) =>
              setDraft((previous) => ({
                ...previous,
                min: event.target.value,
              }))
            }
          />
        </div>
        <div className="w-full space-y-1.5">
          <Label htmlFor="filter-max">{t("maxPrice")}</Label>
          <Input
            id="filter-max"
            name="max"
            type="number"
            min={0}
            inputMode="numeric"
            dir="ltr"
            placeholder={t("maxPricePlaceholder")}
            className="h-11"
            value={draft.max}
            onChange={(event) =>
              setDraft((previous) => ({
                ...previous,
                max: event.target.value,
              }))
            }
          />
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={pending}
          className="lg:justify-self-start"
        >
          {common("apply")}
        </Button>
        {hasFilters || hasDraftFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="lg:justify-self-start"
            disabled={pending}
            onClick={() => {
              setDraft(toPropertyFilterState({}));
              startTransition(() => router.push(basePath, { scroll: false }));
            }}
          >
            <X className="size-4" aria-hidden />
            {t("clearFilters")}
          </Button>
        ) : null}
      </form>
    </div>
  );
}
