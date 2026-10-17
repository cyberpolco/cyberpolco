import { describe, expect, it } from "vitest";
import { courseHasFee, formatCoursePricing, learningModeFeeCents, offeredLearningModes } from "./pricing";

describe("learning-mode pricing", () => {
  it("treats a course with neither price as free", () => {
    const course = { selfPacedFeeCents: null, classroomFeeCents: 0 };
    expect(courseHasFee(course)).toBe(false);
    expect(offeredLearningModes(course)).toEqual([]);
    expect(formatCoursePricing(course)).toBe("Free");
  });

  it("only offers the modes that are priced", () => {
    const course = { selfPacedFeeCents: null, classroomFeeCents: 9900 };
    expect(courseHasFee(course)).toBe(true);
    expect(offeredLearningModes(course)).toEqual([{ mode: "classroom", feeCents: 9900 }]);
    expect(learningModeFeeCents(course, "self_paced")).toBeNull();
    expect(formatCoursePricing(course)).toBe("Classroom $99.00");
  });

  it("lists self-paced before classroom when both are offered", () => {
    const course = { selfPacedFeeCents: 4900, classroomFeeCents: 9900 };
    expect(offeredLearningModes(course).map((o) => o.mode)).toEqual(["self_paced", "classroom"]);
    expect(formatCoursePricing(course)).toBe("Self-paced $49.00 · Classroom $99.00");
  });

  it("is not a fee for an unknown course", () => {
    expect(courseHasFee(undefined)).toBe(false);
  });
});
