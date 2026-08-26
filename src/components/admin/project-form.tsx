"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { toast } from "sonner";

import { adminError } from "@/components/admin/action-messages";
import { BilingualTabs } from "@/components/admin/bilingual-tabs";
import { Field } from "@/components/admin/field";
import { FormSection } from "@/components/admin/form-section";
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
import { PROJECT_STATUSES, type Project } from "@/lib/supabase/types";
import { projectSchema, type ProjectInput } from "@/lib/validations/project";

const STATUS_LABELS: Record<string, string> = {
  under_construction: "Under construction",
  ready: "Ready",
  sold_out: "Sold out",
};

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

export function ProjectForm({ project }: { project?: Project }) {
  const router = useRouter();
  const isEdit = Boolean(project);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProjectInput>({
    // Zod transforms make the schema's input and output types diverge, which
    // the resolver generic cannot express on its own.
    resolver: zodResolver(projectSchema) as unknown as Resolver<ProjectInput>,
    defaultValues: defaults(project),
  });

  const status = useWatch({ control, name: "status" });
  const isFeatured = useWatch({ control, name: "is_featured" });
  const isPublished = useWatch({ control, name: "is_published" });

  async function onSubmit(values: ProjectInput) {
    const result = project
      ? await updateProject(project.id, values)
      : await createProject(values);

    if (!result.ok) {
      toast.error(adminError(result.error));
      return;
    }

    toast.success(isEdit ? "Project updated." : "Project created.");
    if (!isEdit && "data" in result && result.data) {
      router.push(`/dashboard-admin/projects/${result.data.id}/edit`);
    }
    router.refresh();
  }

  // The 35-column table is grouped rather than presented as one long form.
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <FormSection
        title="Basic information"
        description="Name and developer are required in both languages."
      >
        <BilingualTabs
          english={
            <>
              <Field
                id="name_en"
                label="Project name"
                error={errors.name_en?.message}
              >
                <Input id="name_en" {...register("name_en")} />
              </Field>
              <Field
                id="developer_en"
                label="Developer"
                error={errors.developer_en?.message}
              >
                <Input id="developer_en" {...register("developer_en")} />
              </Field>
            </>
          }
          arabic={
            <>
              <Field
                id="name_ar"
                label="اسم المشروع"
                error={errors.name_ar?.message}
              >
                <Input id="name_ar" {...register("name_ar")} />
              </Field>
              <Field
                id="developer_ar"
                label="المطور"
                error={errors.developer_ar?.message}
              >
                <Input id="developer_ar" {...register("developer_ar")} />
              </Field>
            </>
          }
        />
      </FormSection>

      <FormSection
        title="Classification"
        description="Location is plain text — no map or coordinates are stored."
      >
        <BilingualTabs
          english={
            <>
              <Field id="location_en" label="Location">
                <Input id="location_en" {...register("location_en")} />
              </Field>
              <Field id="type_en" label="Type">
                <Input id="type_en" {...register("type_en")} />
              </Field>
              <Field id="handover_en" label="Handover">
                <Input id="handover_en" {...register("handover_en")} />
              </Field>
            </>
          }
          arabic={
            <>
              <Field id="location_ar" label="الموقع">
                <Input id="location_ar" {...register("location_ar")} />
              </Field>
              <Field id="type_ar" label="النوع">
                <Input id="type_ar" {...register("type_ar")} />
              </Field>
              <Field id="handover_ar" label="التسليم">
                <Input id="handover_ar" {...register("handover_ar")} />
              </Field>
            </>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="status" label="Status">
            <Select
              value={status}
              onValueChange={(value) =>
                setValue("status", value as ProjectInput["status"])
              }
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_STATUSES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {STATUS_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field id="portfolio" label="Portfolio">
            <Input id="portfolio" {...register("portfolio")} />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Pricing and area">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field id="price_min" label="Price from">
            <Input
              id="price_min"
              type="number"
              min={0}
              {...register("price_min")}
            />
          </Field>
          <Field id="price_max" label="Price to">
            <Input
              id="price_max"
              type="number"
              min={0}
              {...register("price_max")}
            />
          </Field>
          <Field id="currency" label="Currency">
            <Input id="currency" maxLength={3} {...register("currency")} />
          </Field>
          <Field id="area_min_sqft" label="Area from (sqft)">
            <Input
              id="area_min_sqft"
              type="number"
              min={0}
              {...register("area_min_sqft")}
            />
          </Field>
          <Field id="area_max_sqft" label="Area to (sqft)">
            <Input
              id="area_max_sqft"
              type="number"
              min={0}
              {...register("area_max_sqft")}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Payment details">
        <BilingualTabs
          english={
            <>
              <Field id="installment_en" label="Payment plan">
                <Input id="installment_en" {...register("installment_en")} />
              </Field>
              <Field id="down_payment_en" label="Down payment">
                <Input id="down_payment_en" {...register("down_payment_en")} />
              </Field>
              <Field id="monthly_installment_en" label="Monthly installment">
                <Input
                  id="monthly_installment_en"
                  {...register("monthly_installment_en")}
                />
              </Field>
              <Field id="cash_discount_en" label="Cash discount">
                <Input
                  id="cash_discount_en"
                  {...register("cash_discount_en")}
                />
              </Field>
            </>
          }
          arabic={
            <>
              <Field id="installment_ar" label="خطة السداد">
                <Input id="installment_ar" {...register("installment_ar")} />
              </Field>
              <Field id="down_payment_ar" label="الدفعة الأولى">
                <Input id="down_payment_ar" {...register("down_payment_ar")} />
              </Field>
              <Field id="monthly_installment_ar" label="القسط الشهري">
                <Input
                  id="monthly_installment_ar"
                  {...register("monthly_installment_ar")}
                />
              </Field>
              <Field id="cash_discount_ar" label="خصم الدفع النقدي">
                <Input
                  id="cash_discount_ar"
                  {...register("cash_discount_ar")}
                />
              </Field>
            </>
          }
        />
      </FormSection>

      <FormSection title="Description and notes">
        <BilingualTabs
          english={
            <>
              <Field id="description_en" label="Description">
                <Textarea
                  id="description_en"
                  rows={5}
                  {...register("description_en")}
                />
              </Field>
              <Field id="notes_en" label="Notes">
                <Textarea id="notes_en" rows={3} {...register("notes_en")} />
              </Field>
            </>
          }
          arabic={
            <>
              <Field id="description_ar" label="الوصف">
                <Textarea
                  id="description_ar"
                  rows={5}
                  {...register("description_ar")}
                />
              </Field>
              <Field id="notes_ar" label="ملاحظات">
                <Textarea id="notes_ar" rows={3} {...register("notes_ar")} />
              </Field>
            </>
          }
        />
      </FormSection>

      <FormSection
        title="Publishing"
        description="Unpublishing a project also hides all of its properties from the public site."
      >
        <div className="flex flex-wrap gap-8">
          <label className="flex items-center gap-3 text-sm font-medium">
            <Switch
              checked={isFeatured}
              onCheckedChange={(checked) => setValue("is_featured", checked)}
            />
            Featured
          </label>
          <label className="flex items-center gap-3 text-sm font-medium">
            <Switch
              checked={isPublished}
              onCheckedChange={(checked) => setValue("is_published", checked)}
            />
            Published
          </label>
        </div>
      </FormSection>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving…"
            : isEdit
              ? "Save changes"
              : "Create project"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/dashboard-admin/projects")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
