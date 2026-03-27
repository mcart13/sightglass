import { selectionInternals } from "../selection/generate-anchor.js";

export interface ComponentSignature {
  readonly key: string;
  readonly tagName: string;
  readonly role: string | null;
  readonly stableClasses: readonly string[];
  readonly childCount: number;
  readonly childTags: readonly string[];
  readonly textSlotCount: number;
}

export interface ComponentMatch {
  readonly label: string;
  readonly matchCount: number;
  readonly reason: string;
  readonly signature: Readonly<ComponentSignature>;
}

export interface DetectComponentMatchOptions {
  readonly similarElements?: readonly Element[];
}

const UTILITY_CLASS_PATTERN =
  /^(rounded|bg|text|shadow|border|px|py|pt|pr|pb|pl|gap|flex|grid|items-|justify-|space-|w-|h-|min-|max-)/;

const GENERIC_COMPONENT_CLASS_PATTERN =
  /^(cta|btn|button|primary|secondary|tertiary)$/;

const { getRole } = selectionInternals;

const countTextSlots = (element: Element): number => {
  let count = 0;

  for (const node of element.childNodes) {
    if (node.nodeType === node.TEXT_NODE && node.textContent?.trim()) {
      count += 1;
    }

    if (
      node.nodeType === node.ELEMENT_NODE &&
      (node as Element).children.length === 0 &&
      node.textContent?.trim()
    ) {
      count += 1;
    }
  }

  return count;
};

export const describeComponentSignature = (
  element: Element
): Readonly<ComponentSignature> => {
  const tagName = element.tagName.toLowerCase();
  const stableClasses = selectionInternals.getStableClasses(element);
  const childTags = Array.from(element.children).map((child) =>
    child.tagName.toLowerCase()
  );
  const role = getRole(element);
  const childCount = element.children.length;
  const textSlotCount = countTextSlots(element);
  const signature: ComponentSignature = {
    key: JSON.stringify([
      tagName,
      role,
      stableClasses,
      childTags,
      childCount,
      textSlotCount,
    ]),
    tagName,
    role,
    stableClasses: Object.freeze(stableClasses),
    childCount,
    childTags: Object.freeze(childTags),
    textSlotCount,
  };

  return Object.freeze(signature);
};

const getDescriptor = (signature: Readonly<ComponentSignature>): string => {
  const semanticClasses = signature.stableClasses.filter(
    (className) => !UTILITY_CLASS_PATTERN.test(className)
  );

  if (semanticClasses.length === 0) {
    return signature.tagName;
  }

  const preferredClass =
    semanticClasses.find(
      (className) =>
        className.includes("-") &&
        !GENERIC_COMPONENT_CLASS_PATTERN.test(className)
    ) ??
    semanticClasses.find(
      (className) => !GENERIC_COMPONENT_CLASS_PATTERN.test(className)
    ) ??
    semanticClasses[0];

  return preferredClass;
};

export const detectComponentMatch = (
  element: Element,
  options: DetectComponentMatchOptions = {}
): ComponentMatch | null => {
  const selectedSignature = describeComponentSignature(element);
  const similarElements = options.similarElements ?? [];
  const uniqueCandidates = [element, ...similarElements].filter(
    (candidate, index, allCandidates) =>
      allCandidates.indexOf(candidate) === index
  );
  const matches = uniqueCandidates.filter(
    (candidate) =>
      describeComponentSignature(candidate).key === selectedSignature.key
  );

  if (matches.length <= 1) {
    return null;
  }

  const descriptor = getDescriptor(selectedSignature);

  return Object.freeze({
    label: `Update all ${descriptor} components`,
    matchCount: matches.length,
    reason: `${matches.length} elements share the same tag tree, role, and slot structure.`,
    signature: selectedSignature,
  });
};
