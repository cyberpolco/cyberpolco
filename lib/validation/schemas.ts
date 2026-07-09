import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(120),
  company: z.string().trim().min(1, "Company is required").max(160),
  position: z.string().trim().min(1, "Position is required").max(160),
  email: z.string().trim().email("Invalid email address").max(200),
  subject: z.string().trim().min(2, "Subject is too short").max(200),
  message: z.string().trim().min(10, "Message is too short").max(5000),
  // Honeypot field — must stay empty. Bots that fill every field trip this.
  website: z.string().max(0).optional().default(""),
  turnstileToken: z.string().optional().default(""),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const applicationSchema = z.object({
  jobSlug: z.string().min(1),
  jobTitle: z.string().min(1),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(5).max(40),
  message: z.string().trim().max(5000).optional().default(""),
  website: z.string().max(0).optional().default(""),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

export const ALLOWED_CV_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
export const MAX_CV_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
