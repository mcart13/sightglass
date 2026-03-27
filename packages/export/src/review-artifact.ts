import { createCritiqueExportSummary } from "./critique-report.js";
import { createExplorationBundle } from "./exploration-bundle.js";
import { formatPromptFromManifest } from "./prompt-formatter.js";
import type { ChangeManifest } from "./change-manifest.js";

export interface ReviewArtifact {
  readonly route: string;
  readonly sessionId: string;
  readonly beforeScreenshot: string | null;
  readonly afterScreenshot: string | null;
  readonly transactionCount: number;
  readonly critiqueSummary: ReturnType<typeof createCritiqueExportSummary>;
  readonly exploration: ReturnType<typeof createExplorationBundle>;
  readonly prompt: string;
}

export interface CreateReviewArtifactOptions {
  readonly manifest: Readonly<ChangeManifest>;
  readonly beforeScreenshot?: string | null;
  readonly afterScreenshot?: string | null;
}

export const createReviewArtifact = (
  options: CreateReviewArtifactOptions,
): Readonly<ReviewArtifact> =>
  Object.freeze({
    route: options.manifest.route,
    sessionId: options.manifest.sessionId,
    beforeScreenshot: options.beforeScreenshot ?? null,
    afterScreenshot: options.afterScreenshot ?? null,
    transactionCount: options.manifest.transactions.length,
    critiqueSummary: createCritiqueExportSummary(options.manifest),
    exploration: createExplorationBundle(options.manifest),
    prompt: formatPromptFromManifest(options.manifest),
  });
