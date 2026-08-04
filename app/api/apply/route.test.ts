import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/db/applications", () => ({ addApplication: vi.fn() }));
vi.mock("@/lib/db/jobs", () => ({ getJobBySlug: vi.fn(), getEffectiveJobStatus: vi.fn() }));
vi.mock("@/lib/email", () => ({ sendEmail: vi.fn() }));
vi.mock("@/lib/email/templates", () => ({ renderTemplate: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn(),
  getClientIp: vi.fn(() => "1.2.3.4"),
}));
vi.mock("@/lib/turnstile", () => ({ verifyTurnstileToken: vi.fn() }));

const { addApplication } = await import("@/lib/db/applications");
const { getJobBySlug, getEffectiveJobStatus } = await import("@/lib/db/jobs");
const { sendEmail } = await import("@/lib/email");
const { renderTemplate } = await import("@/lib/email/templates");
const { checkRateLimit } = await import("@/lib/rate-limit");
const { verifyTurnstileToken } = await import("@/lib/turnstile");
const { POST } = await import("./route");

const validFields: Record<string, string> = {
  jobSlug: "soc-analyst",
  jobTitle: "SOC Analyst",
  name: "Ada Lovelace",
  email: "ada@example.com",
  phone: "+1 555 0100",
  message: "I'd love to join the team.",
  website: "",
  turnstileToken: "token",
  locale: "en",
  cvUrl: "https://abc123.public.blob.vercel-storage.com/cvs/resume.pdf",
  cvFileName: "resume.pdf",
};

function makeRequest(fields: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value);
  }
  return new NextRequest("http://localhost/api/apply", { method: "POST", body: formData });
}

describe("POST /api/apply", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkRateLimit).mockResolvedValue({ success: true, remaining: 4 });
    vi.mocked(getJobBySlug).mockResolvedValue({ id: "job-1", slug: "soc-analyst" } as Awaited<
      ReturnType<typeof getJobBySlug>
    >);
    vi.mocked(getEffectiveJobStatus).mockReturnValue("open");
    vi.mocked(verifyTurnstileToken).mockResolvedValue(true);
    vi.mocked(addApplication).mockResolvedValue({
      id: "application-1",
      jobSlug: "soc-analyst",
      jobTitle: "SOC Analyst",
      name: "Ada Lovelace",
      email: "ada@example.com",
      phone: "+1 555 0100",
      message: "I'd love to join the team.",
      cvFileName: "resume.pdf",
      cvUrl: "https://abc123.public.blob.vercel-storage.com/cvs/resume.pdf",
      createdAt: "2026-01-01T00:00:00.000Z",
      stage: "new",
      notes: null,
    });
    vi.mocked(sendEmail).mockResolvedValue({ simulated: true });
    vi.mocked(renderTemplate).mockImplementation(async (_key, locale) => ({
      subject: locale === "fr" ? "Votre candidature a bien été reçue" : "Your application has been received",
      html: "<p>ack</p>",
    }));
  });

  it("saves the application and sends an acknowledgement email on success", async () => {
    const res = await POST(makeRequest(validFields));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ ok: true, id: "application-1" });
    expect(addApplication).toHaveBeenCalledWith({
      jobSlug: "soc-analyst",
      jobTitle: "SOC Analyst",
      name: "Ada Lovelace",
      email: "ada@example.com",
      phone: "+1 555 0100",
      message: "I'd love to join the team.",
      cvFileName: "resume.pdf",
      cvUrl: "https://abc123.public.blob.vercel-storage.com/cvs/resume.pdf",
    });
    expect(renderTemplate).toHaveBeenCalledWith(
      "apply_ack",
      "en",
      expect.objectContaining({ name: "Ada Lovelace", jobTitle: "SOC Analyst" })
    );
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "ada@example.com",
        subject: "Your application has been received",
      })
    );
  });

  it("sends the French acknowledgement subject for locale=fr", async () => {
    await POST(makeRequest({ ...validFields, locale: "fr" }));

    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ subject: "Votre candidature a bien été reçue" })
    );
  });

  it("returns 429 and never touches the DB/email when rate limited", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ success: false, remaining: 0 });

    const res = await POST(makeRequest(validFields));

    expect(res.status).toBe(429);
    expect(addApplication).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("rejects a filled honeypot field via schema validation (max(0) on website)", async () => {
    // Same schema quirk as the contact route: website is z.string().max(0), so a
    // filled honeypot fails validation before the route's own "pretend success"
    // check ever runs.
    const res = await POST(makeRequest({ ...validFields, website: "http://spam.example" }));

    expect(res.status).toBe(400);
    expect(addApplication).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("returns 400 with validation details for an invalid payload", async () => {
    const res = await POST(makeRequest({ ...validFields, phone: "no" }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe("Invalid input");
    expect(json.details.fieldErrors.phone).toBeDefined();
    expect(addApplication).not.toHaveBeenCalled();
  });

  it("returns 400 and never touches the DB/email when the job isn't open", async () => {
    vi.mocked(getEffectiveJobStatus).mockReturnValue("closed");

    const res = await POST(makeRequest(validFields));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe("This position is no longer accepting applications.");
    expect(addApplication).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("returns 400 when the job slug doesn't exist", async () => {
    vi.mocked(getJobBySlug).mockResolvedValue(undefined);

    const res = await POST(makeRequest(validFields));

    expect(res.status).toBe(400);
    expect(addApplication).not.toHaveBeenCalled();
  });

  it("returns 400 when Turnstile verification fails", async () => {
    vi.mocked(verifyTurnstileToken).mockResolvedValue(false);

    const res = await POST(makeRequest(validFields));

    expect(res.status).toBe(400);
    expect(addApplication).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("returns 400 when the CV URL doesn't point at our Blob store", async () => {
    const res = await POST(
      makeRequest({ ...validFields, cvUrl: "https://evil.example/cvs/resume.pdf" })
    );
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe("A CV file is required.");
    expect(addApplication).not.toHaveBeenCalled();
  });

  it("returns 400 when the CV URL is missing", async () => {
    const fields = { ...validFields };
    delete fields.cvUrl;
    delete fields.cvFileName;

    const res = await POST(makeRequest(fields));

    expect(res.status).toBe(400);
    expect(addApplication).not.toHaveBeenCalled();
  });

  it("returns 500 and never attempts to send email when saving the application fails", async () => {
    vi.mocked(addApplication).mockRejectedValue(new Error("connection reset"));

    const res = await POST(makeRequest(validFields));
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toBeTruthy();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("still returns 200 when the acknowledgement email fails to send", async () => {
    vi.mocked(sendEmail).mockRejectedValue(new Error("Resend is down"));

    const res = await POST(makeRequest(validFields));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ ok: true, id: "application-1" });
  });
});
