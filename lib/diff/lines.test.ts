import { describe, expect, it } from "vitest";
import { diffLines } from "./lines";

describe("diffLines", () => {
  it("marks every line same when both sides are identical", () => {
    const lines = ["a", "b", "c"];
    expect(diffLines(lines, lines)).toEqual([
      { type: "same", text: "a" },
      { type: "same", text: "b" },
      { type: "same", text: "c" },
    ]);
  });

  it("marks a changed line as removed (before) and added (after)", () => {
    expect(diffLines(["a", "b", "c"], ["a", "x", "c"])).toEqual([
      { type: "same", text: "a" },
      { type: "removed", text: "b" },
      { type: "added", text: "x" },
      { type: "same", text: "c" },
    ]);
  });

  it("marks trailing new lines as added", () => {
    expect(diffLines(["a"], ["a", "b", "c"])).toEqual([
      { type: "same", text: "a" },
      { type: "added", text: "b" },
      { type: "added", text: "c" },
    ]);
  });

  it("marks trailing removed lines as removed", () => {
    expect(diffLines(["a", "b", "c"], ["a"])).toEqual([
      { type: "same", text: "a" },
      { type: "removed", text: "b" },
      { type: "removed", text: "c" },
    ]);
  });

  it("handles two empty inputs", () => {
    expect(diffLines([], [])).toEqual([]);
  });

  it("handles a completely different set of lines", () => {
    expect(diffLines(["a", "b"], ["x", "y"])).toEqual([
      { type: "removed", text: "a" },
      { type: "removed", text: "b" },
      { type: "added", text: "x" },
      { type: "added", text: "y" },
    ]);
  });
});
