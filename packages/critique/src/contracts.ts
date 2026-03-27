import type { EditScope, EditSemanticKind, TargetAnchor } from "@sightglass/core";

export const CRITIQUE_CATEGORIES = [
  "visual-design",
  "interface-design",
  "consistency",
  "user-context",
  "accessibility",
  "motion-quality",
  "motion-performance",
] as const;

export const CRITIQUE_SEVERITIES = [
  "critical",
  "important",
  "opportunity",
] as const;

export const CRITIQUE_PERSPECTIVES = ["emil", "jakub", "jhey"] as const;

export const CRITIQUE_SCOPES = ["node", "section", "page"] as const;

export type CritiqueCategory = (typeof CRITIQUE_CATEGORIES)[number];
export type CritiqueSeverity = (typeof CRITIQUE_SEVERITIES)[number];
export type CritiquePerspective = (typeof CRITIQUE_PERSPECTIVES)[number];
export type CritiqueScope = (typeof CRITIQUE_SCOPES)[number];

export interface MotionSignals {
  readonly durationMs: number;
  readonly hasReducedMotionGuard: boolean;
  readonly hasTransitionAll: boolean;
  readonly layoutAffectingProperties: readonly string[];
}

export interface CritiqueContext {
  readonly route: string;
  readonly scope: CritiqueScope;
  readonly scopeLabel: string;
  readonly pageTitle: string | null;
  readonly sectionLabel: string | null;
  readonly selectedClasses: readonly string[];
  readonly cardCount: number;
  readonly interactiveCount: number;
  readonly matchingActionCount: number;
  readonly missingDocumentLanguage: boolean;
  readonly hasSectionHeading: boolean;
  readonly motionSignals: Readonly<MotionSignals>;
}

export interface CritiqueFinding {
  readonly id: string;
  readonly category: CritiqueCategory;
  readonly severity: CritiqueSeverity;
  readonly target: Readonly<TargetAnchor>;
  readonly title: string;
  readonly observation: string;
  readonly impact: string;
  readonly recommendation: string;
  readonly sourceLens: string;
}

export type CritiqueGroups = Readonly<Record<CritiqueCategory, readonly CritiqueFinding[]>>;

export interface CritiqueReport {
  readonly context: Readonly<CritiqueContext>;
  readonly findings: readonly CritiqueFinding[];
  readonly groupedFindings: CritiqueGroups;
  readonly perspective: CritiquePerspective;
  readonly scope: CritiqueScope;
}

export interface RunCritiqueOptions {
  readonly document: Document;
  readonly perspective: CritiquePerspective;
  readonly scope: CritiqueScope;
  readonly selectedElement: Element;
  readonly target: Readonly<TargetAnchor>;
}

export const DESIGN_DIRECTION_IDS = [
  "editorial",
  "restrained",
  "premium",
  "playful",
  "utilitarian",
] as const;

export type DesignDirectionId = (typeof DESIGN_DIRECTION_IDS)[number];

export interface DesignDirection {
  readonly id: DesignDirectionId;
  readonly title: string;
  readonly visualThesis: string;
  readonly contentPlan: string;
  readonly interactionThesis: string;
  readonly findingIds: readonly string[];
  readonly focusCategories: readonly CritiqueCategory[];
  readonly priorityScore: number;
}

export interface ExploreEditOperation {
  readonly id: string;
  readonly property: string;
  readonly semanticKind: EditSemanticKind;
  readonly scope: EditScope;
  readonly title: string;
  readonly value: string;
  readonly rationale: string;
}

export interface ExploreEditPlan {
  readonly directionId: DesignDirectionId;
  readonly title: string;
  readonly summary: string;
  readonly proposedOperations: readonly ExploreEditOperation[];
}

export type MotionPipelineTier =
  | "compositor-safe"
  | "layout-risk";

export interface MotionStoryboardStep {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly durationMs: number;
  readonly emphasis: "enter" | "settle" | "exit" | "reduced-motion";
}

export interface MotionStoryboard {
  readonly pipelineTier: MotionPipelineTier;
  readonly warnings: readonly string[];
  readonly reducedMotionNotes: readonly string[];
  readonly steps: readonly MotionStoryboardStep[];
}

export type MotionTuningControlId =
  | "spring"
  | "duration"
  | "blur"
  | "offset"
  | "stagger";

export interface MotionTuningControl {
  readonly id: MotionTuningControlId;
  readonly label: string;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly defaultValue: number;
  readonly recommendedValue: number;
  readonly unit: string;
  readonly guidance: string;
}

export interface MotionTuningSchema {
  readonly controls: readonly MotionTuningControl[];
  readonly performanceNotes: readonly string[];
  readonly reducedMotionNotes: readonly string[];
}
