import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/login-form";
import { BrandLogo } from "@/components/shared/brand-logo";
import { getAdminSession } from "@/lib/supabase/admin";

export const metadata = { title: "Sign in" };

export default async function AdminLoginPage() {
  // Already an admin? Skip the form.
  if (await getAdminSession()) redirect("/dashboard-admin");

  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <div className="flex justify-center">
            <BrandLogo priority />
          </div>
          <h1 className="text-lg font-semibold">Admin sign in</h1>
          <p className="text-sm text-muted-foreground">
            Authorised administrators only.
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
