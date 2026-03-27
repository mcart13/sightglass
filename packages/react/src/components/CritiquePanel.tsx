import { useMemo, type CSSProperties } from "react";
import {
  CRITIQUE_CATEGORIES,
  CRITIQUE_PERSPECTIVES,
  CRITIQUE_SCOPES,
  runScopedCritique,
} from "@sightglass/critique";
import type { SightglassSessionSnapshot } from "@sightglass/core";
import {
  useSightglassReviewDraftCommands,
  useSightglassReviewDraftState,
} from "../use-sightglass";
import {
  panelCardStyle,
  panelSectionLabelStyle,
  panelSectionStyle,
} from "./panel-styles";

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

const CATEGORY_LABELS = Object.freeze({
  "visual-design": "Visual design",
  "interface-design": "Interface design",
  consistency: "Consistency",
  "user-context": "User context",
  accessibility: "Accessibility",
  "motion-quality": "Motion quality",
  "motion-performance": "Motion performance",
});

const SCOPE_LABELS = Object.freeze({
  node: "Selected element",
  section: "Containing section",
  page: "Entire page",
});

interface CritiquePanelProps {
  readonly session: Readonly<SightglassSessionSnapshot>;
}

export const CritiquePanel = ({ session }: CritiquePanelProps) => {
  const reviewDraft = useSightglassReviewDraftState();
  const reviewDraftCommands = useSightglassReviewDraftCommands();
  const target = session.selection.best?.anchors[0] ?? null;
  const selectedElement = session.selectedElement;
  const report = useMemo(() => {
    return runScopedCritique({
      selectedElement,
      perspective: reviewDraft.critiquePerspective,
      scope: reviewDraft.critiqueScope,
      target,
    });
  }, [reviewDraft.critiquePerspective, reviewDraft.critiqueScope, selectedElement, target]);

  if (!report) {
    return (
      <section style={panelSectionStyle}>
        <span style={panelSectionLabelStyle}>Critique</span>
        <p style={{ margin: 0, color: "#475569", lineHeight: 1.5 }}>
          Run critique on a live selection to inspect visual, accessibility, and motion
          issues before turning them into an edit plan.
        </p>
      </section>
    );
  }

  const leadFinding = report.findings[0] ?? null;

  return (
    <section style={panelSectionStyle}>
      <span style={panelSectionLabelStyle}>Critique</span>
      <div style={{ display: "grid", gap: 8 }}>
        <strong>Top finding</strong>
        <div style={panelCardStyle}>
          <strong>{leadFinding?.title ?? "No critique findings"}</strong>
          <span style={{ color: "#475569", fontSize: 13 }}>
            {leadFinding
              ? `${report.context.scopeLabel} · ${CATEGORY_LABELS[leadFinding.category]}`
              : report.context.scopeLabel}
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <span style={panelSectionLabelStyle}>Review scope</span>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CRITIQUE_SCOPES.map((scopeOption) => (
            <button
              key={scopeOption}
              type="button"
              data-critique-scope={scopeOption}
              aria-pressed={reviewDraft.critiqueScope === scopeOption}
              style={controlButtonStyle(reviewDraft.critiqueScope === scopeOption)}
              onClick={() => reviewDraftCommands.setCritiqueScope(scopeOption)}
            >
              {SCOPE_LABELS[scopeOption]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <span style={panelSectionLabelStyle}>Perspective</span>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CRITIQUE_PERSPECTIVES.map((perspectiveOption) => (
            <button
              key={perspectiveOption}
              type="button"
              data-critique-perspective={perspectiveOption}
              aria-pressed={reviewDraft.critiquePerspective === perspectiveOption}
              style={controlButtonStyle(reviewDraft.critiquePerspective === perspectiveOption)}
              onClick={() =>
                reviewDraftCommands.setCritiquePerspective(perspectiveOption)
              }
            >
              {perspectiveOption}
            </button>
          ))}
        </div>
      </div>

      {reviewDraft.selectedFindingId ? (
        <div style={panelCardStyle}>
          <strong>Explore handoff ready</strong>
          <span style={{ color: "#475569", fontSize: 13 }}>
            Selected finding: {reviewDraft.selectedFindingId}
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
                <article key={finding.id} style={panelCardStyle}>
                  <strong>{finding.title}</strong>
                  <span style={{ color: "#475569", fontSize: 13 }}>
                    {finding.observation}
                  </span>
                  <span style={{ color: "#334155", fontSize: 13 }}>
                    {finding.recommendation}
                  </span>
                  <button
                    type="button"
                    aria-pressed={reviewDraft.selectedFindingId === finding.id}
                    style={controlButtonStyle(reviewDraft.selectedFindingId === finding.id)}
                    onClick={() =>
                      reviewDraftCommands.setSelectedFindingId(finding.id)
                    }
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
