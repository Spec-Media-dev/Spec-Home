import { ProfileForm } from "@/components/admin/settings-forms";
import { requireAdmin } from "@/lib/supabase/admin";
import { storageUrl } from "@/lib/storage";

export const metadata = { title: "Profile" };

export default async function ProfileSettingsPage() {
  const session = await requireAdmin();

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="mb-5 space-y-1">
        <h2 className="font-semibold">Your profile</h2>
        <p className="text-sm text-muted-foreground">
          Name and avatar are stored in admin_profiles.
        </p>
      </div>
      <ProfileForm
        name={session.profile.name}
        email={session.email}
        avatarUrl={storageUrl(session.profile.avatar_path)}
      />
    </section>
  );
}
