import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/db/inquiries", () => ({ addInquiry: vi.fn() }));
vi.mock("@/lib/email", () => ({ sendEmail: vi.fn() }));
vi.mock("@/lib/email/templates", () => ({ renderTemplate: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn(),
  getClientIp: vi.fn(() => "1.2.3.4"),
}));
vi.mock("@/lib/turnstile", () => ({ verifyTurnstileToken: vi.fn() }));

const { addInquiry } = await import("@/lib/db/inquiries");
const { sendEmail } = await import("@/lib/email");
const { renderTemplate } = await import("@/lib/email/templates");
const { checkRateLimit } = await import("@/lib/rate-limit");
const { verifyTurnstileToken } = await import("@/lib/turnstile");
const { POST } = await import("./route");

const validPayload = {
  firstName: "Ada",
  lastName: "Lovelace",
  company: "Acme Co",
  position: "Engineer",
  email: "ada@example.com",
  subject: "A question about your services",
  message: "This message is definitely long enough.",
  website: "",
  turnstileToken: "token",
  locale: "en" as const,
};

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkRateLimit).mockResolvedValue({ success: true, remaining: 4 });
    vi.mocked(verifyTurnstileToken).mockResolvedValue(true);
    vi.mocked(addInquiry).mockResolvedValue({
      id: "inquiry-1",
      name: "Ada Lovelace",
      company: "Acme Co",
      position: "Engineer",
      email: "ada@example.com",
      subject: "A question about your services",
      message: "This message is definitely long enough.",
      createdAt: "2026-01-01T00:00:00.000Z",
      read: false,
    });
    vi.mocked(sendEmail).mockResolvedValue({ simulated: true });
    vi.mocked(renderTemplate).mockImplementation(async (_key, locale) => ({
      subject: locale === "fr" ? "Nous avons bien reçu votre message" : "We've received your message",
      html: "<p>ack</p>",
    }));
  });

  it("saves the inquiry and sends an acknowledgement email on success", async () => {
    const res = await POST(makeRequest(validPayload));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ ok: true, id: "inquiry-1" });
    expect(addInquiry).toHaveBeenCalledWith({
      name: "Ada Lovelace",
      company: "Acme Co",
      position: "Engineer",
      email: "ada@example.com",
      subject: "A question about your services",
      message: "This message is definitely long enough.",
    });
    expect(renderTemplate).toHaveBeenCalledWith(
      "contact_ack",
      "en",
      expect.objectContaining({ firstName: "Ada", subject: "A question about your services" })
    );
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "ada@example.com",
        subject: "We've received your message",
      })
    );
  });

  it("sends the French acknowledgement subject for locale=fr", async () => {
    await POST(makeRequest({ ...validPayload, locale: "fr" }));

    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ subject: "Nous avons bien reçu votre message" })
    );
  });

  it("returns 429 and never touches the DB/email when rate limited", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ success: false, remaining: 0 });

    const res = await POST(makeRequest(validPayload));

    expect(res.status).toBe(429);
    expect(addInquiry).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("rejects a filled honeypot field via schema validation (max(0) on website)", async () => {
    // The route's own honeypot check ("if (parsed.data.website) return { ok: true }")
    // is only reachable if schema validation lets a non-empty value through — but
    // contactSchema's website field is z.string().max(0), so any non-empty value
    // fails validation first. Filling the honeypot still blocks the submission,
    // just via a 400 rather than the silent-200 the code comment describes.
    const res = await POST(makeRequest({ ...validPayload, website: "http://spam.example" }));

    expect(res.status).toBe(400);
    expect(addInquiry).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("returns 400 with validation details for an invalid payload", async () => {
    const res = await POST(makeRequest({ ...validPayload, email: "ada@gmail.com" }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe("Invalid input");
    expect(json.details.fieldErrors.email).toBeDefined();
    expect(addInquiry).not.toHaveBeenCalled();
  });

  it("returns 400 when Turnstile verification fails", async () => {
    vi.mocked(verifyTurnstileToken).mockResolvedValue(false);

    const res = await POST(makeRequest(validPayload));

    expect(res.status).toBe(400);
    expect(addInquiry).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("returns 500 and never attempts to send email when saving the inquiry fails", async () => {
    vi.mocked(addInquiry).mockRejectedValue(new Error("connection reset"));

    const res = await POST(makeRequest(validPayload));
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toBeTruthy();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("still returns 200 when the acknowledgement email fails to send", async () => {
    vi.mocked(sendEmail).mockRejectedValue(new Error("Resend is down"));

    const res = await POST(makeRequest(validPayload));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ ok: true, id: "inquiry-1" });
  });
});
