"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { adminError } from "@/components/admin/action-messages";
import { Field } from "@/components/admin/field";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { changePassword } from "@/lib/actions/account";
import {
  removeSiteLogo,
  updateAdminProfile,
  uploadSiteLogo,
} from "@/lib/actions/settings";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

export function LogoForm({ logoUrl }: { logoUrl: string | null }) {
  const { run, pending, router } = useAdminAction();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function upload(file: File) {
    if (!ACCEPTED.includes(file.type) || file.size > 2 * 1024 * 1024) {
      toast.error("Use a JPEG, PNG or WebP file up to 2 MB.");
      return;
    }

    setBusy(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadSiteLogo(formData);

      if (result.ok) {
        toast.success("Logo updated.");
        router.refresh();
      } else {
        toast.error(adminError(result.error));
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
            alt="Current site logo"
            width={220}
            height={72}
            className="max-h-20 w-auto object-contain"
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            No custom logo — the bundled SPEC Home logo is in use.
          </p>
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
          {busy ? "Uploading…" : "Upload logo"}
        </Button>
        {logoUrl ? (
          <Button
            type="button"
            variant="outline"
            disabled={busy || pending}
            onClick={() => run(() => removeSiteLogo(), "Logo removed.")}
          >
            Remove
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function ProfileForm({
  name,
  email,
  avatarUrl,
}: {
  name: string;
  email: string;
  avatarUrl: string | null;
}) {
  const { router } = useAdminAction();
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setBusy(true);
    try {
      const result = await updateAdminProfile(formData);
      if (result.ok) {
        toast.success("Profile updated.");
        router.refresh();
      } else {
        toast.error(adminError(result.error));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field id="email" label="Email">
        <Input id="email" value={email} readOnly disabled />
        <p className="text-xs text-muted-foreground">
          Email is managed by Supabase Auth and cannot be changed here.
        </p>
      </Field>

      <Field id="name" label="Display name">
        <Input
          id="name"
          name="name"
          defaultValue={name}
          required
          minLength={2}
        />
      </Field>

      <Field id="avatar" label="Avatar" hint="JPEG, PNG or WebP up to 1 MB.">
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt=""
              aria-hidden
              width={56}
              height={56}
              className="size-14 rounded-full object-cover"
            />
          ) : null}
          <Input
            id="avatar"
            name="avatar"
            type="file"
            accept={ACCEPTED.join(",")}
          />
        </div>
      </Field>

      <Button type="submit" disabled={busy}>
        {busy ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}

const PASSWORD_ERRORS: Record<string, string> = {
  unauthorized: "You are not authorised to perform this action.",
  validation: "New password must be at least 8 characters.",
  wrongPassword: "Your current password is incorrect.",
  generic: "Could not update the password. Please try again.",
};

export function PasswordForm() {
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const current = String(data.get("current") ?? "");
    const next = String(data.get("next") ?? "");
    const confirm = String(data.get("confirm") ?? "");

    if (next !== confirm) {
      toast.error("The new passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      const result = await changePassword(current, next);
      if (result.ok) {
        toast.success("Password updated.");
        form.reset();
      } else {
        toast.error(PASSWORD_ERRORS[result.error] ?? PASSWORD_ERRORS.generic);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field id="current" label="Current password">
        <Input
          id="current"
          name="current"
          type="password"
          autoComplete="current-password"
          required
        />
      </Field>
      <Field id="next" label="New password" hint="At least 8 characters.">
        <Input
          id="next"
          name="next"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </Field>
      <Field id="confirm" label="Confirm new password">
        <Input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </Field>
      <Button type="submit" disabled={busy}>
        {busy ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
