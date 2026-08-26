import Link from "next/link";

import { AdminPageTitle } from "@/components/admin/page-title";
import { PropertyForm } from "@/components/admin/property-form";
import { Button } from "@/components/ui/button";
import { getAdminProjectOptions } from "@/lib/data/admin";

export const metadata = { title: "New property" };

export default async function NewPropertyPage({
  searchParams,
}: PageProps<"/dashboard-admin/properties/new">) {
  const query = await searchParams;
  const projects = await getAdminProjectOptions();

  // Properties cannot exist without a project, so the form is withheld
  // entirely rather than shown with an unsatisfiable required field.
  if (projects.length === 0) {
    return (
      <div className="space-y-6">
        <AdminPageTitle title="New property" />
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-lg font-medium">No Projects available</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Properties must belong to a Project.
          </p>
          <Button
            className="mt-6"
            nativeButton={false}
            render={<Link href="/dashboard-admin/projects/new" />}
          >
            Create Project First
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
        title="New property"
        description="Reference code and URL slug are generated automatically."
      />
      <PropertyForm projects={projects} presetProjectId={preset} />
    </div>
  );
}
