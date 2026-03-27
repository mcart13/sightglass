import {
  EDIT_SCOPES,
  EDIT_SEMANTIC_KINDS,
  generateAnchor,
  isIsoTimestamp,
  isNullableString,
  isOneOf,
  isRecord,
  isSessionTransaction,
  isString,
  isStringArray,
  isTargetAnchor,
  type MutationEngineSnapshot,
  type SelectionAnchor,
} from "@sightglass/core";
import {
  CRITIQUE_CATEGORIES,
  CRITIQUE_PERSPECTIVES,
  CRITIQUE_SCOPES,
  CRITIQUE_SEVERITIES,
  DESIGN_DIRECTION_IDS,
  type CritiqueCategory,
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
  readonly motionValues: Readonly<
    Partial<Record<MotionTuningControlId, number>>
  >;
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

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isBoolean = (value: unknown): value is boolean =>
  typeof value === "boolean";

const isSelectionAnchor = (value: unknown): value is SelectionAnchor =>
  isRecord(value) &&
  isTargetAnchor(value) &&
  isFiniteNumber(value.confidence) &&
  isStringArray(value.alternates);

const isStoredAppliedState = (value: unknown): value is StoredAppliedState =>
  isRecord(value) &&
  isSelectionAnchor(value.anchor) &&
  isString(value.property) &&
  isOneOf(value.semanticKind, EDIT_SEMANTIC_KINDS) &&
  isString(value.before) &&
  isString(value.beforeInline) &&
  isString(value.beforeComputed) &&
  isString(value.after);

const isStoredHistorySnapshot = (
  value: unknown
): value is Readonly<StoredHistorySnapshot> =>
  isRecord(value) &&
  Array.isArray(value.applied) &&
  value.applied.every(isStoredAppliedState) &&
  isBoolean(value.canUndo) &&
  isBoolean(value.canRedo);

const isReviewDraftSnapshotValue = (
  value: unknown
): value is Readonly<ReviewDraftSnapshot> =>
  isRecord(value) &&
  isOneOf(value.critiquePerspective, CRITIQUE_PERSPECTIVES) &&
  isOneOf(value.critiqueScope, CRITIQUE_SCOPES) &&
  isNullableString(value.selectedFindingId) &&
  isNullableString(value.selectedDirectionId) &&
  isRecord(value.motionValues) &&
  !Array.isArray(value.motionValues) &&
  Object.values(value.motionValues).every(isFiniteNumber);

const isManifestTarget = (value: unknown): boolean =>
  isRecord(value) &&
  isTargetAnchor(value.anchor) &&
  isOneOf(value.scope, EDIT_SCOPES) &&
  (value.semanticLabel === undefined || isString(value.semanticLabel));

const isCritiqueCategoryArray = (
  value: unknown
): value is readonly CritiqueCategory[] =>
  Array.isArray(value) &&
  value.every((entry) => isOneOf(entry, CRITIQUE_CATEGORIES));

const isCritiqueFinding = (value: unknown): boolean =>
  isRecord(value) &&
  isString(value.id) &&
  isOneOf(value.category, CRITIQUE_CATEGORIES) &&
  isOneOf(value.severity, CRITIQUE_SEVERITIES) &&
  isTargetAnchor(value.target) &&
  isString(value.title) &&
  isString(value.observation) &&
  isString(value.impact) &&
  isString(value.recommendation) &&
  isString(value.sourceLens);

const isMotionSignals = (value: unknown): boolean =>
  isRecord(value) &&
  isFiniteNumber(value.durationMs) &&
  isBoolean(value.hasReducedMotionGuard) &&
  isBoolean(value.hasTransitionAll) &&
  isStringArray(value.layoutAffectingProperties);

const isCritiqueContext = (value: unknown): boolean =>
  isRecord(value) &&
  isString(value.route) &&
  isOneOf(value.scope, CRITIQUE_SCOPES) &&
  isString(value.scopeLabel) &&
  isNullableString(value.pageTitle) &&
  isNullableString(value.sectionLabel) &&
  isStringArray(value.selectedClasses) &&
  isFiniteNumber(value.cardCount) &&
  isFiniteNumber(value.interactiveCount) &&
  isFiniteNumber(value.matchingActionCount) &&
  isBoolean(value.missingDocumentLanguage) &&
  isBoolean(value.hasSectionHeading) &&
  isMotionSignals(value.motionSignals);

const isCritiqueGroups = (value: unknown): boolean =>
  isRecord(value) &&
  CRITIQUE_CATEGORIES.every((category) => {
    const findings = value[category];
    return Array.isArray(findings) && findings.every(isCritiqueFinding);
  });

const isCritiqueReportValue = (
  value: unknown
): value is Readonly<CritiqueReport> =>
  isRecord(value) &&
  isCritiqueContext(value.context) &&
  Array.isArray(value.findings) &&
  value.findings.every(isCritiqueFinding) &&
  isCritiqueGroups(value.groupedFindings) &&
  isOneOf(value.perspective, CRITIQUE_PERSPECTIVES) &&
  isOneOf(value.scope, CRITIQUE_SCOPES);

const isDesignDirectionValue = (
  value: unknown
): value is Readonly<DesignDirection> =>
  isRecord(value) &&
  isOneOf(value.id, DESIGN_DIRECTION_IDS) &&
  isString(value.title) &&
  isString(value.visualThesis) &&
  isString(value.contentPlan) &&
  isString(value.interactionThesis) &&
  isStringArray(value.findingIds) &&
  isCritiqueCategoryArray(value.focusCategories) &&
  isFiniteNumber(value.priorityScore);

const isMotionStoryboardStep = (value: unknown): boolean =>
  isRecord(value) &&
  isString(value.id) &&
  isString(value.title) &&
  isString(value.description) &&
  isFiniteNumber(value.durationMs) &&
  isOneOf(value.emphasis, [
    "enter",
    "settle",
    "exit",
    "reduced-motion",
  ] as const);

const isMotionStoryboardValue = (
  value: unknown
): value is Readonly<MotionStoryboard> =>
  isRecord(value) &&
  isOneOf(value.pipelineTier, ["compositor-safe", "layout-risk"] as const) &&
  isStringArray(value.warnings) &&
  isStringArray(value.reducedMotionNotes) &&
  Array.isArray(value.steps) &&
  value.steps.every(isMotionStoryboardStep);

const isMotionTuningControl = (value: unknown): boolean =>
  isRecord(value) &&
  isString(value.id) &&
  isString(value.label) &&
  isFiniteNumber(value.min) &&
  isFiniteNumber(value.max) &&
  isFiniteNumber(value.step) &&
  isFiniteNumber(value.defaultValue) &&
  isFiniteNumber(value.recommendedValue) &&
  isString(value.unit) &&
  isString(value.guidance);

const isMotionTuningSchemaValue = (
  value: unknown
): value is Readonly<MotionTuningSchema> =>
  isRecord(value) &&
  Array.isArray(value.controls) &&
  value.controls.every(isMotionTuningControl) &&
  isStringArray(value.performanceNotes) &&
  isStringArray(value.reducedMotionNotes);

const isChangeManifestValue = (
  value: unknown
): value is Readonly<ChangeManifest> =>
  isRecord(value) &&
  isString(value.route) &&
  isString(value.sessionId) &&
  Array.isArray(value.targets) &&
  value.targets.every(isManifestTarget) &&
  Array.isArray(value.transactions) &&
  value.transactions.every(isSessionTransaction);

const isReviewArtifactValue = (
  value: unknown
): value is Readonly<ReviewArtifact> =>
  isRecord(value) &&
  isString(value.route) &&
  isString(value.sessionId) &&
  (value.beforeScreenshot === null || isString(value.beforeScreenshot)) &&
  (value.afterScreenshot === null || isString(value.afterScreenshot)) &&
  isFiniteNumber(value.transactionCount) &&
  isRecord(value.critiqueSummary) &&
  isFiniteNumber(value.critiqueSummary.totalFindings) &&
  isStringArray(value.critiqueSummary.categories) &&
  isStringArray(value.critiqueSummary.highlights) &&
  isRecord(value.exploration) &&
  isString(value.exploration.route) &&
  isFiniteNumber(value.exploration.directionCount) &&
  isStringArray(value.exploration.directions) &&
  isFiniteNumber(value.exploration.operationCount) &&
  isString(value.prompt);

const toStoredAppliedState = (
  state: MutationEngineSnapshot["applied"][number]
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
  history: Readonly<MutationEngineSnapshot>
): Readonly<StoredHistorySnapshot> =>
  Object.freeze({
    applied: Object.freeze(history.applied.map(toStoredAppliedState)),
    canUndo: history.canUndo,
    canRedo: history.canRedo,
  });

export const createReviewDraftSnapshot = (
  draft: ReviewDraftSnapshot
): Readonly<ReviewDraftSnapshot> =>
  Object.freeze({
    critiquePerspective: draft.critiquePerspective,
    critiqueScope: draft.critiqueScope,
    selectedFindingId: draft.selectedFindingId,
    selectedDirectionId: draft.selectedDirectionId,
    motionValues: Object.freeze({ ...draft.motionValues }),
  });

export const isSessionRecord = (
  value: unknown
): value is Readonly<SessionRecord> =>
  isRecord(value) &&
  isString(value.id) &&
  isString(value.name) &&
  isString(value.route) &&
  isIsoTimestamp(value.createdAt) &&
  isIsoTimestamp(value.updatedAt) &&
  isChangeManifestValue(value.manifest) &&
  isStoredHistorySnapshot(value.history) &&
  isCritiqueReportValue(value.critiqueReport) &&
  Array.isArray(value.directions) &&
  value.directions.every(isDesignDirectionValue) &&
  isMotionStoryboardValue(value.motionStoryboard) &&
  isMotionTuningSchemaValue(value.motionTuningSchema) &&
  isReviewDraftSnapshotValue(value.reviewDraft) &&
  isReviewArtifactValue(value.reviewArtifact);

export const assertSessionRecord = (
  value: unknown
): Readonly<SessionRecord> => {
  if (!isSessionRecord(value)) {
    throw new Error("Invalid Sightglass session payload.");
  }

  return value;
};

export const createSessionRecord = (
  options: CreateSessionRecordOptions
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
