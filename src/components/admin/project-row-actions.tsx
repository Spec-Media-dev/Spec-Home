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
              aria-label={`Actions for ${name}`}
            >
              <MoreHorizontal className="size-4" aria-hidden />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            render={<Link href={`/dashboard-admin/projects/${id}/edit`} />}
          >
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            render={<Link href={`/dashboard-admin/properties?project=${id}`} />}
          >
            View properties
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={pending}
            onClick={() =>
              run(
                () => setProjectPublished(id, !isPublished),
                isPublished ? "Project unpublished." : "Project published.",
              )
            }
          >
            {isPublished ? "Unpublish" : "Publish"}
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={pending}
            onClick={() =>
              run(
                () => setProjectFeatured(id, !isFeatured),
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
        title={`Delete ${name}?`}
        description="This cannot be undone. Projects that still have properties cannot be deleted."
        confirmLabel="Delete project"
        pending={pending}
        onConfirm={() => {
          setConfirmOpen(false);
          run(() => deleteProject(id), "Project deleted.");
        }}
      />
    </>
  );
}
