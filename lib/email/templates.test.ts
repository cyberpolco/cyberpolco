import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db/templates", () => ({ getTemplateRow: vi.fn() }));
vi.mock("./index", () => ({ sendEmail: vi.fn() }));

const { getTemplateRow } = await import("@/lib/db/templates");
const { sendEmail } = await import("./index");
const { renderTemplate, renderBilingualTemplate, sendTemplatedEmail } = await import("./templates");

describe("renderTemplate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("substitutes variables from the DB row when one exists", async () => {
    vi.mocked(getTemplateRow).mockResolvedValue({
      key: "contact_ack",
      channel: "email",
      fr: { subject: "Bonjour {{firstName}}", body: "<p>{{firstName}}: {{subject}}</p>" },
      en: { subject: "Hello {{firstName}}", body: "<p>{{firstName}}: {{subject}}</p>" },
      updatedAt: "2026-01-01T00:00:00.000Z",
      updatedBy: null,
    });

    const result = await renderTemplate("contact_ack", "en", { firstName: "Ada", subject: "Billing" });
    expect(result).toEqual({ subject: "Hello Ada", html: "<p>Ada: Billing</p>" });
  });

  it("falls back to the registry default when no DB row exists", async () => {
    vi.mocked(getTemplateRow).mockResolvedValue(undefined);

    const result = await renderTemplate("contact_ack", "en", { firstName: "Ada", subject: "Billing" });
    expect(result.subject).toBe("We've received your message");
    expect(result.html).toContain("Ada");
    expect(result.html).toContain("Billing");
  });

  it("renders missing variables as an empty string", async () => {
    vi.mocked(getTemplateRow).mockResolvedValue({
      key: "contact_ack",
      channel: "email",
      fr: { subject: "s", body: "before {{missing}} after" },
      en: { subject: "s", body: "before {{missing}} after" },
      updatedAt: "2026-01-01T00:00:00.000Z",
      updatedBy: null,
    });

    const result = await renderTemplate("contact_ack", "en", {});
    expect(result.html).toBe("before  after");
  });
});

describe("renderBilingualTemplate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("composes both languages with an <hr /> and a shared subject", async () => {
    vi.mocked(getTemplateRow).mockResolvedValue(undefined);

    const result = await renderBilingualTemplate(
      "starlink_reminder",
      { clientName: "Ada", siteName: "HQ", expiryDate: "6 août 2026" },
      { clientName: "Ada", siteName: "HQ", expiryDate: "August 6, 2026" }
    );

    expect(result.html).toContain("Bonjour Ada");
    expect(result.html).toContain("Hello Ada");
    expect(result.html).toContain("<hr />");
    expect(result.html).toContain("6 août 2026");
    expect(result.html).toContain("August 6, 2026");
    expect(result.subject).toContain("Rappel");
  });
});

describe("sendTemplatedEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getTemplateRow).mockResolvedValue(undefined);
    vi.mocked(sendEmail).mockResolvedValue({ simulated: true });
  });

  it("renders the template and forwards to sendEmail", async () => {
    await sendTemplatedEmail({
      key: "contact_ack",
      to: "ada@example.com",
      from: "Cyber PolCo <no-reply@cyberpolco.com>",
      locale: "en",
      vars: { firstName: "Ada", subject: "Billing" },
    });

    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "ada@example.com",
        from: "Cyber PolCo <no-reply@cyberpolco.com>",
        subject: "We've received your message",
      })
    );
  });
});
