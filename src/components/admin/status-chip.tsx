import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ENQUIRY_TONE: Record<string, string> = {
  new: "bg-brand-gold/15 text-brand-gold border-brand-gold/30",
  contacted:
    "bg-primary/10 text-primary border-primary/25 dark:text-brand-gold",
  closed: "bg-muted text-muted-foreground border-border",
};

const LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  closed: "Closed",
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
  under_construction: "Under construction",
  ready: "Ready",
  sold_out: "Sold out",
};

export function StatusChip({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("capitalize", ENQUIRY_TONE[status], className)}
    >
      {LABELS[status] ?? status}
    </Badge>
  );
}
