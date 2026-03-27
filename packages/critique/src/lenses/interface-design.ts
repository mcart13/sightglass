import type { CritiqueContext, CritiqueFinding } from "../contracts.js";
import type { TargetAnchor } from "@sightglass/core";

export const runInterfaceDesignLens = (
  context: Readonly<CritiqueContext>,
  target: Readonly<TargetAnchor>,
): readonly CritiqueFinding[] => {
  const findings: CritiqueFinding[] = [];

  if (context.interactiveCount >= 3) {
    findings.push(
      Object.freeze({
        id: "interface-design:competing-actions",
        category: "interface-design",
        severity: "important",
        target,
        title: "Too many peer actions share the same emphasis",
        observation: `${context.interactiveCount} interactive controls sit in the same review scope without a stronger primary path.`,
        impact: "Users have to re-evaluate which action matters most instead of following one obvious next step.",
        recommendation: "Reduce visual parity across peer actions and reserve the strongest treatment for a single primary action.",
        sourceLens: "interface-design",
      }),
    );
  }

  if (context.matchingActionCount >= 3) {
    findings.push(
      Object.freeze({
        id: "interface-design:consistency",
        category: "consistency",
        severity: "opportunity",
        target,
        title: "Repeated action styling needs clearer semantic tiers",
        observation: `${context.matchingActionCount} matching action treatments repeat across the page.`,
        impact: "When every CTA looks equivalent, broad-scope edits become harder to reason about and the UI feels less intentional.",
        recommendation: "Define a clearer primary/secondary action ladder before expanding component-level edits.",
        sourceLens: "interface-design",
      }),
    );
  }

  return Object.freeze(findings);
};
