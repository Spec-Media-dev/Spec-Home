/**
 * Real file-format detection from the leading bytes.
 *
 * `File.type` and the filename are both attacker-controlled: a `.png` named
 * file declaring `image/png` can contain anything. Every upload path in this
 * application therefore confirms the format from the magic bytes and derives
 * the stored extension and Content-Type from *that*, never from the client.
 *
 * Previously duplicated across the settings and property-image actions; one
 * copy means a format can never be accepted in one place and rejected in
 * another.
 */

export type ImageKind = {
  ext: "jpg" | "png" | "webp";
  mime: "image/jpeg" | "image/png" | "image/webp";
};

export const SUPPORTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type SupportedImageMime = (typeof SUPPORTED_IMAGE_MIME_TYPES)[number];

/** Bytes needed to identify every supported format (WebP needs 12). */
export const IMAGE_HEADER_BYTES = 16;

type Signature = ImageKind & { test: (b: Uint8Array) => boolean };

const SIGNATURES: readonly Signature[] = [
  {
    ext: "jpg",
    mime: "image/jpeg",
    test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    ext: "png",
    mime: "image/png",
    test: (b) =>
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  },
  {
    // "RIFF" .... "WEBP" — the four size bytes in between are not checked.
    ext: "webp",
    mime: "image/webp",
    test: (b) =>
      b[0] === 0x52 &&
      b[1] === 0x49 &&
      b[2] === 0x46 &&
      b[3] === 0x46 &&
      b[8] === 0x57 &&
      b[9] === 0x45 &&
      b[10] === 0x42 &&
      b[11] === 0x50,
  },
];

/** Identifies a format from a header slice, or null if it is not supported. */
export function detectImageKind(header: Uint8Array): ImageKind | null {
  const match = SIGNATURES.find((signature) => signature.test(header));
  return match ? { ext: match.ext, mime: match.mime } : null;
}

/** Maps a claimed MIME type to its kind, for pre-flight checks only. */
export function kindForMime(mime: string): ImageKind | null {
  const match = SIGNATURES.find((signature) => signature.mime === mime);
  return match ? { ext: match.ext, mime: match.mime } : null;
}

/**
 * Browser-side pre-flight: does the file's real format match what it claims?
 *
 * Runs in the client so a spoofed file is refused before it is transferred.
 * It is a convenience, never a control — the server re-derives the format from
 * the stored object and deletes anything that does not match.
 */
export async function matchesClaimedImageType(file: File): Promise<boolean> {
  const header = new Uint8Array(
    await file.slice(0, IMAGE_HEADER_BYTES).arrayBuffer(),
  );
  const actual = detectImageKind(header);
  return actual !== null && actual.mime === file.type;
}

/**
 * Reads only the header, never the whole file, and rejects empty or oversized
 * blobs before touching their contents.
 */
export async function inspectImageBlob(
  blob: Blob,
  maxBytes: number,
): Promise<ImageKind | null> {
  if (blob.size === 0 || blob.size > maxBytes) return null;
  const header = new Uint8Array(
    await blob.slice(0, IMAGE_HEADER_BYTES).arrayBuffer(),
  );
  return detectImageKind(header);
}
