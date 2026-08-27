import { cloneElement, isValidElement, type ReactElement } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  requiredLabel?: string;
  optionalLabel?: string;
  className?: string;
  children: React.ReactNode;
};

type InjectedProps = {
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

/**
 * Label, control, hint, and error as one unit.
 *
 * The accessibility wiring is injected rather than left to each caller: a
 * single control child is cloned with `aria-invalid` and an `aria-describedby`
 * pointing at whichever of the hint and error is actually rendered. Doing it
 * here means a new form cannot ship an error message that a screen reader
 * never announces.
 */
export function Field({
  id,
  label,
  error,
  hint,
  required,
  requiredLabel,
  optionalLabel,
  className,
  children,
}: FieldProps) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const showHint = Boolean(hint) && !error;

  const describedBy =
    [error ? errorId : null, showHint ? hintId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<InjectedProps>, {
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
      })
    : children;

  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={id} className="flex items-center gap-1.5">
        <span>{label}</span>
        {required && requiredLabel ? (
          <span aria-hidden className="text-destructive">
            *
          </span>
        ) : null}
        {required && requiredLabel ? (
          <span className="sr-only">{requiredLabel}</span>
        ) : null}
        {!required && optionalLabel ? (
          <span className="text-xs font-normal text-muted-foreground">
            {optionalLabel}
          </span>
        ) : null}
      </Label>

      {control}

      {showHint ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
