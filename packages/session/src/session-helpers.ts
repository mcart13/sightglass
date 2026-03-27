import {
  createEditOperation,
  createSessionTransaction,
  generateAnchor,
  type EditScope,
  type MutationEngineSnapshot,
  type SelectionAnchor,
  type SessionTransaction,
} from "@sightglass/core";
import type { ChangeManifestTarget } from "@sightglass/export";

const inferScopeFromSemanticKind = (
  semanticKind: MutationEngineSnapshot["applied"][number]["semanticKind"],
): EditScope => {
  if (semanticKind === "token") {
    return "token";
  }

  if (semanticKind === "component") {
    return "component";
  }

  return "single";
};

export const buildSessionTransactionsFromHistory = (
  history: Readonly<MutationEngineSnapshot>,
  createdAt: string,
): readonly SessionTransaction[] => {
  if (history.applied.length === 0) {
    return Object.freeze([]);
  }

  return Object.freeze(
    history.applied.map((appliedState, index) =>
      createSessionTransaction({
        id: `session-transaction-${createdAt}-${index + 1}`,
        scope: inferScopeFromSemanticKind(appliedState.semanticKind),
        targets: [generateAnchor(appliedState.target)],
        operations: [
          createEditOperation({
            id: `session-op-${index + 1}`,
            property: appliedState.property,
            before: appliedState.before,
            after: appliedState.after,
            semanticKind: appliedState.semanticKind,
          }),
        ],
        createdAt,
      }),
    ),
  );
};

export const buildChangeManifestTargets = (
  transactions: readonly SessionTransaction[],
  fallbackAnchor: SelectionAnchor | null,
  fallbackLabel = "Current selection",
): readonly ChangeManifestTarget[] => {
  if (transactions.length === 0) {
    return fallbackAnchor
      ? Object.freeze([
          {
            anchor: fallbackAnchor,
            scope: "single" as const,
            semanticLabel: fallbackLabel,
          },
        ])
      : Object.freeze([]);
  }

  const seen = new Set<string>();
  const targets: ChangeManifestTarget[] = [];

  for (const transaction of transactions) {
    for (const transactionTarget of transaction.targets) {
      const key = `${transaction.scope}:${transactionTarget.runtimeId}:${transactionTarget.selector}`;
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      targets.push({
        anchor: transactionTarget,
        scope: transaction.scope,
      });
    }
  }

  return Object.freeze(targets);
};
