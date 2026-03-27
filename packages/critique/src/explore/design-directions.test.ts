import { JSDOM } from "jsdom";
import { createTargetAnchor } from "@sightglass/core";
import { describe, expect, it } from "vitest";
import {
  buildExploreEditPlan,
  buildMotionStoryboard,
  createMotionTuningSchema,
  generateDesignDirections,
  runCritique,
} from "../index.js";

const createDocument = () => {
  const dom = new JSDOM(
    `<!doctype html><html><body><main data-route="/playground/landing"><section class="card-grid"><div class="card"><button class="cta card-action">Start</button></div><div class="card"><button data-testid="selected-target" class="cta card-action" style="transition: all 420ms ease; transform: translateY(0);">Try it</button></div><div class="card"><button class="cta card-action">Compare</button></div></section></main></body></html>`,
    { url: "https://sightglass.local/playground" },
  );

  return dom.window.document;
};

const createReport = () => {
  const document = createDocument();
  const selectedElement = document.querySelector(
    "[data-testid='selected-target']",
  ) as Element;

  return {
    contextDocument: document,
    selectedElement,
    report: runCritique({
      document,
      selectedElement,
      perspective: "jhey",
      scope: "page",
      target: createTargetAnchor({
        runtimeId: "button:selected-target",
        selector: "[data-testid='selected-target']",
        path: "main > section:nth-of-type(1) > button:nth-of-type(1)",
        role: "button",
        classes: ["cta", "card-action"],
      }),
    }),
  };
};

describe("explore mode and motion lab", () => {
  it("creates alternate design directions from critique findings", () => {
    const { report } = createReport();
    const directions = generateDesignDirections(report);

    expect(directions.length).toBe(5);
    expect(directions[0]?.priorityScore).toBeGreaterThanOrEqual(
      directions[1]?.priorityScore ?? 0,
    );
    expect(directions.some((direction) => direction.title === "More editorial")).toBe(
      true,
    );
    expect(directions.some((direction) => direction.title === "More playful")).toBe(
      true,
    );
  });

  it("builds structured edit plans from the chosen direction", () => {
    const { report } = createReport();
    const direction = generateDesignDirections(report)[0]!;
    const plan = buildExploreEditPlan(direction, report);

    expect(plan.directionId).toBe(direction.id);
    expect(plan.proposedOperations.length).toBeGreaterThan(0);
    expect(plan.proposedOperations[0]?.rationale).toContain(direction.title);
  });

  it("creates a motion storyboard and tuning schema with guardrails", () => {
    const { report } = createReport();
    const storyboard = buildMotionStoryboard(report.context);
    const tuning = createMotionTuningSchema(report.context);

    expect(storyboard.pipelineTier).toBe("layout-risk");
    expect(storyboard.steps.map((step) => step.id)).toEqual([
      "trigger",
      "travel",
      "settle",
      "reduced-motion",
    ]);
    expect(tuning.controls.map((control) => control.id)).toEqual([
      "spring",
      "duration",
      "blur",
      "offset",
      "stagger",
    ]);
    expect(tuning.performanceNotes[0]).toContain("transition: all");
  });
});
