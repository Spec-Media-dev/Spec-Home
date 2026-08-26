import Image from "next/image";

import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  /** Admin-uploaded logo from site_settings; overrides the bundled default. */
  logoUrl?: string | null;
  className?: string;
  showWordmark?: boolean;
  priority?: boolean;
};

/**
 * The mark is the official vector extracted from the Brand Guidelines. The
 * wordmark is typeset rather than extracted, because in the source PDF it is
 * live text rather than outlines — see the brand notes in the final report.
 */
export function BrandLogo({
  logoUrl,
  className,
  showWordmark = true,
  priority = false,
}: BrandLogoProps) {
  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={brand.name}
        width={160}
        height={44}
        priority={priority}
        className={cn("h-9 w-auto object-contain", className)}
      />
    );
  }

  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <Image
        src={brand.logo.mark}
        alt=""
        aria-hidden
        width={26}
        height={36}
        priority={priority}
        className="h-8 w-auto"
      />
      {showWordmark ? (
        <span className="flex flex-col leading-none">
          <span className="text-base font-semibold tracking-tight">
            <span className="font-bold">SPEC</span>
            <span className="font-normal"> HOME</span>
          </span>
          <span className="mt-0.5 text-[0.5rem] font-medium uppercase tracking-[0.32em] text-muted-foreground">
            Properties
          </span>
        </span>
      ) : null}
    </span>
  );
}
