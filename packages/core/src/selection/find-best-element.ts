import { generateAnchors, type SelectionAnchor } from "./generate-anchor.js";

export interface SelectionPoint {
  readonly x: number;
  readonly y: number;
}

export interface SelectionMatch {
  readonly confidence: number;
  readonly anchors: readonly SelectionAnchor[];
}

export const INTERACTIVE_SELECTOR = [
  "button",
  "a[href]",
  "input",
  "select",
  "textarea",
  "[role='button']",
  "[role='link']",
].join(",");

const resolveInteractiveAncestor = (element: Element): Element =>
  element.closest(INTERACTIVE_SELECTOR) ?? element;

export const resolveBestElement = (
  document: Document,
  point: SelectionPoint
): Element | null => {
  const hit = document.elementFromPoint(point.x, point.y);

  if (!hit) {
    return null;
  }

  return resolveInteractiveAncestor(hit);
};

export const createSelectionMatch = (
  element: Element,
  confidence: number
): SelectionMatch =>
  Object.freeze({
    confidence,
    anchors: generateAnchors(element),
  });
