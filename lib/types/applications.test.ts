import { describe, expect, it } from "vitest";
import { isValidStageTransition, type Stage } from "./applications";

describe("isValidStageTransition", () => {
  it("allows each forward stage to advance one step at a time", () => {
    expect(isValidStageTransition("new", "reviewing")).toBe(true);
    expect(isValidStageTransition("reviewing", "interview")).toBe(true);
    expect(isValidStageTransition("interview", "offer")).toBe(true);
    expect(isValidStageTransition("offer", "hired")).toBe(true);
  });

  it("blocks skipping a stage forward", () => {
    expect(isValidStageTransition("new", "interview")).toBe(false);
    expect(isValidStageTransition("new", "offer")).toBe(false);
    expect(isValidStageTransition("reviewing", "offer")).toBe(false);
    expect(isValidStageTransition("reviewing", "hired")).toBe(false);
  });

  it("blocks any backward move", () => {
    expect(isValidStageTransition("offer", "interview")).toBe(false);
    expect(isValidStageTransition("interview", "reviewing")).toBe(false);
    expect(isValidStageTransition("hired", "offer")).toBe(false);
  });

  it("allows moving to rejected from any non-terminal stage", () => {
    const nonTerminal: Stage[] = ["new", "reviewing", "interview", "offer"];
    for (const stage of nonTerminal) {
      expect(isValidStageTransition(stage, "rejected")).toBe(true);
    }
  });

  it("treats hired and rejected as terminal — no moves out of either", () => {
    const allStages: Stage[] = ["new", "reviewing", "interview", "offer", "hired", "rejected"];
    for (const target of allStages) {
      expect(isValidStageTransition("hired", target)).toBe(false);
      expect(isValidStageTransition("rejected", target)).toBe(false);
    }
  });

  it("does not consider staying on the same stage a valid transition", () => {
    expect(isValidStageTransition("new", "new")).toBe(false);
  });
});
