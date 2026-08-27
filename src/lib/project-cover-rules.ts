import type { ActionErrorCode } from "@/lib/errors";
import { SUPPORTED_IMAGE_MIME_TYPES } from "@/lib/image-signatures";

/**
 * Rules for the single project cover image.
 *
 * Deliberately separate from `property-image-rules`: a project has exactly one
 * cover stored on `projects.cover_image_path`, while a property has an ordered
 * gallery in `property_images`. Merging them would force one set of limits
 * onto two different shapes.
 */

export const MAX_PROJECT_COVER_BYTES = 5 * 1024 * 1024;

export const PROJECT_COVER_MIME_TYPES = SUPPORTED_IMAGE_MIME_TYPES;

const UUID_SOURCE =
  "[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}";

export const PROJECT_ID_PATTERN = new RegExp(`^${UUID_SOURCE}$`, "i");

/** `projects/{projectId}/{uuid}.{ext}` and nothing else. */
export const PROJECT_COVER_PATH_PATTERN = new RegExp(
  `^projects/(${UUID_SOURCE})/(${UUID_SOURCE})\\.(jpg|png|webp)$`,
  "i",
);

export type ProjectCoverDescriptor = {
  type: string;
  size: number;
};

/**
 * Cheap pre-flight checks shared by the browser and the server. The server
 * repeats them, and additionally inspects the uploaded bytes — this exists so
 * an obviously wrong file is refused before anything is transferred.
 */
export function projectCoverRuleError(
  file: ProjectCoverDescriptor,
): ActionErrorCode | null {
  if (!Number.isInteger(file.size) || file.size <= 0) return "invalidFile";
  if (file.size > MAX_PROJECT_COVER_BYTES) return "fileTooLarge";
  if (
    !PROJECT_COVER_MIME_TYPES.includes(
      file.type as (typeof PROJECT_COVER_MIME_TYPES)[number],
    )
  ) {
    return "invalidFile";
  }
  return null;
}

/**
 * Confirms a Storage path belongs to the project it claims to. Guards against
 * a signed ticket for one project being finalised against another.
 */
export function parseProjectCoverPath(
  path: unknown,
  projectId: string,
): { ext: string } | null {
  if (typeof path !== "string") return null;

  const match = path.match(PROJECT_COVER_PATH_PATTERN);
  if (!match) return null;
  if (match[1].toLowerCase() !== projectId.toLowerCase()) return null;

  return { ext: match[3].toLowerCase() };
}
