import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import {
  buildMotionStoryboard,
  createMotionTuningSchema,
  runCritique,
  type MotionTuningControlId,
} from "@sightglass/critique";
import type { SightglassSessionSnapshot } from "@sightglass/core";

interface MotionLabProps {
  readonly session: Readonly<SightglassSessionSnapshot>;
}

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

const cardStyle: CSSProperties = {
  display: "grid",
  gap: 6,
  padding: 12,
  borderRadius: 14,
  border: "1px solid rgba(148, 163, 184, 0.16)",
  background: "rgba(255, 255, 255, 0.9)",
};

export const MotionLab = ({ session }: MotionLabProps) => {
  const target = session.selection.best?.anchors[0] ?? null;
  const selectedElement = session.selectedElement;
  const critiqueReport = useMemo(() => {
    if (!selectedElement || !target) {
      return null;
    }

    return runCritique({
      document: selectedElement.ownerDocument,
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
  const [values, setValues] = useState<Partial<Record<MotionTuningControlId, number>>>({});

  useEffect(() => {
    if (!tuningSchema) {
      setValues({});
      return;
    }

    setValues(
      Object.fromEntries(
        tuningSchema.controls.map((control) => [control.id, control.recommendedValue]),
      ),
    );
  }, [tuningSchema]);

  if (!selectedElement || !target || !storyboard || !tuningSchema) {
    return (
      <section style={sectionStyle}>
        <span style={sectionLabelStyle}>Motion lab</span>
        <p style={{ margin: 0, color: "#475569", lineHeight: 1.5 }}>
          Select a live interaction to review storyboard steps, performance risks, and
          reduced-motion-aware tuning controls.
        </p>
      </section>
    );
  }

  return (
    <section style={sectionStyle}>
      <span style={sectionLabelStyle}>Motion lab</span>
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
          <div key={step.id} data-storyboard-step={step.id} style={cardStyle}>
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
              {values[control.id] ?? control.recommendedValue}
              {control.unit} · {control.guidance}
            </span>
            <input
              data-motion-control={control.id}
              type="range"
              min={control.min}
              max={control.max}
              step={control.step}
              value={values[control.id] ?? control.recommendedValue}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  [control.id]: Number(event.currentTarget.value),
                }))
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
