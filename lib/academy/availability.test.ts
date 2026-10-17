import { describe, expect, it } from "vitest";
import { lessonAvailability } from "./availability";

const now = new Date("2026-10-17T12:00:00Z");
const past = "2026-10-01T09:00:00.000Z";
const future = "2026-11-01T09:00:00.000Z";

const lesson = (availableAt?: string | null) => ({ id: "l1", availableAt });
const enrollment = (
  learningMode: "self_paced" | "classroom" | null,
  lessonAvailabilityOverrides: Record<string, string | null> = {}
) => ({ learningMode, lessonAvailability: lessonAvailabilityOverrides });

describe("lessonAvailability", () => {
  it("opens every lesson for self-paced students, ignoring the class schedule", () => {
    expect(lessonAvailability(enrollment("self_paced"), lesson(future), now)).toEqual({ available: true });
  });

  it("follows the class schedule for classroom and free-course students", () => {
    for (const mode of ["classroom", null] as const) {
      expect(lessonAvailability(enrollment(mode), lesson(future), now)).toEqual({ available: false, opensAt: future });
      expect(lessonAvailability(enrollment(mode), lesson(past), now)).toEqual({ available: true });
    }
  });

  it("treats a lesson with no class date as open", () => {
    expect(lessonAvailability(enrollment("classroom"), lesson(null), now)).toEqual({ available: true });
    expect(lessonAvailability(enrollment("classroom"), lesson(undefined), now)).toEqual({ available: true });
  });

  it("lets a per-student override win over either default", () => {
    expect(lessonAvailability(enrollment("self_paced", { l1: future }), lesson(), now)).toEqual({
      available: false,
      opensAt: future,
    });
    expect(lessonAvailability(enrollment("self_paced", { l1: null }), lesson(), now)).toEqual({
      available: false,
      opensAt: null,
    });
    expect(lessonAvailability(enrollment("classroom", { l1: past }), lesson(future), now)).toEqual({ available: true });
  });

  it("ignores overrides for other lessons", () => {
    expect(lessonAvailability(enrollment("classroom", { other: null }), lesson(), now)).toEqual({ available: true });
  });
});
