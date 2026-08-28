import Link from "next/link";
import { notFound } from "next/navigation";

import { EnquiryActions } from "@/components/admin/enquiry-actions";
import { AdminPageTitle } from "@/components/admin/page-title";
import { StatusChip } from "@/components/admin/status-chip";
import { Button } from "@/components/ui/button";
import {
  ADMIN_INTL_LOCALE,
  getAdminLocale,
  getAdminTranslations,
} from "@/lib/admin-i18n";
import { getAdminEnquiry } from "@/lib/data/admin";

export async function generateMetadata() {
  const t = await getAdminTranslations("enquiries");
  return { title: t("detailMetaTitle") };
}

export default async function AdminEnquiryDetailPage({
  params,
}: PageProps<"/dashboard-admin/enquiries/[id]">) {
  const { id } = await params;
  const [t, common, locale, enquiry] = await Promise.all([
    getAdminTranslations("enquiries"),
    getAdminTranslations("common"),
    getAdminLocale(),
    getAdminEnquiry(id),
  ]);
  if (!enquiry) notFound();

  const received = new Date(enquiry.created_at).toLocaleString(
    ADMIN_INTL_LOCALE[locale],
    { dateStyle: "medium", timeStyle: "short" },
  );

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title={enquiry.name}
        description={t("receivedAt", { date: received })}
        actions={
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/dashboard-admin/enquiries" />}
          >
            {t("backToInbox")}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 font-semibold">{t("message")}</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {enquiry.message}
            </p>
          </section>

          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 font-semibold">{t("contact")}</h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {t("columnEmail")}
                </dt>
                <dd className="mt-1 text-sm" dir="ltr">
                  <a
                    href={`mailto:${enquiry.email}`}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {enquiry.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {t("columnPhone")}
                </dt>
                <dd className="mt-1 text-sm" dir="ltr">
                  {enquiry.phone ? (
                    <a
                      href={`tel:${enquiry.phone}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {enquiry.phone}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">{common("notProvided")}</span>
                  )}
                </dd>
              </div>
            </dl>
          </section>

          {enquiry.properties || enquiry.projects ? (
            <section className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 font-semibold">{t("relatedTo")}</h2>
              <ul className="space-y-2 text-sm">
                {enquiry.properties ? (
                  <li>
                    <Link
                      href={`/dashboard-admin/properties/${enquiry.properties.id}/edit`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {enquiry.properties.title_en}
                    </Link>
                    <span className="ms-2 font-mono text-xs text-muted-foreground">
                      {enquiry.properties.reference_code}
                    </span>
                  </li>
                ) : null}
                {enquiry.projects ? (
                  <li>
                    <Link
                      href={`/dashboard-admin/projects/${enquiry.projects.id}/edit`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {enquiry.projects.name_en}
                    </Link>
                  </li>
                ) : null}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 font-semibold">{t("statusHeading")}</h2>
          <StatusChip status={enquiry.status} className="mb-5 text-sm" />
          <EnquiryActions
            id={enquiry.id}
            name={enquiry.name}
            status={enquiry.status}
            presentation="detail"
          />
        </aside>
      </div>
    </div>
  );
}
