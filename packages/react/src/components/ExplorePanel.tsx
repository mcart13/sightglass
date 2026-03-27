import { useMemo, type CSSProperties } from "react";
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
  panelSectionLabelStyle,
  panelSectionStyle,
} from "./panel-styles";

interface ExplorePanelProps {
  readonly session: Readonly<SightglassSessionSnapshot>;
}

const optionStyle = (active: boolean): CSSProperties => ({
  display: "grid",
  gap: 6,
  padding: 12,
  borderRadius: 14,
  border: active
    ? "1px solid rgba(14, 116, 144, 0.42)"
    : "1px solid rgba(148, 163, 184, 0.16)",
  background: active ? "rgba(224, 242, 254, 0.82)" : "rgba(255, 255, 255, 0.9)",
  textAlign: "left",
  cursor: "pointer",
});

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
    [report],
  );
  const selectedDirection =
    directions.find((direction) => direction.id === reviewDraft.selectedDirectionId) ??
    directions[0] ??
    null;
  const editPlan = useMemo(
    () => (report && selectedDirection ? buildExploreEditPlan(selectedDirection, report) : null),
    [report, selectedDirection],
  );

  if (!report) {
    return (
      <section style={panelSectionStyle}>
        <span style={panelSectionLabelStyle}>Explore</span>
        <p style={{ margin: 0, color: "#475569", lineHeight: 1.5 }}>
          Critique a live target first, then explore stronger visual directions and
          scope-aware edit plans.
        </p>
      </section>
    );
  }

  return (
    <section style={panelSectionStyle}>
      <span style={panelSectionLabelStyle}>Explore</span>
      <div style={{ display: "grid", gap: 10 }}>
        {directions.map((direction) => (
          <button
            key={direction.id}
            type="button"
            data-direction-id={direction.id}
            aria-pressed={selectedDirection?.id === direction.id}
            style={optionStyle(selectedDirection?.id === direction.id)}
            onClick={() => reviewDraftCommands.setSelectedDirectionId(direction.id)}
          >
            <strong>{direction.title}</strong>
            <span style={{ color: "#475569", fontSize: 13 }}>
              {direction.visualThesis}
            </span>
            <span style={{ color: "#334155", fontSize: 13 }}>
              {direction.interactionThesis}
            </span>
          </button>
        ))}
      </div>

      {selectedDirection && editPlan ? (
        <div style={{ display: "grid", gap: 8 }}>
          <strong>{editPlan.title}</strong>
          <span style={{ color: "#475569", fontSize: 13 }}>{editPlan.summary}</span>
          <div style={{ display: "grid", gap: 8 }}>
            {editPlan.proposedOperations.map((operation) => (
              <div
                key={operation.id}
                data-edit-plan-operation={operation.id}
                style={optionStyle(false)}
              >
                <strong>{operation.title}</strong>
                <span style={{ color: "#475569", fontSize: 13 }}>
                  {operation.scope} · {operation.semanticKind} · {operation.value}
                </span>
                <span style={{ color: "#334155", fontSize: 13 }}>
                  {operation.rationale}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
};
