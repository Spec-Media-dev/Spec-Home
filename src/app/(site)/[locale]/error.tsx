"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  useEffect(() => {
    // Raw cause stays in server logs; visitors only see a translated message.
    console.error(error);
  }, [error]);

  return (
    <div className="container-content flex min-h-[60vh] flex-col items-center justify-center gap-5 py-20 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="max-w-md text-sm text-muted-foreground">{t("body")}</p>
      <Button onClick={reset}>{t("retry")}</Button>
    </div>
  );
}
