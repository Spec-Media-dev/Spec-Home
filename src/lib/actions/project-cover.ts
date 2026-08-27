"use server";

import { updateDatasets } from "@/lib/cache/freshness";
import { logAndMap, type ActionResult } from "@/lib/errors";
import { inspectImageBlob, kindForMime } from "@/lib/image-signatures";
import {
  MAX_PROJECT_COVER_BYTES,
  parseProjectCoverPath,
  PROJECT_ID_PATTERN,
  projectCoverRuleError,
  type ProjectCoverDescriptor,
} from "@/lib/project-cover-rules";
import { storagePathFromUrl, storagePaths } from "@/lib/storage";
import { requireAdminAction } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { STORAGE_BUCKET } from "@/lib/supabase/types";

/**
 * Project cover image lifecycle.
 *
 * The browser never sends image bytes through a Server Action. Instead the
 * server authorises one specific object path with a short-lived, path-scoped
 * upload token; the browser PUTs directly to Storage; and a second action
 * verifies the object that actually landed before any database row changes.
 *
 * The service-role key is never involved: authorisation is the admin's own
 * session, so Storage policies still apply on top.
 */

async function refreshProjectCover(slug: string, projectId: string) {
  await updateDatasets(["projects"], {
    paths: [
      `/dashboard-admin/projects/${projectId}/edit`,
      "/dashboard-admin/projects",
      `/projects/${slug}`,
    ],
  });
}

export type SignedCoverUpload = {
  path: string;
  token: string;
};

/**
 * Authorises exactly one upload into `projects/{projectId}/{uuid}.{ext}`.
 *
 * The extension comes from the claimed MIME type only to pick a candidate
 * path; the real format is confirmed from the bytes at finalisation, and a
 * mismatch there deletes the object rather than recording it.
 */
export async function prepareProjectCoverUpload(
  projectId: string,
  file: ProjectCoverDescriptor,
): Promise<ActionResult<SignedCoverUpload>> {
  try {
    await requireAdminAction();
  } catch {
    return { ok: false, error: "unauthorized" };
  }

  if (!PROJECT_ID_PATTERN.test(projectId)) {
    return { ok: false, error: "validation" };
  }

  if (typeof file !== "object" || file === null) {
    return { ok: false, error: "validation" };
  }

  const ruleError = projectCoverRuleError(file);
  if (ruleError) return { ok: false, error: ruleError };

  const kind = kindForMime(file.type);
  if (!kind) return { ok: false, error: "invalidFile" };

  const supabase = await createClient();

  // The project must exist and be visible to this admin before anything is
  // signed, so a ticket can never be minted for an arbitrary namespace.
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .maybeSingle();

  if (!project) return { ok: false, error: "notFound" };

  const path = storagePaths.projectCover(
    projectId,
    `${crypto.randomUUID()}.${kind.ext}`,
  );

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    if (error) console.error("[prepareProjectCoverUpload]", error);
    return { ok: false, error: "uploadFailed" };
  }

  return { ok: true, data: { path: data.path, token: data.token } };
}

/**
 * Verifies the object that actually landed, then swaps it in.
 *
 * Order matters: the new object is validated and the row updated *before* the
 * old object is removed, so a failure at any step leaves the project pointing
 * at an image that exists. A failed verification deletes the new object, so a
 * rejected upload never lingers in the bucket.
 */
export async function finalizeProjectCoverUpload(
  projectId: string,
  path: string,
): Promise<ActionResult<{ coverPath: string }>> {
  try {
    await requireAdminAction();
  } catch {
    return { ok: false, error: "unauthorized" };
  }

  if (!PROJECT_ID_PATTERN.test(projectId)) {
    return { ok: false, error: "validation" };
  }

  const parsedPath = parseProjectCoverPath(path, projectId);
  if (!parsedPath) return { ok: false, error: "validation" };

  const supabase = await createClient();

  const discard = async () => {
    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);
    if (error) console.error("[finalizeProjectCoverUpload cleanup]", error);
  };

  const { data: project } = await supabase
    .from("projects")
    .select("id, slug, cover_image_path")
    .eq("id", projectId)
    .maybeSingle();

  if (!project) {
    await discard();
    return { ok: false, error: "notFound" };
  }

  // Refuse to re-finalise the path already recorded; deleting it here would
  // strip a live cover from a published project.
  if (storagePathFromUrl(project.cover_image_path) === path) {
    return { ok: false, error: "validation" };
  }

  const { data: object, error: downloadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .download(path);

  if (downloadError || !object) {
    await discard();
    if (downloadError) {
      console.error("[finalizeProjectCoverUpload download]", downloadError);
    }
    return { ok: false, error: "uploadFailed" };
  }

  if (object.size > MAX_PROJECT_COVER_BYTES) {
    await discard();
    return { ok: false, error: "fileTooLarge" };
  }

  const kind = await inspectImageBlob(object, MAX_PROJECT_COVER_BYTES);
  if (!kind || kind.ext !== parsedPath.ext) {
    // Either the bytes are not a supported image at all, or they are a
    // different format than the extension claims — a spoofed upload.
    await discard();
    return { ok: false, error: "invalidFile" };
  }

  const { error } = await supabase
    .from("projects")
    .update({ cover_image_path: path })
    .eq("id", projectId);

  if (error) {
    await discard();
    return {
      ok: false,
      error: logAndMap("finalizeProjectCoverUpload", error, "project"),
    };
  }

  // Only now is the superseded object safe to remove.
  const previous = storagePathFromUrl(project.cover_image_path);
  if (previous && previous !== path) {
    const { error: removeError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([previous]);
    if (removeError) {
      console.error("[finalizeProjectCoverUpload previous]", removeError);
    }
  }

  await refreshProjectCover(project.slug, projectId);
  return { ok: true, data: { coverPath: path } };
}

/**
 * A published project must keep a cover, so removal is refused while it is
 * live. The admin unpublishes or replaces instead — the public page never
 * ends up with a missing image.
 */
export async function removeProjectCover(
  projectId: string,
): Promise<ActionResult> {
  try {
    await requireAdminAction();
  } catch {
    return { ok: false, error: "unauthorized" };
  }

  if (!PROJECT_ID_PATTERN.test(projectId)) {
    return { ok: false, error: "validation" };
  }

  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("id, slug, is_published, cover_image_path")
    .eq("id", projectId)
    .maybeSingle();

  if (!project) return { ok: false, error: "notFound" };
  if (project.is_published) return { ok: false, error: "coverRequired" };
  if (!project.cover_image_path) return { ok: true };

  const { error } = await supabase
    .from("projects")
    .update({ cover_image_path: null })
    .eq("id", projectId);

  if (error) {
    return {
      ok: false,
      error: logAndMap("removeProjectCover", error, "project"),
    };
  }

  const previous = storagePathFromUrl(project.cover_image_path);
  if (previous) {
    const { error: removeError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([previous]);
    if (removeError) console.error("[removeProjectCover]", removeError);
  }

  await refreshProjectCover(project.slug, projectId);
  return { ok: true };
}
