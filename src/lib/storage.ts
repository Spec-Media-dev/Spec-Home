import { publicEnv } from "@/lib/env";
import { STORAGE_BUCKET } from "@/lib/supabase/types";

/**
 * Columns store either a bucket-relative path or, for historical rows, a full
 * URL. Accept both so a stored absolute URL is never double-prefixed.
 */
export function storageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;

  const clean = path.replace(/^\/+/, "");
  return `${publicEnv.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${clean}`;
}

export const storagePaths = {
  siteLogo: (fileName: string) => `site/logo/${fileName}`,
  adminAvatar: (adminId: string, fileName: string) =>
    `admin/${adminId}/${fileName}`,
  projectCover: (projectId: string, fileName: string) =>
    `projects/${projectId}/${fileName}`,
  propertyImage: (propertyId: string, fileName: string) =>
    `properties/${propertyId}/${fileName}`,
};

/**
 * Turns a stored public URL back into a bucket-relative path so uploaded
 * objects can be removed when their row is deleted.
 */
export function storagePathFromUrl(value: string | null): string | null {
  if (!value) return null;
  if (!/^https?:\/\//i.test(value)) return value.replace(/^\/+/, "");

  const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
  const index = value.indexOf(marker);
  if (index === -1) return null;

  return decodeURIComponent(value.slice(index + marker.length));
}
