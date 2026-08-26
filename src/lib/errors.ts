import type { PostgrestError } from "@supabase/supabase-js";

/**
 * Stable, translatable outcome codes. Raw PostgreSQL, Supabase, or RLS text
 * never reaches the UI — it is logged server-side and mapped to one of these.
 */
export type ActionErrorCode =
  | "unauthorized"
  | "validation"
  | "notFound"
  | "duplicateSlug"
  | "duplicateReference"
  | "projectRequired"
  | "projectHasProperties"
  | "imageLimit"
  | "imageRequired"
  | "invalidFile"
  | "uploadFailed"
  | "generic";

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? { data?: never } : { data: T }))
  | { ok: false; error: ActionErrorCode };

const UNIQUE_VIOLATION = "23505";
const FOREIGN_KEY_VIOLATION = "23503";
const NOT_NULL_VIOLATION = "23502";

export function mapPostgrestError(
  error: PostgrestError | null,
  context: "project" | "property" | "generic" = "generic",
): ActionErrorCode {
  if (!error) return "generic";

  if (error.code === UNIQUE_VIOLATION) {
    if (error.message.includes("reference_code")) return "duplicateReference";
    if (error.message.includes("slug")) return "duplicateSlug";
    return "generic";
  }

  if (error.code === FOREIGN_KEY_VIOLATION) {
    // Deleting a project that still owns properties hits ON DELETE RESTRICT.
    if (context === "project") return "projectHasProperties";
    if (context === "property") return "projectRequired";
    return "generic";
  }

  if (error.code === NOT_NULL_VIOLATION) return "validation";

  return "generic";
}

/** Logs the real cause for operators while returning a safe code to callers. */
export function logAndMap(
  scope: string,
  error: PostgrestError | Error | null,
  context: "project" | "property" | "generic" = "generic",
): ActionErrorCode {
  if (error) console.error(`[${scope}]`, error);
  if (error && "code" in error) {
    return mapPostgrestError(error as PostgrestError, context);
  }
  return "generic";
}
