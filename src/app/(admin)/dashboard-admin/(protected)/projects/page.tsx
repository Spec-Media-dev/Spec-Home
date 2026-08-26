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
import { getAdminProjects } from "@/lib/data/admin";

export const metadata = { title: "Projects" };

export default async function AdminProjectsPage() {
  const projects = await getAdminProjects();

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="Projects"
        description="Every property must belong to a project."
        actions={
          <Button
            nativeButton={false}
            render={<Link href="/dashboard-admin/projects/new" />}
          >
            New project
          </Button>
        }
      />

      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="font-medium">No projects yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first project to start adding properties.
          </p>
          <Button
            className="mt-5"
            nativeButton={false}
            render={<Link href="/dashboard-admin/projects/new" />}
          >
            Create project
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Developer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Visibility</TableHead>
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
                  <TableCell>
                    <span className="flex flex-wrap gap-1.5">
                      <Badge
                        variant={project.is_published ? "default" : "outline"}
                      >
                        {project.is_published ? "Published" : "Draft"}
                      </Badge>
                      {project.is_featured ? (
                        <Badge className="bg-brand-gold text-brand-charcoal hover:bg-brand-gold">
                          Featured
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
