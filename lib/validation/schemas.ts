import { z } from "zod";

// Free/personal webmail providers — the contact form requires a work email.
export const FREE_EMAIL_DOMAINS = [
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "yahoo.com",
  "yahoo.co.uk",
  "ymail.com",
];

export function isFreeEmailDomain(email: string): boolean {
  const domain = email.trim().toLowerCase().split("@")[1] ?? "";
  return FREE_EMAIL_DOMAINS.includes(domain);
}

export const contactSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(80),
  lastName: z.string().trim().min(1, "Last name is required").max(80),
  company: z.string().trim().min(1, "Company is required").max(160),
  position: z.string().trim().min(1, "Position is required").max(160),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(200)
    .refine((v) => !isFreeEmailDomain(v), "Please use your work email address"),
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

export const ALLOWED_CERTIFICATE_TYPES = ["application/pdf"];
export const MAX_CERTIFICATE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
