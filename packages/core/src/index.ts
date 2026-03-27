export type {
  EditOperation,
  EditOperationInput,
  EditScope,
  EditSemanticKind,
  SessionTransaction,
  SessionTransactionInput,
  TargetAnchor,
  TargetAnchorInput,
} from "./types";
export {
  EDIT_SCOPES,
  EDIT_SEMANTIC_KINDS,
  ISO_TIMESTAMP_PATTERN,
  assertSessionTransaction,
  createEditOperation,
  createSessionTransaction,
  createTargetAnchor,
  isEditOperation,
  isIsoTimestamp,
  isNullableString,
  isOneOf,
  isRecord,
  isSessionTransaction,
  isString,
  isStringArray,
  isTargetAnchor,
} from "./contracts";
export {
  generateAnchor,
  generateAnchors,
  selectionInternals,
} from "./selection/generate-anchor.js";
export {
  INTERACTIVE_SELECTOR,
  createSelectionMatch,
  resolveBestElement,
} from "./selection/find-best-element.js";
export { findSimilarElements } from "./selection/find-similar-elements.js";
export { identifySelection } from "./selection/identify.js";

/** @deprecated Use `identifySelection(document, point).best` instead. */
export { findBestElement } from "./selection/find-best-element.js";
export {
  analyzeSemanticContext,
  resolveScopeOptions,
} from "./analyze/scope-resolver.js";
export {
  describeComponentSignature,
  detectComponentMatch,
} from "./analyze/component-detector.js";
export { detectTokenCandidates } from "./analyze/token-detector.js";
export { createMutationEngine } from "./mutation/mutation-engine.js";
export { createTextSession } from "./text/text-session.js";
export {
  restoreRichText,
  serializeRichText,
} from "./text/serialize-rich-text.js";
export { createSightglassController } from "./controller.js";
export type {
  ComponentMatch,
  ComponentSignature,
} from "./analyze/component-detector.js";
export type {
  ScopeOption,
  SemanticAnalysis,
} from "./analyze/scope-resolver.js";
export type {
  SemanticTokenCandidate,
  SemanticTokenKind,
} from "./analyze/token-detector.js";
export type { SelectionAnchor } from "./selection/generate-anchor.js";
export type {
  SelectionMatch,
  SelectionPoint,
} from "./selection/find-best-element.js";
export type {
  AppliedTargetState,
  MutationEngine,
  MutationEngineOptions,
  MutationEngineSnapshot,
} from "./mutation/mutation-engine.js";
export type { SelectionResult } from "./selection/identify.js";
export type {
  SightglassController,
  SightglassSessionSnapshot,
  CreateSightglassControllerOptions,
} from "./controller.js";
export type {
  ActiveTextEdit,
  TextEditStartInput,
  TextSession,
  TextSessionKeyEvent,
  TextSessionOptions,
} from "./text/text-session.js";
