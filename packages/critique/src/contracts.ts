import type { TargetAnchor } from "@sightglass/core";

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
