"use client";

import { ArrowDown, ArrowUp, Star, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { useAdminMessages } from "@/components/admin/use-admin-messages";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  deletePropertyImage,
  finalizePropertyImageUpload,
  preparePropertyImageUploads,
  reorderPropertyImages,
  setPropertyImageCover,
} from "@/lib/actions/images";
import {
  MAX_PROPERTY_IMAGE_BYTES,
  PROPERTY_IMAGE_MIME_TYPES,
} from "@/lib/property-image-rules";
import { matchesClaimedImageType } from "@/lib/image-signatures";
import { createClient } from "@/lib/supabase/browser";
import { MAX_PROPERTY_IMAGES } from "@/lib/supabase/types";

export type ManagedImage = {
  id: string;
  url: string;
  isCover: boolean;
};

const ACCEPTED: readonly string[] = PROPERTY_IMAGE_MIME_TYPES;
const MAX_BYTES = MAX_PROPERTY_IMAGE_BYTES;

export function ImageManager({
  propertyId,
  images,
  isPublished,
}: {
  propertyId: string;
  images: ManagedImage[];
  isPublished: boolean;
}) {
  const t = useTranslations("images");
  const { error: errorMessage } = useAdminMessages();
  const { run, pending, router } = useAdminAction();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(
    null,
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const remaining = MAX_PROPERTY_IMAGES - images.length;
  const isFull = remaining <= 0;

  async function onFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);

    // Rejected before any upload starts: 3 existing + 2 new is refused
    // outright rather than uploading one and failing on the second.
    if (files.length > remaining) {
      toast.error(t("tooMany", { max: MAX_PROPERTY_IMAGES, remaining }));
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const oversized = files.find((file) => file.size > MAX_BYTES);
    if (oversized) {
      toast.error(t("oversized", { name: oversized.name }));
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const invalid = files.find(
      (file) => !ACCEPTED.includes(file.type) || file.size === 0,
    );
    if (invalid) {
      toast.error(t("unsupported"));
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const keys = files.map(
      (file) => `${file.name}\u0000${file.size}\u0000${file.lastModified}`,
    );
    if (new Set(keys).size !== keys.length) {
      toast.error(t("duplicateSelection"));
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const signatures = await Promise.all(files.map(matchesClaimedImageType));
    const forgedIndex = signatures.findIndex((matches) => !matches);
    if (forgedIndex !== -1) {
      toast.error(t("notAnImage", { name: files[forgedIndex].name }));
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setUploading(true);
    setProgress({ current: 0, total: files.length });
    let uploaded = 0;
    try {
      const prepared = await preparePropertyImageUploads(
        propertyId,
        files.map((file) => ({ type: file.type, size: file.size })),
      );
      if (!prepared.ok) {
        toast.error(errorMessage(prepared.error));
        return;
      }

      const supabase = createClient();
      for (const [index, file] of files.entries()) {
        const ticket = prepared.data[index];
        setProgress({ current: index + 1, total: files.length });
        const { error: uploadError } = await supabase.storage
          .from("site-media")
          .uploadToSignedUrl(ticket.path, ticket.token, file, {
            contentType: file.type,
          });

        if (uploadError) {
          toast.error(t("uploadFailedFile", { name: file.name }));
          break;
        }

        const result = await finalizePropertyImageUpload(propertyId, ticket.path);
        if (!result.ok) {
          toast.error(errorMessage(result.error));
          break;
        }
        uploaded += 1;
      }

      if (uploaded > 0) {
        toast.success(t("uploadedCount", { count: uploaded }));
        router.refresh();
      }
    } finally {
      setUploading(false);
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function move(index: number, direction: -1 | 1) {
    const next = [...images];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    run(
      () =>
        reorderPropertyImages(
          propertyId,
          next.map((image) => image.id),
        ),
      t("reordered"),
    );
  }

  const busy = pending || uploading;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-5">
        <div className="space-y-1">
          <p className="font-medium">
            {images.length} of {MAX_PROPERTY_IMAGES} images
          </p>
          <p className="text-sm text-muted-foreground">
            {isPublished
              ? t("publishedNeedsOne")
              : t("addOneToPublish")}
          </p>
          <p className="text-xs text-muted-foreground">
            JPEG, PNG or WebP · 5 MB maximum per image · {remaining} remaining
          </p>
        </div>

        <div>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(",")}
            multiple
            className="sr-only"
            id="image-upload"
            disabled={busy || isFull}
            onChange={(event) => void onFilesSelected(event.target.files)}
          />
          <Button
            type="button"
            disabled={busy || isFull}
            onClick={() => inputRef.current?.click()}
            className="gap-2"
          >
            <Upload className="size-4" aria-hidden />
            {isFull
              ? t("limitReached")
              : uploading && progress
                ? t("uploadingProgress", { current: progress.current, total: progress.total })
                : t("upload")}
          </Button>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="font-medium">No images yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload up to {MAX_PROPERTY_IMAGES} images. The first becomes the
            cover.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {images.map((image, index) => (
            <li
              key={image.id}
              className="overflow-hidden rounded-xl border border-border bg-card"
            >
              <div className="relative aspect-[4/3] bg-muted">
                <Image
                  src={image.url}
                  alt=""
                  aria-hidden
                  fill
                  sizes="(max-width: 640px) 100vw, 25vw"
                  className="object-cover"
                />
                {image.isCover ? (
                  <Badge className="absolute left-2 top-2 bg-brand-gold text-brand-charcoal hover:bg-brand-gold">
                    Cover
                  </Badge>
                ) : null}
              </div>

              <div className="flex items-center justify-between gap-1 p-2">
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t("moveEarlier")}
                    disabled={busy || index === 0}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowUp className="size-4" aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t("moveLater")}
                    disabled={busy || index === images.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDown className="size-4" aria-hidden />
                  </Button>
                </div>

                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t("setCover")}
                    disabled={busy || image.isCover}
                    onClick={() =>
                      run(
                        () => setPropertyImageCover(image.id),
                        t("coverSet"),
                      )
                    }
                  >
                    <Star
                      className={
                        image.isCover ? "size-4 fill-current" : "size-4"
                      }
                      aria-hidden
                    />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t("deleteImage")}
                    disabled={busy}
                    onClick={() => setDeleteId(image.id)}
                  >
                    <Trash2 className="size-4 text-destructive" aria-hidden />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t("deleteTitle")}
        description={t("deleteBody")}
        confirmLabel={t("deleteImage")}
        pending={busy}
        onConfirm={() => {
          const id = deleteId;
          setDeleteId(null);
          if (id) run(() => deletePropertyImage(id), t("deleted"));
        }}
      />
    </div>
  );
}
