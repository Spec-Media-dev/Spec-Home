"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";

type BilingualTabsProps = {
  english: React.ReactNode;
  arabic: React.ReactNode;
  /** Controlled so a validation failure can open the tab that owns the field. */
  value?: "en" | "ar";
  onValueChange?: (value: "en" | "ar") => void;
};

/**
 * Keeps English and Arabic inputs visually separate and applies the correct
 * direction to each.
 *
 * The direction of a *content* field follows the language of the content, not
 * the language of the console: Arabic copy is authored RTL even when the admin
 * UI is English, and English copy stays LTR even when the UI is Arabic.
 */
export function BilingualTabs({
  english,
  arabic,
  value,
  onValueChange,
}: BilingualTabsProps) {
  const t = useTranslations("form");

  return (
    <Tabs
      value={value}
      defaultValue={value ? undefined : "en"}
      onValueChange={(next) => onValueChange?.(next as "en" | "ar")}
      className="w-full"
    >
      <TabsList>
        <TabsTrigger value="en">{t("english")}</TabsTrigger>
        <TabsTrigger value="ar">{t("arabic")}</TabsTrigger>
      </TabsList>
      <TabsContent value="en" dir="ltr" className="space-y-4 pt-4 text-start">
        {english}
      </TabsContent>
      <TabsContent value="ar" dir="rtl" className="space-y-4 pt-4 text-start">
        {arabic}
      </TabsContent>
    </Tabs>
  );
}
