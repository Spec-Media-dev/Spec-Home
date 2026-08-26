import { MessageCircle, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { contact } from "@/config/contact";

/**
 * Design #1's floating mobile CTA. Contact values come from static config
 * because the database has no columns for them (see brief §15).
 */
export async function MobileContactBar() {
  const t = await getTranslations("common");

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 p-3 backdrop-blur lg:hidden">
      <div className="container-content flex items-center gap-2">
        <Button
          className="h-12 flex-1"
          nativeButton={false}
          render={<Link href="/contact" />}
        >
          {t("enquire")}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-12"
          aria-label={t("callUs")}
          nativeButton={false}
          render={<a href={contact.phoneHref} />}
        >
          <Phone className="size-5" aria-hidden />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-12"
          aria-label={t("whatsapp")}
          render={
            <a
              href={contact.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
            />
          }
        >
          <MessageCircle className="size-5" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
