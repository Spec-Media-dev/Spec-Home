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

  // Already a full URL (Unsplash, external CDN, etc.)
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }

  // Clean path (remove leading slash if any)
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;

  // Use 'media' as default bucket if custom bucket name is not configured
  const activeBucket = bucket === "project-covers" || bucket === "property-images" || bucket === "site-assets"
    ? "media"
    : bucket;

  // Build Supabase Storage public URL
  return `${SUPABASE_URL}/storage/v1/object/public/${activeBucket}/${cleanPath}`;
}
