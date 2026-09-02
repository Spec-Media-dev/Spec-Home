/**
 * Supabase Storage public URL helper.
 * Resolves storage paths, full URLs, and fallback placeholders.
 */

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://zadfbnjkkkottpubkezg.supabase.co";

/**
 * Get public URL for an image stored in Supabase storage bucket.
 * Defaults to the active 'media' bucket.
 */
export function getStorageUrl(
  path: string | null | undefined,
  bucket: string = "media",
  fallbackUrl: string = "https://images.unsplash.com/photo-1546412414-e1885259563a?q=80&w=1200&auto=format&fit=crop"
): string {
  if (!path || path.trim() === "") {
    return fallbackUrl;
  }

  // If path contains multiple comma-separated or JSON array, use the first one as primary
  let singlePath = path.trim();
  if (singlePath.startsWith("[") && singlePath.endsWith("]")) {
    try {
      const parsed = JSON.parse(singlePath);
      if (Array.isArray(parsed) && parsed.length > 0) {
        singlePath = String(parsed[0]).trim();
      }
    } catch {}
  } else if (singlePath.includes(",")) {
    singlePath = singlePath.split(",")[0].trim();
  }

  // Already a full URL (Unsplash, external CDN, etc.)
  if (singlePath.startsWith("http://") || singlePath.startsWith("https://") || singlePath.startsWith("data:")) {
    return singlePath;
  }

  // Clean path (remove leading slash if any)
  const cleanPath = singlePath.startsWith("/") ? singlePath.slice(1) : singlePath;

  // Use 'media' as default bucket if custom bucket name is not configured
  const activeBucket = bucket === "project-covers" || bucket === "property-images" || bucket === "site-assets"
    ? "media"
    : bucket;

  // Build Supabase Storage public URL
  return `${SUPABASE_URL}/storage/v1/object/public/${activeBucket}/${cleanPath}`;
}

/**
 * Get an array of public URLs for multi-image fields (comma-separated, JSON array, or single string).
 */
export function getStorageUrls(
  path: string | null | undefined,
  bucket: string = "media"
): string[] {
  if (!path || path.trim() === "") return [];

  const raw = path.trim();
  let items: string[] = [];

  if (raw.startsWith("[") && raw.endsWith("]")) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        items = parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      items = [raw];
    }
  } else if (raw.includes(",")) {
    items = raw.split(",").map((s) => s.trim()).filter(Boolean);
  } else {
    items = [raw];
  }

  return items.map((p) => getStorageUrl(p, bucket)).filter(Boolean);
}
