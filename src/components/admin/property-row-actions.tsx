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
  deleteProperty,
  setPropertyFeatured,
  setPropertyPublished,
} from "@/lib/actions/properties";

export function PropertyRowActions({
  id,
  title,
  isPublished,
  isFeatured,
}: {
  id: string;
  title: string;
  isPublished: boolean;
  isFeatured: boolean;
}) {
  const t = useTranslations("properties");
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
              aria-label={common("actionsFor", { name: title })}
            >
              <MoreHorizontal className="size-4" aria-hidden />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            render={<Link href={`/dashboard-admin/properties/${id}/edit`} />}
          >
            {t("editDetails")}
          </DropdownMenuItem>
          <DropdownMenuItem
            render={<Link href={`/dashboard-admin/properties/${id}/images`} />}
          >
            {t("manageImages")}
          </DropdownMenuItem>
          <DropdownMenuItem
            render={<Link href={`/dashboard-admin/properties/${id}/specs`} />}
          >
            {t("manageSpecs")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={pending}
            onClick={() =>
              run(
                () => setPropertyPublished(id, !isPublished),
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
                () => setPropertyFeatured(id, !isFeatured),
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
        title={t("deleteTitle", { name: title })}
        description={t("deleteBody")}
        confirmLabel={t("deleteConfirm")}
        pending={pending}
        onConfirm={() => {
          setConfirmOpen(false);
          run(() => deleteProperty(id), t("deletedToast"));
        }}
      />
    </>
  );
}
