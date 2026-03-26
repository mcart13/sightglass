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
  assertSessionTransaction,
  createEditOperation,
  createSessionTransaction,
  createTargetAnchor,
  isEditOperation,
  isSessionTransaction,
  isTargetAnchor,
} from "./contracts";
export {
  generateAnchor,
  generateAnchors,
  selectionInternals,
} from "./selection/generate-anchor.js";
export {
  createSelectionMatch,
  findBestElement,
  resolveBestElement,
} from "./selection/find-best-element.js";
export { findSimilarElements } from "./selection/find-similar-elements.js";
export { identifySelection } from "./selection/identify.js";
export { createMutationEngine } from "./mutation/mutation-engine.js";
export {
  createTextSession,
} from "./text/text-session.js";
export {
  restoreRichText,
  serializeRichText,
} from "./text/serialize-rich-text.js";
export type {
  SelectionAnchor,
} from "./selection/generate-anchor.js";
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
  ActiveTextEdit,
  TextEditStartInput,
  TextSession,
  TextSessionKeyEvent,
  TextSessionOptions,
} from "./text/text-session.js";
