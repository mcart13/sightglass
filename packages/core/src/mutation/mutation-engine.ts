import type { SessionTransaction } from "../types";
import {
  MutationHistoryStore,
  type MutationCommandRecord,
  type MutationHistorySnapshot,
  type MutationStateRecord,
} from "./history-store";
import {
  captureAppliedTargetState,
  flushStyleWrites,
  type AppliedTargetState,
} from "./style-capture";

export type { AppliedTargetState } from "./style-capture";

export type MutationEngineSnapshot = MutationHistorySnapshot;

export interface MutationEngine {
  apply(
    transaction: Readonly<SessionTransaction>,
  ): Promise<Readonly<MutationEngineSnapshot>>;
  undo(): Promise<Readonly<MutationEngineSnapshot>>;
  redo(): Promise<Readonly<MutationEngineSnapshot>>;
  revertProperty(property: string): Promise<Readonly<MutationEngineSnapshot>>;
  revertSession(sessionId: string): Promise<Readonly<MutationEngineSnapshot>>;
  snapshot(): Readonly<MutationEngineSnapshot>;
}

export interface MutationEngineOptions {
  readonly resolveTargets: (
    transaction: Readonly<SessionTransaction>,
  ) => readonly Element[] | Iterable<Element>;
  readonly scheduleFrame?: (callback: FrameRequestCallback) => number;
}

const runImmediately = (callback: FrameRequestCallback): number => {
  callback(0);
  return 0;
};

const isElementNode = (value: unknown): value is Element =>
  typeof value === "object" &&
  value !== null &&
  "nodeType" in value &&
  (value as { nodeType: unknown }).nodeType === 1;

export const createMutationEngine = (
  options: MutationEngineOptions,
): MutationEngine => {
  const history = new MutationHistoryStore();
  const scheduleFrame =
    options.scheduleFrame ?? globalThis.requestAnimationFrame ?? runImmediately;
  const targetIds = new WeakMap<Element, string>();
  let nextTargetId = 1;

  const getTargetId = (target: Element): string => {
    const existing = targetIds.get(target);
    if (existing) {
      return existing;
    }

    const assigned = `target-${nextTargetId}`;
    nextTargetId += 1;
    targetIds.set(target, assigned);
    return assigned;
  };

  const syncDom = async (): Promise<Readonly<MutationEngineSnapshot>> => {
    history.pruneDisconnectedTargets();
    await flushStyleWrites(history.getDesiredWrites(), scheduleFrame);
    return history.snapshot();
  };

  const createCommand = (
    transaction: Readonly<SessionTransaction>,
  ): MutationCommandRecord => {
    const statesByKey = new Map<string, MutationStateRecord>();

    for (const target of options.resolveTargets(transaction)) {
      if (!isElementNode(target) || !target.isConnected) {
        continue;
      }

      const targetId = getTargetId(target);

      for (const operation of transaction.operations) {
        const key = `${targetId}::${operation.semanticKind}::${operation.property}`;
        const existing = statesByKey.get(key);

        if (existing) {
          existing.after = operation.after;
          continue;
        }

        const captured = captureAppliedTargetState(target, operation);

        statesByKey.set(key, {
          ...captured,
          key,
          sessionId: transaction.id,
          operationId: operation.id,
          status: "active",
        });
      }
    }

    return {
      id: transaction.id,
      sessionId: transaction.id,
      createdAt: transaction.createdAt,
      states: Array.from(statesByKey.values()),
    };
  };

  return {
    async apply(transaction) {
      const command = createCommand(transaction);
      if (command.states.length === 0) {
        return history.snapshot();
      }

      history.record(command);
      return syncDom();
    },

    async undo() {
      history.undo();
      return syncDom();
    },

    async redo() {
      history.redo();
      return syncDom();
    },

    async revertProperty(property) {
      history.revertProperty(property);
      return syncDom();
    },

    async revertSession(sessionId) {
      history.revertSession(sessionId);
      return syncDom();
    },

    snapshot() {
      history.pruneDisconnectedTargets();
      return history.snapshot();
    },
  };
};
