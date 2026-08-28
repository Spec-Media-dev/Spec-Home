import { Mail, MessageCircle, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { BrandLogo } from "@/components/shared/brand-logo";
import { navItems } from "@/components/site/site-header";
import { Link } from "@/i18n/navigation";
import { contact } from "@/config/contact";
import { getSiteSettings } from "@/lib/data/settings";
import { storageUrl } from "@/lib/storage";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");
  const settings = await getSiteSettings();
  const logoUrl = storageUrl(settings?.logo_path);

  const contactLinks = [
    ...(contact.phone && contact.phoneHref
      ? [{ href: contact.phoneHref, label: contact.phone, Icon: Phone }]
      : []),
    ...(contact.whatsapp && contact.whatsappHref
      ? [
          {
            href: contact.whatsappHref,
            label: contact.whatsapp,
            Icon: MessageCircle,
          },
        ]
      : []),
    { href: contact.emailHref, label: contact.email, Icon: Mail },
  ];

  return (
    <footer className="mt-20 border-t border-border bg-card">
      <div className="container-content grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="space-y-4">
          <BrandLogo logoUrl={logoUrl} />
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            {t("tagline")}
          </p>
        </div>

        <nav aria-labelledby="footer-explore" className="space-y-3">
          <h2
            id="footer-explore"
            className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
          >
            {t("explore")}
          </h2>
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                >
                  {nav(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {t("contact")}
          </h2>
          <ul className="space-y-2">
            {contactLinks.map(({ href, label, Icon }) => (
              <li key={href}>
                <a
                  href={href}
                  className="flex items-center gap-2 text-sm text-foreground/80 transition-colors hover:text-foreground"
                >
                  <Icon
                    className="size-4 shrink-0 text-brand-gold"
                    aria-hidden
                  />
                  <span dir="ltr">{label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-content py-6">
          <p className="text-xs text-muted-foreground">
            {t("rights", { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}
