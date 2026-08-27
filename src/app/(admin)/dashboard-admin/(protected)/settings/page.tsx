import { LogoForm } from "@/components/admin/settings-forms";
import { getAdminTranslations } from "@/lib/admin-i18n";
import { getSiteSettings } from "@/lib/data/settings";
import { storageUrl } from "@/lib/storage";

export async function generateMetadata() {
  const t = await getAdminTranslations("settings");
  return { title: t("siteMetaTitle") };
}

export default async function SiteSettingsPage() {
  const [t, settings] = await Promise.all([
    getAdminTranslations("settings"),
    getSiteSettings(),
  ]);

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="mb-5 space-y-1">
        <h2 className="font-semibold">{t("logoTitle")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("logoDescription")}
        </p>
      </div>
      <LogoForm logoUrl={storageUrl(settings?.logo_path)} />
    </section>
  );
}
