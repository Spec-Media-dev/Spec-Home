"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { adminError } from "@/components/admin/action-messages";
import type { ActionErrorCode } from "@/lib/errors";

type AnyActionResult =
  | { ok: true; data?: unknown }
  | { ok: false; error: ActionErrorCode };

/**
 * One place where every admin mutation turns into a toast plus a refresh, so
 * error mapping and success feedback stay consistent across the console.
 */
export function useAdminAction() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run(
    action: () => Promise<AnyActionResult>,
    successMessage: string,
    onSuccess?: () => void,
  ) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast.success(successMessage);
        onSuccess?.();
        router.refresh();
      } else {
        toast.error(adminError(result.error));
      }
    });
  }

  return { run, pending, router };
}
