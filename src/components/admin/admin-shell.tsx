import { AdminRealtimeBridge } from "@/components/admin/admin-realtime-bridge";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";

type AdminShellProps = {
  name: string;
  email: string;
  avatarUrl: string | null;
  logoUrl: string | null;
  children: React.ReactNode;
};

export function AdminShell({
  name,
  email,
  avatarUrl,
  logoUrl,
  children,
}: AdminShellProps) {
  return (
    <div className="flex min-h-dvh bg-muted/30">
      {/*
       * 256px rail, matching the measured Design #2 admin frames. The layout
       * is a plain flex row and the border is logical (`border-e`), so in an
       * Arabic console `dir="rtl"` moves the rail to the right edge and flips
       * the border with it — no mirrored stylesheet, no left/right overrides.
       */}
      <aside className="hidden w-64 shrink-0 border-e border-border bg-sidebar md:block">
        <AdminSidebar
          name={name}
          email={email}
          avatarUrl={avatarUrl}
          logoUrl={logoUrl}
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar
          name={name}
          email={email}
          avatarUrl={avatarUrl}
          logoUrl={logoUrl}
        />
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      {/* One subscription for the whole console. */}
      <AdminRealtimeBridge />
    </div>
  );
}
