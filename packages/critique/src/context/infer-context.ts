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

const readTransitionDuration = (element: Element): number => {
  const style = (element as HTMLElement).style;
  const duration = style.transitionDuration || "";

  if (duration.endsWith("ms")) {
    return Number.parseFloat(duration);
  }

  if (duration.endsWith("s")) {
    return Number.parseFloat(duration) * 1000;
  }

  const transition = style.transition || "";
  const match = transition.match(/(\d+(?:\.\d+)?)m?s/);

  if (!match) {
    return 0;
  }

  return transition.includes("ms")
    ? Number.parseFloat(match[1])
    : Number.parseFloat(match[1]) * 1000;
};

const readMotionSignals = (
  document: Document,
  selectedElement: Element,
): MotionSignals => {
  const transition = (selectedElement as HTMLElement).style.transition || "";
  const properties = transition
    .split(",")
    .flatMap((chunk) => chunk.split(/\s+/))
    .filter(Boolean);
  const layoutAffectingProperties = properties.filter((property) =>
    ["all", "width", "height", "top", "left", "right", "bottom"].includes(property),
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
  const matchingActionCount = document.querySelectorAll(
    Array.from(selectedElement.classList)
      .map((className) => `.${className}`)
      .join(""),
  ).length;

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
