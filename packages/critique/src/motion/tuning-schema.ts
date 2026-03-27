import type { CritiqueContext, MotionTuningControl, MotionTuningSchema } from "../contracts.js";

const createControl = (
  control: MotionTuningControl,
): MotionTuningControl => Object.freeze(control);

export const createMotionTuningSchema = (
  context: Readonly<CritiqueContext>,
): Readonly<MotionTuningSchema> => {
  const reducedMotionActive = context.motionSignals.hasReducedMotionGuard;
  const durationBaseline = context.motionSignals.durationMs || 220;

  return Object.freeze({
    controls: Object.freeze([
      createControl({
        id: "spring",
        label: "Spring",
        min: 0.6,
        max: 1.4,
        step: 0.05,
        defaultValue: 1,
        recommendedValue: reducedMotionActive ? 0.8 : 1.05,
        unit: "ratio",
        guidance: "Keep the spring restrained so the interaction lands cleanly instead of wobbling.",
      }),
      createControl({
        id: "duration",
        label: "Duration",
        min: 120,
        max: reducedMotionActive ? 220 : 420,
        step: 10,
        defaultValue: durationBaseline,
        recommendedValue: reducedMotionActive ? 160 : Math.min(260, durationBaseline),
        unit: "ms",
        guidance: "Shorter durations work better for repeated UI actions; reserve slower timing for scene changes.",
      }),
      createControl({
        id: "blur",
        label: "Blur",
        min: 0,
        max: reducedMotionActive ? 4 : 16,
        step: 1,
        defaultValue: 4,
        recommendedValue: reducedMotionActive ? 0 : 6,
        unit: "px",
        guidance: "Use blur sparingly and keep the reduced-motion variant blur-free.",
      }),
      createControl({
        id: "offset",
        label: "Offset",
        min: 0,
        max: 40,
        step: 2,
        defaultValue: 12,
        recommendedValue: reducedMotionActive ? 4 : 16,
        unit: "px",
        guidance: "Offsets should stay transform-based and modest enough to preserve layout stability.",
      }),
      createControl({
        id: "stagger",
        label: "Stagger",
        min: 0,
        max: reducedMotionActive ? 40 : 120,
        step: 4,
        defaultValue: 24,
        recommendedValue: reducedMotionActive ? 8 : 32,
        unit: "ms",
        guidance: "Stagger should feel rhythmic, not theatrical; tighten it further for reduced-motion friendly flows.",
      }),
    ]),
    performanceNotes: Object.freeze([
      context.motionSignals.hasTransitionAll
        ? "Replace `transition: all` with transform/opacity-specific transitions before increasing polish."
        : "Current transition list can stay compositor-friendly if you keep tuning on transform and opacity.",
      context.motionSignals.layoutAffectingProperties.length > 0
        ? `Avoid animating ${context.motionSignals.layoutAffectingProperties.join(", ")} in the tuned variant.`
        : "No layout-affecting motion properties are currently flagged.",
    ]),
    reducedMotionNotes: Object.freeze([
      reducedMotionActive
        ? "A reduced-motion marker is present; keep recommended values inside the lower range."
        : "Add a reduced-motion variant before shipping any tuned motion sequence.",
    ]),
  });
};
