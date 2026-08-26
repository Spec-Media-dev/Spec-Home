import { z } from "zod";

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name."),
  email: z.email("Please enter a valid email address."),
});

export type EnquiryFormValues = z.infer<typeof enquirySchema>;
