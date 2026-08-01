import { describe, expect, it } from "vitest";
import { isArticlePublished } from "./visibility";

describe("isArticlePublished", () => {
  const today = "2026-07-31";

  it("is published when the date is today", () => {
    expect(isArticlePublished("2026-07-31", today)).toBe(true);
  });

  it("is published when the date is in the past", () => {
    expect(isArticlePublished("2026-01-01", today)).toBe(true);
  });

  it("is not published when the date is in the future", () => {
    expect(isArticlePublished("2026-08-01", today)).toBe(false);
  });
});
