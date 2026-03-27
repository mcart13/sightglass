import { useMemo } from "react";
import {
  analyzeSemanticContext,
  type ScopeOption,
  type SelectionMatch,
  type SightglassSessionSnapshot,
} from "@sightglass/core";
import type { OverlayState, SightglassCommands } from "../provider";
import {
  panelButtonActiveStyle,
  panelButtonStyle,
  panelCardStyle,
  panelMutedStyle,
  panelRowLabelStyle,
  panelRowStyle,
  panelRowValueStyle,
  panelSectionLabelStyle,
  panelSectionStyle,
} from "./panel-styles";

interface SemanticInspectorProps {
  readonly commands: Pick<SightglassCommands, "setHoveredScope">;
  readonly overlay: OverlayState;
  readonly session: Readonly<SightglassSessionSnapshot>;
}

const scoreResolvedCandidate = (
  candidate: Element,
  anchor: SelectionMatch["anchors"][number]
): number => {
  const classScore = anchor.classes.reduce(
    (score, className) =>
      score + (candidate.classList.contains(className) ? 1 : 0),
    0
  );
  const roleScore =
    anchor.role && candidate.getAttribute("role") === anchor.role ? 2 : 0;

  return classScore + roleScore;
};

const resolveAnchorElement = (
  selectedElement: Element,
  anchor: SelectionMatch["anchors"][number]
): Element | null => {
  const document = selectedElement.ownerDocument;
  const selectors = Array.from(
    new Set(
      [anchor.selector, ...anchor.alternates, anchor.path].filter(Boolean)
    )
  );
  let bestCandidate: Element | null = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const selector of selectors) {
    try {
      const matches = Array.from(document.querySelectorAll(selector)).filter(
        (candidate) => candidate !== selectedElement
      );

      if (matches.length === 1) {
        return matches[0];
      }

      for (const candidate of matches) {
        const score = scoreResolvedCandidate(candidate, anchor);

        if (score > bestScore) {
          bestScore = score;
          bestCandidate = candidate;
        }
      }
    } catch {
      continue;
    }
  }

  return bestCandidate;
};

const resolveSimilarElements = (
  selectedElement: Element | null,
  matches: readonly SelectionMatch[]
): readonly Element[] => {
  if (!selectedElement) {
    return Object.freeze([]);
  }

  const resolved = new Set<Element>();

  for (const match of matches) {
    for (const anchor of match.anchors) {
      const candidate = resolveAnchorElement(selectedElement, anchor);

      if (candidate) {
        resolved.add(candidate);
        break;
      }
    }
  }

  return Object.freeze([...resolved]);
};

const renderScopeOption = (
  option: ScopeOption,
  hoveredScope: string | null,
  commands: Pick<SightglassCommands, "setHoveredScope">
) => {
  const active = hoveredScope === option.scope;

  return (
    <button
      key={option.scope}
      type="button"
      data-scope-option={option.scope}
      style={active ? panelButtonActiveStyle : panelButtonStyle}
      onFocus={() => commands.setHoveredScope(option.scope)}
      onBlur={() => commands.setHoveredScope(null)}
      onMouseEnter={() => commands.setHoveredScope(option.scope)}
      onMouseLeave={() => commands.setHoveredScope(null)}
    >
      {option.label} · {option.targetCount}
    </button>
  );
};

export const SemanticInspector = ({
  commands,
  overlay,
  session,
}: SemanticInspectorProps) => {
  const similarElements = useMemo(
    () =>
      resolveSimilarElements(
        session.selectedElement,
        session.selection.similar
      ),
    [session.selectedElement, session.selection.similar]
  );
  const analysis = useMemo(
    () =>
      session.selectedElement
        ? analyzeSemanticContext({
            element: session.selectedElement,
            similarElements,
          })
        : null,
    [session.selectedElement, similarElements]
  );

  if (!session.selectedElement || !analysis) {
    return (
      <div style={panelSectionStyle}>
        <span style={panelSectionLabelStyle}>Tokens & Scope</span>
        <span style={panelMutedStyle}>Select an element to inspect.</span>
      </div>
    );
  }

  return (
    <>
      {/* Tokens */}
      <div style={panelSectionStyle}>
        <span style={panelSectionLabelStyle}>Tokens</span>
        {analysis.tokens.length === 0 ? (
          <span style={panelMutedStyle}>No tokens detected.</span>
        ) : (
          analysis.tokens.map((token) => (
            <div
              key={token.id}
              style={panelCardStyle}
              data-token-candidate={token.id}
            >
              <div style={panelRowStyle}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>
                  {token.label}
                </span>
                <span style={panelRowValueStyle}>{token.value}</span>
              </div>
              <span style={panelMutedStyle}>{token.source}</span>
            </div>
          ))
        )}
      </div>

      {/* Component */}
      <div style={panelSectionStyle}>
        <span style={panelSectionLabelStyle}>Component</span>
        {analysis.component ? (
          <div style={panelCardStyle}>
            <div style={panelRowStyle}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>
                {analysis.component.label}
              </span>
              <span style={panelRowValueStyle}>
                {analysis.component.matchCount} matches
              </span>
            </div>
          </div>
        ) : (
          <span style={panelMutedStyle}>No component match.</span>
        )}
      </div>

      {/* Scope */}
      <div style={panelSectionStyle}>
        <span style={panelSectionLabelStyle}>Scope</span>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {analysis.scopes.map((option) =>
            renderScopeOption(option, overlay.hoveredScope, commands)
          )}
        </div>
      </div>
    </>
  );
};
