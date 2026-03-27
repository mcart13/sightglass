import {
  identifySelection,
  type SelectionResult,
} from "./selection/identify.js";
import {
  resolveBestElement,
  type SelectionPoint,
} from "./selection/find-best-element.js";
import {
  createMutationEngine,
  type MutationEngine,
  type MutationEngineSnapshot,
} from "./mutation/mutation-engine.js";
import type { SessionTransaction } from "./types.js";

export interface SightglassSessionSnapshot {
  readonly active: boolean;
  readonly selectedElement: Element | null;
  readonly selection: Readonly<SelectionResult>;
  readonly history: Readonly<MutationEngineSnapshot>;
}

export interface SightglassController {
  mount(): void;
  destroy(): void;
  subscribe(listener: () => void): () => void;
  getSnapshot(): Readonly<SightglassSessionSnapshot>;
  setActive(active: boolean): void;
  inspectAtPoint(point: SelectionPoint): void;
  apply(
    transaction: Readonly<SessionTransaction>,
  ): Promise<Readonly<MutationEngineSnapshot>>;
  undo(): Promise<Readonly<MutationEngineSnapshot>>;
  redo(): Promise<Readonly<MutationEngineSnapshot>>;
}

export interface CreateSightglassControllerOptions {
  readonly document: Document;
  readonly mutationEngine?: MutationEngine;
}

const emptySelection = (): Readonly<SelectionResult> =>
  Object.freeze({
    best: null,
    similar: Object.freeze([]),
  });

const toReadonlySelection = (
  selection: SelectionResult,
): Readonly<SelectionResult> =>
  Object.freeze({
    best: selection.best,
    similar: Object.freeze([...selection.similar]),
  });

const createResolveTargets = (document: Document) => {
  return (transaction: Readonly<SessionTransaction>): readonly Element[] => {
    const targets = new Set<Element>();

    for (const anchor of transaction.targets) {
      let matches: Element[];

      try {
        matches = Array.from(document.querySelectorAll(anchor.selector));
      } catch {
        continue;
      }

      for (const match of matches) {
        targets.add(match);
      }
    }

    return Array.from(targets);
  };
};

const createSnapshot = (
  overrides: Partial<SightglassSessionSnapshot>,
  previous?: Readonly<SightglassSessionSnapshot>,
): Readonly<SightglassSessionSnapshot> =>
  Object.freeze({
    active: previous?.active ?? false,
    selectedElement: previous?.selectedElement ?? null,
    selection: previous?.selection ?? emptySelection(),
    history:
      previous?.history ??
      Object.freeze({
        applied: Object.freeze([]),
        canUndo: false,
        canRedo: false,
      }),
    ...overrides,
  });

export const createSightglassController = (
  options: CreateSightglassControllerOptions,
): SightglassController => {
  const mutationEngine =
    options.mutationEngine ??
    createMutationEngine({
      resolveTargets: createResolveTargets(options.document),
    });
  const listeners = new Set<() => void>();
  let snapshot = createSnapshot({
    history: mutationEngine.snapshot(),
  });

  const emit = () => {
    for (const listener of listeners) {
      listener();
    }
  };

  const updateSnapshot = (overrides: Partial<SightglassSessionSnapshot>) => {
    snapshot = createSnapshot(overrides, snapshot);
    emit();
  };

  return {
    mount() {},

    destroy() {
      listeners.clear();
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    getSnapshot() {
      return snapshot;
    },

    setActive(active) {
      if (snapshot.active === active) {
        return;
      }

      updateSnapshot({ active });
    },

    inspectAtPoint(point) {
      const selectedElement = resolveBestElement(options.document, point);
      const selection = identifySelection(options.document, point);

      updateSnapshot({
        selectedElement,
        selection: toReadonlySelection(selection),
      });
    },

    async apply(transaction) {
      const history = await mutationEngine.apply(transaction);
      updateSnapshot({ history });
      return history;
    },

    async undo() {
      const history = await mutationEngine.undo();
      updateSnapshot({ history });
      return history;
    },

    async redo() {
      const history = await mutationEngine.redo();
      updateSnapshot({ history });
      return history;
    },
  };
};
