import { describe, expect, it } from "vitest";
import { buildSubscriptionReminderEmail } from "./starlink-reminder";

describe("buildSubscriptionReminderEmail", () => {
  const base = {
    clientName: "Ada Lovelace",
    siteName: "HQ Site",
    expiryDateFr: "6 août 2026",
    expiryDateEn: "August 6, 2026",
  };

  it("includes both languages in one email", () => {
    const { html } = buildSubscriptionReminderEmail(base);
    expect(html).toContain("Bonjour Ada Lovelace");
    expect(html).toContain("Hello Ada Lovelace");
  });

  it("includes the site name and both expiry date formats", () => {
    const { html } = buildSubscriptionReminderEmail(base);
    expect(html).toContain("HQ Site");
    expect(html).toContain("6 août 2026");
    expect(html).toContain("August 6, 2026");
  });

  it("includes the contact email and both offices' WhatsApp links", () => {
    const { html } = buildSubscriptionReminderEmail(base);
    expect(html).toContain("info@cyberpolco.com");
    expect(html).toContain("https://wa.me/243828117710");
    expect(html).toContain("https://wa.me/264812314352");
  });

  it("has a bilingual subject line", () => {
    const { subject } = buildSubscriptionReminderEmail(base);
    expect(subject).toContain("Rappel");
    expect(subject).toContain("Reminder");
  });

  it("escapes HTML in client and site names", () => {
    const { html } = buildSubscriptionReminderEmail({
      ...base,
      clientName: '<script>alert("x")</script>',
      siteName: "<b>Evil</b>",
    });
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<b>Evil</b>");
    expect(html).toContain("&lt;script&gt;");
  });
});
