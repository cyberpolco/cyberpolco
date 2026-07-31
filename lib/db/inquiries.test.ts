import { describe, expect, it } from "vitest";
import { computeInquiriesStats, type Inquiry } from "./inquiries";

function makeInquiry(overrides: Partial<Inquiry> = {}): Inquiry {
  return {
    id: "inquiry-1",
    name: "Ada Lovelace",
    company: "Acme Co",
    position: "Engineer",
    email: "ada@example.com",
    subject: "A question",
    message: "This message is definitely long enough.",
    createdAt: "2026-01-15T00:00:00.000Z",
    read: false,
    ...overrides,
  };
}

describe("computeInquiriesStats", () => {
  it("counts read vs unread", () => {
    const stats = computeInquiriesStats([
      makeInquiry({ id: "1", read: true }),
      makeInquiry({ id: "2", read: false }),
      makeInquiry({ id: "3", read: false }),
    ]);

    expect(stats.readBreakdown).toEqual([
      { label: "Read", value: 1 },
      { label: "Unread", value: 2 },
    ]);
  });

  it("returns a 12-entry monthly trend", () => {
    const stats = computeInquiriesStats([makeInquiry()]);
    expect(stats.perMonth).toHaveLength(12);
  });

  it("handles an empty list", () => {
    const stats = computeInquiriesStats([]);
    expect(stats.readBreakdown).toEqual([
      { label: "Read", value: 0 },
      { label: "Unread", value: 0 },
    ]);
  });
});
