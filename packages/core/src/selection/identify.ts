import {
  findBestElement,
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
): SelectionResult => {
  const bestElement = resolveBestElement(document, point);

  if (!bestElement) {
    return Object.freeze({
      best: null,
      similar: Object.freeze([]),
    });
  }

  return Object.freeze({
    best: findBestElement(document, point),
    similar: findSimilarElements(document, bestElement),
  });
};
