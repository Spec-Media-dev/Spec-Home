import { redirect } from "next/navigation";

export default function PasswordSettingsPage() {
  redirect("/dashboard-admin/settings/account");
}
