import { EmailForm, PasswordForm } from "@/components/admin/settings-forms";
import { getAdminTranslations } from "@/lib/admin-i18n";
import { requireAdmin } from "@/lib/supabase/admin";

export async function generateMetadata() {
  const t = await getAdminTranslations("settings");
  return { title: t("accountMetaTitle") };
}

export default async function AccountSettingsPage() {
  const [t, session] = await Promise.all([
    getAdminTranslations("settings"),
    requireAdmin(),
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="mb-5 space-y-1">
          <h2 className="font-semibold">{t("emailTitle")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("emailDescription")}
          </p>
        </div>
        <EmailForm currentEmail={session.email} />
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <div className="mb-5 space-y-1">
          <h2 className="font-semibold">{t("passwordTitle")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("passwordDescription")}
          </p>
        </div>
        <PasswordForm />
      </section>
    </div>
  );
}
