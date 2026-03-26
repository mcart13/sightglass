import type {
  EditOperation,
  EditOperationInput,
  EditScope,
  EditSemanticKind,
  SessionTransaction,
  SessionTransactionInput,
  TargetAnchor,
  TargetAnchorInput,
} from "./types";

export const EDIT_SCOPES = [
  "single",
  "siblings",
  "similar",
  "component",
  "token",
] as const satisfies readonly EditScope[];

export const EDIT_SEMANTIC_KINDS = [
  "css",
  "token",
  "text",
  "layout",
  "component",
] as const satisfies readonly EditSemanticKind[];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isString = (value: unknown): value is string => typeof value === "string";

const isNullableString = (value: unknown): value is string | null =>
  typeof value === "string" || value === null;

const isStringArray = (value: unknown): value is readonly string[] =>
  Array.isArray(value) && value.every(isString);

const isOneOf = <T extends readonly string[]>(
  value: unknown,
  allowed: T,
): value is T[number] => isString(value) && allowed.includes(value);

const isIsoTimestamp = (value: unknown): value is string => {
  if (!isString(value)) {
    return false;
  }

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value;
};

const freezeStringArray = (value: readonly string[]): readonly string[] =>
  Object.freeze([...value]);

export const createTargetAnchor = (
  input: TargetAnchorInput,
): Readonly<TargetAnchor> =>
  Object.freeze({
    runtimeId: input.runtimeId,
    selector: input.selector,
    path: input.path,
    role: input.role,
    classes: freezeStringArray(input.classes),
  });

export const createEditOperation = (
  input: EditOperationInput,
): Readonly<EditOperation> =>
  Object.freeze({
    id: input.id,
    property: input.property,
    before: input.before,
    after: input.after,
    semanticKind: input.semanticKind,
  });

export const createSessionTransaction = (
  input: SessionTransactionInput,
): Readonly<SessionTransaction> =>
  Object.freeze({
    id: input.id,
    scope: input.scope,
    targets: Object.freeze(input.targets.map(createTargetAnchor)),
    operations: Object.freeze(input.operations.map(createEditOperation)),
    createdAt: input.createdAt,
  });

export const isTargetAnchor = (value: unknown): value is TargetAnchor => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isString(value.runtimeId) &&
    isString(value.selector) &&
    isString(value.path) &&
    isNullableString(value.role) &&
    isStringArray(value.classes)
  );
};

export const isEditOperation = (value: unknown): value is EditOperation => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isString(value.id) &&
    isString(value.property) &&
    isString(value.before) &&
    isString(value.after) &&
    isOneOf(value.semanticKind, EDIT_SEMANTIC_KINDS)
  );
};

export const isSessionTransaction = (
  value: unknown,
): value is SessionTransaction => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isString(value.id) &&
    isOneOf(value.scope, EDIT_SCOPES) &&
    Array.isArray(value.targets) &&
    value.targets.every(isTargetAnchor) &&
    Array.isArray(value.operations) &&
    value.operations.every(isEditOperation) &&
    isIsoTimestamp(value.createdAt)
  );
};

export const assertSessionTransaction = (
  value: unknown,
): Readonly<SessionTransaction> => {
  if (!isSessionTransaction(value)) {
    throw new TypeError("Invalid session transaction payload");
  }

  return createSessionTransaction(value);
};
