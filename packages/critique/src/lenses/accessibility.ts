import type { CritiqueContext, CritiqueFinding } from "../contracts.js";
import type { TargetAnchor } from "@sightglass/core";

export const runAccessibilityLens = (
  context: Readonly<CritiqueContext>,
  target: Readonly<TargetAnchor>,
): readonly CritiqueFinding[] => {
  const findings: CritiqueFinding[] = [];

  if (context.missingDocumentLanguage) {
    findings.push(
      Object.freeze({
        id: "accessibility:document-language",
        category: "accessibility",
        severity: "important",
        target,
        title: "Document language is missing",
        observation: "The page does not declare `lang` on the root document element.",
        impact: "Screen readers and translation tools lose context, which weakens pronunciation and language switching.",
        recommendation: "Set a concrete document language before critique findings are exported or shared.",
        sourceLens: "accessibility",
      }),
    );
  }

  if (!context.hasSectionHeading && context.scope !== "node") {
    findings.push(
      Object.freeze({
        id: "accessibility:user-context",
        category: "user-context",
        severity: "opportunity",
        target,
        title: "The section lacks a local heading or label",
        observation: `This ${context.scopeLabel.toLowerCase()} has actions, but no nearby heading establishes what the group is for.`,
        impact: "Users lose orientation and critique findings are harder to map back to product intent.",
        recommendation: "Add a concise heading or aria-label so the section communicates its purpose before the actions do.",
        sourceLens: "accessibility",
      }),
    );
  }

  return Object.freeze(findings);
};
