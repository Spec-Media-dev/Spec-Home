import { Badge } from "@/components/ui/badge";
import { getAdminTranslations } from "@/lib/admin-i18n";
import { cn } from "@/lib/utils";

const TONE: Record<string, string> = {
  new: "bg-brand-gold/15 text-brand-gold border-brand-gold/30",
  contacted:
    "bg-primary/10 text-primary border-primary/25 dark:text-brand-gold",
  closed: "bg-muted text-muted-foreground border-border",
};

/**
 * The three status columns are plain text in Postgres with no CHECK, so an
 * unrecognised value is displayed verbatim rather than hidden — an operator
 * seeing a raw value is more useful than one seeing nothing.
 */
const NAMESPACES = {
  new: "enquiryStatus",
  contacted: "enquiryStatus",
  closed: "enquiryStatus",
  available: "propertyStatus",
  reserved: "propertyStatus",
  sold: "propertyStatus",
  under_construction: "projectStatus",
  ready: "projectStatus",
  sold_out: "projectStatus",
} as const;

export async function StatusChip({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const namespace = NAMESPACES[status as keyof typeof NAMESPACES];
  let label = status;

  if (namespace) {
    const t = await getAdminTranslations(namespace);
    label = t(status as never);
  }

  return (
    <Badge variant="outline" className={cn(TONE[status], className)}>
      {label}
    </Badge>
  );
}
