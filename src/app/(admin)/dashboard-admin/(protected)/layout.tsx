import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/supabase/admin";
import { storageUrl } from "@/lib/storage";

/**
 * Guards every admin route except /dashboard-admin/login, which sits outside
 * this route group. Server Actions re-check independently — a layout guard
 * alone would leave them exposed.
 */
export default async function ProtectedAdminLayout({
  children,
}: LayoutProps<"/dashboard-admin">) {
  const session = await requireAdmin();

  return (
    <AdminShell
      name={session.profile.name}
      email={session.email}
      avatarUrl={storageUrl(session.profile.avatar_path)}
    >
      {children}
    </AdminShell>
  );
}
