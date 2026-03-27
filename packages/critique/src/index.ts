import type {
  CritiqueCategory,
  CritiqueFinding,
  CritiqueGroups,
  CritiqueReport,
  CritiquePerspective,
  RunCritiqueOptions,
} from "./contracts.js";
import { CRITIQUE_CATEGORIES } from "./contracts.js";
import { inferCritiqueContext } from "./context/infer-context.js";
import { buildExploreEditPlan } from "./explore/edit-plan.js";
import { generateDesignDirections } from "./explore/design-directions.js";
import { runAccessibilityLens } from "./lenses/accessibility.js";
import { runInterfaceDesignLens } from "./lenses/interface-design.js";
import { buildMotionStoryboard } from "./motion/build-storyboard.js";
import { createMotionTuningSchema } from "./motion/tuning-schema.js";
import { runMotionPerformanceLens } from "./lenses/motion-performance.js";
import { runMotionQualityLens } from "./lenses/motion-quality.js";
import { runVisualDesignLens } from "./lenses/visual-design.js";
import { emilPerspective } from "./perspectives/emil.js";
import { jakubPerspective } from "./perspectives/jakub.js";
import { jheyPerspective } from "./perspectives/jhey.js";

export * from "./contracts.js";
export { buildExploreEditPlan } from "./explore/edit-plan.js";
export { generateDesignDirections } from "./explore/design-directions.js";
export { buildMotionStoryboard } from "./motion/build-storyboard.js";
export { createMotionTuningSchema } from "./motion/tuning-schema.js";

const SEVERITY_SCORES = Object.freeze({
  critical: 300,
  important: 200,
  opportunity: 100,
});

const PERSPECTIVE_WEIGHTS = Object.freeze({
  emil: emilPerspective,
  jakub: jakubPerspective,
  jhey: jheyPerspective,
});

const sortFindings = (
  perspective: CritiquePerspective,
  findings: readonly CritiqueFinding[],
): readonly CritiqueFinding[] => {
  const weights = PERSPECTIVE_WEIGHTS[perspective];

  return Object.freeze(
    [...findings].sort((left, right) => {
      const leftScore =
        SEVERITY_SCORES[left.severity] + weights[left.category];
      const rightScore =
        SEVERITY_SCORES[right.severity] + weights[right.category];

      return (
        rightScore - leftScore ||
        left.title.localeCompare(right.title)
      );
    }),
  );
};

const groupFindings = (
  findings: readonly CritiqueFinding[],
): CritiqueGroups =>
  Object.freeze(
    Object.fromEntries(
      CRITIQUE_CATEGORIES.map((category) => [
        category,
        Object.freeze(
          findings.filter((finding) => finding.category === category),
        ),
      ]),
    ) as Record<CritiqueCategory, readonly CritiqueFinding[]>,
  );

export const runCritique = (
  options: RunCritiqueOptions,
): Readonly<CritiqueReport> => {
  const context = inferCritiqueContext(
    options.document,
    options.selectedElement,
    options.scope,
  );
  const findings = sortFindings(options.perspective, [
    ...runVisualDesignLens(context, options.target),
    ...runInterfaceDesignLens(context, options.target),
    ...runAccessibilityLens(context, options.target),
    ...runMotionQualityLens(context, options.target),
    ...runMotionPerformanceLens(context, options.target),
  ]);

  return Object.freeze({
    context,
    findings,
    groupedFindings: groupFindings(findings),
    perspective: options.perspective,
    scope: options.scope,
  });
};
