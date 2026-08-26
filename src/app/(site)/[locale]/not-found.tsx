import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default async function LocaleNotFound() {
  const t = await getTranslations("notFound");
  const common = await getTranslations("common");

  return (
    <div className="container-content flex min-h-[60vh] flex-col items-center justify-center gap-5 py-20 text-center">
      <p className="text-6xl font-semibold text-brand-gold">404</p>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {t("title")}
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">{t("body")}</p>
      <Button nativeButton={false} render={<Link href="/" />}>
        {common("backToHome")}
      </Button>
    </div>
  );
}
