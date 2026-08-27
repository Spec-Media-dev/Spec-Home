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
import { ProjectCoverManager } from "@/components/admin/project-cover-manager";
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
import { createProject, updateProject } from "@/lib/actions/projects";
import { storageUrl } from "@/lib/storage";
import {
  firstFieldInOrder,
  toFieldErrors,
  type FieldErrorMap,
  type FieldIssueCode,
} from "@/lib/validations/field-errors";
import { PROJECT_STATUSES, type Project } from "@/lib/supabase/types";
import {
  PROJECT_ARABIC_FIELDS,
  PROJECT_FIELD_ORDER,
  projectSchema,
  type ProjectInput,
} from "@/lib/validations/project";

const STATUS_KEYS = {
  under_construction: "statusUnderConstruction",
  ready: "statusReady",
  sold_out: "statusSoldOut",
} as const;

function defaults(project?: Project): ProjectInput {
  return {
    name_en: project?.name_en ?? "",
    name_ar: project?.name_ar ?? "",
    developer_en: project?.developer_en ?? "",
    developer_ar: project?.developer_ar ?? "",
    location_en: project?.location_en ?? null,
    location_ar: project?.location_ar ?? null,
    type_en: project?.type_en ?? null,
    type_ar: project?.type_ar ?? null,
    status: (project?.status as ProjectInput["status"]) ?? "under_construction",
    handover_en: project?.handover_en ?? null,
    handover_ar: project?.handover_ar ?? null,
    portfolio: project?.portfolio ?? null,
    price_min: project?.price_min ?? null,
    price_max: project?.price_max ?? null,
    currency: project?.currency ?? "AED",
    area_min_sqft: project?.area_min_sqft ?? null,
    area_max_sqft: project?.area_max_sqft ?? null,
    installment_en: project?.installment_en ?? null,
    installment_ar: project?.installment_ar ?? null,
    down_payment_en: project?.down_payment_en ?? null,
    down_payment_ar: project?.down_payment_ar ?? null,
    monthly_installment_en: project?.monthly_installment_en ?? null,
    monthly_installment_ar: project?.monthly_installment_ar ?? null,
    cash_discount_en: project?.cash_discount_en ?? null,
    cash_discount_ar: project?.cash_discount_ar ?? null,
    notes_en: project?.notes_en ?? null,
    notes_ar: project?.notes_ar ?? null,
    description_en: project?.description_en ?? null,
    description_ar: project?.description_ar ?? null,
    is_featured: project?.is_featured ?? false,
    is_published: project?.is_published ?? false,
  };
}

/**
 * Validates with the same schema *and the same classification* the server
 * uses, so a field can never be described one way before submit and another
 * way after. The resolver stores the safe code as the message; the component
 * translates it at render time, which is also why switching the console
 * language re-labels existing errors without re-validating.
 */
const projectResolver: Resolver<ProjectInput> = async (
  values,
): Promise<ResolverResult<ProjectInput>> => {
  const parsed = projectSchema.safeParse(values);
  if (parsed.success) {
    return { values: parsed.data as ProjectInput, errors: {} };
  }

  const codes = toFieldErrors(parsed.error.issues);
  const errors = Object.fromEntries(
    Object.entries(codes).map(([name, code]) => [
      name,
      { type: code, message: code },
    ]),
  ) as FieldErrors<ProjectInput>;

  // react-hook-form's failure branch expects no parsed values at all.
  return { values: {}, errors };
};

export function ProjectForm({
  project,
  coverUrl,
}: {
  project?: Project;
  coverUrl?: string | null;
}) {
  const t = useTranslations("projectForm");
  const common = useTranslations("common");
  const cover = useTranslations("projectCover");
  const { error: errorMessage, field: fieldMessage } = useAdminMessages();

  const router = useRouter();
  const isEdit = Boolean(project);

  /** Server-reported failures, keyed by field. Cleared on the next submit. */
  const [serverErrors, setServerErrors] = useState<FieldErrorMap>({});
  const [tab, setTab] = useState<"en" | "ar">("en");

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProjectInput>({
    resolver: projectResolver,
    defaultValues: defaults(project),
  });

  const status = useWatch({ control, name: "status" });
  const isFeatured = useWatch({ control, name: "is_featured" });
  const isPublished = useWatch({ control, name: "is_published" });

  /**
   * The bytes live in Storage; `projects.cover_image_path` holds only the
   * bucket-relative path. Deriving the URL here rather than requiring the page
   * to pass it means the Media section works on any route that renders this
   * form, and `coverUrl` stays an optional override.
   */
  const coverImageUrl = coverUrl ?? storageUrl(project?.cover_image_path);

  /**
   * A published project must have a cover, and a cover cannot exist before the
   * project does (the Storage path is namespaced by project id). Rather than
   * letting an admin switch this on and then rejecting the save, the control
   * is disabled until publishing is actually possible — with the reason stated
   * underneath. Turning publishing *off* is always allowed, so a project can
   * never get stuck published.
   */
  const canPublish = isEdit && Boolean(coverImageUrl);

  /**
   * A field shows the client-side message when one exists, otherwise the
   * server's. Both are looked up from the same localized vocabulary, so an
   * admin never sees two different phrasings of the same problem.
   */
  const messageFor = useCallback(
    (name: keyof ProjectInput): string | undefined => {
      const clientCode = errors[name]?.message as FieldIssueCode | undefined;
      const code = clientCode ?? serverErrors[name as string];
      return code ? fieldMessage(code) : undefined;
    },
    [errors, serverErrors, fieldMessage],
  );

  /** Opens the tab that owns the field, then focuses it. */
  const revealField = useCallback((name: string) => {
    if (PROJECT_ARABIC_FIELDS.has(name as never)) setTab("ar");
    else if (name.endsWith("_en")) setTab("en");

    // The tab panel mounts on the next paint, so focus after it exists.
    requestAnimationFrame(() => {
      const element = document.getElementById(name);
      if (!element) return;
      element.scrollIntoView({ block: "center", behavior: "smooth" });
      if (element instanceof HTMLElement) element.focus({ preventScroll: true });
    });
  }, []);

  async function onSubmit(values: ProjectInput) {
    setServerErrors({});

    const result = project
      ? await updateProject(project.id, values)
      : await createProject(values);

    if (!result.ok) {
      const fieldErrors = result.fieldErrors ?? {};
      setServerErrors(fieldErrors);

      const first = firstFieldInOrder(fieldErrors, PROJECT_FIELD_ORDER);

      // One useful summary, never a bare "Validation failed": when the cause
      // is known it is named, otherwise the admin is pointed at the fields.
      toast.error(
        result.error === "validation"
          ? isEdit
            ? t("failedUpdate")
            : t("failedCreate")
          : errorMessage(result.error),
      );

      if (first) revealField(first);
      return;
    }

    if (isEdit) {
      toast.success(t("updatedToast"));
      router.refresh();
      return;
    }

    // Creation always produces a draft, because a cover cannot exist yet.
    toast.success(t("createdToast"), { description: t("createdNext") });
    if ("data" in result && result.data) {
      router.push(`/dashboard-admin/projects/${result.data.id}/edit`);
    }
    router.refresh();
  }

  const onInvalid = useCallback(
    (formErrors: FieldErrors<ProjectInput>) => {
      // One summary toast; the per-field detail is already inline.
      toast.error(isEdit ? t("failedUpdate") : t("failedCreate"));
      const map = Object.fromEntries(
        Object.keys(formErrors).map((key) => [key, "invalid" as FieldIssueCode]),
      );
      const first = firstFieldInOrder(map, PROJECT_FIELD_ORDER);
      if (first) revealField(first);
    },
    [isEdit, revealField, t],
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      // A readable measure: the 35-column table is grouped into sections
      // rather than stretched across the full desktop width.
      className="max-w-5xl space-y-6 pb-24"
      noValidate
    >
      <FormSection title={t("sectionBasic")} description={t("sectionBasicHint")}>
        <BilingualTabs
          value={tab}
          onValueChange={setTab}
          english={
            <>
              <Field
                id="name_en"
                label={t("name")}
                required
                requiredLabel={common("required")}
                error={messageFor("name_en")}
              >
                <Input id="name_en" {...register("name_en")} />
              </Field>
              <Field
                id="developer_en"
                label={t("developer")}
                required
                requiredLabel={common("required")}
                error={messageFor("developer_en")}
              >
                <Input id="developer_en" {...register("developer_en")} />
              </Field>
            </>
          }
          arabic={
            <>
              <Field
                id="name_ar"
                label={t("name")}
                required
                requiredLabel={common("required")}
                error={messageFor("name_ar")}
              >
                <Input id="name_ar" {...register("name_ar")} />
              </Field>
              <Field
                id="developer_ar"
                label={t("developer")}
                required
                requiredLabel={common("required")}
                error={messageFor("developer_ar")}
              >
                <Input id="developer_ar" {...register("developer_ar")} />
              </Field>
            </>
          }
        />
      </FormSection>

      <FormSection
        title={t("sectionClassification")}
        description={t("sectionClassificationHint")}
      >
        <BilingualTabs
          value={tab}
          onValueChange={setTab}
          english={
            <>
              <Field
                id="location_en"
                label={t("location")}
                optionalLabel={common("optional")}
                error={messageFor("location_en")}
              >
                <Input id="location_en" {...register("location_en")} />
              </Field>
              <Field
                id="type_en"
                label={t("type")}
                optionalLabel={common("optional")}
                error={messageFor("type_en")}
              >
                <Input id="type_en" {...register("type_en")} />
              </Field>
              <Field
                id="handover_en"
                label={t("handover")}
                optionalLabel={common("optional")}
                error={messageFor("handover_en")}
              >
                <Input id="handover_en" {...register("handover_en")} />
              </Field>
            </>
          }
          arabic={
            <>
              <Field
                id="location_ar"
                label={t("location")}
                optionalLabel={common("optional")}
                error={messageFor("location_ar")}
              >
                <Input id="location_ar" {...register("location_ar")} />
              </Field>
              <Field
                id="type_ar"
                label={t("type")}
                optionalLabel={common("optional")}
                error={messageFor("type_ar")}
              >
                <Input id="type_ar" {...register("type_ar")} />
              </Field>
              <Field
                id="handover_ar"
                label={t("handover")}
                optionalLabel={common("optional")}
                error={messageFor("handover_ar")}
              >
                <Input id="handover_ar" {...register("handover_ar")} />
              </Field>
            </>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="status" label={t("status")} error={messageFor("status")}>
            <Select
              value={status}
              onValueChange={(value) =>
                setValue("status", value as ProjectInput["status"])
              }
            >
              <SelectTrigger id="status" className="w-full">
                {/*
                 * Base UI renders the raw value unless given a function child,
                 * so without this the Arabic console showed "ready".
                 */}
                <SelectValue>
                  {(value: string) =>
                    value in STATUS_KEYS
                      ? t(STATUS_KEYS[value as keyof typeof STATUS_KEYS])
                      : value
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PROJECT_STATUSES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {t(STATUS_KEYS[value])}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field
            id="portfolio"
            label={t("portfolio")}
            optionalLabel={common("optional")}
            error={messageFor("portfolio")}
          >
            {/* Chrome reads the name as a profile field and offers URLs. */}
            <Input
              id="portfolio"
              autoComplete="off"
              {...register("portfolio")}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title={t("sectionPricing")}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field
            id="price_min"
            label={t("priceMin")}
            optionalLabel={common("optional")}
            error={messageFor("price_min")}
          >
            <Input
              id="price_min"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              dir="ltr"
              className="text-start"
              {...register("price_min")}
            />
          </Field>
          <Field
            id="price_max"
            label={t("priceMax")}
            optionalLabel={common("optional")}
            error={messageFor("price_max")}
          >
            <Input
              id="price_max"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              dir="ltr"
              className="text-start"
              {...register("price_max")}
            />
          </Field>
          <Field
            id="currency"
            label={t("currency")}
            hint={t("currencyHint")}
            error={messageFor("currency")}
          >
            <Input
              id="currency"
              maxLength={3}
              dir="ltr"
              className="text-start uppercase"
              {...register("currency")}
            />
          </Field>
          <Field
            id="area_min_sqft"
            label={t("areaMin")}
            optionalLabel={common("optional")}
            error={messageFor("area_min_sqft")}
          >
            <Input
              id="area_min_sqft"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              dir="ltr"
              className="text-start"
              {...register("area_min_sqft")}
            />
          </Field>
          <Field
            id="area_max_sqft"
            label={t("areaMax")}
            optionalLabel={common("optional")}
            error={messageFor("area_max_sqft")}
          >
            <Input
              id="area_max_sqft"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              dir="ltr"
              className="text-start"
              {...register("area_max_sqft")}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title={t("sectionPayment")}>
        <BilingualTabs
          value={tab}
          onValueChange={setTab}
          english={
            <>
              <Field
                id="installment_en"
                label={t("installment")}
                optionalLabel={common("optional")}
                error={messageFor("installment_en")}
              >
                <Input id="installment_en" {...register("installment_en")} />
              </Field>
              <Field
                id="down_payment_en"
                label={t("downPayment")}
                optionalLabel={common("optional")}
                error={messageFor("down_payment_en")}
              >
                <Input id="down_payment_en" {...register("down_payment_en")} />
              </Field>
              <Field
                id="monthly_installment_en"
                label={t("monthlyInstallment")}
                optionalLabel={common("optional")}
                error={messageFor("monthly_installment_en")}
              >
                <Input
                  id="monthly_installment_en"
                  {...register("monthly_installment_en")}
                />
              </Field>
              <Field
                id="cash_discount_en"
                label={t("cashDiscount")}
                optionalLabel={common("optional")}
                error={messageFor("cash_discount_en")}
              >
                <Input
                  id="cash_discount_en"
                  {...register("cash_discount_en")}
                />
              </Field>
            </>
          }
          arabic={
            <>
              <Field
                id="installment_ar"
                label={t("installment")}
                optionalLabel={common("optional")}
                error={messageFor("installment_ar")}
              >
                <Input id="installment_ar" {...register("installment_ar")} />
              </Field>
              <Field
                id="down_payment_ar"
                label={t("downPayment")}
                optionalLabel={common("optional")}
                error={messageFor("down_payment_ar")}
              >
                <Input id="down_payment_ar" {...register("down_payment_ar")} />
              </Field>
              <Field
                id="monthly_installment_ar"
                label={t("monthlyInstallment")}
                optionalLabel={common("optional")}
                error={messageFor("monthly_installment_ar")}
              >
                <Input
                  id="monthly_installment_ar"
                  {...register("monthly_installment_ar")}
                />
              </Field>
              <Field
                id="cash_discount_ar"
                label={t("cashDiscount")}
                optionalLabel={common("optional")}
                error={messageFor("cash_discount_ar")}
              >
                <Input
                  id="cash_discount_ar"
                  {...register("cash_discount_ar")}
                />
              </Field>
            </>
          }
        />
      </FormSection>

      <FormSection title={t("sectionDescription")}>
        <BilingualTabs
          value={tab}
          onValueChange={setTab}
          english={
            <>
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
              <Field
                id="notes_en"
                label={t("notes")}
                optionalLabel={common("optional")}
                error={messageFor("notes_en")}
              >
                <Textarea id="notes_en" rows={3} {...register("notes_en")} />
              </Field>
            </>
          }
          arabic={
            <>
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
              <Field
                id="notes_ar"
                label={t("notes")}
                optionalLabel={common("optional")}
                error={messageFor("notes_ar")}
              >
                <Textarea id="notes_ar" rows={3} {...register("notes_ar")} />
              </Field>
            </>
          }
        />
      </FormSection>

      <FormSection title={t("sectionMedia")} description={t("sectionMediaHint")}>
        {project ? (
          <ProjectCoverManager
            projectId={project.id}
            coverUrl={coverImageUrl}
            isPublished={project.is_published}
          />
        ) : (
          <p className="text-sm text-muted-foreground">{cover("saveFirst")}</p>
        )}
      </FormSection>

      <FormSection
        title={t("sectionPublishing")}
        description={t("sectionPublishingHint")}
      >
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
              id="is_published"
              checked={isPublished}
              disabled={!canPublish && !isPublished}
              onCheckedChange={(checked) => setValue("is_published", checked)}
            />
            {t("isPublished")}
          </label>
        </div>

        {!canPublish && !isPublished ? (
          <p className="text-sm text-muted-foreground">
            {isEdit ? t("publishNeedsCover") : t("publishAfterCreate")}
          </p>
        ) : null}

        {serverErrors.is_published ? (
          <p role="alert" className="text-sm text-destructive">
            {fieldMessage(serverErrors.is_published)}
          </p>
        ) : null}
      </FormSection>

      {/*
       * Sticky action bar: the form is long enough that a footer button would
       * sit below the fold on every screen after the first section.
       */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? isEdit
                ? common("saving")
                : common("creating")
              : isEdit
                ? t("submitUpdate")
                : t("submitCreate")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={isSubmitting}
            onClick={() => router.push("/dashboard-admin/projects")}
          >
            {common("cancel")}
          </Button>
        </div>
      </div>
    </form>
  );
}
