import Image from "next/image";
import { UserRound } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The administrator's avatar, or the generic person icon when
 * `admin_profiles.avatar_path` is null.
 *
 * One component so the sidebar, the topbar, the mobile sheet, and the profile
 * form can never disagree about the fallback — the previous sidebar silently
 * discarded the `avatarUrl` it was handed and always drew the icon.
 */
export function AdminAvatar({
  avatarUrl,
  alt,
  size = 32,
  className,
}: {
  avatarUrl: string | null;
  alt: string;
  size?: number;
  className?: string;
}) {
  const shell = cn(
    "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted",
    className,
  );

  if (!avatarUrl) {
    return (
      <span className={shell} style={{ width: size, height: size }}>
        <UserRound
          className="size-1/2 text-muted-foreground"
          aria-hidden
        />
      </span>
    );
  }

  return (
    <Image
      src={avatarUrl}
      alt={alt}
      width={size}
      height={size}
      className={cn("shrink-0 rounded-full object-cover", className)}
      style={{ width: size, height: size }}
    />
  );
}
