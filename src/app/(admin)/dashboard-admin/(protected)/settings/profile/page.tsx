import { ProfileForm } from "@/components/admin/settings-forms";
import { getAdminTranslations } from "@/lib/admin-i18n";
import { requireAdmin } from "@/lib/supabase/admin";
import { storageUrl } from "@/lib/storage";

export async function generateMetadata() {
  const t = await getAdminTranslations("settings");
  return { title: t("profileMetaTitle") };
}

export default async function ProfileSettingsPage() {
  const [t, session] = await Promise.all([
    getAdminTranslations("settings"),
    requireAdmin(),
  ]);

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="mb-5 space-y-1">
        <h2 className="font-semibold">{t("profileTitle")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("profileDescription")}
        </p>
      </div>
      <ProfileForm
        name={session.profile.name}
        avatarUrl={storageUrl(session.profile.avatar_path)}
      />
    </section>
  );
}
