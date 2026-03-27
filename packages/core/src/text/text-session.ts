import { createSessionTransaction } from "../contracts";
import type { TargetAnchor } from "../types";
import type {
  MutationEngine,
  MutationEngineSnapshot,
} from "../mutation/mutation-engine";
import { restoreRichText, serializeRichText } from "./serialize-rich-text";

export interface TextSessionOptions {
  readonly engine: MutationEngine;
  readonly createSessionId?: () => string;
  readonly now?: () => string;
}

export interface TextEditStartInput {
  readonly target: Element;
  readonly anchor: Readonly<TargetAnchor>;
  readonly sessionId?: string;
  readonly createdAt?: string;
}

export interface ActiveTextEdit {
  readonly sessionId: string;
  readonly createdAt: string;
  readonly target: Element;
  readonly anchor: Readonly<TargetAnchor>;
  readonly beforeMarkup: string;
}

export interface TextSessionKeyEvent {
  readonly key: string;
  preventDefault?(): void;
  stopPropagation?(): void;
}

export interface TextSession {
  current(): Readonly<ActiveTextEdit> | null;
  startTextEdit(input: TextEditStartInput): Readonly<ActiveTextEdit>;
  commitTextEdit(): Promise<Readonly<MutationEngineSnapshot>>;
  cancelTextEdit(): Readonly<ActiveTextEdit> | null;
  handleKeyDown(event: TextSessionKeyEvent): Promise<"cancel" | "noop">;
}

let fallbackSessionSequence = 0;

const createFallbackSessionId = (): string => {
  const randomId = globalThis.crypto?.randomUUID?.();
  if (randomId) {
    return `text-session-${randomId}`;
  }

  const sequence = fallbackSessionSequence.toString(36);
  fallbackSessionSequence += 1;
  return `text-session-${Date.now().toString(36)}-${sequence}`;
};

export const createTextSession = (
  options: TextSessionOptions,
): TextSession => {
  let activeEdit: Readonly<ActiveTextEdit> | null = null;

  const clearActiveEdit = (): Readonly<ActiveTextEdit> => {
    if (!activeEdit) {
      throw new Error("No active text edit");
    }

    const currentEdit = activeEdit;
    activeEdit = null;
    return currentEdit;
  };

  const cancelActiveEdit = (): Readonly<ActiveTextEdit> | null => {
    if (!activeEdit) {
      return null;
    }

    const currentEdit = clearActiveEdit();
    restoreRichText(currentEdit.target, currentEdit.beforeMarkup);
    return currentEdit;
  };

  const commitActiveEdit = async (): Promise<Readonly<MutationEngineSnapshot>> => {
    if (!activeEdit) {
      throw new Error("No active text edit");
    }

    const currentEdit = activeEdit;
    const afterMarkup = serializeRichText(currentEdit.target);

    if (afterMarkup === currentEdit.beforeMarkup) {
      clearActiveEdit();
      return options.engine.snapshot();
    }

    const snapshot = await options.engine.apply(
      createSessionTransaction({
        id: currentEdit.sessionId,
        scope: "single",
        targets: [currentEdit.anchor],
        operations: [
          {
            id: `${currentEdit.sessionId}::text`,
            property: "innerHTML",
            before: currentEdit.beforeMarkup,
            after: afterMarkup,
            semanticKind: "text",
          },
        ],
        createdAt: currentEdit.createdAt,
      }),
    );

    if (activeEdit === currentEdit) {
      clearActiveEdit();
    }

    return snapshot;
  };

  return {
    current() {
      return activeEdit;
    },

    startTextEdit(input) {
      if (activeEdit) {
        throw new Error(
          "An active text edit is already in progress. Commit or cancel it before starting a new one.",
        );
      }

      const sessionId =
        input.sessionId ??
        options.createSessionId?.() ??
        createFallbackSessionId();
      const createdAt =
        input.createdAt ?? options.now?.() ?? new Date().toISOString();
      const started = Object.freeze({
        sessionId,
        createdAt,
        target: input.target,
        anchor: input.anchor,
        beforeMarkup: serializeRichText(input.target),
      });

      activeEdit = started;
      return started;
    },

    async commitTextEdit() {
      return commitActiveEdit();
    },

    cancelTextEdit() {
      return cancelActiveEdit();
    },

    async handleKeyDown(event) {
      if (event.key !== "Escape" || !activeEdit) {
        return "noop";
      }

      event.preventDefault?.();
      event.stopPropagation?.();
      cancelActiveEdit();
      return "cancel";
    },
  };
};
