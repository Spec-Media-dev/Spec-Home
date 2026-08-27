"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";

import type { ActionErrorCode } from "@/lib/errors";
import { MAX_PROPERTY_IMAGES } from "@/lib/supabase/types";
import type { FieldIssueCode } from "@/lib/validations/field-errors";

/**
 * Turns the safe outcome codes returned by Server Actions into copy in the
 * console's current language.
 *
 * Replaces the old hard-coded English map: with the admin available in Arabic,
 * an English-only error string would have been the one thing on the screen the
 * admin could not read. Raw PostgreSQL, Supabase, and RLS text still never
 * reach the UI — these codes are the entire vocabulary.
 */
export function useAdminMessages() {
  const errors = useTranslations("errors");
  const fields = useTranslations("fieldErrors");

  const error = useCallback(
    (code: ActionErrorCode) =>
      // `max` is only consumed by `imageLimit`; extra values are ignored.
      errors(code, { max: MAX_PROPERTY_IMAGES }),
    [errors],
  );

  const field = useCallback(
    (code: FieldIssueCode) => fields(code),
    [fields],
  );

  return { error, field };
}
