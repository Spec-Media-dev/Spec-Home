"use client";

import { MoreHorizontal, Trash2 } from "lucide-react";
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
import { deleteEnquiry, updateEnquiryStatus } from "@/lib/actions/enquiries";
import {
  ENQUIRY_STATUSES,
  type EnquiryStatus,
} from "@/lib/supabase/types";

const STATUS_ACTION_KEYS: Record<
  EnquiryStatus,
  "markNew" | "markContacted" | "markClosed"
> = {
  new: "markNew",
  contacted: "markContacted",
  closed: "markClosed",
};

type EnquiryActionsProps = {
  id: string;
  name: string;
  status: string;
  presentation?: "menu" | "detail";
};

export function EnquiryActions({
  id,
  name,
  status,
  presentation = "menu",
}: EnquiryActionsProps) {
  const t = useTranslations("enquiries");
  const common = useTranslations("common");
  const statusLabel = useTranslations("enquiryStatus");
  const { run, pending, router } = useAdminAction();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const availableStatuses = ENQUIRY_STATUSES.filter(
    (candidate) => candidate !== status,
  );

  function changeStatus(nextStatus: EnquiryStatus) {
    run(
      () => updateEnquiryStatus(id, nextStatus),
      t("statusUpdated", { status: statusLabel(nextStatus) }),
      undefined,
      t("updateFailed"),
    );
  }

  function confirmDelete() {
    run(
      () => deleteEnquiry(id),
      t("deleted"),
      () => {
        setConfirmOpen(false);
        if (presentation === "detail") {
          router.replace("/dashboard-admin/enquiries");
        }
      },
      t("deleteFailed"),
    );
  }

  return (
    <>
      {presentation === "detail" ? (
        <div className="space-y-5" aria-busy={pending}>
          <div className="flex flex-col gap-2">
            {availableStatuses.map((nextStatus) => (
              <Button
                key={nextStatus}
                type="button"
                variant="outline"
                disabled={pending}
                className="justify-start"
                onClick={() => changeStatus(nextStatus)}
              >
                {t(STATUS_ACTION_KEYS[nextStatus])}
              </Button>
            ))}
          </div>
          <Button
            type="button"
            variant="destructive"
            disabled={pending}
            className="w-full justify-start"
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 className="size-4" aria-hidden />
            {t("delete")}
          </Button>
        </div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={pending}
                aria-label={common("actionsFor", { name })}
              >
                <MoreHorizontal className="size-4" aria-hidden />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              render={<Link href={`/dashboard-admin/enquiries/${id}`} />}
            >
              {t("viewDetails")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {availableStatuses.map((nextStatus) => (
              <DropdownMenuItem
                key={nextStatus}
                disabled={pending}
                onClick={() => changeStatus(nextStatus)}
              >
                {t(STATUS_ACTION_KEYS[nextStatus])}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={pending}
              onClick={() => setConfirmOpen(true)}
            >
              {t("delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t("deleteTitle")}
        description={t("deleteBody")}
        confirmLabel={pending ? t("deleting") : t("deleteConfirm")}
        pending={pending}
        onConfirm={confirmDelete}
      />
    </>
  );
}
