import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  subtitle,
  children,
  className,
}: PageHeaderProps) {
  return (
    <section className={cn("border-b border-border bg-muted/30", className)}>
      <div className="container-content py-12 sm:py-16">
        <div className="max-w-3xl space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              {subtitle}
            </p>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}
