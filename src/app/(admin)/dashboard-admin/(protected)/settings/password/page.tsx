import { PasswordForm } from "@/components/admin/settings-forms";

export const metadata = { title: "Password" };

export default function PasswordSettingsPage() {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="mb-5 space-y-1">
        <h2 className="font-semibold">Change password</h2>
        <p className="text-sm text-muted-foreground">
          Passwords are managed by Supabase Auth. Your current password is
          required before a new one is accepted.
        </p>
      </div>
      <PasswordForm />
    </section>
  );
}
