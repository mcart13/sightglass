import type { EditScope, SessionTransaction, TargetAnchor } from "@sightglass/core";
import type {
  CritiqueFinding,
  ExploreEditOperation,
  MotionStoryboard,
} from "@sightglass/critique";

export interface ChangeManifestTarget {
  readonly anchor: Readonly<TargetAnchor>;
  readonly scope: EditScope;
  readonly semanticLabel?: string;
}

export interface ChangeManifestExploration {
  readonly directionId: string;
  readonly title: string;
  readonly proposedOperations: readonly ExploreEditOperation[];
}

export interface ChangeManifest {
  readonly route: string;
  readonly sessionId: string;
  readonly targets: readonly ChangeManifestTarget[];
  readonly transactions: readonly SessionTransaction[];
  readonly critique?: readonly CritiqueFinding[];
  readonly exploration?: readonly ChangeManifestExploration[];
  readonly motionStoryboard?: Readonly<MotionStoryboard>;
}

export interface CreateChangeManifestOptions {
  readonly route: string;
  readonly sessionId: string;
  readonly targets: readonly ChangeManifestTarget[];
  readonly transactions: readonly SessionTransaction[];
  readonly critique?: readonly CritiqueFinding[];
  readonly exploration?: readonly ChangeManifestExploration[];
  readonly motionStoryboard?: Readonly<MotionStoryboard>;
}

const sortTargets = (
  targets: readonly ChangeManifestTarget[],
): readonly ChangeManifestTarget[] =>
  Object.freeze(
    [...targets].sort(
      (left, right) =>
        left.anchor.runtimeId.localeCompare(right.anchor.runtimeId) ||
        left.scope.localeCompare(right.scope),
    ),
  );

const sortTransactions = (
  transactions: readonly SessionTransaction[],
): readonly SessionTransaction[] =>
  Object.freeze(
    [...transactions].sort(
      (left, right) =>
        left.createdAt.localeCompare(right.createdAt) || left.id.localeCompare(right.id),
    ),
  );

const sortCritique = (
  critique: readonly CritiqueFinding[] | undefined,
): readonly CritiqueFinding[] | undefined =>
  critique
    ? Object.freeze(
        [...critique].sort(
          (left, right) =>
            left.category.localeCompare(right.category) ||
            left.severity.localeCompare(right.severity) ||
            left.id.localeCompare(right.id),
        ),
      )
    : undefined;

const sortExploration = (
  exploration: readonly ChangeManifestExploration[] | undefined,
): readonly ChangeManifestExploration[] | undefined =>
  exploration
    ? Object.freeze(
        [...exploration].sort(
          (left, right) =>
            left.directionId.localeCompare(right.directionId) ||
            left.title.localeCompare(right.title),
        ),
      )
    : undefined;

export const createChangeManifest = (
  options: CreateChangeManifestOptions,
): Readonly<ChangeManifest> =>
  Object.freeze({
    route: options.route,
    sessionId: options.sessionId,
    targets: sortTargets(options.targets),
    transactions: sortTransactions(options.transactions),
    critique: sortCritique(options.critique),
    exploration: sortExploration(options.exploration),
    motionStoryboard: options.motionStoryboard,
  });
