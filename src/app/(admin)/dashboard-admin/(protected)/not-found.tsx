import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getAdminTranslations } from "@/lib/admin-i18n";

export default async function AdminNotFound() {
  const t = await getAdminTranslations("notFound");

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-5xl font-semibold text-brand-gold">{t("code")}</p>
      <h1 className="text-xl font-semibold">{t("title")}</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        {t("body")}
      </p>
      <Button nativeButton={false} render={<Link href="/dashboard-admin" />}>
        {t("action")}
      </Button>
    </div>
  );
}
