/**
 * Size caps for the two small images that still travel through a Server
 * Action rather than a signed direct upload.
 *
 * These live outside `lib/actions/settings.ts` on purpose: a `"use server"`
 * module may only export async functions, so exporting a number from one
 * fails at module evaluation with "A 'use server' file can only export async
 * functions, found number." The browser and the server both need these values,
 * which is exactly why they belong in a plain module.
 *
 * Both stay under `next.config.ts`'s `serverActions.bodySizeLimit` of 2.25 MB,
 * which covers the larger of the two plus multipart overhead.
 */

export const MAX_LOGO_BYTES = 2 * 1024 * 1024;
export const MAX_AVATAR_BYTES = 1 * 1024 * 1024;
