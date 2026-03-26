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

export interface TargetAnchorInput {
  readonly runtimeId: string;
  readonly selector: string;
  readonly path: string;
  readonly role: string | null;
  readonly classes: readonly string[];
}

export interface EditOperationInput {
  readonly id: string;
  readonly property: string;
  readonly before: string;
  readonly after: string;
  readonly semanticKind: EditSemanticKind;
}

export interface SessionTransactionInput {
  readonly id: string;
  readonly scope: EditScope;
  readonly targets: readonly TargetAnchorInput[];
  readonly operations: readonly EditOperationInput[];
  readonly createdAt: string;
}
