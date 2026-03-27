import type { CritiqueContext, CritiqueFinding } from "../contracts.js";
import type { TargetAnchor } from "@sightglass/core";

export const runMotionPerformanceLens = (
  context: Readonly<CritiqueContext>,
  target: Readonly<TargetAnchor>,
): readonly CritiqueFinding[] => {
  if (
    !context.motionSignals.hasTransitionAll &&
    context.motionSignals.layoutAffectingProperties.length === 0
  ) {
    return Object.freeze([]);
  }

  return Object.freeze([
    Object.freeze({
      id: "motion-performance:layout-properties",
      category: "motion-performance",
      severity: "important",
      target,
      title: "The interaction animates broad or layout-affecting properties",
      observation: `The transition includes ${context.motionSignals.layoutAffectingProperties.join(", ") || "all"}.`,
      impact: "That expands work beyond compositor-friendly transforms and raises the risk of jank.",
      recommendation: "Prefer transform and opacity, and narrow the transition list before tuning feel.",
      sourceLens: "motion-performance",
    }),
  ]);
};
