import type { EditScope, EditSemanticKind } from "@sightglass/core";
import type {
  CritiqueReport,
  DesignDirection,
  ExploreEditOperation,
  ExploreEditPlan,
} from "../contracts.js";

const CATEGORY_TO_OPERATION: Record<
  string,
  {
    property: string;
    semanticKind: EditSemanticKind;
    scope: EditScope;
    value: string;
  }
> = Object.freeze({
  "visual-design": {
    property: "surface-emphasis",
    semanticKind: "component",
    scope: "component",
    value: "reduce-secondary-card-chrome",
  },
  "interface-design": {
    property: "action-hierarchy",
    semanticKind: "component",
    scope: "component",
    value: "promote-single-primary-action",
  },
  consistency: {
    property: "action-tier",
    semanticKind: "component",
    scope: "similar",
    value: "standardize-primary-secondary-ladder",
  },
  "user-context": {
    property: "section-label",
    semanticKind: "text",
    scope: "single",
    value: "add-heading-or-aria-label",
  },
  accessibility: {
    property: "document-language",
    semanticKind: "text",
    scope: "single",
    value: "set-root-lang",
  },
  "motion-quality": {
    property: "transition-duration",
    semanticKind: "layout",
    scope: "component",
    value: "tighten-motion-timing",
  },
  "motion-performance": {
    property: "transition-property",
    semanticKind: "layout",
    scope: "component",
    value: "limit-to-transform-opacity",
  },
});

const createOperation = (
  options: Omit<ExploreEditOperation, never>
): ExploreEditOperation => Object.freeze(options);

export const buildExploreEditPlan = (
  direction: Readonly<DesignDirection>,
  report: Readonly<CritiqueReport>
): Readonly<ExploreEditPlan> => {
  const operations = report.findings
    .filter((finding) => direction.findingIds.includes(finding.id))
    .map((finding) => {
      const template = CATEGORY_TO_OPERATION[finding.category];

      return createOperation({
        id: `plan:${direction.id}:${finding.id}`,
        title: finding.title,
        rationale: `${direction.title} addresses ${
          finding.category
        } by ${finding.recommendation.toLowerCase()}`,
        property: template.property,
        semanticKind: template.semanticKind,
        scope: template.scope,
        value: template.value,
      });
    });

  return Object.freeze({
    directionId: direction.id,
    title: `${direction.title} edit plan`,
    summary: `${direction.visualThesis} ${direction.interactionThesis}`,
    proposedOperations: Object.freeze(operations),
  });
};
