import { notFound } from "next/navigation";

import { AdminPageTitle } from "@/components/admin/page-title";
import { ProjectForm } from "@/components/admin/project-form";
import { getAdminProject } from "@/lib/data/admin";

export const metadata = { title: "Edit project" };

export default async function EditProjectPage({
  params,
}: PageProps<"/dashboard-admin/projects/[id]/edit">) {
  const { id } = await params;
  const project = await getAdminProject(id);
  if (!project) notFound();

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title={project.name_en}
        description={
          project.is_published
            ? "This project is published — its URL is frozen and will not change when renamed."
            : "Draft. The URL slug is regenerated from the English name until published."
        }
      />
      <ProjectForm project={project} />
    </div>
  );
}
