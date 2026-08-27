"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import {
  useForm,
  useWatch,
  type FieldErrors,
  type Resolver,
  type ResolverResult,
} from "react-hook-form";
import { toast } from "sonner";

import { BilingualTabs } from "@/components/admin/bilingual-tabs";
import { Field } from "@/components/admin/field";
import { FormSection } from "@/components/admin/form-section";
import { useAdminMessages } from "@/components/admin/use-admin-messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { createProperty, updateProperty } from "@/lib/actions/properties";
import { PROPERTY_STATUSES, type Property } from "@/lib/supabase/types";
import {
  firstFieldInOrder,
  toFieldErrors,
  type FieldErrorMap,
  type FieldIssueCode,
} from "@/lib/validations/field-errors";
import {
  PROPERTY_ARABIC_FIELDS,
  PROPERTY_FIELD_ORDER,
  propertySchema,
  type PropertyInput,
} from "@/lib/validations/property";

const STATUS_KEYS = {
  available: "statusAvailable",
  reserved: "statusReserved",
  sold: "statusSold",
} as const;

/** Same schema and same classification the server uses — see ProjectForm. */
const propertyResolver: Resolver<PropertyInput> = async (
  values,
): Promise<ResolverResult<PropertyInput>> => {
  const parsed = propertySchema.safeParse(values);
  if (parsed.success) {
    return { values: parsed.data as PropertyInput, errors: {} };
  }

  const errors = Object.fromEntries(
    Object.entries(toFieldErrors(parsed.error.issues)).map(([name, code]) => [
      name,
      { type: code, message: code },
    ]),
  ) as FieldErrors<PropertyInput>;

  return { values: {}, errors };
};

type ProjectOption = { id: string; name_en: string; name_ar: string };

function defaults(
  property?: Property,
  presetProjectId?: string,
): PropertyInput {
  return {
    project_id: property?.project_id ?? presetProjectId ?? "",
    title_en: property?.title_en ?? "",
    title_ar: property?.title_ar ?? "",
    description_en: property?.description_en ?? null,
    description_ar: property?.description_ar ?? null,
    property_type_en: property?.property_type_en ?? "",
    property_type_ar: property?.property_type_ar ?? "",
    price: property?.price ?? null,
    currency: property?.currency ?? "AED",
    bedrooms: property?.bedrooms ?? null,
    bathrooms: property?.bathrooms ?? null,
    size_sqft: property?.size_sqft ?? null,
    status: (property?.status as PropertyInput["status"]) ?? "available",
    is_featured: property?.is_featured ?? false,
    is_published: property?.is_published ?? false,
  };
}

export function PropertyForm({
  property,
  projects,
  presetProjectId,
  imageCount = 0,
}: {
  property?: Property;
  projects: ProjectOption[];
  presetProjectId?: string;
  imageCount?: number;
}) {
  const t = useTranslations("propertyForm");
  const common = useTranslations("common");
  const { error: errorMessage, field: fieldMessage } = useAdminMessages();

  const router = useRouter();
  const isEdit = Boolean(property);

  const [serverErrors, setServerErrors] = useState<FieldErrorMap>({});
  const [tab, setTab] = useState<"en" | "ar">("en");

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PropertyInput>({
    resolver: propertyResolver,
    defaultValues: defaults(property, presetProjectId),
  });

  const messageFor = useCallback(
    (name: keyof PropertyInput): string | undefined => {
      const clientCode = errors[name]?.message as FieldIssueCode | undefined;
      const code = clientCode ?? serverErrors[name as string];
      return code ? fieldMessage(code) : undefined;
    },
    [errors, serverErrors, fieldMessage],
  );

  const revealField = useCallback((name: string) => {
    if (PROPERTY_ARABIC_FIELDS.has(name as never)) setTab("ar");
    else if (name.endsWith("_en")) setTab("en");

    requestAnimationFrame(() => {
      const element = document.getElementById(name);
      if (!element) return;
      element.scrollIntoView({ block: "center", behavior: "smooth" });
      if (element instanceof HTMLElement) element.focus({ preventScroll: true });
    });
  }, []);

  const onInvalid = useCallback(
    (formErrors: FieldErrors<PropertyInput>) => {
      toast.error(isEdit ? t("failedUpdate") : t("failedCreate"));
      const first = firstFieldInOrder(
        Object.fromEntries(
          Object.keys(formErrors).map((key) => [key, "invalid" as FieldIssueCode]),
        ),
        PROPERTY_FIELD_ORDER,
      );
      if (first) revealField(first);
    },
    [isEdit, revealField, t],
  );

  const projectId = useWatch({ control, name: "project_id" });
  const status = useWatch({ control, name: "status" });
  const isFeatured = useWatch({ control, name: "is_featured" });
  const isPublished = useWatch({ control, name: "is_published" });

  // A new property has no id yet, so it cannot have images, so it cannot be
  // published in the same step. Publishing is offered once images exist.
  const canPublish = isEdit && imageCount > 0;

  async function onSubmit(values: PropertyInput) {
    setServerErrors({});

    const result = property
      ? await updateProperty(property.id, values)
      : await createProperty({ ...values, is_published: false });

    if (!result.ok) {
      const fieldErrors = result.fieldErrors ?? {};
      setServerErrors(fieldErrors);

      toast.error(
        result.error === "validation"
          ? isEdit
            ? t("failedUpdate")
            : t("failedCreate")
          : errorMessage(result.error),
      );

      const first = firstFieldInOrder(fieldErrors, PROPERTY_FIELD_ORDER);
      if (first) revealField(first);
      return;
    }

    if (!isEdit && "data" in result && result.data) {
      toast.success(t("createdDraft"), { description: t("createdNext") });
      router.push(`/dashboard-admin/properties/${result.data.id}/images`);
      return;
    }

    toast.success(t("updatedToast"));
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className="max-w-5xl space-y-6"
      noValidate
    >
      <FormSection
        title={t("project")}
        description={t("projectHint")}
      >
        <Field
          id="project_id"
          label={t("project")}
          required
          requiredLabel={common("required")}
          error={messageFor("project_id")}
        >
          <Select
            // `null` is Base UI's "no selection"; `undefined` means
            // *uncontrolled*. With no preset project the value starts as "",
            // so `|| undefined` made the first render uncontrolled and the
            // render after choosing a project controlled — which is exactly
            // the switch React and Base UI refuse to do quietly.
            value={projectId || null}
            onValueChange={(value) => setValue("project_id", value ?? "")}
          >
            <SelectTrigger id="project_id" className="w-full">
              {/* Renders the project's name rather than its UUID. */}
              <SelectValue placeholder={t("selectProject")}>
                {(value: string) =>
                  projects.find((option) => option.id === value)?.name_en ??
                  t("selectProject")
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {projects.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name_en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </FormSection>

      <FormSection title={t("sectionBasic")}>
        <BilingualTabs
          value={tab}
          onValueChange={setTab}
          english={
            <>
              <Field
                id="title_en"
                label={t("title")}
                required
                requiredLabel={common("required")}
                error={messageFor("title_en")}
              >
                <Input id="title_en" {...register("title_en")} />
              </Field>
              <Field
                id="property_type_en"
                label={t("propertyType")}
                required
                requiredLabel={common("required")}
                error={messageFor("property_type_en")}
                hint={t("typeHint")}
              >
                <Input
                  id="property_type_en"
                  {...register("property_type_en")}
                />
              </Field>
              <Field
                id="description_en"
                label={t("descriptionField")}
                optionalLabel={common("optional")}
                error={messageFor("description_en")}
              >
                <Textarea
                  id="description_en"
                  rows={5}
                  {...register("description_en")}
                />
              </Field>
            </>
          }
          arabic={
            <>
              <Field
                id="title_ar"
                label={t("title")}
                required
                requiredLabel={common("required")}
                error={messageFor("title_ar")}
              >
                <Input id="title_ar" {...register("title_ar")} />
              </Field>
              <Field
                id="property_type_ar"
                label={t("propertyType")}
                required
                requiredLabel={common("required")}
                error={messageFor("property_type_ar")}
              >
                <Input
                  id="property_type_ar"
                  {...register("property_type_ar")}
                />
              </Field>
              <Field
                id="description_ar"
                label={t("descriptionField")}
                optionalLabel={common("optional")}
                error={messageFor("description_ar")}
              >
                <Textarea
                  id="description_ar"
                  rows={5}
                  {...register("description_ar")}
                />
              </Field>
            </>
          }
        />
      </FormSection>

      <FormSection title={t("sectionPricing")}>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            id="price"
            label={t("price")}
            hint={t("priceHint")}
            error={messageFor("price")}
          >
            <Input id="price" type="number" min={0} {...register("price")} />
          </Field>
          <Field
            id="currency"
            label={t("currency")}
            hint={t("currencyHint")}
            error={messageFor("currency")}
          >
            <Input id="currency" maxLength={3} {...register("currency")} />
          </Field>
          <Field id="status" label={t("status")} error={messageFor("status")}>
            <Select
              value={status}
              onValueChange={(value) =>
                setValue("status", value as PropertyInput["status"])
              }
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue>
                  {(value: string) =>
                    value in STATUS_KEYS
                      ? t(STATUS_KEYS[value as keyof typeof STATUS_KEYS])
                      : value
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_STATUSES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {t(STATUS_KEYS[value])}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field
            id="bedrooms"
            label={t("bedrooms")}
            optionalLabel={common("optional")}
            error={messageFor("bedrooms")}
          >
            <Input
              id="bedrooms"
              type="number"
              min={0}
              {...register("bedrooms")}
            />
          </Field>
          <Field
            id="bathrooms"
            label={t("bathrooms")}
            optionalLabel={common("optional")}
            error={messageFor("bathrooms")}
          >
            <Input
              id="bathrooms"
              type="number"
              min={0}
              {...register("bathrooms")}
            />
          </Field>
          <Field
            id="size_sqft"
            label={t("size")}
            optionalLabel={common("optional")}
            error={messageFor("size_sqft")}
          >
            <Input
              id="size_sqft"
              type="number"
              min={0}
              {...register("size_sqft")}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title={t("sectionPublishing")}>
        <div className="flex flex-wrap gap-8">
          <label className="flex items-center gap-3 text-sm font-medium">
            <Switch
              checked={isFeatured}
              onCheckedChange={(checked) => setValue("is_featured", checked)}
            />
            {t("isFeatured")}
          </label>
          <label className="flex items-center gap-3 text-sm font-medium">
            <Switch
              checked={isPublished}
              disabled={!canPublish}
              onCheckedChange={(checked) => setValue("is_published", checked)}
            />
            {t("isPublished")}
          </label>
        </div>
        {!canPublish ? (
          <p className="text-xs text-muted-foreground">
            {isEdit
              ? t("needImages")
              : t("saveDraftFirst")}
          </p>
        ) : null}
      </FormSection>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? common("saving")
            : isEdit
              ? t("submitUpdate")
              : t("saveDraft")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/dashboard-admin/properties")}
        >
          {common("cancel")}
        </Button>
      </div>
    </form>
  );
}
