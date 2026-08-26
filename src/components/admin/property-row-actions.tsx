"use client";

import { MoreHorizontal } from "lucide-react";
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
              aria-label={`Actions for ${title}`}
            >
              <MoreHorizontal className="size-4" aria-hidden />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            render={<Link href={`/dashboard-admin/properties/${id}/edit`} />}
          >
            Edit details
          </DropdownMenuItem>
          <DropdownMenuItem
            render={<Link href={`/dashboard-admin/properties/${id}/images`} />}
          >
            Manage images
          </DropdownMenuItem>
          <DropdownMenuItem
            render={<Link href={`/dashboard-admin/properties/${id}/specs`} />}
          >
            Manage specifications
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={pending}
            onClick={() =>
              run(
                () => setPropertyPublished(id, !isPublished),
                isPublished ? "Property unpublished." : "Property published.",
              )
            }
          >
            {isPublished ? "Unpublish" : "Publish"}
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={pending}
            onClick={() =>
              run(
                () => setPropertyFeatured(id, !isFeatured),
                isFeatured ? "Removed from featured." : "Marked as featured.",
              )
            }
          >
            {isFeatured ? "Unfeature" : "Feature"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={pending}
            onClick={() => setConfirmOpen(true)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete ${title}?`}
        description="The property and its images are permanently removed."
        confirmLabel="Delete property"
        pending={pending}
        onConfirm={() => {
          setConfirmOpen(false);
          run(() => deleteProperty(id), "Property deleted.");
        }}
      />
    </>
  );
}
