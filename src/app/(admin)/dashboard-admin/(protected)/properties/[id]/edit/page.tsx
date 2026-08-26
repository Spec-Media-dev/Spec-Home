import { notFound } from "next/navigation";

import { AdminPageTitle } from "@/components/admin/page-title";
import { PropertyForm } from "@/components/admin/property-form";
import { PropertyTabs } from "@/components/admin/property-tabs";
import { getAdminProjectOptions, getAdminProperty } from "@/lib/data/admin";

export const metadata = { title: "Edit property" };

export default async function EditPropertyPage({
  params,
}: PageProps<"/dashboard-admin/properties/[id]/edit">) {
  const { id } = await params;
  const [property, projects] = await Promise.all([
    getAdminProperty(id),
    getAdminProjectOptions(),
  ]);

  if (!property) notFound();

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title={property.title_en}
        description={`Reference ${property.reference_code}`}
      />
      <PropertyTabs id={id} active="edit" />
      <PropertyForm
        property={property}
        projects={projects}
        imageCount={property.property_images.length}
      />
    </div>
  );
}
