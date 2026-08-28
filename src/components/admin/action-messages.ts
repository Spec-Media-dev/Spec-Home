import type { ActionErrorCode } from "@/lib/errors";

/**
 * Single mapping from outcome code to admin-facing copy. Raw PostgreSQL,
 * Supabase, or RLS text is never surfaced.
 */
export const ADMIN_ERROR_MESSAGES: Record<ActionErrorCode, string> = {
  unauthorized: "You are not authorised to perform this action.",
  validation: "Please check the highlighted fields and try again.",
  notFound: "That record no longer exists.",
  duplicateSlug: "Another record already uses that name. Try a different one.",
  duplicateReference: "That reference code is already in use.",
  projectRequired: "Select a valid project first.",
  projectHasProperties:
    "This project still has properties. Move or delete them first.",
  imageLimit: "A property can have at most 4 images.",
  imageRequired: "Add at least one image before publishing.",
  coverRequired: "Add a project cover image before publishing.",
  invalidFile: "Unsupported file. Use a JPEG, PNG or WebP within the size limit.",
  fileTooLarge: "That image is larger than 5 MB.",
  uploadFailed: "The upload failed. Please try again.",
  generic: "Something went wrong. Please try again.",
};

export function adminError(code: ActionErrorCode): string {
  return ADMIN_ERROR_MESSAGES[code] ?? ADMIN_ERROR_MESSAGES.generic;
}
