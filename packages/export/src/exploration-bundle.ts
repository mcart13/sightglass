import type { ChangeManifest } from "./change-manifest.js";

export interface ExplorationBundle {
  readonly route: string;
  readonly directionCount: number;
  readonly directions: readonly string[];
  readonly operationCount: number;
}

export const createExplorationBundle = (
  manifest: Readonly<ChangeManifest>,
): Readonly<ExplorationBundle> =>
  Object.freeze({
    route: manifest.route,
    directionCount: manifest.exploration?.length ?? 0,
    directions: Object.freeze(
      (manifest.exploration ?? []).map((direction) => direction.title),
    ),
    operationCount: (manifest.exploration ?? []).reduce(
      (count, direction) => count + direction.proposedOperations.length,
      0,
    ),
  });
