import type { EditOperation } from "../types";

export interface AppliedTargetState {
  readonly target: Element;
  readonly property: string;
  readonly semanticKind: EditOperation["semanticKind"];
  readonly before: string;
  readonly beforeInline: string;
  readonly beforeComputed: string;
  readonly after: string;
}

export interface PendingStyleWrite {
  readonly key: string;
  readonly target: Element;
  readonly property: string;
  readonly semanticKind: EditOperation["semanticKind"];
  readonly value: string;
}

const trimStyleValue = (value: string): string => value.trim();

export const captureAppliedTargetState = (
  target: Element,
  operation: Readonly<EditOperation>,
): AppliedTargetState => {
  if (operation.semanticKind === "text") {
    return {
      target,
      property: operation.property,
      semanticKind: operation.semanticKind,
      before: operation.before,
      beforeInline: operation.before,
      beforeComputed: operation.before,
      after: operation.after,
    };
  }

  const { property, after, semanticKind } = operation;
  const inlineStyle = (target as HTMLElement).style;
  const beforeInline = trimStyleValue(inlineStyle.getPropertyValue(property));
  const view = target.ownerDocument.defaultView;
  const beforeComputed = view
    ? trimStyleValue(view.getComputedStyle(target).getPropertyValue(property))
    : "";

  return {
    target,
    property,
    semanticKind,
    before: beforeInline,
    beforeInline,
    beforeComputed,
    after,
  };
};

export const writeInlineStyle = (
  target: Element,
  property: string,
  value: string,
): void => {
  const inlineStyle = (target as HTMLElement).style;

  if (value === "") {
    inlineStyle.removeProperty(property);
    return;
  }

  inlineStyle.setProperty(property, value);
};

export const flushStyleWrites = async (
  writes: readonly PendingStyleWrite[],
  scheduleFrame: (callback: FrameRequestCallback) => number,
): Promise<void> => {
  if (writes.length === 0) {
    return;
  }

  await new Promise<void>((resolve) => {
    scheduleFrame(() => {
      for (const write of writes) {
        if (!write.target.isConnected) {
          continue;
        }

        if (write.semanticKind === "text") {
          if (write.property === "textContent") {
            write.target.textContent = write.value;
            continue;
          }

          (write.target as Element & { innerHTML: string }).innerHTML = write.value;
          continue;
        }

        writeInlineStyle(write.target, write.property, write.value);
      }

      resolve();
      return 0;
    });
  });
};
