import {
  createSelectionMatch,
  type SelectionMatch,
} from "./find-best-element.js";
import { selectionInternals } from "./generate-anchor.js";

const computeOverlapScore = (
  baseClasses: readonly string[],
  candidateClasses: readonly string[],
): number => {
  if (baseClasses.length === 0 || candidateClasses.length === 0) {
    return 0;
  }

  const baseSet = new Set(baseClasses);
  const candidateSet = new Set(candidateClasses);
  let shared = 0;

  for (const className of baseSet) {
    if (candidateSet.has(className)) {
      shared += 1;
    }
  }

  return shared / new Set([...baseSet, ...candidateSet]).size;
};

export const findSimilarElements = (
  document: Document,
  selectedElement: Element,
): readonly SelectionMatch[] => {
  const tagName = selectedElement.tagName.toLowerCase();
  const selectedStableClasses = selectionInternals.getStableClasses(selectedElement);
  const selectedRole = selectedElement.getAttribute("role");
  const candidates = [...document.querySelectorAll(tagName)];

  return Object.freeze(
    candidates
      .filter((candidate) => candidate !== selectedElement)
      .filter(
        (candidate) =>
          !candidate.contains(selectedElement) && !selectedElement.contains(candidate),
      )
      .map((candidate) => {
        const overlap = computeOverlapScore(
          selectedStableClasses,
          selectionInternals.getStableClasses(candidate),
        );
        const roleBoost =
          selectedRole && candidate.getAttribute("role") === selectedRole ? 0.1 : 0;
        const confidence = Math.min(1, 0.4 + overlap * 0.5 + roleBoost);

        return { candidate, confidence };
      })
      .filter((entry) => entry.confidence >= 0.5)
      .sort((left, right) => right.confidence - left.confidence)
      .map((entry) => createSelectionMatch(entry.candidate, entry.confidence)),
  );
};
