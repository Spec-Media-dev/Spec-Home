/**
 * Slugs are generated, never typed by an admin, and frozen once a record is
 * published so live URLs cannot silently move.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Arabic-only titles slugify to an empty string, so a stable fallback keeps the
 * URL valid and unique.
 */
export function slugifyWithFallback(input: string, fallback: string): string {
  const slug = slugify(input);
  return slug || slugify(fallback) || "item";
}

export function projectSlug(nameEn: string, fallback: string): string {
  return slugifyWithFallback(nameEn, fallback);
}

/** Property slugs embed the reference so they stay unique and human-readable. */
export function propertySlug(titleEn: string, referenceCode: string): string {
  const base = slugify(titleEn);
  const reference = slugify(referenceCode);
  return base ? `${base}-${reference}` : reference;
}

/** e.g. SHP-10235 */
export function generateReferenceCode(): string {
  const suffix = Math.floor(10000 + Math.random() * 90000);
  return `SHP-${suffix}`;
}
