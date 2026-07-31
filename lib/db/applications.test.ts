import { describe, expect, it } from "vitest";
import { computeApplicationsStats } from "./applications";
import type { Application } from "@/lib/types/applications";

function makeApplication(overrides: Partial<Application> = {}): Application {
  return {
    id: "app-1",
    jobSlug: "soc-analyst",
    jobTitle: "SOC Analyst",
    name: "Ada Lovelace",
    email: "ada@example.com",
    phone: "+264 81 000 0000",
    message: "",
    cvFileName: "resume.pdf",
    cvUrl: "https://example.public.blob.vercel-storage.com/cvs/resume.pdf",
    createdAt: "2026-01-15T00:00:00.000Z",
    stage: "new",
    notes: null,
    ...overrides,
  };
}

describe("computeApplicationsStats", () => {
  it("counts applications per stage in fixed pipeline order", () => {
    const stats = computeApplicationsStats([
      makeApplication({ id: "1", stage: "new" }),
      makeApplication({ id: "2", stage: "new" }),
      makeApplication({ id: "3", stage: "hired" }),
    ]);

    expect(stats.byStage.map((s) => s.label)).toEqual([
      "New",
      "Reviewing",
      "Interview",
      "Offer",
      "Hired",
      "Rejected",
    ]);
    expect(stats.byStage.find((s) => s.label === "New")?.value).toBe(2);
    expect(stats.byStage.find((s) => s.label === "Hired")?.value).toBe(1);
    expect(stats.byStage.find((s) => s.label === "Rejected")?.value).toBe(0);
  });

  it("returns a 12-entry monthly trend", () => {
    const stats = computeApplicationsStats([makeApplication()]);
    expect(stats.perMonth).toHaveLength(12);
  });

  it("handles an empty list", () => {
    const stats = computeApplicationsStats([]);
    expect(stats.byStage.every((s) => s.value === 0)).toBe(true);
  });
});
