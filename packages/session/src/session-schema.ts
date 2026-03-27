import {
  generateAnchor,
  type MutationEngineSnapshot,
  type SelectionAnchor,
} from "@sightglass/core";
import type {
  CritiquePerspective,
  CritiqueReport,
  CritiqueScope,
  DesignDirection,
  MotionStoryboard,
  MotionTuningControlId,
  MotionTuningSchema,
} from "@sightglass/critique";
import type { ChangeManifest, ReviewArtifact } from "@sightglass/export";

export interface StoredAppliedState {
  readonly anchor: Readonly<SelectionAnchor>;
  readonly property: string;
  readonly semanticKind: string;
  readonly before: string;
  readonly beforeInline: string;
  readonly beforeComputed: string;
  readonly after: string;
}

export interface StoredHistorySnapshot {
  readonly applied: readonly StoredAppliedState[];
  readonly canUndo: boolean;
  readonly canRedo: boolean;
}

export interface ReviewDraftSnapshot {
  readonly critiquePerspective: CritiquePerspective;
  readonly critiqueScope: CritiqueScope;
  readonly selectedFindingId: string | null;
  readonly selectedDirectionId: string | null;
  readonly motionValues: Readonly<Partial<Record<MotionTuningControlId, number>>>;
}

export interface SessionRecord {
  readonly id: string;
  readonly name: string;
  readonly route: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly manifest: Readonly<ChangeManifest>;
  readonly history: Readonly<StoredHistorySnapshot>;
  readonly critiqueReport: Readonly<CritiqueReport>;
  readonly directions: readonly DesignDirection[];
  readonly motionStoryboard: Readonly<MotionStoryboard>;
  readonly motionTuningSchema: Readonly<MotionTuningSchema>;
  readonly reviewDraft: Readonly<ReviewDraftSnapshot>;
  readonly reviewArtifact: Readonly<ReviewArtifact>;
}

export interface CreateSessionRecordOptions {
  readonly id: string;
  readonly name: string;
  readonly route: string;
  readonly manifest: Readonly<ChangeManifest>;
  readonly history: Readonly<StoredHistorySnapshot>;
  readonly critiqueReport: Readonly<CritiqueReport>;
  readonly directions: readonly DesignDirection[];
  readonly motionStoryboard: Readonly<MotionStoryboard>;
  readonly motionTuningSchema: Readonly<MotionTuningSchema>;
  readonly reviewDraft: Readonly<ReviewDraftSnapshot>;
  readonly reviewArtifact: Readonly<ReviewArtifact>;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

const toStoredAppliedState = (
  state: MutationEngineSnapshot["applied"][number],
): StoredAppliedState =>
  Object.freeze({
    anchor: generateAnchor(state.target),
    property: state.property,
    semanticKind: state.semanticKind,
    before: state.before,
    beforeInline: state.beforeInline,
    beforeComputed: state.beforeComputed,
    after: state.after,
  });

export const serializeHistorySnapshot = (
  history: Readonly<MutationEngineSnapshot>,
): Readonly<StoredHistorySnapshot> =>
  Object.freeze({
    applied: Object.freeze(history.applied.map(toStoredAppliedState)),
    canUndo: history.canUndo,
    canRedo: history.canRedo,
  });

export const createReviewDraftSnapshot = (
  draft: ReviewDraftSnapshot,
): Readonly<ReviewDraftSnapshot> =>
  Object.freeze({
    critiquePerspective: draft.critiquePerspective,
    critiqueScope: draft.critiqueScope,
    selectedFindingId: draft.selectedFindingId,
    selectedDirectionId: draft.selectedDirectionId,
    motionValues: Object.freeze({ ...draft.motionValues }),
  });

export const createSessionRecord = (
  options: CreateSessionRecordOptions,
): Readonly<SessionRecord> => {
  const timestamp = options.updatedAt ?? new Date().toISOString();

  return Object.freeze({
    id: options.id,
    name: options.name,
    route: options.route,
    createdAt: options.createdAt ?? timestamp,
    updatedAt: timestamp,
    manifest: options.manifest,
    history: options.history,
    critiqueReport: options.critiqueReport,
    directions: Object.freeze([...options.directions]),
    motionStoryboard: options.motionStoryboard,
    motionTuningSchema: options.motionTuningSchema,
    reviewDraft: createReviewDraftSnapshot(options.reviewDraft),
    reviewArtifact: options.reviewArtifact,
  });
};
