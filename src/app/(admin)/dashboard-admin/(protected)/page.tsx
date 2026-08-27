import Link from "next/link";

import { KpiCard } from "@/components/admin/kpi-card";
import { AdminPageTitle } from "@/components/admin/page-title";
import { StatusChip } from "@/components/admin/status-chip";
import { Button } from "@/components/ui/button";
import { getAdminTranslations } from "@/lib/admin-i18n";
import { getAdminStats, getRecentEnquiries } from "@/lib/data/admin";

export async function generateMetadata() {
  const t = await getAdminTranslations("overview");
  return { title: t("title") };
}

export default async function AdminOverviewPage() {
  const [t, projects, stats, recent] = await Promise.all([
    getAdminTranslations("overview"),
    getAdminTranslations("projects"),
    getAdminStats(),
    getRecentEnquiries(6),
  ]);

  return (
    <div className="space-y-8">
      <AdminPageTitle
        title={t("title")}
        description={t("description")}
        actions={
          <>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/dashboard-admin/projects/new" />}
            >
              {projects("new")}
            </Button>
            <Button
              nativeButton={false}
              render={<Link href="/dashboard-admin/properties/new" />}
            >
              {t("newProperty")}
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          label={t("kpiProjects")}
          value={stats.projects}
          href="/dashboard-admin/projects"
        />
        <KpiCard
          label={t("kpiProperties")}
          value={stats.properties}
          href="/dashboard-admin/properties"
        />
        <KpiCard
          label={t("kpiPublished")}
          value={stats.published}
          href="/dashboard-admin/properties?published=true"
        />
        <KpiCard label={t("kpiFeatured")} value={stats.featured} />
        <KpiCard
          label={t("kpiNewEnquiries")}
          value={stats.newEnquiries}
          href="/dashboard-admin/enquiries?status=new"
          accent
        />
      </div>

      <section className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="font-semibold">{t("recentEnquiries")}</h2>
          <Link
            href="/dashboard-admin/enquiries"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {t("viewAll")}
          </Link>
        </div>

        {recent.length > 0 ? (
          <ul className="divide-y divide-border">
            {recent.map((enquiry) => (
              <li key={enquiry.id}>
                <Link
                  href={`/dashboard-admin/enquiries/${enquiry.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 p-5 transition-colors hover:bg-muted/40"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      {enquiry.name}
                    </span>
                    <span
                      dir="ltr"
                      className="block truncate text-start text-sm text-muted-foreground"
                    >
                      {enquiry.email}
                    </span>
                  </span>
                  <StatusChip status={enquiry.status} />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-10 text-center text-sm text-muted-foreground">
            {t("noEnquiries")}
          </p>
        )}
      </section>
    </div>
  );
}
