"use client";

import { useAdminAction } from "@/components/admin/use-admin-action";
import { Button } from "@/components/ui/button";
import { updateEnquiryStatus } from "@/lib/actions/enquiries";
import { ENQUIRY_STATUSES } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  closed: "Closed",
};

/**
 * `enquiries.status` is a plain text column with no CHECK, so the allowed
 * values are defined by the application. These three match the Figma lead
 * inbox and are the only ones the server accepts.
 */
export function EnquiryStatusControl({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const { run, pending } = useAdminAction();

  return (
    <div className="flex flex-col gap-2">
      {ENQUIRY_STATUSES.map((value) => (
        <Button
          key={value}
          type="button"
          variant={value === status ? "default" : "outline"}
          disabled={pending || value === status}
          className={cn("justify-start")}
          onClick={() =>
            run(
              () => updateEnquiryStatus(id, value),
              `Enquiry marked as ${LABELS[value].toLowerCase()}.`,
            )
          }
        >
          {LABELS[value]}
        </Button>
      ))}
    </div>
  );
}
