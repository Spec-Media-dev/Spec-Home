"use client";

import { ImagePlus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { useAdminMessages } from "@/components/admin/use-admin-messages";
import { Button } from "@/components/ui/button";
import {
  finalizeProjectCoverUpload,
  prepareProjectCoverUpload,
  removeProjectCover,
} from "@/lib/actions/project-cover";
import { matchesClaimedImageType } from "@/lib/image-signatures";
import {
  PROJECT_COVER_MIME_TYPES,
  projectCoverRuleError,
} from "@/lib/project-cover-rules";
import { createClient } from "@/lib/supabase/browser";
import { STORAGE_BUCKET } from "@/lib/supabase/types";

const ACCEPT = PROJECT_COVER_MIME_TYPES.join(",");

/**
 * The project's single cover image.
 *
 * Bytes never travel through a Server Action: the server hands back a
 * short-lived token scoped to one object path, the browser PUTs straight to
 * Storage, and a second action verifies the object that actually landed before
 * the database is touched. The checks here are a courtesy so an obviously
 * wrong file is refused before anything is transferred — the server repeats
 * every one of them and inspects the real bytes as well.
 */
export function ProjectCoverManager({
  projectId,
  coverUrl,
  isPublished,
}: {
  projectId: string;
  coverUrl: string | null;
  isPublished: boolean;
}) {
  const t = useTranslations("projectCover");
  const { error: errorMessage } = useAdminMessages();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const shown = preview ?? coverUrl;

  function reset() {
    if (inputRef.current) inputRef.current.value = "";
  }

  async function onSelected(file: File | undefined) {
    if (!file || busy) return;

    const ruleError = projectCoverRuleError({
      type: file.type,
      size: file.size,
    });
    if (ruleError) {
      toast.error(errorMessage(ruleError));
      reset();
      return;
    }

    // A renamed `.exe` claiming image/png is caught here, and again server-side.
    if (!(await matchesClaimedImageType(file))) {
      toast.error(errorMessage("invalidFile"));
      reset();
      return;
    }

    setBusy(true);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    try {
      const prepared = await prepareProjectCoverUpload(projectId, {
        type: file.type,
        size: file.size,
      });
      if (!prepared.ok) {
        toast.error(errorMessage(prepared.error));
        return;
      }

      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .uploadToSignedUrl(prepared.data.path, prepared.data.token, file, {
          contentType: file.type,
        });

      if (uploadError) {
        toast.error(errorMessage("uploadFailed"));
        return;
      }

      const finalized = await finalizeProjectCoverUpload(
        projectId,
        prepared.data.path,
      );
      if (!finalized.ok) {
        // The server has already deleted the rejected object.
        toast.error(errorMessage(finalized.error));
        return;
      }

      toast.success(t("uploaded"));
      // The refreshed server render supplies the real URL; drop the preview so
      // the two cannot disagree.
      setPreview(null);
    } finally {
      URL.revokeObjectURL(objectUrl);
      setBusy(false);
      reset();
    }
  }

  async function onRemove() {
    setConfirmOpen(false);
    setBusy(true);
    try {
      const result = await removeProjectCover(projectId);
      if (!result.ok) {
        toast.error(errorMessage(result.error));
        return;
      }
      setPreview(null);
      toast.success(t("removed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex min-h-44 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted/40 p-3">
        {shown ? (
          <Image
            src={shown}
            alt={t("alt")}
            width={640}
            height={360}
            unoptimized={Boolean(preview)}
            className="max-h-56 w-auto rounded object-contain"
          />
        ) : (
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        )}
      </div>

      <p className="text-xs text-muted-foreground">{t("hint")}</p>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        // `tabIndex={-1}` keeps the visually hidden input out of the tab order;
        // the visible button is the real control.
        tabIndex={-1}
        aria-hidden
        onChange={(event) => void onSelected(event.target.files?.[0])}
      />

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant={coverUrl ? "outline" : "default"}
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus className="size-4" aria-hidden />
          {busy ? t("uploading") : coverUrl ? t("replace") : t("choose")}
        </Button>

        {coverUrl ? (
          <Button
            type="button"
            variant="ghost"
            className="text-destructive"
            // A published project must keep a cover: removal is offered only
            // once it is back in draft, with the reason stated.
            disabled={busy || isPublished}
            title={isPublished ? t("publishedLocked") : undefined}
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 className="size-4" aria-hidden />
            {t("remove")}
          </Button>
        ) : null}
      </div>

      {isPublished && coverUrl ? (
        <p className="text-xs text-muted-foreground">{t("publishedLocked")}</p>
      ) : null}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t("remove")}
        description={t("hint")}
        confirmLabel={t("remove")}
        pending={busy}
        onConfirm={() => void onRemove()}
      />
    </div>
  );
}
