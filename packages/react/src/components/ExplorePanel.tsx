import { useMemo } from "react";
import {
  buildExploreEditPlan,
  generateDesignDirections,
  runScopedCritique,
} from "@sightglass/critique";
import type { SightglassSessionSnapshot } from "@sightglass/core";
import {
  useSightglassReviewDraftCommands,
  useSightglassReviewDraftState,
} from "../use-sightglass";
import {
  panelButtonActiveStyle,
  panelCardStyle,
  panelMutedStyle,
  panelRowLabelStyle,
  panelRowStyle,
  panelRowValueStyle,
  panelSectionLabelStyle,
  panelSectionStyle,
} from "./panel-styles";

interface ExplorePanelProps {
  readonly session: Readonly<SightglassSessionSnapshot>;
}

export const ExplorePanel = ({ session }: ExplorePanelProps) => {
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
  const directions = useMemo(
    () => (report ? generateDesignDirections(report) : []),
    [report]
  );
  const selectedDirection =
    directions.find((d) => d.id === reviewDraft.selectedDirectionId) ??
    directions[0] ??
    null;
  const editPlan = useMemo(
    () =>
      report && selectedDirection
        ? buildExploreEditPlan(selectedDirection, report)
        : null,
    [report, selectedDirection]
  );

  if (!report) {
    return (
      <div style={panelSectionStyle}>
        <span style={panelSectionLabelStyle}>Explore</span>
        <span style={panelMutedStyle}>Run critique first.</span>
      </div>
    );
  }

  return (
    <>
      {/* Directions */}
      <div style={panelSectionStyle}>
        <span style={panelSectionLabelStyle}>
          Directions
          <span style={{ fontVariantNumeric: "tabular-nums" }}>
            {directions.length}
          </span>
        </span>
        {directions.map((direction) => (
          <button
            key={direction.id}
            type="button"
            data-direction-id={direction.id}
            aria-pressed={selectedDirection?.id === direction.id}
            style={{
              ...(selectedDirection?.id === direction.id
                ? panelButtonActiveStyle
                : panelCardStyle),
              textAlign: "left",
              cursor: "pointer",
              width: "100%",
            }}
            onClick={() =>
              reviewDraftCommands.setSelectedDirectionId(direction.id)
            }
          >
            <span style={{ fontSize: 12, fontWeight: 500 }}>
              {direction.title}
            </span>
            <span style={panelMutedStyle}>{direction.visualThesis}</span>
          </button>
        ))}
      </div>

      {/* Edit plan */}
      {editPlan && (
        <div style={panelSectionStyle}>
          <span style={panelSectionLabelStyle}>
            Edit Plan
            <span style={{ fontVariantNumeric: "tabular-nums" }}>
              {editPlan.proposedOperations.length}
            </span>
          </span>
          {editPlan.proposedOperations.map((op) => (
            <div
              key={op.id}
              style={panelCardStyle}
              data-edit-plan-operation={op.id}
            >
              <div style={panelRowStyle}>
                <span style={{ fontSize: 12, fontWeight: 500 }}>
                  {op.title}
                </span>
              </div>
              <div style={panelRowStyle}>
                <span style={panelRowLabelStyle}>{op.scope}</span>
                <span style={panelRowValueStyle}>
                  {op.semanticKind} · {op.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};
