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
import {
  ADMIN_INTL_LOCALE,
  getAdminLocale,
  getAdminTranslations,
} from "@/lib/admin-i18n";
import { getAdminEnquiries } from "@/lib/data/admin";
import { ENQUIRY_STATUSES } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

export async function generateMetadata() {
  const t = await getAdminTranslations("enquiries");
  return { title: t("metaTitle") };
}

export default async function AdminEnquiriesPage({
  searchParams,
}: PageProps<"/dashboard-admin/enquiries">) {
  const query = await searchParams;
  const status = Array.isArray(query.status) ? query.status[0] : query.status;

  const [t, common, statusLabel, locale, enquiries] = await Promise.all([
    getAdminTranslations("enquiries"),
    getAdminTranslations("common"),
    getAdminTranslations("enquiryStatus"),
    getAdminLocale(),
    getAdminEnquiries(status),
  ]);

  const filters: { value?: string; label: string }[] = [
    { label: common("all") },
    ...ENQUIRY_STATUSES.map((value) => ({ value, label: statusLabel(value) })),
  ];

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title={t("title")}
        description={t("description")}
      />

      <nav className="flex flex-wrap gap-2" aria-label={t("filterLabel")}>
        {filters.map((filter) => (
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
          <p className="font-medium">{t("emptyTitle")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("emptyBody")}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("columnName")}</TableHead>
                <TableHead>{t("columnEmail")}</TableHead>
                <TableHead>{t("columnPhone")}</TableHead>
                <TableHead>{t("columnRelated")}</TableHead>
                <TableHead>{t("columnStatus")}</TableHead>
                <TableHead>{t("columnReceived")}</TableHead>
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
                  <TableCell
                    dir="ltr"
                    className="text-start text-sm text-muted-foreground"
                  >
                    {enquiry.email}
                  </TableCell>
                  <TableCell
                    dir="ltr"
                    className="text-start text-sm text-muted-foreground"
                  >
                    {enquiry.phone ?? common("none")}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {enquiry.properties?.title_en ??
                      enquiry.projects?.name_en ??
                      t("general")}
                  </TableCell>
                  <TableCell>
                    <StatusChip status={enquiry.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(enquiry.created_at).toLocaleDateString(
                      ADMIN_INTL_LOCALE[locale],
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      },
                    )}
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
