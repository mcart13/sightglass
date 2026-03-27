import { createCritiqueExportSummary } from "./critique-report.js";
import { createExplorationBundle } from "./exploration-bundle.js";
import type { ChangeManifest } from "./change-manifest.js";

export const formatPromptFromManifest = (
  manifest: Readonly<ChangeManifest>,
): string => {
  const critiqueSummary = createCritiqueExportSummary(manifest);
  const explorationBundle = createExplorationBundle(manifest);

  return [
    `Apply the Sightglass manifest for route ${manifest.route}.`,
    `Session: ${manifest.sessionId}.`,
    `Targets: ${manifest.targets
      .map((target) => `${target.anchor.selector} (${target.scope})`)
      .join(", ")}.`,
    `Transactions: ${manifest.transactions
      .map((transaction) => `${transaction.id} with ${transaction.operations.length} operations`)
      .join("; ")}.`,
    `Critique highlights: ${critiqueSummary.highlights.join("; ") || "none"}.`,
    `Exploration directions: ${explorationBundle.directions.join(", ") || "none"}.`,
    manifest.motionStoryboard
      ? `Motion guardrails: ${manifest.motionStoryboard.warnings.join("; ") || manifest.motionStoryboard.pipelineTier}.`
      : "Motion guardrails: none.",
  ].join(" ");
};
