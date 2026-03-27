import { useMemo } from "react";
import {
  buildMotionStoryboard,
  createMotionTuningSchema,
  runScopedCritique,
} from "@sightglass/critique";
import type { SightglassSessionSnapshot } from "@sightglass/core";
import {
  useSightglassReviewDraftCommands,
  useSightglassReviewDraftState,
} from "../use-sightglass";
import {
  panelCardStyle,
  panelMutedStyle,
  panelRowLabelStyle,
  panelRowStyle,
  panelRowValueStyle,
  panelSectionLabelStyle,
  panelSectionStyle,
} from "./panel-styles";

interface MotionLabProps {
  readonly session: Readonly<SightglassSessionSnapshot>;
}

export const MotionLab = ({ session }: MotionLabProps) => {
  const reviewDraft = useSightglassReviewDraftState();
  const reviewDraftCommands = useSightglassReviewDraftCommands();
  const target = session.selection.best?.anchors[0] ?? null;
  const selectedElement = session.selectedElement;
  const critiqueReport = useMemo(() => {
    return runScopedCritique({
      selectedElement,
      perspective: "jhey",
      scope: "node",
      target,
    });
  }, [selectedElement, target]);
  const storyboard = useMemo(
    () =>
      critiqueReport ? buildMotionStoryboard(critiqueReport.context) : null,
    [critiqueReport]
  );
  const tuningSchema = useMemo(
    () =>
      critiqueReport ? createMotionTuningSchema(critiqueReport.context) : null,
    [critiqueReport]
  );

  if (!storyboard || !tuningSchema) {
    return (
      <div style={panelSectionStyle}>
        <span style={panelSectionLabelStyle}>Motion</span>
        <span style={panelMutedStyle}>
          Select an element to analyze motion.
        </span>
      </div>
    );
  }

  return (
    <>
      {/* Pipeline tier */}
      <div style={panelSectionStyle}>
        <span style={panelSectionLabelStyle}>
          Pipeline
          <span
            style={{
              padding: "2px 6px",
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 600,
              background:
                storyboard.pipelineTier === "layout-risk"
                  ? "rgba(239, 68, 68, 0.15)"
                  : "rgba(34, 197, 94, 0.15)",
              color:
                storyboard.pipelineTier === "layout-risk"
                  ? "#fca5a5"
                  : "#86efac",
            }}
          >
            {storyboard.pipelineTier === "layout-risk"
              ? "Layout risk"
              : "Compositor"}
          </span>
        </span>
        {storyboard.warnings.map((warning) => (
          <span key={warning} style={panelMutedStyle}>
            {warning}
          </span>
        ))}
      </div>

      {/* Storyboard */}
      <div style={panelSectionStyle}>
        <span style={panelSectionLabelStyle}>Storyboard</span>
        {storyboard.steps.map((step) => (
          <div
            key={step.id}
            style={panelCardStyle}
            data-storyboard-step={step.id}
          >
            <div style={panelRowStyle}>
              <span style={{ fontSize: 12, fontWeight: 500 }}>
                {step.title}
              </span>
              <span style={panelRowValueStyle}>{step.durationMs}ms</span>
            </div>
            <span style={panelMutedStyle}>{step.emphasis}</span>
          </div>
        ))}
      </div>

      {/* Tuning */}
      <div style={panelSectionStyle}>
        <span style={panelSectionLabelStyle}>Tuning</span>
        {tuningSchema.controls.map((control) => (
          <label key={control.id} style={{ display: "grid", gap: 4 }}>
            <div style={panelRowStyle}>
              <span style={panelRowLabelStyle}>{control.label}</span>
              <span style={panelRowValueStyle}>
                {reviewDraft.motionValues[control.id] ??
                  control.recommendedValue}
                {control.unit}
              </span>
            </div>
            <input
              data-motion-control={control.id}
              type="range"
              min={control.min}
              max={control.max}
              step={control.step}
              value={
                reviewDraft.motionValues[control.id] ?? control.recommendedValue
              }
              style={{ width: "100%", accentColor: "#3b82f6" }}
              onChange={(event) =>
                reviewDraftCommands.setMotionValue(
                  control.id,
                  Number(event.currentTarget.value)
                )
              }
            />
          </label>
        ))}
      </div>
    </>
  );
};
