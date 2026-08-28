import { z } from "@/lib/zod";

export const ENQUIRY_MESSAGE_MAX = 2000;

/**
 * Shared by the client form and the Server Action. The action re-parses on the
 * server, which is authoritative — the client copy exists only for UX.
 *
 * `.strict()` is load-bearing, not stylistic: an unknown key is *rejected*
 * rather than stripped, so a crafted payload carrying `status`, `created_at`,
 * or any other column name cannot reach the privileged insert at all. Every
 * system-controlled field is set server-side in `submitEnquiry`.
 *
 * `.trim()` runs before each length check, so a whitespace-only name or
 * message fails as too short rather than being stored as blank.
 */
export const enquirySchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    email: z.email().max(200),
    phone: z
      .string()
      .trim()
      .max(40)
      .regex(/^[+()\d\s-]*$/)
      .optional()
      .or(z.literal("")),
    message: z.string().trim().min(10).max(ENQUIRY_MESSAGE_MAX),
    projectId: z.uuid().optional().or(z.literal("")),
    propertyId: z.uuid().optional().or(z.literal("")),
    /** Bot trap: accepted by validation, then silently discarded by the action. */
    company: z.string().max(200).optional().or(z.literal("")),
  })
  .strict();

export type EnquiryInput = z.infer<typeof enquirySchema>;
