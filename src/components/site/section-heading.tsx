import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
  align?: "start" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  href,
  linkLabel,
  className,
  align = "start",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:flex-col sm:items-center sm:text-center",
        className,
      )}
    >
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {subtitle}
          </p>
        ) : null}
      </div>
      {href && linkLabel ? (
        <Link
          href={href}
          className="shrink-0 text-sm font-medium text-primary underline-offset-4 hover:underline dark:text-brand-gold"
        >
          {linkLabel} →
        </Link>
      ) : null}
    </div>
  );
}
