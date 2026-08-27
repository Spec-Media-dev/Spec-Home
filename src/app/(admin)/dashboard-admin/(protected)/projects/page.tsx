import Link from "next/link";

import { AdminPageTitle } from "@/components/admin/page-title";
import { ProjectRowActions } from "@/components/admin/project-row-actions";
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
import { getAdminTranslations } from "@/lib/admin-i18n";
import { getAdminProjects } from "@/lib/data/admin";

export async function generateMetadata() {
  const t = await getAdminTranslations("projects");
  return { title: t("metaTitle") };
}

export default async function AdminProjectsPage() {
  const [t, common, projects] = await Promise.all([
    getAdminTranslations("projects"),
    getAdminTranslations("common"),
    getAdminProjects(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title={t("title")}
        description={t("description")}
        actions={
          <Button
            nativeButton={false}
            render={<Link href="/dashboard-admin/projects/new" />}
          >
            {t("new")}
          </Button>
        }
      />

      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="font-medium">{t("emptyTitle")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("emptyBody")}
          </p>
          <Button
            className="mt-5"
            nativeButton={false}
            render={<Link href="/dashboard-admin/projects/new" />}
          >
            {t("emptyAction")}
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("columnProject")}</TableHead>
                <TableHead>{t("columnDeveloper")}</TableHead>
                <TableHead>{t("columnStatus")}</TableHead>
                <TableHead>{t("columnCover")}</TableHead>
                <TableHead>{t("columnVisibility")}</TableHead>
                <TableHead className="w-px" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <Link
                      href={`/dashboard-admin/projects/${project.id}/edit`}
                      className="font-medium hover:underline"
                    >
                      {project.name_en}
                    </Link>
                    <span className="block text-xs text-muted-foreground">
                      {project.name_ar}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {project.developer_en}
                  </TableCell>
                  <TableCell>
                    <StatusChip status={project.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {project.cover_image_path ? "—" : t("coverMissing")}
                  </TableCell>
                  <TableCell>
                    <span className="flex flex-wrap gap-1.5">
                      <Badge
                        variant={project.is_published ? "default" : "outline"}
                      >
                        {project.is_published
                          ? common("published")
                          : common("draft")}
                      </Badge>
                      {project.is_featured ? (
                        <Badge className="bg-brand-gold text-brand-charcoal hover:bg-brand-gold">
                          {common("featured")}
                        </Badge>
                      ) : null}
                    </span>
                  </TableCell>
                  <TableCell>
                    <ProjectRowActions
                      id={project.id}
                      name={project.name_en}
                      isPublished={project.is_published}
                      isFeatured={project.is_featured}
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
