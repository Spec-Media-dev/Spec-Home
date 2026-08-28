"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { useAdminMessages } from "@/components/admin/use-admin-messages";
import type { ActionErrorCode } from "@/lib/errors";

type AnyActionResult =
  | { ok: true; data?: unknown }
  | { ok: false; error: ActionErrorCode };

/**
 * One place where every admin mutation turns into a toast plus a refresh, so
 * error mapping and success feedback stay consistent across the console.
 *
 * `router.refresh()` remains here for the acting tab. Other tabs and other
 * signed-in sessions are covered by the Realtime bridge instead — no component
 * opens a subscription of its own.
 */
export function useAdminAction() {
  const router = useRouter();
  const { error: errorMessage } = useAdminMessages();
  const [pending, startTransition] = useTransition();

  function run(
    action: () => Promise<AnyActionResult>,
    successMessage: string,
    onSuccess?: () => void,
    failureMessage?: string,
  ) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast.success(successMessage);
        onSuccess?.();
        router.refresh();
      } else {
        toast.error(failureMessage ?? errorMessage(result.error));
      }
    });
  }

  return { run, pending, router };
}
