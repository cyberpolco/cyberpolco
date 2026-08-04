import { z } from "zod";

export const PHONE_UPDATE_COOLDOWN_DAYS = 5;

// Canonical stored form: "+" prefix, 1-3 digit country code, then exactly 9
// digits whose first digit is never 0 — the standard African mobile
// convention where the locally-written "0XXXXXXXX" drops its leading 0 once
// combined with a country code, e.g. local "0991234567" becomes
// "+243991234567". Generic on purpose — no fixed country list.
export const PHONE_REGEX = /^\+\d{1,3}[1-9]\d{8}$/;

export const countryCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{1,3}$/, "Country code must be 1 to 3 digits, e.g. 243");

// Accepts the 9-digit local number with or without its customary leading 0
// (e.g. "991234567" or "0991234567") — the leading 0, if present, is
// stripped before combining with the country code and is never stored.
export const localNumberSchema = z
  .string()
  .trim()
  .regex(/^0?[1-9]\d{8}$/, "Enter the 9-digit number without the leading 0, e.g. 991234567")
  .transform((v) => (v.startsWith("0") ? v.slice(1) : v));

export const phoneInputSchema = z.object({
  countryCode: countryCodeSchema,
  localNumber: localNumberSchema,
});

export function composePhone(countryCode: string, localNumber: string): string {
  return `+${countryCode}${localNumber}`;
}

// Defense-in-depth check on the fully composed value, regardless of which
// caller produced the string.
export const phoneSchema = z.string().refine((v) => PHONE_REGEX.test(v), "Invalid phone number");

// Used to prefill the two-field admin edit form from a stored
// "+<code><9 digits>" value. Unambiguous only because we always compose
// with exactly 9 trailing digits, so the last 9 digits are always the local
// part and whatever remains is the country code.
export function splitPhone(phone: string | null): { countryCode: string; localNumber: string } {
  if (!phone) return { countryCode: "243", localNumber: "" };
  const match = phone.match(/^\+(\d{1,3})([1-9]\d{8})$/);
  return match ? { countryCode: match[1], localNumber: match[2] } : { countryCode: "243", localNumber: "" };
}
