export interface ReviewRouteArtifact {
  readonly route: string;
  readonly sessionId: string;
  readonly transactionCount: number;
  readonly critiqueSummary: {
    readonly totalFindings: number;
    readonly categories: readonly string[];
    readonly highlights: readonly string[];
  };
  readonly exploration: {
    readonly directionCount: number;
    readonly directions: readonly string[];
    readonly operationCount: number;
  };
  readonly prompt: string;
}

export interface ReviewRouteModel {
  readonly title: string;
  readonly subtitle: string;
  readonly highlights: readonly string[];
  readonly directions: readonly string[];
  readonly prompt: string;
}

export const createReviewRouteModel = (
  artifact: Readonly<ReviewRouteArtifact>,
): Readonly<ReviewRouteModel> =>
  Object.freeze({
    title: `Review session ${artifact.sessionId}`,
    subtitle: `${artifact.route} · ${artifact.transactionCount} transactions · ${artifact.critiqueSummary.totalFindings} findings`,
    highlights: Object.freeze(artifact.critiqueSummary.highlights),
    directions: Object.freeze(artifact.exploration.directions),
    prompt: artifact.prompt,
  });

export const renderReviewRouteSummary = (
  model: Readonly<ReviewRouteModel>,
): string =>
  [
    model.title,
    model.subtitle,
    `Highlights: ${model.highlights.join("; ") || "none"}`,
    `Directions: ${model.directions.join(", ") || "none"}`,
    `Prompt: ${model.prompt}`,
  ].join("\n");
