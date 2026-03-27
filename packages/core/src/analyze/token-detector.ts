import { selectionInternals } from "../selection/generate-anchor.js";

export type SemanticTokenKind =
  | "css-variable"
  | "utility-group"
  | "repeated-value";

export interface SemanticTokenCandidate {
  readonly id: string;
  readonly kind: SemanticTokenKind;
  readonly label: string;
  readonly property: string;
  readonly source: string;
  readonly tokenName: string | null;
  readonly targetCount: number;
  readonly value: string;
}

export interface DetectTokenCandidatesOptions {
  readonly similarElements?: readonly Element[];
}

const TOKEN_REFERENCE_PATTERN = /var\(\s*(--[A-Za-z0-9-_]+)\s*(?:,[^)]+)?\)/g;

const UTILITY_GROUPS = [
  {
    property: "border-radius",
    label: "radius",
    test: (className: string) => /^rounded(?:-|$)/.test(className),
  },
  {
    property: "background-color",
    label: "background",
    test: (className: string) => /^bg-/.test(className),
  },
  {
    property: "color",
    label: "text",
    test: (className: string) => /^text-/.test(className),
  },
  {
    property: "box-shadow",
    label: "shadow",
    test: (className: string) => /^shadow(?:-|$)/.test(className),
  },
  {
    property: "padding-inline",
    label: "horizontal spacing",
    test: (className: string) => /^px-/.test(className),
  },
  {
    property: "padding-block",
    label: "vertical spacing",
    test: (className: string) => /^py-/.test(className),
  },
  {
    property: "gap",
    label: "gap",
    test: (className: string) => /^gap-/.test(className),
  },
  {
    property: "border",
    label: "border",
    test: (className: string) => /^border(?:-|$)/.test(className),
  },
] as const;

const SHARED_STYLE_PROPERTIES = [
  "border-radius",
  "background-color",
  "color",
  "font-size",
  "font-weight",
  "gap",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
] as const;

const normalizeValue = (value: string): string => value.trim().replace(/\s+/g, " ");

const toCandidateId = (
  kind: SemanticTokenKind,
  property: string,
  descriptor: string,
): string => `${kind}:${property}:${descriptor}`;

const createCandidate = (
  candidate: SemanticTokenCandidate,
): SemanticTokenCandidate => Object.freeze(candidate);

const collectCssVariableCandidates = (
  element: Element,
): readonly SemanticTokenCandidate[] => {
  const candidates = new Map<string, SemanticTokenCandidate>();

  for (let current: Element | null = element; current; current = current.parentElement) {
    if (!(current instanceof current.ownerDocument.defaultView!.HTMLElement)) {
      continue;
    }

    const style = current.style;

    for (let index = 0; index < style.length; index += 1) {
      const property = style.item(index);
      const value = normalizeValue(style.getPropertyValue(property));

      if (!value) {
        continue;
      }

      for (const match of value.matchAll(TOKEN_REFERENCE_PATTERN)) {
        const tokenName = match[1];
        const id = toCandidateId("css-variable", property, tokenName);

        if (!candidates.has(id)) {
          candidates.set(
            id,
            createCandidate({
              id,
              kind: "css-variable",
              label: `Update token ${tokenName}`,
              property,
              source: current === element ? "inline-style" : "ancestor-style",
              tokenName,
              targetCount: 1,
              value,
            }),
          );
        }
      }
    }
  }

  return Object.freeze([...candidates.values()]);
};

const collectUtilityGroupCandidates = (
  element: Element,
): readonly SemanticTokenCandidate[] => {
  const stableClasses = selectionInternals.getStableClasses(element);

  return Object.freeze(
    UTILITY_GROUPS.flatMap((group) => {
      const matches = stableClasses.filter(group.test);

      if (matches.length === 0) {
        return [];
      }

      return [
        createCandidate({
          id: toCandidateId("utility-group", group.property, matches.join(",")),
          kind: "utility-group",
          label: `Update ${group.label} utilities`,
          property: group.property,
          source: "utility-group",
          tokenName: null,
          targetCount: 1,
          value: matches.join(" "),
        }),
      ];
    }),
  );
};

const collectRepeatedValueCandidates = (
  element: Element,
  similarElements: readonly Element[],
): readonly SemanticTokenCandidate[] => {
  const window = element.ownerDocument.defaultView;

  if (!window || similarElements.length === 0) {
    return Object.freeze([]);
  }

  const selectedStyle = window.getComputedStyle(element);
  const candidates = new Map<string, SemanticTokenCandidate>();

  for (const property of SHARED_STYLE_PROPERTIES) {
    const selectedValue = normalizeValue(selectedStyle.getPropertyValue(property));

    if (!selectedValue) {
      continue;
    }

    const sharedMatches = similarElements.filter((candidate) => {
      const candidateValue = normalizeValue(
        window.getComputedStyle(candidate).getPropertyValue(property),
      );

      return candidateValue === selectedValue;
    });

    if (sharedMatches.length === 0) {
      continue;
    }

    const id = toCandidateId("repeated-value", property, selectedValue);
    candidates.set(
      id,
      createCandidate({
        id,
        kind: "repeated-value",
        label: `Update shared ${property}`,
        property,
        source: "repeated-computed-value",
        tokenName: null,
        targetCount: sharedMatches.length + 1,
        value: selectedValue,
      }),
    );
  }

  return Object.freeze([...candidates.values()]);
};

export const detectTokenCandidates = (
  element: Element,
  options: DetectTokenCandidatesOptions = {},
): readonly SemanticTokenCandidate[] => {
  const similarElements = options.similarElements ?? [];
  const cssVariableCandidates = collectCssVariableCandidates(element);
  const utilityCandidates = collectUtilityGroupCandidates(element);
  const claimedProperties = new Set<string>(
    [...cssVariableCandidates, ...utilityCandidates].map((candidate) => candidate.property),
  );
  const repeatedValueCandidates = collectRepeatedValueCandidates(
    element,
    similarElements,
  ).filter((candidate) => {
    if (candidate.value.includes("var(")) {
      return false;
    }

    if (candidate.property.startsWith("padding-")) {
      return !claimedProperties.has("padding-inline") && !claimedProperties.has("padding-block");
    }

    return !claimedProperties.has(candidate.property);
  });

  return Object.freeze([
    ...cssVariableCandidates,
    ...utilityCandidates,
    ...repeatedValueCandidates,
  ]);
};
