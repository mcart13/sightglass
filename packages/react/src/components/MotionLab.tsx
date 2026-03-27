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
    () => (critiqueReport ? buildMotionStoryboard(critiqueReport.context) : null),
    [critiqueReport],
  );
  const tuningSchema = useMemo(
    () => (critiqueReport ? createMotionTuningSchema(critiqueReport.context) : null),
    [critiqueReport],
  );

  if (!storyboard || !tuningSchema) {
    return (
      <section style={panelSectionStyle}>
        <span style={panelSectionLabelStyle}>Motion lab</span>
        <p style={{ margin: 0, color: "#475569", lineHeight: 1.5 }}>
          Select a live interaction to review storyboard steps, performance risks, and
          reduced-motion-aware tuning controls.
        </p>
      </section>
    );
  }

  return (
    <section style={panelSectionStyle}>
      <span style={panelSectionLabelStyle}>Motion lab</span>
      <div style={{ display: "grid", gap: 8 }}>
        <strong>{storyboard.pipelineTier === "layout-risk" ? "Layout-risk motion" : "Compositor-safe motion"}</strong>
        {storyboard.warnings.map((warning) => (
          <span key={warning} style={{ color: "#475569", fontSize: 13 }}>
            {warning}
          </span>
        ))}
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {storyboard.steps.map((step) => (
          <div
            key={step.id}
            data-storyboard-step={step.id}
            style={panelCardStyle}
          >
            <strong>{step.title}</strong>
            <span style={{ color: "#475569", fontSize: 13 }}>
              {step.durationMs}ms · {step.emphasis}
            </span>
            <span style={{ color: "#334155", fontSize: 13 }}>
              {step.description}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {tuningSchema.controls.map((control) => (
          <label key={control.id} style={{ display: "grid", gap: 6 }}>
            <strong>{control.label}</strong>
            <span style={{ color: "#475569", fontSize: 13 }}>
              {reviewDraft.motionValues[control.id] ?? control.recommendedValue}
              {control.unit} · {control.guidance}
            </span>
            <input
              data-motion-control={control.id}
              type="range"
              min={control.min}
              max={control.max}
              step={control.step}
              value={reviewDraft.motionValues[control.id] ?? control.recommendedValue}
              onChange={(event) =>
                reviewDraftCommands.setMotionValue(
                  control.id,
                  Number(event.currentTarget.value),
                )
              }
            />
          </label>
        ))}
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        {tuningSchema.performanceNotes.map((note) => (
          <span key={note} style={{ color: "#475569", fontSize: 13 }}>
            {note}
          </span>
        ))}
        {tuningSchema.reducedMotionNotes.map((note) => (
          <span key={note} style={{ color: "#334155", fontSize: 13 }}>
            {note}
          </span>
        ))}
      </div>
    </section>
  );
};
