import { AdminPageTitle } from "@/components/admin/page-title";
import { ProjectForm } from "@/components/admin/project-form";

export const metadata = { title: "New project" };

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="New project"
        description="The URL slug is generated from the English name."
      />
      <ProjectForm />
    </div>
  );
}
