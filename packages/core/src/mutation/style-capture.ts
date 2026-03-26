export interface AppliedTargetState {
  readonly target: Element;
  readonly property: string;
  readonly beforeInline: string;
  readonly beforeComputed: string;
  readonly after: string;
}

export interface PendingStyleWrite {
  readonly key: string;
  readonly target: Element;
  readonly property: string;
  readonly value: string;
}

const trimStyleValue = (value: string): string => value.trim();

export const captureAppliedTargetState = (
  target: Element,
  property: string,
  after: string,
): AppliedTargetState => {
  const inlineStyle = (target as HTMLElement).style;
  const beforeInline = trimStyleValue(inlineStyle.getPropertyValue(property));
  const view = target.ownerDocument.defaultView;
  const beforeComputed = view
    ? trimStyleValue(view.getComputedStyle(target).getPropertyValue(property))
    : "";

  return {
    target,
    property,
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

        writeInlineStyle(write.target, write.property, write.value);
      }

      resolve();
      return 0;
    });
  });
};
