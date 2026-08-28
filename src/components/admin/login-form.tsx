"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Field } from "@/components/admin/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { signIn } from "@/lib/actions/auth";
import { z } from "@/lib/zod";

const schema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

const ERROR_KEYS = {
  invalid: "errorInvalid",
  notAdmin: "errorNotAdmin",
  rateLimited: "errorRateLimited",
} as const;

export function LoginForm() {
  const t = useTranslations("login");
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    const result = await signIn(values.email, values.password);

    if (result.ok) {
      router.replace("/dashboard-admin");
      router.refresh();
      return;
    }

    toast.error(t(ERROR_KEYS[result.error]));
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      <Field
        id="email"
        label={t("email")}
        error={errors.email ? t("emailInvalid") : undefined}
      >
        <Input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          spellCheck={false}
          autoFocus
          // Addresses are always Latin, whatever the console language.
          dir="ltr"
          className="text-start"
          {...register("email")}
        />
      </Field>

      <Field
        id="password"
        label={t("password")}
        error={errors.password ? t("passwordRequired") : undefined}
      >
        <PasswordInput
          id="password"
          autoComplete="current-password"
          dir="ltr"
          {...register("password")}
        />
      </Field>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
