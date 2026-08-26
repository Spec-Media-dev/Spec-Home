import { z } from "zod";

export const ENQUIRY_MESSAGE_MAX = 2000;

/**
 * Shared by the client form and the Server Action. The action re-parses on the
 * server, which is authoritative — the client copy exists only for UX.
 */
export const enquirySchema = z.object({
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
  /** Bot trap: real users never populate a hidden field. */
  company: z.string().max(0).optional().or(z.literal("")),
  turnstileToken: z.string().optional(),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
