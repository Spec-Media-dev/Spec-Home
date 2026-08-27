import Link from "next/link";

import { AdminPageTitle } from "@/components/admin/page-title";
import { PropertyForm } from "@/components/admin/property-form";
import { Button } from "@/components/ui/button";
import { getAdminTranslations } from "@/lib/admin-i18n";
import { getAdminProjectOptions } from "@/lib/data/admin";

export async function generateMetadata() {
  const t = await getAdminTranslations("properties");
  return { title: t("newMetaTitle") };
}

export default async function NewPropertyPage({
  searchParams,
}: PageProps<"/dashboard-admin/properties/new">) {
  const query = await searchParams;
  const [t, projects] = await Promise.all([
    getAdminTranslations("properties"),
    getAdminProjectOptions(),
  ]);

  // Properties cannot exist without a project, so the form is withheld
  // entirely rather than shown with an unsatisfiable required field.
  if (projects.length === 0) {
    return (
      <div className="space-y-6">
        <AdminPageTitle title={t("new")} />
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-lg font-medium">{t("noProjectsTitle")}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("noProjectsBody")}
          </p>
          <Button
            className="mt-6"
            nativeButton={false}
            render={<Link href="/dashboard-admin/projects/new" />}
          >
            {t("noProjectsAction")}
          </Button>
        </div>
      </div>
    );
  }

  const preset = Array.isArray(query.project)
    ? query.project[0]
    : query.project;

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title={t("new")}
        description={t("newDescription")}
      />
      <PropertyForm projects={projects} presetProjectId={preset} />
    </div>
  );
}
