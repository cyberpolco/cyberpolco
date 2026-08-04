import { describe, expect, it } from "vitest";
import { computeJobsStats, getEffectiveJobStatus, type Job } from "./jobs";

function makeJob(overrides: Partial<Job> = {}): Job {
  return {
    id: "job-1",
    slug: "soc-analyst",
    status: "open",
    openAt: null,
    closeAt: null,
    fr: { title: "Analyste SOC", location: "Windhoek", type: "Full-time", description: "" },
    en: { title: "SOC Analyst", location: "Windhoek", type: "Full-time", description: "" },
    createdAt: "2026-01-15T00:00:00.000Z",
    ...overrides,
  };
}

describe("getEffectiveJobStatus", () => {
  const now = new Date("2026-06-01T00:00:00.000Z");

  it("is draft regardless of dates", () => {
    expect(getEffectiveJobStatus(makeJob({ status: "draft", openAt: "2026-01-01T00:00:00.000Z" }), now)).toBe("draft");
  });

  it("is closed when manually closed regardless of dates", () => {
    expect(getEffectiveJobStatus(makeJob({ status: "closed", closeAt: "2027-01-01T00:00:00.000Z" }), now)).toBe(
      "closed"
    );
  });

  it("is open with no schedule set", () => {
    expect(getEffectiveJobStatus(makeJob({ status: "open" }), now)).toBe("open");
  });

  it("is scheduled before openAt", () => {
    expect(getEffectiveJobStatus(makeJob({ status: "open", openAt: "2026-07-01T00:00:00.000Z" }), now)).toBe(
      "scheduled"
    );
  });

  it("is open between openAt and closeAt", () => {
    expect(
      getEffectiveJobStatus(
        makeJob({ status: "open", openAt: "2026-01-01T00:00:00.000Z", closeAt: "2026-12-01T00:00:00.000Z" }),
        now
      )
    ).toBe("open");
  });

  it("is closed after closeAt", () => {
    expect(getEffectiveJobStatus(makeJob({ status: "open", closeAt: "2026-05-01T00:00:00.000Z" }), now)).toBe(
      "closed"
    );
  });
});

describe("computeJobsStats", () => {
  it("counts open, scheduled, closed, and draft", () => {
    const now = new Date("2026-06-01T00:00:00.000Z");
    const stats = computeJobsStats(
      [
        makeJob({ id: "1", status: "open" }),
        makeJob({ id: "2", status: "open", openAt: "2026-07-01T00:00:00.000Z" }),
        makeJob({ id: "3", status: "closed" }),
        makeJob({ id: "4", status: "draft" }),
      ],
      now
    );

    expect(stats.byStatus).toEqual([
      { label: "Open", value: 1 },
      { label: "Scheduled", value: 1 },
      { label: "Closed", value: 1 },
      { label: "Draft", value: 1 },
    ]);
  });

  it("handles an empty list", () => {
    const stats = computeJobsStats([]);
    expect(stats.byStatus).toEqual([
      { label: "Open", value: 0 },
      { label: "Scheduled", value: 0 },
      { label: "Closed", value: 0 },
      { label: "Draft", value: 0 },
    ]);
  });
});
