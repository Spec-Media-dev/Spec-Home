"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * Keeps English and Arabic inputs visually separate and applies the correct
 * direction to each, so Arabic text is authored RTL even though the admin
 * console itself is LTR.
 */
export function BilingualTabs({
  english,
  arabic,
}: {
  english: React.ReactNode;
  arabic: React.ReactNode;
}) {
  return (
    <Tabs defaultValue="en" className="w-full">
      <TabsList>
        <TabsTrigger value="en">English</TabsTrigger>
        <TabsTrigger value="ar">العربية</TabsTrigger>
      </TabsList>
      <TabsContent value="en" dir="ltr" className="space-y-4 pt-4">
        {english}
      </TabsContent>
      <TabsContent value="ar" dir="rtl" className="space-y-4 pt-4">
        {arabic}
      </TabsContent>
    </Tabs>
  );
}
