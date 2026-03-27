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
import {
  createTextSession,
  type TextSession,
  type ActiveTextEdit,
} from "./text/text-session.js";
import { generateAnchor } from "./selection/generate-anchor.js";
import { createSessionTransaction } from "./contracts.js";
import type { EditSemanticKind, SessionTransaction } from "./types.js";

export interface SightglassSessionSnapshot {
  readonly active: boolean;
  readonly selectedElement: Element | null;
  readonly selection: Readonly<SelectionResult>;
  readonly history: Readonly<MutationEngineSnapshot>;
  readonly isEditingText: boolean;
}

export interface SightglassController {
  destroy(): void;
  subscribe(listener: () => void): () => void;
  getSnapshot(): Readonly<SightglassSessionSnapshot>;
  setActive(active: boolean): void;
  inspectAtPoint(point: SelectionPoint): void;
  apply(
    transaction: Readonly<SessionTransaction>
  ): Promise<Readonly<MutationEngineSnapshot>>;
  undo(): Promise<Readonly<MutationEngineSnapshot>>;
  redo(): Promise<Readonly<MutationEngineSnapshot>>;
  applyStyleToSelected(
    property: string,
    value: string,
    semanticKind?: EditSemanticKind
  ): Promise<Readonly<MutationEngineSnapshot>>;
  startTextEdit(): void;
  commitTextEdit(): Promise<void>;
  cancelTextEdit(): void;
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
  selection: SelectionResult
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
  previous?: Readonly<SightglassSessionSnapshot>
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
    isEditingText: previous?.isEditingText ?? false,
    ...overrides,
  });

export const createSightglassController = (
  options: CreateSightglassControllerOptions
): SightglassController => {
  const mutationEngine =
    options.mutationEngine ??
    createMutationEngine({
      resolveTargets: createResolveTargets(options.document),
    });
  const textSession = createTextSession({ engine: mutationEngine });
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
    destroy() {
      const edit = textSession.current();
      if (edit) {
        edit.target.removeAttribute("contenteditable");
        textSession.cancelTextEdit();
      }
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

      if (!active && textSession.current()) {
        const edit = textSession.current()!;
        edit.target.removeAttribute("contenteditable");
        textSession.cancelTextEdit();
        updateSnapshot({ active, isEditingText: false });
        return;
      }

      updateSnapshot({ active });
    },

    inspectAtPoint(point) {
      if (textSession.current()) {
        const edit = textSession.current()!;
        edit.target.removeAttribute("contenteditable");
        textSession.cancelTextEdit();
      }

      const selectedElement = resolveBestElement(options.document, point);
      const selection = identifySelection(
        options.document,
        point,
        selectedElement
      );

      updateSnapshot({
        selectedElement,
        selection: toReadonlySelection(selection),
        isEditingText: false,
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

    startTextEdit() {
      const el = snapshot.selectedElement;
      if (!el || textSession.current()) return;
      const anchor = generateAnchor(el);
      textSession.startTextEdit({ target: el, anchor });
      el.setAttribute("contenteditable", "plaintext-only");
      if (el instanceof HTMLElement) {
        el.focus();
      }
      updateSnapshot({ isEditingText: true });
    },

    async commitTextEdit() {
      const edit = textSession.current();
      if (!edit) return;
      edit.target.removeAttribute("contenteditable");
      const history = await textSession.commitTextEdit();
      updateSnapshot({ isEditingText: false, history });
    },

    cancelTextEdit() {
      const edit = textSession.current();
      if (!edit) return;
      edit.target.removeAttribute("contenteditable");
      textSession.cancelTextEdit();
      updateSnapshot({ isEditingText: false });
    },

    async applyStyleToSelected(property, value, semanticKind = "css") {
      const el = snapshot.selectedElement;
      if (!el) return snapshot.history;

      const anchor = generateAnchor(el);
      const transaction = createSessionTransaction({
        id: `style-${Date.now().toString(36)}-${Math.random()
          .toString(36)
          .slice(2, 6)}`,
        scope: "single",
        targets: [anchor],
        operations: [
          {
            id: `op-${Date.now().toString(36)}`,
            property,
            before: getComputedStyle(el).getPropertyValue(property),
            after: value,
            semanticKind,
          },
        ],
        createdAt: new Date().toISOString(),
      });

      const history = await mutationEngine.apply(transaction);
      updateSnapshot({ history });
      return history;
    },
  };
};
