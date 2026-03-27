export type EditScope =
  | "single"
  | "siblings"
  | "similar"
  | "component"
  | "token";

export type EditSemanticKind =
  | "css"
  | "token"
  | "text"
  | "layout"
  | "component";

export interface TargetAnchor {
  readonly runtimeId: string;
  readonly selector: string;
  readonly path: string;
  readonly role: string | null;
  readonly classes: readonly string[];
}

export interface EditOperation {
  readonly id: string;
  readonly property: string;
  readonly before: string;
  readonly after: string;
  readonly semanticKind: EditSemanticKind;
}

export interface SessionTransaction {
  readonly id: string;
  readonly scope: EditScope;
  readonly targets: readonly TargetAnchor[];
  readonly operations: readonly EditOperation[];
  readonly createdAt: string;
}

/** @deprecated Use TargetAnchor directly */
export type TargetAnchorInput = TargetAnchor;

/** @deprecated Use EditOperation directly */
export type EditOperationInput = EditOperation;

/** @deprecated Use SessionTransaction directly */
export type SessionTransactionInput = SessionTransaction;
