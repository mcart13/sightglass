import type { ChangeManifest } from "./change-manifest.js";

export interface CritiqueExportSummary {
  readonly totalFindings: number;
  readonly categories: readonly string[];
  readonly highlights: readonly string[];
}

export const createCritiqueExportSummary = (
  manifest: Readonly<ChangeManifest>,
): Readonly<CritiqueExportSummary> =>
  Object.freeze({
    totalFindings: manifest.critique?.length ?? 0,
    categories: Object.freeze(
      [...new Set((manifest.critique ?? []).map((finding) => finding.category))],
    ),
    highlights: Object.freeze(
      (manifest.critique ?? []).slice(0, 3).map((finding) => finding.title),
    ),
  });
