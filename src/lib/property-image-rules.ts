import type { ActionErrorCode } from "@/lib/errors";
import { MAX_PROPERTY_IMAGES } from "@/lib/supabase/types";

export const MAX_PROPERTY_IMAGE_BYTES = 5 * 1024 * 1024;
export const PROPERTY_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type PropertyImageDescriptor = {
  type: string;
  size: number;
};

/** Shared cheap checks; Storage bytes are inspected separately after upload. */
export function propertyImageRuleError(
  existingCount: number,
  files: PropertyImageDescriptor[],
): ActionErrorCode | null {
  if (
    !Number.isInteger(existingCount) ||
    existingCount < 0 ||
    files.length === 0
  ) {
    return "validation";
  }
  if (
    files.length > MAX_PROPERTY_IMAGES ||
    existingCount + files.length > MAX_PROPERTY_IMAGES
  ) {
    return "imageLimit";
  }
  if (files.some((file) => file.size > MAX_PROPERTY_IMAGE_BYTES)) {
    return "fileTooLarge";
  }
  if (
    files.some(
      (file) =>
        !Number.isInteger(file.size) ||
        file.size <= 0 ||
        !PROPERTY_IMAGE_MIME_TYPES.includes(
          file.type as (typeof PROPERTY_IMAGE_MIME_TYPES)[number],
        ),
    )
  ) {
    return "invalidFile";
  }
  return null;
}
