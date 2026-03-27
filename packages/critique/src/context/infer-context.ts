import type { CritiqueContext, CritiqueScope, MotionSignals } from "../contracts.js";

const SECTION_SELECTOR = [
  "section",
  "article",
  "aside",
  "form",
  "main",
  "header",
  "footer",
  "nav",
].join(",");

const INTERACTIVE_SELECTOR = [
  "button",
  "a[href]",
  "input",
  "select",
  "textarea",
  "[role='button']",
  "[role='link']",
].join(",");

const LAYOUT_AFFECTING_PROPERTIES = new Set([
  "all",
  "width",
  "height",
  "top",
  "left",
  "right",
  "bottom",
]);

const resolveScopeElement = (
  document: Document,
  selectedElement: Element,
  scope: CritiqueScope,
): Element => {
  if (scope === "page") {
    return document.body;
  }

  if (scope === "section") {
    return selectedElement.closest(SECTION_SELECTOR) ?? document.body;
  }

  return selectedElement;
};

const resolveScopeLabel = (scope: CritiqueScope): string => {
  if (scope === "page") {
    return "Entire page";
  }

  if (scope === "section") {
    return "Containing section";
  }

  return "Selected element";
};

const parseDurationToken = (value: string): number => {
  const match = value.trim().match(/^(\d+(?:\.\d+)?)(ms|s)$/);

  if (!match) {
    return 0;
  }

  const duration = Number.parseFloat(match[1]);

  return match[2] === "ms" ? duration : duration * 1000;
};

const resolveStyles = (element: Element): CSSStyleDeclaration => {
  const view = element.ownerDocument.defaultView;

  if (view) {
    return view.getComputedStyle(element);
  }

  return (element as HTMLElement).style;
};

const readDurationList = (value: string): number =>
  value
    .split(",")
    .map((token) => parseDurationToken(token))
    .reduce((maxDuration, duration) => Math.max(maxDuration, duration), 0);

const readTransitionDuration = (element: Element): number => {
  const styles = resolveStyles(element);
  const duration = readDurationList(styles.transitionDuration);

  if (duration > 0) {
    return duration;
  }

  const inlineTransition = (element as HTMLElement).style.transition;
  const durationTokens = inlineTransition.match(/\d+(?:\.\d+)?(?:ms|s)/g) ?? [];

  return durationTokens.reduce(
    (maxDuration, token) => Math.max(maxDuration, parseDurationToken(token)),
    0,
  );
};

const readTransitionProperties = (element: Element): readonly string[] => {
  const computedProperties = resolveStyles(element).transitionProperty
    .split(",")
    .map((property) => property.trim())
    .filter((property) => property.length > 0 && property !== "none");

  if (computedProperties.length > 0) {
    return computedProperties;
  }

  return (element as HTMLElement).style.transition
    .split(",")
    .map((chunk) => chunk.trim().split(/\s+/)[0] ?? "")
    .filter((property) => property.length > 0 && property !== "none");
};

const readMotionSignals = (
  document: Document,
  selectedElement: Element,
): MotionSignals => {
  const properties = readTransitionProperties(selectedElement);
  const layoutAffectingProperties = properties.filter((property) =>
    LAYOUT_AFFECTING_PROPERTIES.has(property),
  );

  return Object.freeze({
    durationMs: readTransitionDuration(selectedElement),
    hasReducedMotionGuard:
      document.documentElement.hasAttribute("data-reduced-motion") ||
      Boolean(document.querySelector("[data-reduced-motion='true']")),
    hasTransitionAll: properties.includes("all"),
    layoutAffectingProperties: Object.freeze(layoutAffectingProperties),
  });
};

const resolveMatchingActionCount = (
  document: Document,
  selectedElement: Element,
): number => {
  const escapeClassName =
    document.defaultView?.CSS?.escape ??
    ((className: string) => className.replace(/[^a-zA-Z0-9_-]/g, "\\$&"));
  const selector = Array.from(selectedElement.classList)
    .map((className) => `.${escapeClassName(className)}`)
    .join("");

  if (!selector) {
    return 0;
  }

  try {
    return document.querySelectorAll(selector).length;
  } catch {
    return 0;
  }
};

export const inferCritiqueContext = (
  document: Document,
  selectedElement: Element,
  scope: CritiqueScope,
): Readonly<CritiqueContext> => {
  const scopeElement = resolveScopeElement(document, selectedElement, scope);
  const route =
    scopeElement.closest("[data-route]")?.getAttribute("data-route") ??
    document.body.getAttribute("data-route") ??
    document.location.pathname;
  const selectedClasses = Object.freeze(Array.from(selectedElement.classList));
  const matchingActionCount = resolveMatchingActionCount(
    document,
    selectedElement,
  );

  return Object.freeze({
    route,
    scope,
    scopeLabel: resolveScopeLabel(scope),
    pageTitle: document.title || null,
    sectionLabel: scopeElement.getAttribute("aria-label"),
    selectedClasses,
    cardCount: scopeElement.querySelectorAll(".card, [class*='card-']").length,
    interactiveCount: scopeElement.querySelectorAll(INTERACTIVE_SELECTOR).length,
    matchingActionCount,
    missingDocumentLanguage: !document.documentElement.hasAttribute("lang"),
    hasSectionHeading: Boolean(scopeElement.querySelector("h1, h2, h3")),
    motionSignals: readMotionSignals(document, selectedElement),
  });
};
