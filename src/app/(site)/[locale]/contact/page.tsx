import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { EnquiryForm } from "@/components/site/enquiry-form";
import { PageHeader } from "@/components/site/page-header";
import { contact } from "@/config/contact";
import type { Locale } from "@/i18n/routing";
import { JsonLd } from "@/lib/seo/json-ld";
import { buildContactGraph } from "@/lib/seo/graphs";
import { buildAlternates } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: buildAlternates("/contact", locale as Locale),
  };
}

export default async function ContactPage({
  params,
}: PageProps<"/[locale]/contact">) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(locale);

  const t = await getTranslations("contact");
  const common = await getTranslations("common");

  const channels = [
    {
      Icon: Phone,
      label: common("callUs"),
      value: contact.phone,
      href: contact.phoneHref,
    },
    {
      Icon: MessageCircle,
      label: common("whatsapp"),
      value: contact.whatsapp,
      href: contact.whatsappHref,
    },
    {
      Icon: Mail,
      label: common("email"),
      value: contact.email,
      href: contact.emailHref,
    },
  ];

  return (
    <>
      <JsonLd data={await buildContactGraph(locale)} />
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <section className="container-content grid gap-12 py-14 pb-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-start">
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">{t("detailsTitle")}</h2>
            <ul className="space-y-3">
              {channels.map(({ Icon, label, value, href }) => (
                <li key={href}>
                  <a
                    href={href}
                    className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted"
                  >
                    <Icon
                      className="mt-0.5 size-5 shrink-0 text-brand-gold"
                      aria-hidden
                    />
                    <span className="space-y-0.5">
                      <span className="block text-xs uppercase tracking-[0.14em] text-muted-foreground">
                        {label}
                      </span>
                      <span className="block text-sm font-medium" dir="ltr">
                        {value}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold">{t("officeTitle")}</h2>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4 shrink-0 text-brand-gold" aria-hidden />
              {contact.address.locality}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
          <EnquiryForm locale={locale} />
        </div>
      </section>
    </>
  );
}
