import { describe, it, expect } from "vitest";
import { cssToTailwind } from "./css-to-tailwind";

describe("cssToTailwind", () => {
  it("converts padding", () => {
    expect(cssToTailwind("padding", "16px")).toBe("p-4");
    expect(cssToTailwind("padding-top", "8px")).toBe("pt-2");
  });
  it("converts margin", () => {
    expect(cssToTailwind("margin", "24px")).toBe("m-6");
  });
  it("converts font-size", () => {
    expect(cssToTailwind("font-size", "14px")).toBe("text-sm");
    expect(cssToTailwind("font-size", "16px")).toBe("text-base");
  });
  it("converts border-radius", () => {
    expect(cssToTailwind("border-radius", "0px")).toBe("rounded-none");
    expect(cssToTailwind("border-radius", "4px")).toBe("rounded");
    expect(cssToTailwind("border-radius", "9999px")).toBe("rounded-full");
  });
  it("converts font-weight", () => {
    expect(cssToTailwind("font-weight", "700")).toBe("font-bold");
  });
  it("converts opacity", () => {
    expect(cssToTailwind("opacity", "0.5")).toBe("opacity-50");
  });
  it("falls back to arbitrary", () => {
    expect(cssToTailwind("padding", "13px")).toBe("p-[13px]");
  });
  it("converts gap", () => {
    expect(cssToTailwind("gap", "16px")).toBe("gap-4");
  });
  it("converts display", () => {
    expect(cssToTailwind("display", "flex")).toBe("flex");
    expect(cssToTailwind("display", "none")).toBe("hidden");
  });
});
