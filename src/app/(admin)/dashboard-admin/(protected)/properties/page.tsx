import Link from "next/link";

import { AdminPageTitle } from "@/components/admin/page-title";
import { PropertyRowActions } from "@/components/admin/property-row-actions";
import { StatusChip } from "@/components/admin/status-chip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminProperties } from "@/lib/data/admin";

export const metadata = { title: "Properties" };

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatPrice(price: number | null, currency: string) {
  if (price === null) return "On request";
  return `${currency} ${price.toLocaleString("en-AE")}`;
}

export default async function AdminPropertiesPage({
  searchParams,
}: PageProps<"/dashboard-admin/properties">) {
  const query = await searchParams;
  const properties = await getAdminProperties({
    projectId: first(query.project),
    status: first(query.status),
    published: first(query.published),
  });

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="Properties"
        description="Inventory across every project."
        actions={
          <Button
            nativeButton={false}
            render={<Link href="/dashboard-admin/properties/new" />}
          >
            New property
          </Button>
        }
      />

      {properties.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="font-medium">No properties found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a property, or clear the current filters.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead className="w-px" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell>
                    <Link
                      href={`/dashboard-admin/properties/${property.id}/edit`}
                      className="font-medium hover:underline"
                    >
                      {property.title_en}
                    </Link>
                    <span className="block text-xs text-muted-foreground">
                      {property.property_images.length} of 4 images
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {property.reference_code}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {property.projects?.name_en ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm tabular-nums">
                    {formatPrice(property.price, property.currency)}
                  </TableCell>
                  <TableCell>
                    <StatusChip status={property.status} />
                  </TableCell>
                  <TableCell>
                    <span className="flex flex-wrap gap-1.5">
                      <Badge
                        variant={property.is_published ? "default" : "outline"}
                      >
                        {property.is_published ? "Published" : "Draft"}
                      </Badge>
                      {property.is_featured ? (
                        <Badge className="bg-brand-gold text-brand-charcoal hover:bg-brand-gold">
                          Featured
                        </Badge>
                      ) : null}
                    </span>
                  </TableCell>
                  <TableCell>
                    <PropertyRowActions
                      id={property.id}
                      title={property.title_en}
                      isPublished={property.is_published}
                      isFeatured={property.is_featured}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
