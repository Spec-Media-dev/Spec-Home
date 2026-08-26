import { notFound } from "next/navigation";

import { AdminPageTitle } from "@/components/admin/page-title";
import { PropertyTabs } from "@/components/admin/property-tabs";
import { SpecEditor } from "@/components/admin/spec-editor";
import { getAdminProperty } from "@/lib/data/admin";

export const metadata = { title: "Property specifications" };

export default async function PropertySpecsPage({
  params,
}: PageProps<"/dashboard-admin/properties/[id]/specs">) {
  const { id } = await params;
  const property = await getAdminProperty(id);
  if (!property) notFound();

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title={property.title_en}
        description="Optional. Rows appear in the order shown here."
      />
      <PropertyTabs id={id} active="specs" />
      <SpecEditor
        propertyId={id}
        initialSpecs={property.property_specs.map((spec) => ({
          key_en: spec.key_en,
          key_ar: spec.key_ar,
          value_en: spec.value_en,
          value_ar: spec.value_ar,
        }))}
      />
    </div>
  );
}
