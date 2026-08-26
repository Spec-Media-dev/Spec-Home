import Link from "next/link";

import { AdminPageTitle } from "@/components/admin/page-title";
import { StatusChip } from "@/components/admin/status-chip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminEnquiries } from "@/lib/data/admin";
import { ENQUIRY_STATUSES } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

export const metadata = { title: "Lead Inbox" };

const FILTERS: { value?: string; label: string }[] = [
  { label: "All" },
  ...ENQUIRY_STATUSES.map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1),
  })),
];

export default async function AdminEnquiriesPage({
  searchParams,
}: PageProps<"/dashboard-admin/enquiries">) {
  const query = await searchParams;
  const status = Array.isArray(query.status) ? query.status[0] : query.status;
  const enquiries = await getAdminEnquiries(status);

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="Lead Inbox"
        description="Enquiries submitted from the public site."
      />

      <nav className="flex flex-wrap gap-2" aria-label="Filter by status">
        {FILTERS.map((filter) => (
          <Link
            key={filter.label}
            href={
              filter.value
                ? `/dashboard-admin/enquiries?status=${filter.value}`
                : "/dashboard-admin/enquiries"
            }
            aria-current={status === filter.value ? "page" : undefined}
            className={cn(
              "rounded-full border border-border px-4 py-1.5 text-sm transition-colors",
              status === filter.value
                ? "border-primary bg-primary text-primary-foreground"
                : "hover:bg-muted",
            )}
          >
            {filter.label}
          </Link>
        ))}
      </nav>

      {enquiries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="font-medium">No enquiries</p>
          <p className="mt-1 text-sm text-muted-foreground">
            New enquiries from the public site appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Related to</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Received</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enquiries.map((enquiry) => (
                <TableRow key={enquiry.id}>
                  <TableCell>
                    <Link
                      href={`/dashboard-admin/enquiries/${enquiry.id}`}
                      className="font-medium hover:underline"
                    >
                      {enquiry.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {enquiry.email}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {enquiry.phone ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {enquiry.properties?.title_en ??
                      enquiry.projects?.name_en ??
                      "General"}
                  </TableCell>
                  <TableCell>
                    <StatusChip status={enquiry.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(enquiry.created_at).toLocaleDateString("en-AE", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
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
