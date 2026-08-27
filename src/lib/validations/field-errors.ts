import type { $ZodIssue } from "zod/v4/core";

/**
 * Safe, translatable field-level failure codes.
 *
 * Server validation stays authoritative; this is the vocabulary it uses to say
 * *which* field failed and *why*, without ever exposing a Zod issue, a
 * Postgres message, an RLS message, or a stack trace. Every code here is
 * something an administrator can act on.
 */
export type FieldIssueCode =
  | "required"
  | "tooShort"
  | "tooLong"
  | "invalid"
  | "notANumber"
  | "negative"
  | "tooLarge"
  | "tooPrecise"
  | "notInteger"
  | "rangeReversed"
  | "invalidCurrency"
  | "invalidStatus"
  | "duplicate"
  | "coverRequired";

/** Field path (dot-joined for nesting) to its first failure. */
export type FieldErrorMap = Record<string, FieldIssueCode>;

/**
 * Marker attached to custom issues so the mapping below stays explicit rather
 * than pattern-matching on human-readable messages.
 */
export type CustomIssueParams = { code: FieldIssueCode };

function pathKey(issue: $ZodIssue): string {
  return issue.path.map(String).join(".") || "_form";
}

function classify(issue: $ZodIssue): FieldIssueCode {
  // Custom refinements carry their own code — always trust it first.
  const params = (issue as { params?: unknown }).params;
  if (
    typeof params === "object" &&
    params !== null &&
    typeof (params as CustomIssueParams).code === "string"
  ) {
    return (params as CustomIssueParams).code;
  }

  switch (issue.code) {
    case "invalid_type":
      // Zod does not report the received value, so the expected type is the
      // only signal. Numbers reach here after preprocessing, which means the
      // admin typed something unparseable (or NaN/Infinity) rather than
      // leaving the field blank — blanks are coerced to null upstream.
      if (issue.expected === "number") return "notANumber";
      if (issue.expected === "boolean") return "invalid";
      return "required";

    case "too_small": {
      const origin = (issue as { origin?: string }).origin;
      if (origin === "number") return "negative";
      // A minimum of one character means the field was left blank; anything
      // stricter is a genuine "too short".
      const minimum = Number((issue as { minimum?: unknown }).minimum ?? 0);
      return minimum <= 1 ? "required" : "tooShort";
    }

    case "too_big": {
      const origin = (issue as { origin?: string }).origin;
      return origin === "number" ? "tooLarge" : "tooLong";
    }

    case "not_multiple_of":
      return "tooPrecise";

    case "invalid_value":
      return "invalidStatus";

    case "invalid_format":
      return "invalid";

    default:
      return "invalid";
  }
}

/**
 * Reduces a Zod failure to the safe map. The first issue per field wins, which
 * keeps the message an administrator sees stable and actionable rather than a
 * pile of overlapping complaints about one input.
 */
export function toFieldErrors(issues: readonly $ZodIssue[]): FieldErrorMap {
  const errors: FieldErrorMap = {};
  for (const issue of issues) {
    const key = pathKey(issue);
    errors[key] ??= classify(issue);
  }
  return errors;
}

/** Field order used to decide which invalid input to focus first. */
export function firstFieldInOrder(
  errors: FieldErrorMap,
  order: readonly string[],
): string | null {
  for (const field of order) {
    if (errors[field]) return field;
  }
  const [fallback] = Object.keys(errors);
  return fallback ?? null;
}
