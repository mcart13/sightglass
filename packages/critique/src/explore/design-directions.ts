import type {
  CritiqueCategory,
  CritiqueReport,
  DesignDirection,
  DesignDirectionId,
} from "../contracts.js";

const categories = (
  values: readonly CritiqueCategory[],
): readonly CritiqueCategory[] => Object.freeze([...values]);

const DIRECTION_TEMPLATES: Record<
  DesignDirectionId,
  Omit<DesignDirection, "findingIds" | "priorityScore">
> = Object.freeze({
  editorial: {
    id: "editorial",
    title: "More editorial",
    visualThesis: "Create one dominant visual anchor and let secondary content step back.",
    contentPlan: "Condense repeated cards into a tighter supporting rhythm with one lead story.",
    interactionThesis: "Use tighter, directional motion that feels intentional instead of generic.",
    focusCategories: categories([
      "visual-design",
      "consistency",
      "motion-quality",
    ]),
  },
  restrained: {
    id: "restrained",
    title: "More restrained",
    visualThesis: "Reduce decorative repetition and let spacing and hierarchy carry the composition.",
    contentPlan: "Trim duplicate emphasis so every control has a clearer role.",
    interactionThesis: "Favor shorter durations, fewer layers, and more predictable transitions.",
    focusCategories: categories([
      "interface-design",
      "consistency",
      "motion-performance",
    ]),
  },
  premium: {
    id: "premium",
    title: "More premium",
    visualThesis: "Increase contrast in emphasis and create a more deliberate visual ladder.",
    contentPlan: "Surface product intent faster with clearer section framing and lead messaging.",
    interactionThesis: "Prefer confident transforms and opacity over broad property animation.",
    focusCategories: categories([
      "visual-design",
      "user-context",
      "motion-performance",
    ]),
  },
  playful: {
    id: "playful",
    title: "More playful",
    visualThesis: "Lean into personality without losing semantic clarity or accessibility.",
    contentPlan: "Keep the structure intact, but give key calls to action more expressive moments.",
    interactionThesis: "Use springier motion, modest offsets, and tighter staggering with reduced-motion fallbacks.",
    focusCategories: categories([
      "motion-quality",
      "motion-performance",
      "visual-design",
    ]),
  },
  utilitarian: {
    id: "utilitarian",
    title: "More utilitarian",
    visualThesis: "Make the system easier to scan by reducing flourish and reinforcing semantic tiers.",
    contentPlan: "Prioritize headings, labels, and action grouping over ornament.",
    interactionThesis: "Keep motion minimal, fast, and clearly tied to state changes.",
    focusCategories: categories([
      "accessibility",
      "interface-design",
      "user-context",
    ]),
  },
});

const scoreDirection = (
  report: Readonly<CritiqueReport>,
  directionId: DesignDirectionId,
): number => {
  const focusCategories = DIRECTION_TEMPLATES[directionId].focusCategories;

  return report.findings.reduce((score, finding) => {
    const focusBonus = focusCategories.includes(finding.category) ? 2 : 0;
    const severityBonus =
      finding.severity === "critical"
        ? 3
        : finding.severity === "important"
          ? 2
          : 1;

    return score + focusBonus + severityBonus;
  }, 0);
};

const resolveFindingIds = (
  report: Readonly<CritiqueReport>,
  directionId: DesignDirectionId,
): readonly string[] => {
  const focusCategories = DIRECTION_TEMPLATES[directionId].focusCategories;

  return Object.freeze(
    report.findings
      .filter((finding) => focusCategories.includes(finding.category))
      .slice(0, 3)
      .map((finding) => finding.id),
  );
};

export const generateDesignDirections = (
  report: Readonly<CritiqueReport>,
): readonly DesignDirection[] =>
  Object.freeze(
    (Object.keys(DIRECTION_TEMPLATES) as DesignDirectionId[])
      .map((directionId) => ({
        ...DIRECTION_TEMPLATES[directionId],
        findingIds: resolveFindingIds(report, directionId),
        priorityScore: scoreDirection(report, directionId),
      }))
      .sort(
        (left, right) =>
          right.priorityScore - left.priorityScore ||
          left.title.localeCompare(right.title),
      ),
  );
