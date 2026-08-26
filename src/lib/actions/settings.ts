"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { cacheTags } from "@/lib/cache-tags";
import { logAndMap, type ActionResult } from "@/lib/errors";
import { storagePathFromUrl, storagePaths } from "@/lib/storage";
import { requireAdminAction } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { SITE_SETTINGS_KEY, STORAGE_BUCKET } from "@/lib/supabase/types";

const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const MAX_AVATAR_BYTES = 1 * 1024 * 1024;

const SIGNATURES: { ext: string; mime: string; test: (b: Uint8Array) => boolean }[] = [
  {
    ext: "jpg",
    mime: "image/jpeg",
    test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    ext: "png",
    mime: "image/png",
    test: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  },
  {
    ext: "webp",
    mime: "image/webp",
    test: (b) =>
      b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  },
];

async function inspectImage(file: File, maxBytes: number) {
  if (file.size === 0 || file.size > maxBytes) return null;
  const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  return SIGNATURES.find((signature) => signature.test(header)) ?? null;
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

  const kind = await inspectImage(file, MAX_LOGO_BYTES);
  if (!kind) return { ok: false, error: "invalidFile" };

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

  // site_settings is a singleton keyed on 'main'; upsert keeps it that way.
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: SITE_SETTINGS_KEY, logo_path: path }, { onConflict: "key" });

  if (error) {
    await supabase.storage.from(STORAGE_BUCKET).remove([path]);
    return { ok: false, error: logAndMap("uploadSiteLogo", error) };
  }

  // Remove the superseded file only after the row points at the new one.
  const previous = storagePathFromUrl(current?.logo_path ?? null);
  if (previous && previous !== path) {
    await supabase.storage.from(STORAGE_BUCKET).remove([previous]);
  }

  revalidateTag(cacheTags.siteSettings, "max");
  revalidatePath("/dashboard-admin/settings");
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
    .upsert({ key: SITE_SETTINGS_KEY, logo_path: null }, { onConflict: "key" });

  if (error) return { ok: false, error: logAndMap("removeSiteLogo", error) };

  const path = storagePathFromUrl(current?.logo_path ?? null);
  if (path) await supabase.storage.from(STORAGE_BUCKET).remove([path]);

  revalidateTag(cacheTags.siteSettings, "max");
  revalidatePath("/dashboard-admin/settings");
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
  if (name.length < 2 || name.length > 120) {
    return { ok: false, error: "validation" };
  }

  const supabase = await createClient();
  const file = formData.get("avatar");
  let avatarPath: string | undefined;

  if (file instanceof File && file.size > 0) {
    const kind = await inspectImage(file, MAX_AVATAR_BYTES);
    if (!kind) return { ok: false, error: "invalidFile" };

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

  revalidatePath("/dashboard-admin", "layout");
  return { ok: true };
}
