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

const createFallbackSessionId = (): string =>
  `text-session-${globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36)}`;

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

  return {
    current() {
      return activeEdit;
    },

    startTextEdit(input) {
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
      const currentEdit = clearActiveEdit();
      const afterMarkup = serializeRichText(currentEdit.target);

      if (afterMarkup === currentEdit.beforeMarkup) {
        return options.engine.snapshot();
      }

      return options.engine.apply(
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
    },

    cancelTextEdit() {
      if (!activeEdit) {
        return null;
      }

      const currentEdit = clearActiveEdit();
      restoreRichText(currentEdit.target, currentEdit.beforeMarkup);
      return currentEdit;
    },

    async handleKeyDown(event) {
      if (event.key !== "Escape" || !activeEdit) {
        return "noop";
      }

      event.preventDefault?.();
      event.stopPropagation?.();
      this.cancelTextEdit();
      return "cancel";
    },
  };
};
