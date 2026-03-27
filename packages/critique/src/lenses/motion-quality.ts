import type { CritiqueContext, CritiqueFinding } from "../contracts.js";
import type { TargetAnchor } from "@sightglass/core";

export const runMotionQualityLens = (
  context: Readonly<CritiqueContext>,
  target: Readonly<TargetAnchor>,
): readonly CritiqueFinding[] => {
  const findings: CritiqueFinding[] = [];

  if (context.motionSignals.durationMs > 300) {
    findings.push(
      Object.freeze({
        id: "motion-quality:duration",
        category: "motion-quality",
        severity: "opportunity",
        target,
        title: "The motion timing is heavier than the interaction needs",
        observation: `The selected interaction runs at roughly ${Math.round(context.motionSignals.durationMs)}ms.`,
        impact: "Longer durations make common UI actions feel sluggish instead of deliberate.",
        recommendation: "Tighten the duration and reserve slower motion for scene changes or rich reveals.",
        sourceLens: "motion-quality",
      }),
    );
  }

  if (!context.motionSignals.hasReducedMotionGuard) {
    findings.push(
      Object.freeze({
        id: "motion-quality:reduced-motion",
        category: "motion-quality",
        severity: "opportunity",
        target,
        title: "No reduced-motion escape hatch is visible",
        observation: "The current review scope shows motion styling without a reduced-motion override marker.",
        impact: "Users who prefer reduced motion may still get non-essential movement.",
        recommendation: "Define a reduced-motion variant before expanding motion polish or tuning springs.",
        sourceLens: "motion-quality",
      }),
    );
  }

  return Object.freeze(findings);
};
