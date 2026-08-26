import { LogoForm } from "@/components/admin/settings-forms";
import { getSiteSettings } from "@/lib/data/settings";
import { storageUrl } from "@/lib/storage";

export const metadata = { title: "Site settings" };

export default async function SiteSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="mb-5 space-y-1">
        <h2 className="font-semibold">Site logo</h2>
        <p className="text-sm text-muted-foreground">
          Replaces the bundled SPEC Home logo in the public header and footer.
        </p>
      </div>
      <LogoForm logoUrl={storageUrl(settings?.logo_path)} />
    </section>
  );
}
