import type { AppliedTargetState } from "./style-capture";

export interface MutationStateRecord extends AppliedTargetState {
  readonly key: string;
  readonly sessionId: string;
  readonly operationId: string;
  after: string;
  status: "active" | "undone" | "discarded";
}

export interface MutationCommandRecord {
  readonly id: string;
  readonly sessionId: string;
  readonly createdAt: string;
  readonly states: MutationStateRecord[];
}

export interface MutationHistorySnapshot {
  readonly applied: readonly AppliedTargetState[];
  readonly canUndo: boolean;
  readonly canRedo: boolean;
}

const toReadonlyAppliedState = (
  state: AppliedTargetState,
): Readonly<AppliedTargetState> =>
  Object.freeze({
    target: state.target,
    property: state.property,
    semanticKind: state.semanticKind,
    before: state.before,
    beforeInline: state.beforeInline,
    beforeComputed: state.beforeComputed,
    after: state.after,
  });

export class MutationHistoryStore {
  private readonly commands: MutationCommandRecord[] = [];

  private readonly doneCommands: MutationCommandRecord[] = [];

  private readonly undoneCommands: MutationCommandRecord[] = [];

  record(command: MutationCommandRecord): void {
    this.commands.push(command);
    this.doneCommands.push(command);
    this.undoneCommands.splice(0, this.undoneCommands.length);
  }

  undo(): boolean {
    for (let index = this.doneCommands.length - 1; index >= 0; index -= 1) {
      const command = this.doneCommands[index];
      if (!command.states.some((state) => state.status === "active")) {
        continue;
      }

      for (const state of command.states) {
        if (state.status === "active") {
          state.status = "undone";
        }
      }

      this.doneCommands.splice(index, 1);
      this.undoneCommands.push(command);
      return true;
    }

    return false;
  }

  redo(): boolean {
    for (let index = this.undoneCommands.length - 1; index >= 0; index -= 1) {
      const command = this.undoneCommands[index];
      if (!command.states.some((state) => state.status === "undone")) {
        continue;
      }

      for (const state of command.states) {
        if (state.status === "undone") {
          state.status = "active";
        }
      }

      this.undoneCommands.splice(index, 1);
      this.doneCommands.push(command);
      return true;
    }

    return false;
  }

  revertProperty(property: string): boolean {
    return this.discardStates((state) => state.property === property);
  }

  revertSession(sessionId: string): boolean {
    return this.discardStates((state) => state.sessionId === sessionId);
  }

  pruneDisconnectedTargets(): boolean {
    return this.discardStates((state) => !state.target.isConnected);
  }

  getDesiredWrites(): readonly {
    readonly key: string;
    readonly target: Element;
    readonly property: string;
    readonly semanticKind: MutationStateRecord["semanticKind"];
    readonly value: string;
  }[] {
    const baselines = new Map<string, MutationStateRecord>();
    const activeStates = new Map<string, MutationStateRecord>();

    for (const command of this.commands) {
      for (const state of command.states) {
        if (!baselines.has(state.key)) {
          baselines.set(state.key, state);
        }

        if (state.status === "active") {
          activeStates.set(state.key, state);
        }
      }
    }

    return Array.from(baselines.entries(), ([key, baseline]) => {
      const active = activeStates.get(key);

      return {
        key,
        target: baseline.target,
        property: baseline.property,
        semanticKind: baseline.semanticKind,
        value: active ? active.after : baseline.beforeInline,
      };
    });
  }

  snapshot(): Readonly<MutationHistorySnapshot> {
    const appliedByKey = new Map<string, MutationStateRecord>();

    for (const command of this.commands) {
      for (const state of command.states) {
        if (state.status === "active") {
          appliedByKey.set(state.key, state);
        }
      }
    }

    return Object.freeze({
      applied: Object.freeze(
        Array.from(appliedByKey.values(), (state) => toReadonlyAppliedState(state)),
      ),
      canUndo: this.doneCommands.some((command) =>
        command.states.some((state) => state.status === "active"),
      ),
      canRedo: this.undoneCommands.some((command) =>
        command.states.some((state) => state.status === "undone"),
      ),
    });
  }

  private discardStates(
    predicate: (state: MutationStateRecord) => boolean,
  ): boolean {
    let changed = false;

    for (const command of this.commands) {
      for (const state of command.states) {
        if (state.status === "discarded" || !predicate(state)) {
          continue;
        }

        state.status = "discarded";
        changed = true;
      }
    }

    return changed;
  }
}
