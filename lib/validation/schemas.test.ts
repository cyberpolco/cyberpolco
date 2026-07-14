import { describe, expect, it } from "vitest";
import { applicationSchema, contactSchema, isFreeEmailDomain } from "./schemas";

describe("isFreeEmailDomain", () => {
  it("flags common free/personal webmail providers", () => {
    expect(isFreeEmailDomain("someone@gmail.com")).toBe(true);
    expect(isFreeEmailDomain("Someone@GMAIL.com")).toBe(true);
    expect(isFreeEmailDomain("someone@yahoo.co.uk")).toBe(true);
  });

  it("does not flag work email domains", () => {
    expect(isFreeEmailDomain("someone@cyberpolco.com")).toBe(false);
    expect(isFreeEmailDomain("someone@acme-corp.io")).toBe(false);
  });
});

const validContact = {
  firstName: "Jane",
  lastName: "Doe",
  company: "Acme Corp",
  position: "CISO",
  email: "jane@acme-corp.com",
  subject: "Question about services",
  message: "This is a long enough message to pass validation.",
};

describe("contactSchema", () => {
  it("accepts valid input", () => {
    expect(contactSchema.safeParse(validContact).success).toBe(true);
  });

  it("rejects free-webmail addresses (work email required)", () => {
    const result = contactSchema.safeParse({ ...validContact, email: "jane@gmail.com" });
    expect(result.success).toBe(false);
  });

  it("rejects a too-short message", () => {
    const result = contactSchema.safeParse({ ...validContact, message: "hi" });
    expect(result.success).toBe(false);
  });

  it("rejects a filled-in honeypot field", () => {
    const result = contactSchema.safeParse({ ...validContact, website: "http://spam.example" });
    expect(result.success).toBe(false);
  });

  it("defaults the honeypot and turnstile token to empty when omitted", () => {
    const result = contactSchema.safeParse(validContact);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.website).toBe("");
      expect(result.data.turnstileToken).toBe("");
    }
  });
});

describe("applicationSchema", () => {
  const validApplication = {
    jobSlug: "security-analyst",
    jobTitle: "Security Analyst",
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "+264 81 123 4567",
    website: "",
  };

  it("accepts valid input without a message or turnstile token", () => {
    const result = applicationSchema.safeParse(validApplication);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.message).toBe("");
      expect(result.data.turnstileToken).toBe("");
    }
  });

  it("rejects a filled-in honeypot field", () => {
    const result = applicationSchema.safeParse({ ...validApplication, website: "http://spam.example" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing name/email/phone", () => {
    const withoutName: Partial<typeof validApplication> = { ...validApplication };
    delete withoutName.name;
    expect(applicationSchema.safeParse(withoutName).success).toBe(false);
  });
});
