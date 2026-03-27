import { createSessionTransaction, createTargetAnchor } from "@sightglass/core";
import type { CritiqueFinding } from "@sightglass/critique";
import { describe, expect, it } from "vitest";
import { createChangeManifest } from "./change-manifest.js";
import { createCritiqueExportSummary } from "./critique-report.js";
import { createExplorationBundle } from "./exploration-bundle.js";
import { formatPromptFromManifest } from "./prompt-formatter.js";
import { createReviewArtifact } from "./review-artifact.js";

const createCritiqueFinding = (
  id: string,
  category: CritiqueFinding["category"],
  title: string,
): CritiqueFinding =>
  Object.freeze({
    id,
    category,
    severity: "important",
    target: createTargetAnchor({
      runtimeId: "button:selected",
      selector: "[data-testid='selected-target']",
      path: "main > button:nth-of-type(1)",
      role: "button",
      classes: ["cta", "card-action"],
    }),
    title,
    observation: `${title} observation`,
    impact: `${title} impact`,
    recommendation: `${title} recommendation`,
    sourceLens: category,
  });

describe("structured export pipeline", () => {
  it("creates a deterministic manifest and derives prompt/review outputs from it", () => {
    const secondTarget = createTargetAnchor({
      runtimeId: "button:secondary",
      selector: "[data-testid='secondary-target']",
      path: "main > button:nth-of-type(2)",
      role: "button",
      classes: ["cta"],
    });
    const firstTarget = createTargetAnchor({
      runtimeId: "button:primary",
      selector: "[data-testid='selected-target']",
      path: "main > button:nth-of-type(1)",
      role: "button",
      classes: ["cta", "card-action"],
    });
    const manifest = createChangeManifest({
      route: "/playground/landing",
      sessionId: "session-123",
      targets: [
        {
          anchor: secondTarget,
          scope: "similar",
          semanticLabel: "secondary action",
        },
        {
          anchor: firstTarget,
          scope: "component",
          semanticLabel: "primary action",
        },
      ],
      transactions: [
        createSessionTransaction({
          id: "tx-2",
          scope: "component",
          targets: [secondTarget],
          operations: [
            {
              id: "op-2",
              property: "border-radius",
              before: "12px",
              after: "16px",
              semanticKind: "token",
            },
          ],
          createdAt: "2026-03-26T12:00:02.000Z",
        }),
        createSessionTransaction({
          id: "tx-1",
          scope: "single",
          targets: [firstTarget],
          operations: [
            {
              id: "op-1",
              property: "color",
              before: "#111111",
              after: "#ff3366",
              semanticKind: "css",
            },
          ],
          createdAt: "2026-03-26T12:00:01.000Z",
        }),
      ],
      critique: [
        createCritiqueFinding(
          "finding-2",
          "motion-performance",
          "Tighten the transition list",
        ),
        createCritiqueFinding(
          "finding-1",
          "accessibility",
          "Add a document language",
        ),
      ],
      exploration: [
        {
          directionId: "playful",
          title: "More playful",
          proposedOperations: [
            {
              id: "plan-1",
              property: "transition-duration",
              semanticKind: "layout",
              scope: "component",
              title: "Tighten motion timing",
              value: "220ms",
              rationale: "Faster motion keeps the CTA responsive.",
            },
          ],
        },
      ],
      motionStoryboard: {
        pipelineTier: "layout-risk",
        warnings: ["Replace `transition: all` with transform/opacity."],
        reducedMotionNotes: ["Add a reduced-motion fallback."],
        steps: [
          {
            id: "trigger",
            title: "Trigger",
            description: "Prime the interaction.",
            durationMs: 60,
            emphasis: "enter",
          },
        ],
      },
    });

    expect(manifest.targets.map((target) => target.anchor.runtimeId)).toEqual([
      "button:primary",
      "button:secondary",
    ]);
    expect(manifest.transactions.map((transaction) => transaction.id)).toEqual([
      "tx-1",
      "tx-2",
    ]);
    expect(manifest.critique?.map((finding) => finding.id)).toEqual([
      "finding-1",
      "finding-2",
    ]);

    const critiqueSummary = createCritiqueExportSummary(manifest);
    const explorationBundle = createExplorationBundle(manifest);
    const prompt = formatPromptFromManifest(manifest);
    const reviewArtifact = createReviewArtifact({
      manifest,
      beforeScreenshot: "before.png",
      afterScreenshot: "after.png",
    });

    expect(critiqueSummary.categories).toEqual([
      "accessibility",
      "motion-performance",
    ]);
    expect(explorationBundle.operationCount).toBe(1);
    expect(prompt).toContain("/playground/landing");
    expect(prompt).toContain("Add a document language");
    expect(prompt).toContain("More playful");
    expect(reviewArtifact.transactionCount).toBe(2);
    expect(reviewArtifact.prompt).toBe(prompt);
    expect(reviewArtifact.beforeScreenshot).toBe("before.png");
  });

  it("preserves transaction order when timestamps match", () => {
    const target = createTargetAnchor({
      runtimeId: "button:selected",
      selector: "[data-testid='selected-target']",
      path: "main > button:nth-of-type(1)",
      role: "button",
      classes: ["cta", "card-action"],
    });
    const createdAt = "2026-03-26T12:00:01.000Z";
    const manifest = createChangeManifest({
      route: "/playground/landing",
      sessionId: "session-ordered",
      targets: [{ anchor: target, scope: "single", semanticLabel: "Primary CTA" }],
      transactions: [
        createSessionTransaction({
          id: "tx-2",
          scope: "single",
          targets: [target],
          operations: [
            {
              id: "op-2",
              property: "color",
              before: "#111111",
              after: "#222222",
              semanticKind: "css",
            },
          ],
          createdAt,
        }),
        createSessionTransaction({
          id: "tx-10",
          scope: "single",
          targets: [target],
          operations: [
            {
              id: "op-10",
              property: "color",
              before: "#222222",
              after: "#333333",
              semanticKind: "css",
            },
          ],
          createdAt,
        }),
        createSessionTransaction({
          id: "tx-1",
          scope: "single",
          targets: [target],
          operations: [
            {
              id: "op-1",
              property: "color",
              before: "#333333",
              after: "#444444",
              semanticKind: "css",
            },
          ],
          createdAt,
        }),
      ],
    });

    expect(manifest.transactions.map((transaction) => transaction.id)).toEqual([
      "tx-2",
      "tx-10",
      "tx-1",
    ]);
  });
});
