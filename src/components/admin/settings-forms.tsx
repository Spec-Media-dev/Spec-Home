"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { AdminAvatar } from "@/components/admin/admin-identity";
import { Field } from "@/components/admin/field";
import { useAdminMessages } from "@/components/admin/use-admin-messages";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { changeEmail, changePassword } from "@/lib/actions/account";
import {
  removeAdminAvatar,
  removeSiteLogo,
  updateAdminProfile,
  uploadSiteLogo,
} from "@/lib/actions/settings";
import { SUPPORTED_IMAGE_MIME_TYPES } from "@/lib/image-signatures";
import {
  MAX_AVATAR_BYTES,
  MAX_LOGO_BYTES,
} from "@/lib/settings-media-rules";

const ACCEPTED: readonly string[] = SUPPORTED_IMAGE_MIME_TYPES;

export function LogoForm({ logoUrl }: { logoUrl: string | null }) {
  const t = useTranslations("settings");
  const { error: errorMessage } = useAdminMessages();
  const { run, pending, router } = useAdminAction();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function upload(file: File) {
    if (!ACCEPTED.includes(file.type) || file.size > MAX_LOGO_BYTES) {
      toast.error(t("logoHint"));
      return;
    }

    setBusy(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadSiteLogo(formData);

      if (result.ok) {
        toast.success(t("logoUpdated"));
        router.refresh();
      } else {
        toast.error(errorMessage(result.error));
      }
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 p-4">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={t("logoAlt")}
            width={220}
            height={72}
            className="max-h-20 w-auto object-contain"
          />
        ) : (
          <p className="text-sm text-muted-foreground">{t("logoEmpty")}</p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
        }}
      />

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          disabled={busy || pending}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? t("logoUploading") : t("logoUpload")}
        </Button>
        {logoUrl ? (
          <Button
            type="button"
            variant="outline"
            disabled={busy || pending}
            onClick={() => run(() => removeSiteLogo(), t("logoRemoved"))}
          >
            {t("logoRemove")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function ProfileForm({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {
  const t = useTranslations("settings");
  const { error: errorMessage } = useAdminMessages();
  const { run, pending, router } = useAdminAction();
  const [busy, setBusy] = useState(false);

  /**
   * Controlled, because the server value changes underneath this form.
   *
   * `defaultValue` only seeds an uncontrolled input on its first render, so
   * when `router.refresh()` (after a save) or the Realtime bridge (after
   * another admin session renames the profile) sends a new `name`, Base UI
   * warns that a mounted uncontrolled field's default changed — and the input
   * would keep showing the stale value.
   *
   * `syncedName` records which server value the local state was seeded from.
   * When a genuinely new one arrives, the server wins. This is React's
   * documented way to adjust state during render rather than in an effect,
   * which would render the stale value once before correcting it.
   */
  const [displayName, setDisplayName] = useState(name);
  const [syncedName, setSyncedName] = useState(name);

  if (name !== syncedName) {
    setSyncedName(name);
    setDisplayName(name);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    // Refused before upload; the server re-checks size and magic bytes.
    const avatar = formData.get("avatar");
    if (avatar instanceof File && avatar.size > 0) {
      if (!ACCEPTED.includes(avatar.type) || avatar.size > MAX_AVATAR_BYTES) {
        toast.error(t("avatarHint"));
        return;
      }
    }

    setBusy(true);
    try {
      const result = await updateAdminProfile(formData);
      if (result.ok) {
        toast.success(t("profileUpdated"));
        router.refresh();
      } else {
        toast.error(errorMessage(result.error));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field id="name" label={t("displayName")}>
        <Input
          id="name"
          name="name"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          required
          minLength={2}
        />
      </Field>

      <Field id="avatar" label={t("avatar")} hint={t("avatarHint")}>
        <div className="flex items-center gap-4">
          {/* Falls back to the person icon when avatar_path is null. */}
          <AdminAvatar avatarUrl={avatarUrl} alt={t("avatarAlt")} size={56} />
          <Input
            id="avatar"
            name="avatar"
            type="file"
            accept={ACCEPTED.join(",")}
          />
          {avatarUrl ? (
            <Button
              type="button"
              variant="ghost"
              className="text-destructive"
              disabled={busy || pending}
              onClick={() => run(() => removeAdminAvatar(), t("avatarRemoved"))}
            >
              {t("avatarRemove")}
            </Button>
          ) : null}
        </div>
      </Field>

      <Button type="submit" disabled={busy || pending}>
        {busy ? t("profileSaving") : t("profileSave")}
      </Button>
    </form>
  );
}

/**
 * Email and password live in Supabase Auth, so these actions return their own
 * outcome codes rather than the shared `ActionErrorCode`. They map to the
 * `accountErrors` namespace, which is localized like everything else.
 */
export function EmailForm({ currentEmail }: { currentEmail: string }) {
  const t = useTranslations("settings");
  const accountError = useTranslations("accountErrors");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const next = String(data.get("newEmail") ?? "").trim();
    const confirm = String(data.get("confirmEmail") ?? "").trim();

    setBusy(true);
    try {
      const result = await changeEmail(next, confirm);
      if (!result.ok) {
        toast.error(accountError(result.error));
        return;
      }

      toast.success(
        result.status === "updated"
          ? t("emailUpdated")
          : t("emailConfirmationSent"),
      );
      form.reset();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field id="current-email" label={t("currentEmail")}>
        <Input
          id="current-email"
          name="currentEmail"
          type="email"
          dir="ltr"
          className="text-start"
          value={currentEmail}
          autoComplete="email"
          readOnly
        />
      </Field>
      <Field id="new-email" label={t("newEmail")}>
        <Input
          id="new-email"
          name="newEmail"
          type="email"
          inputMode="email"
          dir="ltr"
          className="text-start"
          autoComplete="email"
          spellCheck={false}
          required
        />
      </Field>
      <Field id="confirm-email" label={t("confirmEmail")}>
        <Input
          id="confirm-email"
          name="confirmEmail"
          type="email"
          inputMode="email"
          dir="ltr"
          className="text-start"
          autoComplete="email"
          spellCheck={false}
          required
        />
      </Field>
      <Button type="submit" disabled={busy}>
        {busy ? t("emailSubmitting") : t("emailSubmit")}
      </Button>
    </form>
  );
}

export function PasswordForm() {
  const t = useTranslations("settings");
  const accountError = useTranslations("accountErrors");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const current = String(data.get("current") ?? "");
    const next = String(data.get("next") ?? "");
    const confirm = String(data.get("confirm") ?? "");

    if (next !== confirm) {
      toast.error(t("passwordMismatch"));
      return;
    }

    setBusy(true);
    try {
      const result = await changePassword(current, next);
      if (result.ok) {
        toast.success(t("passwordUpdated"));
        form.reset();
      } else {
        toast.error(accountError(result.error));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field id="current" label={t("currentPassword")}>
        <PasswordInput
          id="current"
          name="current"
          autoComplete="current-password"
          dir="ltr"
          required
        />
      </Field>
      <Field id="next" label={t("newPassword")} hint={t("passwordHint")}>
        <PasswordInput
          id="next"
          name="next"
          autoComplete="new-password"
          dir="ltr"
          minLength={8}
          required
        />
      </Field>
      <Field id="confirm" label={t("confirmPassword")}>
        <PasswordInput
          id="confirm"
          name="confirm"
          autoComplete="new-password"
          dir="ltr"
          minLength={8}
          required
        />
      </Field>
      <Button type="submit" disabled={busy}>
        {busy ? t("passwordSubmitting") : t("passwordSubmit")}
      </Button>
    </form>
  );
}
