"use client";

import { ArrowDown, ArrowUp, Star, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { adminError } from "@/components/admin/action-messages";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  deletePropertyImage,
  reorderPropertyImages,
  setPropertyImageCover,
  uploadPropertyImage,
} from "@/lib/actions/images";
import { MAX_PROPERTY_IMAGES } from "@/lib/supabase/types";

export type ManagedImage = {
  id: string;
  url: string;
  isCover: boolean;
};

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

export function ImageManager({
  propertyId,
  images,
  isPublished,
}: {
  propertyId: string;
  images: ManagedImage[];
  isPublished: boolean;
}) {
  const { run, pending, router } = useAdminAction();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const remaining = MAX_PROPERTY_IMAGES - images.length;
  const isFull = remaining <= 0;

  async function onFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);

    // Rejected before any upload starts: 3 existing + 2 new is refused
    // outright rather than uploading one and failing on the second.
    if (files.length > remaining) {
      toast.error(
        `A property can have at most ${MAX_PROPERTY_IMAGES} images. You can add ${remaining} more.`,
      );
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const invalid = files.find(
      (file) => !ACCEPTED.includes(file.type) || file.size > MAX_BYTES,
    );
    if (invalid) {
      toast.error("Use JPEG, PNG or WebP files up to 5 MB.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setUploading(true);
    let uploaded = 0;
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.set("propertyId", propertyId);
        formData.set("file", file);

        const result = await uploadPropertyImage(formData);
        if (!result.ok) {
          toast.error(adminError(result.error));
          break;
        }
        uploaded += 1;
      }

      if (uploaded > 0) {
        toast.success(
          uploaded === 1 ? "Image uploaded." : `${uploaded} images uploaded.`,
        );
        router.refresh();
      }
    } finally {
      setUploading(false);
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
      "Image order updated.",
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
              ? "This property is published, so at least one image must remain."
              : "Add at least one image to publish this property."}
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
              ? "Limit reached"
              : uploading
                ? "Uploading…"
                : "Upload images"}
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
                    aria-label="Move earlier"
                    disabled={busy || index === 0}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowUp className="size-4" aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Move later"
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
                    aria-label="Set as cover"
                    disabled={busy || image.isCover}
                    onClick={() =>
                      run(
                        () => setPropertyImageCover(image.id),
                        "Cover image updated.",
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
                    aria-label="Delete image"
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
        title="Delete this image?"
        description="The file is removed from storage and cannot be recovered."
        confirmLabel="Delete image"
        pending={busy}
        onConfirm={() => {
          const id = deleteId;
          setDeleteId(null);
          if (id) run(() => deletePropertyImage(id), "Image removed.");
        }}
      />
    </div>
  );
}
