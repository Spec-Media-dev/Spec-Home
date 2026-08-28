"use client";

import { Link, usePathname } from "@/i18n/navigation";

type NavLink = {
  href: string;
  label: string;
};

export function HeaderNavLinks({ links }: { links: NavLink[] }) {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={pathname === link.href ? "page" : undefined}
          className={`text-sm font-medium transition-colors hover:text-foreground ${
            pathname === link.href
              ? "text-brand-gold underline"
              : "text-muted-foreground"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </>
  );
}
