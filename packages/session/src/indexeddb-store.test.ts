import { describe, expect, it } from "vitest";
import { createSessionTransaction, createTargetAnchor } from "@sightglass/core";
import type {
  CritiqueReport,
  DesignDirection,
  MotionStoryboard,
  MotionTuningSchema,
} from "@sightglass/critique";
import type { ChangeManifest, ReviewArtifact } from "@sightglass/export";
import {
  createIndexedDbSessionStore,
  createMemorySessionAdapter,
} from "./indexeddb-store.js";
import {
  createReviewDraftSnapshot,
  createSessionRecord,
  type SessionRecord,
} from "./session-schema.js";

const anchor = createTargetAnchor({
  runtimeId: "button:selected",
  selector: "[data-testid='selected-target']",
  path: "main > button:nth-of-type(1)",
  role: "button",
  classes: ["cta", "card-action"],
});

const manifest: ChangeManifest = Object.freeze({
  route: "/playground/landing",
  sessionId: "session-1",
  targets: Object.freeze([
    { anchor, scope: "single" as const, semanticLabel: "Primary CTA" },
  ]),
  transactions: Object.freeze([
    createSessionTransaction({
      id: "tx-1",
      scope: "single",
      targets: [anchor],
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
  ]),
});

const critiqueReport: CritiqueReport = Object.freeze({
  context: Object.freeze({
    route: "/playground/landing",
    scope: "page",
    scopeLabel: "Entire page",
    pageTitle: "Landing",
    sectionLabel: "Hero",
    selectedClasses: Object.freeze(["cta", "card-action"]),
    cardCount: 3,
    interactiveCount: 3,
    matchingActionCount: 3,
    missingDocumentLanguage: true,
    hasSectionHeading: false,
    motionSignals: Object.freeze({
      durationMs: 220,
      hasReducedMotionGuard: false,
      hasTransitionAll: true,
      layoutAffectingProperties: Object.freeze(["width"]),
    }),
  }),
  findings: Object.freeze([
    Object.freeze({
      id: "finding-1",
      category: "accessibility",
      severity: "important",
      target: anchor,
      title: "Document language is missing",
      observation: "The root document has no lang attribute.",
      impact: "Assistive technology loses locale cues.",
      recommendation: "Set <html lang> to the product locale.",
      sourceLens: "accessibility",
    }),
  ]),
  groupedFindings: Object.freeze({
    "visual-design": Object.freeze([]),
    "interface-design": Object.freeze([]),
    consistency: Object.freeze([]),
    "user-context": Object.freeze([]),
    accessibility: Object.freeze([
      Object.freeze({
        id: "finding-1",
        category: "accessibility",
        severity: "important",
        target: anchor,
        title: "Document language is missing",
        observation: "The root document has no lang attribute.",
        impact: "Assistive technology loses locale cues.",
        recommendation: "Set <html lang> to the product locale.",
        sourceLens: "accessibility",
      }),
    ]),
    "motion-quality": Object.freeze([]),
    "motion-performance": Object.freeze([]),
  }),
  perspective: "emil",
  scope: "page",
});

const directions: readonly DesignDirection[] = Object.freeze([
  Object.freeze({
    id: "playful",
    title: "More playful",
    visualThesis: "Give the hero more character.",
    contentPlan: "Tighten card repetition around one lead CTA.",
    interactionThesis: "Use springier motion with guardrails.",
    findingIds: Object.freeze(["finding-1"]),
    focusCategories: Object.freeze(["accessibility"] as const),
    priorityScore: 10,
  }),
]);

const motionStoryboard: MotionStoryboard = Object.freeze({
  pipelineTier: "layout-risk",
  warnings: Object.freeze(["Replace transition: all."]),
  reducedMotionNotes: Object.freeze(["Add a reduced-motion variant."]),
  steps: Object.freeze([
    Object.freeze({
      id: "trigger",
      title: "Trigger",
      description: "Prime the interaction.",
      durationMs: 60,
      emphasis: "enter",
    }),
  ]),
});

const motionTuningSchema: MotionTuningSchema = Object.freeze({
  controls: Object.freeze([
    Object.freeze({
      id: "duration",
      label: "Duration",
      min: 120,
      max: 420,
      step: 10,
      defaultValue: 220,
      recommendedValue: 180,
      unit: "ms",
      guidance: "Tighten the timing.",
    }),
  ]),
  performanceNotes: Object.freeze(["Replace transition: all."]),
  reducedMotionNotes: Object.freeze(["Add reduced motion."]),
});

const reviewArtifact: ReviewArtifact = Object.freeze({
  route: "/playground/landing",
  sessionId: "session-1",
  beforeScreenshot: null,
  afterScreenshot: null,
  transactionCount: 1,
  critiqueSummary: Object.freeze({
    totalFindings: 1,
    categories: Object.freeze(["accessibility"]),
    highlights: Object.freeze(["Document language is missing"]),
  }),
  exploration: Object.freeze({
    route: "/playground/landing",
    directionCount: 1,
    directions: Object.freeze(["More playful"]),
    operationCount: 1,
  }),
  prompt: "Apply the manifest.",
});

const createRecord = (): SessionRecord =>
  createSessionRecord({
    id: "session-1",
    name: "Hero polish",
    route: "/playground/landing",
    manifest,
    history: Object.freeze({
      applied: Object.freeze([
        Object.freeze({
          anchor: { ...anchor, confidence: 0.98, alternates: Object.freeze([]) },
          property: "color",
          semanticKind: "css",
          before: "#111111",
          beforeInline: "#111111",
          beforeComputed: "rgb(17, 17, 17)",
          after: "#ff3366",
        }),
      ]),
      canUndo: true,
      canRedo: false,
    }),
    critiqueReport,
    directions,
    motionStoryboard,
    motionTuningSchema,
    reviewDraft: createReviewDraftSnapshot({
      critiquePerspective: "emil",
      critiqueScope: "page",
      selectedFindingId: "finding-1",
      selectedDirectionId: "playful",
      motionValues: { duration: 180 },
    }),
    reviewArtifact,
    createdAt: "2026-03-26T12:00:00.000Z",
    updatedAt: "2026-03-26T12:05:00.000Z",
  });

describe("@sightglass/session store", () => {
  it("saves, lists, loads, exports, imports, and preserves review state", async () => {
    const store = await createIndexedDbSessionStore({
      adapter: createMemorySessionAdapter(),
    });
    const record = createRecord();

    await store.save(record);

    const listed = await store.list();
    expect(listed).toHaveLength(1);
    expect(listed[0]?.reviewDraft.selectedDirectionId).toBe("playful");
    expect(listed[0]?.reviewDraft.motionValues.duration).toBe(180);
    expect(listed[0]?.history.canUndo).toBe(true);
    expect(listed[0]?.history.applied[0]?.property).toBe("color");

    const loaded = await store.load(record.id);
    expect(loaded?.critiqueReport.scope).toBe("page");
    expect(loaded?.reviewArtifact.transactionCount).toBe(1);

    const exported = await store.exportSession(record.id);
    expect(exported).toContain("\"selectedDirectionId\": \"playful\"");

    await store.remove(record.id);
    expect(await store.load(record.id)).toBeNull();

    const imported = await store.importSession(exported);
    expect(imported.reviewDraft.critiquePerspective).toBe("emil");
    expect(imported.history.applied[0]?.after).toBe("#ff3366");
  });
});
