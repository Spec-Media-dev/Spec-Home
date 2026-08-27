"use server";

import { updateDatasets } from "@/lib/cache/freshness";
import { logAndMap, validationFailure, type ActionResult } from "@/lib/errors";
import { inspectImageBlob } from "@/lib/image-signatures";
import {
  MAX_AVATAR_BYTES,
  MAX_LOGO_BYTES,
} from "@/lib/settings-media-rules";
import { storagePathFromUrl, storagePaths } from "@/lib/storage";
import { requireAdminAction } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { SITE_SETTINGS_KEY, STORAGE_BUCKET } from "@/lib/supabase/types";

/** The logo and avatar are small, so they still travel through the action. */
async function refreshSiteSettings() {
  await updateDatasets(["site_settings"], {
    paths: ["/dashboard-admin/settings"],
  });
}

/**
 * The admin shell renders the name and avatar on every screen, so the whole
 * admin layout is dropped rather than a single page.
 */
async function refreshAdminProfile() {
  await updateDatasets(["admin_profiles"], {
    paths: [{ path: "/dashboard-admin", type: "layout" }],
  });
}

/**
 * The logo is read by the header and footer on every page, so the cached
 * settings entry is invalidated by tag rather than by path.
 */
export async function uploadSiteLogo(
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireAdminAction();
  } catch {
    return { ok: false, error: "unauthorized" };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "validation" };

  const kind = await inspectImageBlob(file, MAX_LOGO_BYTES);
  if (!kind) {
    return file.size > MAX_LOGO_BYTES
      ? { ok: false, error: "fileTooLarge" }
      : { ok: false, error: "invalidFile" };
  }

  const supabase = await createClient();

  const { data: current } = await supabase
    .from("site_settings")
    .select("logo_path")
    .eq("key", SITE_SETTINGS_KEY)
    .maybeSingle();

  const path = storagePaths.siteLogo(`${crypto.randomUUID()}.${kind.ext}`);

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { contentType: kind.mime, upsert: false });

  if (uploadError) {
    console.error("[uploadSiteLogo] storage", uploadError);
    return { ok: false, error: "uploadFailed" };
  }

  const { error } = await supabase
    .from("site_settings")
    .update({ logo_path: path })
    .eq("key", SITE_SETTINGS_KEY);

  if (error) {
    // Roll the new object back so a failed save leaves no orphan behind.
    await supabase.storage.from(STORAGE_BUCKET).remove([path]);
    return { ok: false, error: logAndMap("uploadSiteLogo", error) };
  }

  // Remove the superseded file only after the row points at the new one.
  const previous = storagePathFromUrl(current?.logo_path ?? null);
  if (previous && previous !== path) {
    await supabase.storage.from(STORAGE_BUCKET).remove([previous]);
  }

  await refreshSiteSettings();
  return { ok: true };
}

export async function removeSiteLogo(): Promise<ActionResult> {
  try {
    await requireAdminAction();
  } catch {
    return { ok: false, error: "unauthorized" };
  }

  const supabase = await createClient();

  const { data: current } = await supabase
    .from("site_settings")
    .select("logo_path")
    .eq("key", SITE_SETTINGS_KEY)
    .maybeSingle();

  const { error } = await supabase
    .from("site_settings")
    .update({ logo_path: null })
    .eq("key", SITE_SETTINGS_KEY);

  if (error) return { ok: false, error: logAndMap("removeSiteLogo", error) };

  const path = storagePathFromUrl(current?.logo_path ?? null);
  if (path) await supabase.storage.from(STORAGE_BUCKET).remove([path]);

  await refreshSiteSettings();
  return { ok: true };
}

export async function updateAdminProfile(
  formData: FormData,
): Promise<ActionResult> {
  let session;
  try {
    session = await requireAdminAction();
  } catch {
    return { ok: false, error: "unauthorized" };
  }

  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return validationFailure({ name: "required" });
  if (name.length > 120) return validationFailure({ name: "tooLong" });

  const supabase = await createClient();
  const file = formData.get("avatar");
  let avatarPath: string | undefined;

  if (file instanceof File && file.size > 0) {
    const kind = await inspectImageBlob(file, MAX_AVATAR_BYTES);
    if (!kind) {
      return file.size > MAX_AVATAR_BYTES
        ? { ok: false, error: "fileTooLarge" }
        : { ok: false, error: "invalidFile" };
    }

    // Namespaced by admin id, matching the storage policy's path expectations.
    const path = storagePaths.adminAvatar(
      session.userId,
      `${crypto.randomUUID()}.${kind.ext}`,
    );

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, { contentType: kind.mime, upsert: false });

    if (uploadError) {
      console.error("[updateAdminProfile] storage", uploadError);
      return { ok: false, error: "uploadFailed" };
    }

    avatarPath = path;
  }

  const { error } = await supabase
    .from("admin_profiles")
    .update({ name, ...(avatarPath ? { avatar_path: avatarPath } : {}) })
    .eq("id", session.userId);

  if (error) {
    if (avatarPath) {
      await supabase.storage.from(STORAGE_BUCKET).remove([avatarPath]);
    }
    return { ok: false, error: logAndMap("updateAdminProfile", error) };
  }

  const previous = storagePathFromUrl(session.profile.avatar_path);
  if (avatarPath && previous && previous !== avatarPath) {
    await supabase.storage.from(STORAGE_BUCKET).remove([previous]);
  }

  await refreshAdminProfile();
  return { ok: true };
}

/**
 * Clears the avatar and deletes its object. Unlike the project cover there is
 * nothing to gate on — the shell falls back to the generic person icon.
 */
export async function removeAdminAvatar(): Promise<ActionResult> {
  let session;
  try {
    session = await requireAdminAction();
  } catch {
    return { ok: false, error: "unauthorized" };
  }

  if (!session.profile.avatar_path) return { ok: true };

  const supabase = await createClient();

  const { error } = await supabase
    .from("admin_profiles")
    .update({ avatar_path: null })
    .eq("id", session.userId);

  if (error) return { ok: false, error: logAndMap("removeAdminAvatar", error) };

  const previous = storagePathFromUrl(session.profile.avatar_path);
  if (previous) {
    const { error: removeError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([previous]);
    if (removeError) console.error("[removeAdminAvatar] storage", removeError);
  }

  await refreshAdminProfile();
  return { ok: true };
}
