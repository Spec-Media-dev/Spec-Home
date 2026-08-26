import Link from "next/link";

import { cn } from "@/lib/utils";

type KpiCardProps = {
  label: string;
  value: number;
  href?: string;
  accent?: boolean;
};

/**
 * Counts only. The brief explicitly rules out analytics charts, so nothing
 * here implies a trend or metric the database cannot substantiate.
 */
export function KpiCard({ label, value, href, accent }: KpiCardProps) {
  const body = (
    <>
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 text-3xl font-semibold tabular-nums",
          accent && "text-brand-gold",
        )}
      >
        {value}
      </p>
    </>
  );

  const className = cn(
    "rounded-xl border border-border bg-card p-5 transition-colors",
    href && "hover:border-primary/40 hover:bg-muted/40",
  );

  return href ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}
