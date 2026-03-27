import { describe, it, expect } from "vitest";
import { findClosestTailwindColor } from "./tailwind-colors";

describe("findClosestTailwindColor", () => {
  it("finds exact match for red-500", () => {
    expect(findClosestTailwindColor("#ef4444")?.name).toBe("red-500");
  });
  it("finds exact match for blue-600", () => {
    expect(findClosestTailwindColor("#2563eb")?.name).toBe("blue-600");
  });
  it("returns a match for any color", () => {
    expect(findClosestTailwindColor("#123456")).toBeTruthy();
  });
});
