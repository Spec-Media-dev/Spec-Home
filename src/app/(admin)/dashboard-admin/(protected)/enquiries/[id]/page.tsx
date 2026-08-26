import Link from "next/link";
import { notFound } from "next/navigation";

import { EnquiryStatusControl } from "@/components/admin/enquiry-status-control";
import { AdminPageTitle } from "@/components/admin/page-title";
import { Button } from "@/components/ui/button";
import { getAdminEnquiry } from "@/lib/data/admin";

export const metadata = { title: "Enquiry" };

export default async function AdminEnquiryDetailPage({
  params,
}: PageProps<"/dashboard-admin/enquiries/[id]">) {
  const { id } = await params;
  const enquiry = await getAdminEnquiry(id);
  if (!enquiry) notFound();

  const received = new Date(enquiry.created_at).toLocaleString("en-AE", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title={enquiry.name}
        description={`Received ${received}`}
        actions={
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/dashboard-admin/enquiries" />}
          >
            Back to inbox
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 font-semibold">Message</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {enquiry.message}
            </p>
          </section>

          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 font-semibold">Contact</h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Email
                </dt>
                <dd className="mt-1 text-sm">
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
                  Phone
                </dt>
                <dd className="mt-1 text-sm">
                  {enquiry.phone ? (
                    <a
                      href={`tel:${enquiry.phone}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {enquiry.phone}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">Not provided</span>
                  )}
                </dd>
              </div>
            </dl>
          </section>

          {enquiry.properties || enquiry.projects ? (
            <section className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 font-semibold">Related to</h2>
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
          <h2 className="mb-4 font-semibold">Status</h2>
          <EnquiryStatusControl id={enquiry.id} status={enquiry.status} />
        </aside>
      </div>
    </div>
  );
}
