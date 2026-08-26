"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  enquirySchema,
  type EnquiryFormValues,
} from "@/lib/validations/enquiry";

export function EnquiryForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EnquiryFormValues>({
    resolver: zodResolver(enquirySchema),
    defaultValues: { name: "", email: "" },
  });

  async function onSubmit(values: EnquiryFormValues) {
    // The CRM/Supabase destination will be connected after its schema is approved.
    console.info("Enquiry form validated", values);
    setSubmitted(true);
    reset();
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" autoComplete="name" {...register("name")} />
        {errors.name ? (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        ) : null}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
        />
        {errors.email ? (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        ) : null}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Request a consultation"}
      </Button>
      {submitted ? (
        <p className="text-sm text-emerald-700" role="status">
          Form validation is working. Connect the approved CRM or Supabase table next.
        </p>
      ) : null}
    </form>
  );
}
