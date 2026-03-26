import type { TargetAnchor } from "../types";

export interface SelectionAnchor extends TargetAnchor {
  readonly confidence: number;
  readonly alternates: readonly string[];
}

const HASHED_CLASS_PATTERN =
  /(?:^|[_-])[A-Za-z0-9-]+__[A-Za-z0-9_-]{4,}$|__[A-Za-z0-9_-]{4,}$/;

const escapeCssValue = (value: string): string =>
  value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');

const isHashedClassName = (className: string): boolean =>
  HASHED_CLASS_PATTERN.test(className);

const getStableClasses = (element: Element): string[] =>
  [...element.classList].filter((className) => !isHashedClassName(className));

const getImplicitRole = (element: Element): string | null => {
  const tagName = element.tagName.toLowerCase();

  if (tagName === "button") {
    return "button";
  }

  if (tagName === "a" && element.hasAttribute("href")) {
    return "link";
  }

  if (tagName === "input") {
    const inputType = element.getAttribute("type")?.toLowerCase();
    return inputType === "button" || inputType === "submit" ? "button" : "textbox";
  }

  return null;
};

const getRole = (element: Element): string | null =>
  element.getAttribute("role") ?? getImplicitRole(element);

const getPathSegment = (element: Element): string => {
  const tagName = element.tagName.toLowerCase();
  const siblings = element.parentElement
    ? [...element.parentElement.children].filter(
        (candidate) => candidate.tagName === element.tagName,
      )
    : [];

  if (siblings.length <= 1) {
    return tagName;
  }

  return `${tagName}:nth-of-type(${siblings.indexOf(element) + 1})`;
};

const buildPath = (element: Element): string => {
  const segments: string[] = [];
  let current: Element | null = element;

  while (current && current.tagName.toLowerCase() !== "html") {
    if (current.id) {
      segments.unshift(`${current.tagName.toLowerCase()}#${escapeCssValue(current.id)}`);
      break;
    }

    segments.unshift(getPathSegment(current));
    current = current.parentElement;
  }

  return segments.join(" > ");
};

const getRuntimeId = (element: Element, path: string): string => {
  const preferredId =
    element.getAttribute("data-testid") ??
    element.getAttribute("data-sightglass-id") ??
    element.id;

  if (preferredId) {
    return `${element.tagName.toLowerCase()}:${preferredId}`;
  }

  return `${element.tagName.toLowerCase()}:${path}`;
};

const buildSelectors = (element: Element, path: string): Array<{ selector: string; confidence: number }> => {
  const selectors: Array<{ selector: string; confidence: number }> = [];
  const dataTestId = element.getAttribute("data-testid");
  const dataSightglassId = element.getAttribute("data-sightglass-id");
  const stableClasses = getStableClasses(element);
  const role = getRole(element);
  const tagName = element.tagName.toLowerCase();

  if (dataTestId) {
    selectors.push({
      selector: `[data-testid="${escapeCssValue(dataTestId)}"]`,
      confidence: 0.98,
    });
  }

  if (dataSightglassId) {
    selectors.push({
      selector: `[data-sightglass-id="${escapeCssValue(dataSightglassId)}"]`,
      confidence: 0.97,
    });
  }

  if (element.id) {
    selectors.push({
      selector: `#${escapeCssValue(element.id)}`,
      confidence: 0.99,
    });
  }

  if (stableClasses.length > 0) {
    selectors.push({
      selector: `${tagName}${stableClasses.map((className) => `.${escapeCssValue(className)}`).join("")}`,
      confidence: 0.86,
    });
  }

  if (role) {
    selectors.push({
      selector: `${tagName}[role="${escapeCssValue(role)}"]`,
      confidence: 0.8,
    });
  }

  selectors.push({
    selector: tagName,
    confidence: 0.55,
  });

  selectors.push({
    selector: path,
    confidence: 0.72,
  });

  return selectors.filter(
    (candidate, index, allCandidates) =>
      allCandidates.findIndex((entry) => entry.selector === candidate.selector) === index,
  );
};

export const generateAnchors = (element: Element): readonly SelectionAnchor[] => {
  const path = buildPath(element);
  const runtimeId = getRuntimeId(element, path);
  const role = getRole(element);
  const classes = Object.freeze([...element.classList]);
  const selectors = buildSelectors(element, path);

  return Object.freeze(
    selectors.map((candidate, index) =>
      Object.freeze({
        runtimeId,
        selector: candidate.selector,
        path,
        role,
        classes,
        confidence: candidate.confidence,
        alternates: Object.freeze(
          selectors
            .filter((entry, entryIndex) => entryIndex !== index)
            .map((entry) => entry.selector),
        ),
      }),
    ),
  );
};

export const generateAnchor = (element: Element): SelectionAnchor => generateAnchors(element)[0];

export const selectionInternals = {
  getStableClasses,
  isHashedClassName,
};
