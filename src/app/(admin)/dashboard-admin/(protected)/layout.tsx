import { AdminShell } from "@/components/admin/admin-shell";
import { getSiteSettings } from "@/lib/data/settings";
import { requireAdmin } from "@/lib/supabase/admin";
import { storageUrl } from "@/lib/storage";

/**
 * Guards every admin route except /dashboard-admin/login, which sits outside
 * this route group. Server Actions re-check independently — a layout guard
 * alone would leave them exposed.
 *
 * The site logo and the admin's avatar are resolved here, once, and handed to
 * the shell: every surface that draws either of them reads the same value.
 */
export default async function ProtectedAdminLayout({
  children,
}: LayoutProps<"/dashboard-admin">) {
  const [session, settings] = await Promise.all([
    requireAdmin(),
    getSiteSettings(),
  ]);

  return (
    <AdminShell
      name={session.profile.name}
      email={session.email}
      avatarUrl={storageUrl(session.profile.avatar_path)}
      logoUrl={storageUrl(settings?.logo_path)}
    >
      {children}
    </AdminShell>
  );
}
