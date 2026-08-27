import { redirect } from "next/navigation";

import { AdminLocaleSwitcher } from "@/components/admin/admin-locale-switcher";
import { AdminThemeToggle } from "@/components/admin/admin-theme-toggle";
import { LoginForm } from "@/components/admin/login-form";
import { BrandLogo } from "@/components/shared/brand-logo";
import { getAdminTranslations } from "@/lib/admin-i18n";
import { getSiteSettings } from "@/lib/data/settings";
import { storageUrl } from "@/lib/storage";
import { getAdminSession } from "@/lib/supabase/admin";

export async function generateMetadata() {
  const t = await getAdminTranslations("login");
  return { title: t("metaTitle") };
}

export default async function AdminLoginPage() {
  // Already an admin? Skip the form.
  if (await getAdminSession()) redirect("/dashboard-admin");

  const [t, settings] = await Promise.all([
    getAdminTranslations("login"),
    getSiteSettings(),
  ]);

  return (
    <main className="flex min-h-dvh flex-col bg-muted/40 p-4">
      {/*
       * Language and theme belong here, not only inside the signed-in shell:
       * an admin who left the console in Arabic has to be able to read their
       * way back to English before they can sign in. Both are preferences with
       * no privilege attached, so neither needs a session.
       */}
      <div className="flex justify-end gap-1">
        <AdminLocaleSwitcher />
        <AdminThemeToggle />
      </div>

      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-sm space-y-6 rounded-xl border border-border bg-card p-8 shadow-sm">
          <div className="space-y-2 text-center">
            <div className="flex justify-center">
              {/* The sign-in screen shows the admin's own logo, not a default. */}
              <BrandLogo logoUrl={storageUrl(settings?.logo_path)} priority />
            </div>
            <h1 className="text-lg font-semibold">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
