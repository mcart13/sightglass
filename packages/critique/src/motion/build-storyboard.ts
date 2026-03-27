import type { CritiqueContext, MotionStoryboard, MotionStoryboardStep } from "../contracts.js";

const createStep = (
  id: string,
  title: string,
  description: string,
  durationMs: number,
  emphasis: MotionStoryboardStep["emphasis"],
): MotionStoryboardStep =>
  Object.freeze({
    id,
    title,
    description,
    durationMs,
    emphasis,
  });

export const buildMotionStoryboard = (
  context: Readonly<CritiqueContext>,
): Readonly<MotionStoryboard> => {
  const hasLayoutRisk =
    context.motionSignals.hasTransitionAll ||
    context.motionSignals.layoutAffectingProperties.length > 0;
  const baseDuration = context.motionSignals.durationMs || 220;
  const warnings = [
    hasLayoutRisk
      ? "Current interaction animates broad or layout-affecting properties."
      : null,
    !context.motionSignals.hasReducedMotionGuard
      ? "Reduced-motion fallback is missing."
      : null,
  ].filter((value): value is string => Boolean(value));

  return Object.freeze({
    pipelineTier: hasLayoutRisk ? "layout-risk" : "compositor-safe",
    warnings: Object.freeze(warnings),
    reducedMotionNotes: Object.freeze([
      context.motionSignals.hasReducedMotionGuard
        ? "Reduced-motion override is already signaled in the current review scope."
        : "Replace non-essential movement with opacity-only or instant state changes when reduced motion is requested.",
    ]),
    steps: Object.freeze([
      createStep(
        "trigger",
        "Trigger",
        "Prime the interaction with a small transform-or-opacity cue instead of a broad transition list.",
        Math.round(baseDuration * 0.25),
        "enter",
      ),
      createStep(
        "travel",
        "Travel",
        "Use a modest offset and blur reduction so the eye can track the element without layout shifts.",
        Math.round(baseDuration * 0.45),
        "enter",
      ),
      createStep(
        "settle",
        "Settle",
        "Ease the element into its final state with a shorter settle phase and no layout-affecting properties.",
        Math.round(baseDuration * 0.3),
        "settle",
      ),
      createStep(
        "reduced-motion",
        "Reduced-motion variant",
        "Collapse the sequence to opacity and state emphasis only when motion should be minimized.",
        Math.min(120, Math.round(baseDuration * 0.2)),
        "reduced-motion",
      ),
    ]),
  });
};
