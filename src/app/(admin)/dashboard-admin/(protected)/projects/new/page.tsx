import { AdminPageTitle } from "@/components/admin/page-title";
import { ProjectForm } from "@/components/admin/project-form";
import { getAdminTranslations } from "@/lib/admin-i18n";

export async function generateMetadata() {
  const t = await getAdminTranslations("projects");
  return { title: t("newMetaTitle") };
}

export default async function NewProjectPage() {
  const t = await getAdminTranslations("projects");

  return (
    <div className="space-y-6">
      <AdminPageTitle title={t("new")} description={t("newDescription")} />
      <ProjectForm />
    </div>
  );
}
