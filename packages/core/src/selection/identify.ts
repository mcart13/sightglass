import {
  createSelectionMatch,
  resolveBestElement,
  type SelectionMatch,
  type SelectionPoint,
} from "./find-best-element.js";
import { findSimilarElements } from "./find-similar-elements.js";

export interface SelectionResult {
  readonly best: SelectionMatch | null;
  readonly similar: readonly SelectionMatch[];
}

export const identifySelection = (
  document: Document,
  point: SelectionPoint,
  preResolved?: Element | null
): SelectionResult => {
  const bestElement =
    preResolved !== undefined
      ? preResolved
      : resolveBestElement(document, point);

  if (!bestElement) {
    return Object.freeze({
      best: null,
      similar: Object.freeze([]),
    });
  }

  return Object.freeze({
    best: createSelectionMatch(bestElement, 0.92),
    similar: findSimilarElements(document, bestElement),
  });
};
