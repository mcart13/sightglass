import { describe, expect, it } from "vitest";
import {
  createReviewRouteModel,
  renderReviewRouteSummary,
} from "./review";

describe("playground review route", () => {
  it("creates a readable review summary from a local session artifact", () => {
    const model = createReviewRouteModel({
      route: "/playground/landing",
      sessionId: "session-1",
      transactionCount: 2,
      critiqueSummary: {
        totalFindings: 3,
        categories: ["accessibility", "motion-performance"],
        highlights: ["Document language is missing", "Replace transition: all"],
      },
      exploration: {
        directionCount: 1,
        directions: ["More playful"],
        operationCount: 2,
      },
      prompt: "Apply the manifest.",
    });

    const summary = renderReviewRouteSummary(model);

    expect(summary).toContain("Review session session-1");
    expect(summary).toContain("/playground/landing");
    expect(summary).toContain("Document language is missing");
    expect(summary).toContain("More playful");
    expect(summary).toContain("Apply the manifest.");
  });
});
