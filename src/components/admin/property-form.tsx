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
import { createProperty, updateProperty } from "@/lib/actions/properties";
import { PROPERTY_STATUSES, type Property } from "@/lib/supabase/types";
import { propertySchema, type PropertyInput } from "@/lib/validations/property";

const STATUS_LABELS: Record<string, string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
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
  const router = useRouter();
  const isEdit = Boolean(property);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PropertyInput>({
    resolver: zodResolver(propertySchema) as unknown as Resolver<PropertyInput>,
    defaultValues: defaults(property, presetProjectId),
  });

  const projectId = useWatch({ control, name: "project_id" });
  const status = useWatch({ control, name: "status" });
  const isFeatured = useWatch({ control, name: "is_featured" });
  const isPublished = useWatch({ control, name: "is_published" });

  // A new property has no id yet, so it cannot have images, so it cannot be
  // published in the same step. Publishing is offered once images exist.
  const canPublish = isEdit && imageCount > 0;

  async function onSubmit(values: PropertyInput) {
    const result = property
      ? await updateProperty(property.id, values)
      : await createProperty({ ...values, is_published: false });

    if (!result.ok) {
      toast.error(adminError(result.error));
      return;
    }

    if (!isEdit && "data" in result && result.data) {
      toast.success("Property created as a draft. Add images to publish it.");
      router.push(`/dashboard-admin/properties/${result.data.id}/images`);
      return;
    }

    toast.success("Property updated.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <FormSection
        title="Project"
        description="Every property must belong to a project."
      >
        <Field
          id="project_id"
          label="Project"
          error={errors.project_id?.message}
        >
          <Select
            value={projectId || undefined}
            onValueChange={(value) => setValue("project_id", String(value))}
          >
            <SelectTrigger id="project_id">
              <SelectValue placeholder="Select a project" />
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

      <FormSection title="Content">
        <BilingualTabs
          english={
            <>
              <Field
                id="title_en"
                label="Title"
                error={errors.title_en?.message}
              >
                <Input id="title_en" {...register("title_en")} />
              </Field>
              <Field
                id="property_type_en"
                label="Property type"
                error={errors.property_type_en?.message}
                hint="For example: Apartment, Villa, Townhouse"
              >
                <Input
                  id="property_type_en"
                  {...register("property_type_en")}
                />
              </Field>
              <Field id="description_en" label="Description">
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
                label="العنوان"
                error={errors.title_ar?.message}
              >
                <Input id="title_ar" {...register("title_ar")} />
              </Field>
              <Field
                id="property_type_ar"
                label="نوع العقار"
                error={errors.property_type_ar?.message}
              >
                <Input
                  id="property_type_ar"
                  {...register("property_type_ar")}
                />
              </Field>
              <Field id="description_ar" label="الوصف">
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

      <FormSection title="Details">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            id="price"
            label="Price"
            hint="Leave empty for price on request"
          >
            <Input id="price" type="number" min={0} {...register("price")} />
          </Field>
          <Field id="currency" label="Currency">
            <Input id="currency" maxLength={3} {...register("currency")} />
          </Field>
          <Field id="status" label="Status">
            <Select
              value={status}
              onValueChange={(value) =>
                setValue("status", value as PropertyInput["status"])
              }
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_STATUSES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {STATUS_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field id="bedrooms" label="Bedrooms">
            <Input
              id="bedrooms"
              type="number"
              min={0}
              {...register("bedrooms")}
            />
          </Field>
          <Field id="bathrooms" label="Bathrooms">
            <Input
              id="bathrooms"
              type="number"
              min={0}
              {...register("bathrooms")}
            />
          </Field>
          <Field id="size_sqft" label="Size (sqft)">
            <Input
              id="size_sqft"
              type="number"
              min={0}
              {...register("size_sqft")}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Visibility">
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
              disabled={!canPublish}
              onCheckedChange={(checked) => setValue("is_published", checked)}
            />
            Published
          </label>
        </div>
        {!canPublish ? (
          <p className="text-xs text-muted-foreground">
            {isEdit
              ? "Add at least one image before publishing this property."
              : "Save as a draft first, then add images to publish."}
          </p>
        ) : null}
      </FormSection>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Save as draft"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/dashboard-admin/properties")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
