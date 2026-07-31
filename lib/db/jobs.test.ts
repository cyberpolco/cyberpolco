import { describe, expect, it } from "vitest";
import { computeJobsStats, type Job } from "./jobs";

function makeJob(overrides: Partial<Job> = {}): Job {
  return {
    id: "job-1",
    slug: "soc-analyst",
    status: "open",
    fr: { title: "Analyste SOC", location: "Windhoek", type: "Full-time", description: "" },
    en: { title: "SOC Analyst", location: "Windhoek", type: "Full-time", description: "" },
    createdAt: "2026-01-15T00:00:00.000Z",
    ...overrides,
  };
}

describe("computeJobsStats", () => {
  it("counts open vs closed", () => {
    const stats = computeJobsStats([
      makeJob({ id: "1", status: "open" }),
      makeJob({ id: "2", status: "open" }),
      makeJob({ id: "3", status: "closed" }),
    ]);

    expect(stats.byStatus).toEqual([
      { label: "Open", value: 2 },
      { label: "Closed", value: 1 },
    ]);
  });

  it("handles an empty list", () => {
    const stats = computeJobsStats([]);
    expect(stats.byStatus).toEqual([
      { label: "Open", value: 0 },
      { label: "Closed", value: 0 },
    ]);
  });
});
