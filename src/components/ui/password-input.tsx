"use client";

import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLayoutEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<React.ComponentProps<typeof Input>, "type">;

export function PasswordInput({
  className,
  dir,
  ref: forwardedRef,
  ...props
}: PasswordInputProps) {
  const t = useTranslations("common");
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const preserved = useRef({
    value: "",
    start: null as number | null,
    end: null as number | null,
    focused: false,
  });
  const label = visible ? t("hidePassword") : t("showPassword");

  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.value = preserved.current.value;
    if (preserved.current.focused) {
      input.focus();
      if (preserved.current.start !== null && preserved.current.end !== null) {
        input.setSelectionRange(preserved.current.start, preserved.current.end);
      }
    }
  }, [visible]);

  function setInputRef(input: HTMLInputElement | null) {
    inputRef.current = input;
    if (typeof forwardedRef === "function") forwardedRef(input);
    else if (forwardedRef) forwardedRef.current = input;
  }

  function toggleVisibility() {
    const input = inputRef.current;
    if (input) {
      preserved.current = {
        value: input.value,
        start: input.selectionStart,
        end: input.selectionEnd,
        focused: document.activeElement === input,
      };
    }
    setVisible((current) => !current);
  }

  return (
    // `dir` belongs on the wrapper, not just the input.
    //
    // The padding (`pe-10`) and the button (`end-0`) are logical properties, so
    // they resolve against the *wrapper's* direction. A password is always
    // typed LTR, so callers pass dir="ltr" — but if that only reached the
    // input, the wrapper stayed RTL in an Arabic console and the toggle landed
    // on the left, directly on top of the first characters. Keeping both in
    // one direction puts the toggle on the input's trailing edge either way.
    <div className="relative" dir={dir}>
      <Input
        {...props}
        dir={dir}
        ref={setInputRef}
        type={visible ? "text" : "password"}
        className={cn("pe-10", className)}
      />
      <button
        type="button"
        aria-label={label}
        title={label}
        aria-pressed={visible}
        className="absolute inset-y-0 end-0 inline-flex w-10 items-center justify-center rounded-e-lg text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        onMouseDown={(event) => event.preventDefault()}
        onClick={toggleVisibility}
      >
        {visible ? (
          <EyeOff className="size-4" aria-hidden />
        ) : (
          <Eye className="size-4" aria-hidden />
        )}
      </button>
    </div>
  );
}
