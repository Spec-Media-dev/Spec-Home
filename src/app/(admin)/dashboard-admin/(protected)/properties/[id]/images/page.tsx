import { notFound } from "next/navigation";

import { ImageManager } from "@/components/admin/image-manager";
import { AdminPageTitle } from "@/components/admin/page-title";
import { PropertyTabs } from "@/components/admin/property-tabs";
import { getAdminProperty } from "@/lib/data/admin";
import { storageUrl } from "@/lib/storage";

export const metadata = { title: "Property images" };

export default async function PropertyImagesPage({
  params,
}: PageProps<"/dashboard-admin/properties/[id]/images">) {
  const { id } = await params;
  const property = await getAdminProperty(id);
  if (!property) notFound();

  const images = property.property_images
    .map((image) => ({
      id: image.id,
      url: storageUrl(image.image_url),
      isCover: image.is_cover,
    }))
    .filter((image): image is { id: string; url: string; isCover: boolean } =>
      Boolean(image.url),
    );

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title={property.title_en}
        description={`Reference ${property.reference_code}`}
      />
      <PropertyTabs id={id} active="images" />
      <ImageManager
        propertyId={id}
        images={images}
        isPublished={property.is_published}
      />
    </div>
  );
}
