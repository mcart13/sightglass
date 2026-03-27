import type { CritiqueContext, CritiqueFinding } from "../contracts.js";
import type { TargetAnchor } from "@sightglass/core";

export const runVisualDesignLens = (
  context: Readonly<CritiqueContext>,
  target: Readonly<TargetAnchor>,
): readonly CritiqueFinding[] => {
  if (context.cardCount < 3) {
    return Object.freeze([]);
  }

  return Object.freeze([
    Object.freeze({
      id: "visual-design:card-overuse",
      category: "visual-design",
      severity: "important",
      target,
      title: "Card rhythm is carrying too much of the page",
      observation: `${context.cardCount} card-like containers compete for the same visual weight in this ${context.scopeLabel.toLowerCase()}.`,
      impact: "The page loses a clear visual anchor and the eye has to parse too many equivalent blocks.",
      recommendation: "Promote one dominant action area and reduce repeated card chrome around secondary actions.",
      sourceLens: "visual-design",
    }),
  ]);
};
