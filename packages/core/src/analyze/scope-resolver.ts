import type { EditScope } from "../types.js";
import {
  detectComponentMatch,
  type ComponentMatch,
} from "./component-detector.js";
import {
  detectTokenCandidates,
  type SemanticTokenCandidate,
} from "./token-detector.js";

export interface ScopeOption {
  readonly scope: EditScope;
  readonly label: string;
  readonly description: string;
  readonly reason: string;
  readonly source: "selection" | "component" | "token";
  readonly targetCount: number;
}

export interface AnalyzeSemanticContextOptions {
  readonly element: Element;
  readonly similarElements?: readonly Element[];
}

export interface SemanticAnalysis {
  readonly component: ComponentMatch | null;
  readonly scopes: readonly ScopeOption[];
  readonly tokens: readonly SemanticTokenCandidate[];
}

const createScopeOption = (option: ScopeOption): ScopeOption => Object.freeze(option);

const resolveSiblingCount = (element: Element): number => {
  if (!element.parentElement) {
    return 1;
  }

  return Array.from(element.parentElement.children).filter(
    (candidate) => candidate.tagName === element.tagName,
  ).length;
};

export const resolveScopeOptions = (
  element: Element,
  tokens: readonly SemanticTokenCandidate[],
  component: ComponentMatch | null,
  similarElements: readonly Element[],
): readonly ScopeOption[] => {
  const options: ScopeOption[] = [
    createScopeOption({
      scope: "single",
      label: "Only update this instance",
      description: "Keep the edit scoped to the selected element.",
      reason: "Safe default for one-off refinements.",
      source: "selection",
      targetCount: 1,
    }),
  ];
  const siblingCount = resolveSiblingCount(element);

  if (siblingCount > 1) {
    options.push(
      createScopeOption({
        scope: "siblings",
        label: "Update sibling elements",
        description: "Apply the change to matching siblings in the same parent group.",
        reason: `${siblingCount} sibling elements share the same tag.`,
        source: "selection",
        targetCount: siblingCount,
      }),
    );
  }

  if (similarElements.length > 0) {
    options.push(
      createScopeOption({
        scope: "similar",
        label: "Update all similar matches",
        description: "Use the existing selection heuristics to widen the change safely.",
        reason: `${similarElements.length + 1} similar elements were detected.`,
        source: "selection",
        targetCount: similarElements.length + 1,
      }),
    );
  }

  if (component) {
    options.push(
      createScopeOption({
        scope: "component",
        label: component.label,
        description: "Apply the edit to repeated components with the same signature.",
        reason: component.reason,
        source: "component",
        targetCount: component.matchCount,
      }),
    );
  }

  const tokenCandidate = tokens[0] ?? null;
  if (tokenCandidate) {
    options.push(
      createScopeOption({
        scope: "token",
        label: tokenCandidate.label,
        description: "Promote the edit through the detected token or shared style.",
        reason: `Detected via ${tokenCandidate.source}.`,
        source: "token",
        targetCount: tokenCandidate.targetCount,
      }),
    );
  }

  return Object.freeze(options);
};

export const analyzeSemanticContext = (
  options: AnalyzeSemanticContextOptions,
): Readonly<SemanticAnalysis> => {
  const similarElements = options.similarElements ?? [];
  const tokens = detectTokenCandidates(options.element, { similarElements });
  const component = detectComponentMatch(options.element, { similarElements });
  const scopes = resolveScopeOptions(
    options.element,
    tokens,
    component,
    similarElements,
  );

  return Object.freeze({
    component,
    scopes,
    tokens,
  });
};
