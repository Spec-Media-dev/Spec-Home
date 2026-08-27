"use client";

import { MoreHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  deleteProject,
  setProjectFeatured,
  setProjectPublished,
} from "@/lib/actions/projects";

type ProjectRowActionsProps = {
  id: string;
  name: string;
  isPublished: boolean;
  isFeatured: boolean;
};

export function ProjectRowActions({
  id,
  name,
  isPublished,
  isFeatured,
}: ProjectRowActionsProps) {
  const t = useTranslations("projects");
  const common = useTranslations("common");
  const { run, pending } = useAdminAction();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              aria-label={common("actionsFor", { name })}
            >
              <MoreHorizontal className="size-4" aria-hidden />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            render={<Link href={`/dashboard-admin/projects/${id}/edit`} />}
          >
            {common("edit")}
          </DropdownMenuItem>
          <DropdownMenuItem
            render={<Link href={`/dashboard-admin/properties?project=${id}`} />}
          >
            {t("viewProperties")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={pending}
            onClick={() =>
              run(
                () => setProjectPublished(id, !isPublished),
                isPublished ? t("unpublishedToast") : t("publishedToast"),
              )
            }
          >
            {isPublished ? common("unpublish") : common("publish")}
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={pending}
            onClick={() =>
              run(
                () => setProjectFeatured(id, !isFeatured),
                isFeatured ? t("unfeaturedToast") : t("featuredToast"),
              )
            }
          >
            {isFeatured ? common("unfeature") : common("feature")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={pending}
            onClick={() => setConfirmOpen(true)}
          >
            {common("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t("deleteTitle", { name })}
        description={t("deleteBody")}
        confirmLabel={t("deleteConfirm")}
        pending={pending}
        onConfirm={() => {
          setConfirmOpen(false);
          run(() => deleteProject(id), t("deletedToast"));
        }}
      />
    </>
  );
}
