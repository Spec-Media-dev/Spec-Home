import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";

type AdminShellProps = {
  name: string;
  email: string;
  avatarUrl: string | null;
  children: React.ReactNode;
};

export function AdminShell({
  name,
  email,
  avatarUrl,
  children,
}: AdminShellProps) {
  return (
    <div className="flex min-h-dvh bg-muted/30">
      {/* 256px rail, matching the measured Design #2 admin frames. */}
      <aside className="hidden w-64 shrink-0 border-e border-border bg-sidebar md:block">
        <AdminSidebar name={name} email={email} avatarUrl={avatarUrl} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar name={name} email={email} avatarUrl={avatarUrl} />
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
