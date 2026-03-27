import { useMemo, useState, type CSSProperties } from "react";
import {
  CRITIQUE_CATEGORIES,
  runCritique,
  type CritiquePerspective,
  type CritiqueScope,
} from "@sightglass/critique";
import type { SightglassSessionSnapshot } from "@sightglass/core";

const sectionStyle: CSSProperties = {
  display: "grid",
  gap: 10,
  padding: 14,
  borderRadius: 18,
  background: "rgba(15, 23, 42, 0.04)",
  border: "1px solid rgba(148, 163, 184, 0.18)",
};

const sectionLabelStyle: CSSProperties = {
  fontSize: 12,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#64748b",
};

const controlButtonStyle = (active: boolean): CSSProperties => ({
  border: active
    ? "1px solid rgba(14, 116, 144, 0.42)"
    : "1px solid rgba(148, 163, 184, 0.22)",
  background: active ? "rgba(224, 242, 254, 0.82)" : "rgba(255, 255, 255, 0.9)",
  color: "#0f172a",
  borderRadius: 999,
  padding: "6px 10px",
  cursor: "pointer",
});

const findingCardStyle: CSSProperties = {
  display: "grid",
  gap: 6,
  padding: 12,
  borderRadius: 14,
  background: "rgba(255, 255, 255, 0.9)",
  border: "1px solid rgba(148, 163, 184, 0.16)",
};

const CATEGORY_LABELS = Object.freeze({
  "visual-design": "Visual design",
  "interface-design": "Interface design",
  consistency: "Consistency",
  "user-context": "User context",
  accessibility: "Accessibility",
  "motion-quality": "Motion quality",
  "motion-performance": "Motion performance",
});

interface CritiquePanelProps {
  readonly session: Readonly<SightglassSessionSnapshot>;
}

const resolveScopeElement = (
  selectedElement: Element,
  scope: CritiqueScope,
): Element => {
  if (scope === "page") {
    return selectedElement.ownerDocument.body;
  }

  if (scope === "section") {
    return (
      selectedElement.closest("section, article, aside, form, main, header, footer, nav") ??
      selectedElement
    );
  }

  return selectedElement;
};

export const CritiquePanel = ({ session }: CritiquePanelProps) => {
  const [scope, setScope] = useState<CritiqueScope>("node");
  const [perspective, setPerspective] = useState<CritiquePerspective>("emil");
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const target = session.selection.best?.anchors[0] ?? null;
  const selectedElement = session.selectedElement;
  const report = useMemo(() => {
    if (!selectedElement || !target) {
      return null;
    }

    return runCritique({
      document: selectedElement.ownerDocument,
      selectedElement: resolveScopeElement(selectedElement, scope),
      perspective,
      scope,
      target,
    });
  }, [perspective, scope, selectedElement, target]);

  if (!selectedElement || !target || !report) {
    return (
      <section style={sectionStyle}>
        <span style={sectionLabelStyle}>Critique</span>
        <p style={{ margin: 0, color: "#475569", lineHeight: 1.5 }}>
          Run critique on a live selection to inspect visual, accessibility, and motion
          issues before turning them into an edit plan.
        </p>
      </section>
    );
  }

  const leadFinding = report.findings[0] ?? null;

  return (
    <section style={sectionStyle}>
      <span style={sectionLabelStyle}>Critique</span>
      <div style={{ display: "grid", gap: 8 }}>
        <strong>Top finding</strong>
        <div style={findingCardStyle}>
          <strong>{leadFinding?.title ?? "No critique findings"}</strong>
          <span style={{ color: "#475569", fontSize: 13 }}>
            {report.context.scopeLabel} · {CATEGORY_LABELS[leadFinding?.category ?? "visual-design"]}
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <span style={sectionLabelStyle}>Review scope</span>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(["node", "section", "page"] as const).map((scopeOption) => (
            <button
              key={scopeOption}
              type="button"
              data-critique-scope={scopeOption}
              aria-pressed={scope === scopeOption}
              style={controlButtonStyle(scope === scopeOption)}
              onClick={() => setScope(scopeOption)}
            >
              {scopeOption === "node"
                ? "Selected element"
                : scopeOption === "section"
                  ? "Containing section"
                  : "Entire page"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <span style={sectionLabelStyle}>Perspective</span>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(["emil", "jakub", "jhey"] as const).map((perspectiveOption) => (
            <button
              key={perspectiveOption}
              type="button"
              data-critique-perspective={perspectiveOption}
              aria-pressed={perspective === perspectiveOption}
              style={controlButtonStyle(perspective === perspectiveOption)}
              onClick={() => setPerspective(perspectiveOption)}
            >
              {perspectiveOption}
            </button>
          ))}
        </div>
      </div>

      {selectedFindingId ? (
        <div style={findingCardStyle}>
          <strong>Explore handoff ready</strong>
          <span style={{ color: "#475569", fontSize: 13 }}>
            Selected finding: {selectedFindingId}
          </span>
        </div>
      ) : null}

      <div style={{ display: "grid", gap: 12 }}>
        {CRITIQUE_CATEGORIES.map((category) => {
          const findings = report.groupedFindings[category];

          if (findings.length === 0) {
            return null;
          }

          return (
            <div key={category} style={{ display: "grid", gap: 8 }}>
              <strong>{CATEGORY_LABELS[category]}</strong>
              {findings.map((finding) => (
                <article key={finding.id} style={findingCardStyle}>
                  <strong>{finding.title}</strong>
                  <span style={{ color: "#475569", fontSize: 13 }}>
                    {finding.observation}
                  </span>
                  <span style={{ color: "#334155", fontSize: 13 }}>
                    {finding.recommendation}
                  </span>
                  <button
                    type="button"
                    style={controlButtonStyle(selectedFindingId === finding.id)}
                    onClick={() => setSelectedFindingId(finding.id)}
                  >
                    Turn this into an edit plan
                  </button>
                </article>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
};
