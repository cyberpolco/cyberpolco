import { describe, expect, it } from "vitest";
import { computeStarlinkStats, type StarlinkClient, type StarlinkSite } from "./starlink";

function makeSite(overrides: Partial<StarlinkSite> = {}): StarlinkSite {
  return {
    id: "site-1",
    siteName: "HQ",
    subscriptionType: "business",
    dishType: "standard",
    installationStatus: "pending",
    kitOrderRef: "KIT-0001",
    deliveryDate: null,
    deploymentStatus: "not_deployed",
    wifiPassword: "hunter2",
    paymentStatus: "pending",
    ...overrides,
  };
}

function makeClient(sites: StarlinkSite[], overrides: Partial<StarlinkClient> = {}): StarlinkClient {
  return {
    id: "client-1",
    clientId: "STK-0001",
    name: "Acme Corp",
    email: "ops@acme.example",
    phone: "+264 81 000 0000",
    sites,
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("computeStarlinkStats", () => {
  it("returns all-zero stats with no clients", () => {
    const stats = computeStarlinkStats([]);
    expect(stats.totalClients).toBe(0);
    expect(stats.totalSites).toBe(0);
    expect(stats.paymentBreakdown).toEqual({ paid: 0, pending: 0, overdue: 0 });
  });

  it("counts clients and sites across multiple clients", () => {
    const clients = [
      makeClient([makeSite({ id: "s1" }), makeSite({ id: "s2" })], { id: "c1" }),
      makeClient([makeSite({ id: "s3" })], { id: "c2" }),
    ];

    const stats = computeStarlinkStats(clients);
    expect(stats.totalClients).toBe(2);
    expect(stats.totalSites).toBe(3);
  });

  it("breaks down payment status across all sites", () => {
    const clients = [
      makeClient([
        makeSite({ id: "s1", paymentStatus: "paid" }),
        makeSite({ id: "s2", paymentStatus: "paid" }),
        makeSite({ id: "s3", paymentStatus: "pending" }),
        makeSite({ id: "s4", paymentStatus: "overdue" }),
      ]),
    ];

    expect(computeStarlinkStats(clients).paymentBreakdown).toEqual({ paid: 2, pending: 1, overdue: 1 });
  });

  it("breaks down installation status in pipeline order, including zero-count stages", () => {
    const clients = [
      makeClient([
        makeSite({ id: "s1", installationStatus: "completed" }),
        makeSite({ id: "s2", installationStatus: "completed" }),
        makeSite({ id: "s3", installationStatus: "pending" }),
      ]),
    ];

    expect(computeStarlinkStats(clients).installationByStatus).toEqual([
      { label: "Pending", value: 1 },
      { label: "Scheduled", value: 0 },
      { label: "In progress", value: 0 },
      { label: "Completed", value: 2 },
    ]);
  });

  it("breaks down deployment status and subscription type", () => {
    const clients = [
      makeClient([
        makeSite({ id: "s1", deploymentStatus: "active", subscriptionType: "maritime" }),
        makeSite({ id: "s2", deploymentStatus: "suspended", subscriptionType: "residential" }),
      ]),
    ];

    const stats = computeStarlinkStats(clients);

    expect(stats.deploymentByStatus).toEqual([
      { label: "Not deployed", value: 0 },
      { label: "Deployed", value: 0 },
      { label: "Active", value: 1 },
      { label: "Suspended", value: 1 },
    ]);
    expect(stats.subscriptionByType).toEqual([
      { label: "Residential", value: 1 },
      { label: "Business", value: 0 },
      { label: "Roam", value: 0 },
      { label: "Maritime", value: 1 },
    ]);
  });
});
