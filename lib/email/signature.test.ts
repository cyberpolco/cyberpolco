import { describe, expect, it } from "vitest";
import { appendSignature, extractAddress, renderSignature } from "./signature";

describe("extractAddress", () => {
  it("pulls the address out of a display-name header", () => {
    expect(extractAddress("Cyber PolCo <HR@cyberpolco.com>")).toBe("hr@cyberpolco.com");
  });

  it("accepts a bare address", () => {
    expect(extractAddress(" noreply@cyberpolco.com ")).toBe("noreply@cyberpolco.com");
  });
});

describe("renderSignature", () => {
  it("picks the identity matching the sending alias", () => {
    const html = renderSignature("Cyber PolCo <hr@cyberpolco.com>");
    expect(html).toContain("Ressources humaines");
    expect(html).toContain("Human Resources");
    expect(html).toContain('href="mailto:hr@cyberpolco.com"');
  });

  it("renders the personal signature for lam@", () => {
    const html = renderSignature("lam@cyberpolco.com");
    expect(html).toContain("L&eacute;on Atunakou");
    expect(html).toContain("Co-founder &amp; CTO");
  });

  it("omits the English title when the alias has none", () => {
    const html = renderSignature("admin@cyberpolco.com");
    expect(html).toContain("Administration");
    expect(html).not.toContain("&nbsp;/&nbsp; ");
  });

  it("falls back to the general info@ signature for unknown senders", () => {
    const html = renderSignature("Cyber PolCo <notifications@cyberpolco.com>");
    expect(html).toContain("General Enquiries");
    expect(html).toContain('href="mailto:info@cyberpolco.com"');
  });
});

describe("appendSignature", () => {
  it("keeps the body and adds the signature after it", () => {
    const html = appendSignature("<p>Hello</p>", "support@cyberpolco.com");
    expect(html.startsWith("<p>Hello</p>")).toBe(true);
    expect(html).toContain("Client Support");
  });
});
