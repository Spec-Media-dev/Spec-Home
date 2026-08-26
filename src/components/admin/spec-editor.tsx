"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useAdminAction } from "@/components/admin/use-admin-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { savePropertySpecs } from "@/lib/actions/specs";

export type SpecRow = {
  key_en: string;
  key_ar: string;
  value_en: string;
  value_ar: string;
};

const EMPTY_ROW: SpecRow = {
  key_en: "",
  key_ar: "",
  value_en: "",
  value_ar: "",
};

/**
 * Edits the whole set locally and saves it in one action. Row-by-row writes
 * would multiply round trips and could leave the list half-updated.
 */
export function SpecEditor({
  propertyId,
  initialSpecs,
}: {
  propertyId: string;
  initialSpecs: SpecRow[];
}) {
  const { run, pending } = useAdminAction();
  const [rows, setRows] = useState<SpecRow[]>(initialSpecs);

  function update(index: number, field: keyof SpecRow, value: string) {
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  }

  function save() {
    // Blank rows are dropped silently; partially filled ones are an error, so
    // an admin is never left wondering why a row vanished.
    const filled = rows.filter((row) =>
      Object.values(row).some((value) => value.trim() !== ""),
    );

    const incomplete = filled.find((row) =>
      Object.values(row).some((value) => value.trim() === ""),
    );

    if (incomplete) {
      toast.error("Complete all four fields on each specification row.");
      return;
    }

    run(
      () => savePropertySpecs({ propertyId, specs: filled }),
      "Specifications saved.",
      () => setRows(filled),
    );
  }

  return (
    <div className="space-y-4">
      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <p className="font-medium">No specifications</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Specifications are optional. Add rows to show a details table on the
            property page.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((row, index) => (
            <li
              key={index}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2" dir="ltr">
                  <Label htmlFor={`key_en-${index}`}>Label (English)</Label>
                  <Input
                    id={`key_en-${index}`}
                    value={row.key_en}
                    onChange={(event) =>
                      update(index, "key_en", event.target.value)
                    }
                  />
                </div>
                <div className="grid gap-2" dir="rtl">
                  <Label htmlFor={`key_ar-${index}`}>التسمية (العربية)</Label>
                  <Input
                    id={`key_ar-${index}`}
                    value={row.key_ar}
                    onChange={(event) =>
                      update(index, "key_ar", event.target.value)
                    }
                  />
                </div>
                <div className="grid gap-2" dir="ltr">
                  <Label htmlFor={`value_en-${index}`}>Value (English)</Label>
                  <Input
                    id={`value_en-${index}`}
                    value={row.value_en}
                    onChange={(event) =>
                      update(index, "value_en", event.target.value)
                    }
                  />
                </div>
                <div className="grid gap-2" dir="rtl">
                  <Label htmlFor={`value_ar-${index}`}>القيمة (العربية)</Label>
                  <Input
                    id={`value_ar-${index}`}
                    value={row.value_ar}
                    onChange={(event) =>
                      update(index, "value_ar", event.target.value)
                    }
                  />
                </div>
              </div>

              <div className="mt-3 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-destructive"
                  onClick={() =>
                    setRows((current) => current.filter((_, i) => i !== index))
                  }
                >
                  <Trash2 className="size-4" aria-hidden />
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={() => setRows((current) => [...current, { ...EMPTY_ROW }])}
        >
          <Plus className="size-4" aria-hidden />
          Add specification
        </Button>
        <Button type="button" disabled={pending} onClick={save}>
          {pending ? "Saving…" : "Save specifications"}
        </Button>
      </div>
    </div>
  );
}
