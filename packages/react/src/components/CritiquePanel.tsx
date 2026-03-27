import { useMemo } from "react";
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

const CATEGORY_LABELS: Record<string, string> = {
  "visual-design": "Visual",
  "interface-design": "Interface",
  consistency: "Consistency",
  "user-context": "Context",
  accessibility: "A11y",
  "motion-quality": "Motion",
  "motion-performance": "Perf",
};

const SCOPE_LABELS: Record<string, string> = {
  node: "Element",
  section: "Section",
  page: "Page",
};

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
  }, [
    reviewDraft.critiquePerspective,
    reviewDraft.critiqueScope,
    selectedElement,
    target,
  ]);

  if (!report) {
    return (
      <div style={panelSectionStyle}>
        <span style={panelSectionLabelStyle}>Critique</span>
        <span style={panelMutedStyle}>Select an element to critique.</span>
      </div>
    );
  }

  return (
    <>
      {/* Scope + Perspective controls */}
      <div style={panelSectionStyle}>
        <span style={panelSectionLabelStyle}>Scope</span>
        <div style={{ display: "flex", gap: 4 }}>
          {CRITIQUE_SCOPES.map((scope) => (
            <button
              key={scope}
              type="button"
              data-critique-scope={scope}
              aria-pressed={reviewDraft.critiqueScope === scope}
              style={
                reviewDraft.critiqueScope === scope
                  ? panelButtonActiveStyle
                  : panelButtonStyle
              }
              onClick={() => reviewDraftCommands.setCritiqueScope(scope)}
            >
              {SCOPE_LABELS[scope]}
            </button>
          ))}
        </div>
      </div>

      <div style={panelSectionStyle}>
        <span style={panelSectionLabelStyle}>Perspective</span>
        <div style={{ display: "flex", gap: 4 }}>
          {CRITIQUE_PERSPECTIVES.map((perspective) => (
            <button
              key={perspective}
              type="button"
              data-critique-perspective={perspective}
              aria-pressed={reviewDraft.critiquePerspective === perspective}
              style={
                reviewDraft.critiquePerspective === perspective
                  ? panelButtonActiveStyle
                  : panelButtonStyle
              }
              onClick={() =>
                reviewDraftCommands.setCritiquePerspective(perspective)
              }
            >
              {perspective}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div style={panelSectionStyle}>
        <span style={panelSectionLabelStyle}>
          Findings
          <span style={{ fontVariantNumeric: "tabular-nums" }}>
            {report.findings.length}
          </span>
        </span>

        {report.findings.length === 0 ? (
          <span style={panelMutedStyle}>No findings.</span>
        ) : (
          report.findings.slice(0, 8).map((finding) => (
            <button
              key={finding.id}
              type="button"
              style={{
                ...(reviewDraft.selectedFindingId === finding.id
                  ? panelButtonActiveStyle
                  : panelCardStyle),
                textAlign: "left",
                cursor: "pointer",
                width: "100%",
              }}
              onClick={() =>
                reviewDraftCommands.setSelectedFindingId(finding.id)
              }
            >
              <div style={panelRowStyle}>
                <span style={{ fontSize: 12, fontWeight: 500 }}>
                  {finding.title}
                </span>
                <span style={{ ...panelRowValueStyle, flexShrink: 0 }}>
                  {CATEGORY_LABELS[finding.category] ?? finding.category}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </>
  );
};
