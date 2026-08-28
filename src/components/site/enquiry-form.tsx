"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { useRef, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitEnquiry } from "@/lib/actions/enquiries";
import { ENQUIRY_MESSAGE_MAX } from "@/lib/validations/enquiry";
import { z } from "@/lib/zod";

type EnquiryFormProps = {
  projectId?: string;
  propertyId?: string;
  defaultMessage?: string;
};

export function EnquiryForm({
  projectId,
  propertyId,
  defaultMessage,
}: EnquiryFormProps) {
  const t = useTranslations("enquiry");
  const submissionLocked = useRef(false);

  /**
   * Built inside the component so validation messages resolve through the
   * active locale; the server re-validates independently.
   */
  const schema = z.object({
    name: z.string().trim().min(2, t("errors.nameMin")).max(120),
    email: z.email(t("errors.email")).max(200),
    phone: z
      .string()
      .trim()
      .max(40)
      .regex(/^[+()\d\s-]*$/, t("errors.phone"))
      .optional()
      .or(z.literal("")),
    message: z
      .string()
      .trim()
      .min(10, t("errors.messageMin"))
      .max(ENQUIRY_MESSAGE_MAX, t("errors.messageMax")),
    company: z.string().max(200).optional().or(z.literal("")),
  });

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: defaultMessage ?? "",
      company: "",
    },
  });

  async function onSubmit(values: FormValues) {
    const result = await submitEnquiry({
      ...values,
      projectId: projectId ?? "",
      propertyId: propertyId ?? "",
    });

    if (result.ok) {
      toast.success(t("successTitle"), { description: t("successBody") });
      reset({ name: "", email: "", phone: "", message: "", company: "" });
      return;
    }

    // Field-level errors already render inline; only server-side outcomes
    // become toasts, so a user never sees the same problem twice.
    const key =
      result.error === "rateLimited" ? "errors.rateLimited" : "errors.generic";
    toast.error(t(key));
  }

  /**
   * Double-submit guard. `isSubmitting` disables the button, but React may not
   * have painted that state by the time a second click of a real double-click
   * arrives. This ref flips synchronously inside the submit handler, so the
   * second event is dropped before it can reach the Server Action.
   */
  async function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    if (submissionLocked.current) {
      event.preventDefault();
      return;
    }

    submissionLocked.current = true;
    try {
      await handleSubmit(onSubmit)(event);
    } finally {
      submissionLocked.current = false;
    }
  }

  return (
    <form onSubmit={handleFormSubmit} className="grid gap-4" noValidate>
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">{t("title")}</h2>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="enquiry-name">{t("name")}</Label>
        <Input
          id="enquiry-name"
          autoComplete="name"
          placeholder={t("namePlaceholder")}
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />
        {errors.name ? (
          <p role="alert" className="text-sm text-destructive">
            {errors.name.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="enquiry-email">{t("email")}</Label>
          <Input
            id="enquiry-email"
            type="email"
            dir="ltr"
            autoComplete="email"
            placeholder={t("emailPlaceholder")}
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
          {errors.email ? (
            <p role="alert" className="text-sm text-destructive">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="enquiry-phone">{t("phone")}</Label>
          <Input
            id="enquiry-phone"
            type="tel"
            dir="ltr"
            autoComplete="tel"
            placeholder={t("phonePlaceholder")}
            aria-invalid={Boolean(errors.phone)}
            {...register("phone")}
          />
          {errors.phone ? (
            <p role="alert" className="text-sm text-destructive">
              {errors.phone.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="enquiry-message">{t("message")}</Label>
        <Textarea
          id="enquiry-message"
          rows={4}
          placeholder={t("messagePlaceholder")}
          aria-invalid={Boolean(errors.message)}
          {...register("message")}
        />
        {errors.message ? (
          <p role="alert" className="text-sm text-destructive">
            {errors.message.message}
          </p>
        ) : null}
      </div>

      {/*
       * Honeypot.
       *
       * Positioned off-screen rather than `display: none`. A bot that parses
       * the DOM fills every text input it finds; one that checks computed
       * styles skips anything explicitly hidden, so an off-screen field is the
       * better trap. It is also the only variant a real browser can focus and
       * type into, which is what makes the bot path testable end to end.
       *
       * `aria-hidden` keeps it out of the accessibility tree, `tabIndex={-1}`
       * keeps it off the keyboard path, `autoComplete="off"` stops a password
       * manager filling it for a real visitor, and absolute positioning keeps
       * it out of layout flow entirely. The field is named `company` rather
       * than anything resembling "honeypot" so its purpose is not advertised.
       */}
      <div
        aria-hidden
        className="pointer-events-none absolute h-px w-px overflow-hidden [clip-path:inset(50%)]"
      >
        <label htmlFor="enquiry-company">Company</label>
        <input
          id="enquiry-company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("company")}
        />
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
