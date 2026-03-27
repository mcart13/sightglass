import { useMemo, type CSSProperties } from "react";
import {
  analyzeSemanticContext,
  type ScopeOption,
  type SelectionMatch,
  type SightglassSessionSnapshot,
} from "@sightglass/core";
import type { OverlayState, SightglassCommands } from "../provider";

interface SemanticInspectorProps {
  readonly commands: Pick<SightglassCommands, "setHoveredScope">;
  readonly overlay: OverlayState;
  readonly session: Readonly<SightglassSessionSnapshot>;
}

const sectionStyle: CSSProperties = {
  display: "grid",
  gap: 10,
  padding: 14,
  borderRadius: 18,
  background: "rgba(255, 255, 255, 0.78)",
  border: "1px solid rgba(148, 163, 184, 0.18)",
};

const sectionLabelStyle: CSSProperties = {
  fontSize: 12,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#64748b",
};

const mutedTextStyle: CSSProperties = {
  margin: 0,
  color: "#475569",
  lineHeight: 1.5,
};

const scopeButtonStyle = (
  active: boolean,
): CSSProperties => ({
  display: "grid",
  gap: 4,
  width: "100%",
  padding: "12px 14px",
  borderRadius: 16,
  border: active
    ? "1px solid rgba(14, 116, 144, 0.5)"
    : "1px solid rgba(148, 163, 184, 0.22)",
  background: active ? "rgba(224, 242, 254, 0.72)" : "rgba(255, 255, 255, 0.92)",
  textAlign: "left",
  cursor: "pointer",
});

const resolveSimilarElements = (
  selectedElement: Element | null,
  matches: readonly SelectionMatch[],
): readonly Element[] => {
  if (!selectedElement) {
    return Object.freeze([]);
  }

  const document = selectedElement.ownerDocument;
  const resolved = new Set<Element>();

  for (const match of matches) {
    for (const anchor of match.anchors) {
      try {
        const candidate = document.querySelector(anchor.selector);

        if (candidate && candidate !== selectedElement) {
          resolved.add(candidate);
          break;
        }
      } catch {
        continue;
      }
    }
  }

  return Object.freeze([...resolved]);
};

const renderScopeOption = (
  option: ScopeOption,
  hoveredScope: string | null,
  commands: Pick<SightglassCommands, "setHoveredScope">,
) => (
  <button
    key={option.scope}
    type="button"
    data-scope-option={option.scope}
    style={scopeButtonStyle(hoveredScope === option.scope)}
    onFocus={() => commands.setHoveredScope(option.scope)}
    onBlur={() => commands.setHoveredScope(null)}
    onMouseEnter={() => commands.setHoveredScope(option.scope)}
    onMouseLeave={() => commands.setHoveredScope(null)}
  >
    <strong>{option.label}</strong>
    <span style={{ color: "#475569", fontSize: 13 }}>{option.description}</span>
    <span style={{ color: "#64748b", fontSize: 12 }}>
      {option.targetCount} targets · {option.reason}
    </span>
  </button>
);

export const SemanticInspector = ({
  commands,
  overlay,
  session,
}: SemanticInspectorProps) => {
  const similarElements = useMemo(
    () => resolveSimilarElements(session.selectedElement, session.selection.similar),
    [session.selectedElement, session.selection.similar],
  );
  const analysis = useMemo(
    () =>
      session.selectedElement
        ? analyzeSemanticContext({
            element: session.selectedElement,
            similarElements,
          })
        : null,
    [session.selectedElement, similarElements],
  );

  if (!session.selectedElement || !analysis) {
    return (
      <section style={sectionStyle}>
        <span style={sectionLabelStyle}>Semantic controls</span>
        <p style={mutedTextStyle}>
          Select a live target to inspect tokens, repeated components, and safe scope
          options.
        </p>
      </section>
    );
  }

  return (
    <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
      <section style={sectionStyle}>
        <span style={sectionLabelStyle}>Token candidates</span>
        {analysis.tokens.length === 0 ? (
          <p style={mutedTextStyle}>
            No token-like values detected yet. Use single-instance edits for this target.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {analysis.tokens.map((token) => (
              <div
                key={token.id}
                data-token-candidate={token.id}
                style={{ display: "grid", gap: 4 }}
              >
                <strong>{token.label}</strong>
                <span style={{ color: "#475569", fontSize: 13 }}>
                  {token.source} · {token.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={sectionStyle}>
        <span style={sectionLabelStyle}>Component signature</span>
        {analysis.component ? (
          <div style={{ display: "grid", gap: 4 }}>
            <strong>{analysis.component.label}</strong>
            <span style={{ color: "#475569", fontSize: 13 }}>
              {analysis.component.reason}
            </span>
          </div>
        ) : (
          <p style={mutedTextStyle}>
            This selection does not yet match a repeated component signature.
          </p>
        )}
      </section>

      <section style={sectionStyle}>
        <span style={sectionLabelStyle}>Scope choices</span>
        <div style={{ display: "grid", gap: 10 }}>
          {analysis.scopes.map((option) =>
            renderScopeOption(option, overlay.hoveredScope, commands),
          )}
        </div>
      </section>
    </div>
  );
};
