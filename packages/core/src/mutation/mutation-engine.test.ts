import { JSDOM } from "jsdom";
import { describe, expect, it, vi } from "vitest";
import {
  createMutationEngine,
  createSessionTransaction,
  createTargetAnchor,
} from "../index";

const createDocument = (body: string) => {
  const dom = new JSDOM(`<!doctype html><html><body>${body}</body></html>`);
  return dom.window.document;
};

const createTransaction = (
  id: string,
  operations: ReadonlyArray<{
    id: string;
    property: string;
    before?: string;
    after: string;
  }>,
) =>
  createSessionTransaction({
    id,
    scope: "single",
    targets: [
      createTargetAnchor({
        runtimeId: `${id}-target`,
        selector: `[data-session="${id}"]`,
        path: `Session/${id}`,
        role: null,
        classes: [],
      }),
    ],
    operations: operations.map((operation) => ({
      id: operation.id,
      property: operation.property,
      before: operation.before ?? "",
      after: operation.after,
      semanticKind: "css" as const,
    })),
    createdAt: "2026-03-26T19:00:00.000Z",
  });

const createFrameScheduler = () => {
  const callbacks: FrameRequestCallback[] = [];
  const scheduleFrame = vi.fn((callback: FrameRequestCallback) => {
    callbacks.push(callback);
    return callbacks.length;
  });

  const flush = () => {
    const pending = callbacks.splice(0, callbacks.length);
    pending.forEach((callback, index) => callback(index));
  };

  return {
    scheduleFrame,
    flush,
  };
};

describe("mutation engine", () => {
  it("batches style writes and dedupes repeated target-property updates", async () => {
    const document = createDocument(`
      <div data-session="session-a" style="color: black; background-color: white;"></div>
    `);
    const target = document.querySelector("[data-session='session-a']") as HTMLElement;
    const frame = createFrameScheduler();
    const engine = createMutationEngine({
      resolveTargets: () => [target],
      scheduleFrame: frame.scheduleFrame,
    });

    const applyPromise = engine.apply(
      createTransaction("session-a", [
        {
          id: "op-color-initial",
          property: "color",
          after: "red",
        },
        {
          id: "op-color-final",
          property: "color",
          after: "blue",
        },
        {
          id: "op-background",
          property: "background-color",
          after: "yellow",
        },
      ]),
    );

    expect(target.style.getPropertyValue("color")).toBe("black");
    expect(target.style.getPropertyValue("background-color")).toBe("white");
    expect(frame.scheduleFrame).toHaveBeenCalledTimes(1);

    frame.flush();
    const snapshot = await applyPromise;

    expect(target.style.getPropertyValue("color")).toBe("blue");
    expect(target.style.getPropertyValue("background-color")).toBe("yellow");
    expect(snapshot.applied).toHaveLength(2);
    expect(snapshot.applied).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          target,
          beforeInline: "black",
          after: "blue",
        }),
        expect.objectContaining({
          target,
          beforeInline: "white",
          after: "yellow",
        }),
      ]),
    );
  });

  it("captures per-target originals for grouped targets with different starting values", async () => {
    const document = createDocument(`
      <div data-session="session-b" style="color: red;"></div>
      <div data-session="session-b" style="color: green;"></div>
    `);
    const targets = Array.from(
      document.querySelectorAll("[data-session='session-b']"),
    ) as HTMLElement[];
    const frame = createFrameScheduler();
    const engine = createMutationEngine({
      resolveTargets: () => targets,
      scheduleFrame: frame.scheduleFrame,
    });

    const applyPromise = engine.apply(
      createTransaction("session-b", [
        {
          id: "op-color",
          property: "color",
          after: "purple",
        },
      ]),
    );

    frame.flush();
    const snapshot = await applyPromise;

    expect(targets.map((target) => target.style.getPropertyValue("color"))).toEqual([
      "purple",
      "purple",
    ]);
    expect(snapshot.applied).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          target: targets[0],
          beforeInline: "red",
          after: "purple",
        }),
        expect.objectContaining({
          target: targets[1],
          beforeInline: "green",
          after: "purple",
        }),
      ]),
    );
  });

  it("supports undo and redo with per-target restoration", async () => {
    const document = createDocument(`
      <div data-session="session-c" style="color: red;"></div>
      <div data-session="session-c" style="color: green;"></div>
    `);
    const targets = Array.from(
      document.querySelectorAll("[data-session='session-c']"),
    ) as HTMLElement[];
    const frame = createFrameScheduler();
    const engine = createMutationEngine({
      resolveTargets: () => targets,
      scheduleFrame: frame.scheduleFrame,
    });

    const applyPromise = engine.apply(
      createTransaction("session-c", [
        {
          id: "op-color",
          property: "color",
          after: "purple",
        },
      ]),
    );
    frame.flush();
    await applyPromise;

    const undoPromise = engine.undo();
    frame.flush();
    const undoSnapshot = await undoPromise;

    expect(targets.map((target) => target.style.getPropertyValue("color"))).toEqual([
      "red",
      "green",
    ]);
    expect(undoSnapshot.applied).toHaveLength(0);

    const redoPromise = engine.redo();
    frame.flush();
    const redoSnapshot = await redoPromise;

    expect(targets.map((target) => target.style.getPropertyValue("color"))).toEqual([
      "purple",
      "purple",
    ]);
    expect(redoSnapshot.applied).toHaveLength(2);
  });

  it("reverts a single property without disturbing other active properties", async () => {
    const document = createDocument(`
      <div data-session="session-d" style="color: black; background-color: white;"></div>
    `);
    const target = document.querySelector("[data-session='session-d']") as HTMLElement;
    const frame = createFrameScheduler();
    const engine = createMutationEngine({
      resolveTargets: () => [target],
      scheduleFrame: frame.scheduleFrame,
    });

    const applyPromise = engine.apply(
      createTransaction("session-d", [
        {
          id: "op-color",
          property: "color",
          after: "purple",
        },
        {
          id: "op-background",
          property: "background-color",
          after: "orange",
        },
      ]),
    );
    frame.flush();
    await applyPromise;

    const revertPromise = engine.revertProperty("color");
    frame.flush();
    const snapshot = await revertPromise;

    expect(target.style.getPropertyValue("color")).toBe("black");
    expect(target.style.getPropertyValue("background-color")).toBe("orange");
    expect(snapshot.applied).toEqual([
      expect.objectContaining({
        target,
        beforeInline: "white",
        after: "orange",
      }),
    ]);
  });

  it("reverts an entire session and leaves later sessions intact", async () => {
    const document = createDocument(`
      <div data-session="session-e" style="color: black; background-color: white;"></div>
    `);
    const target = document.querySelector("[data-session='session-e']") as HTMLElement;
    const frame = createFrameScheduler();
    const engine = createMutationEngine({
      resolveTargets: () => [target],
      scheduleFrame: frame.scheduleFrame,
    });

    const sessionA = engine.apply(
      createTransaction("session-e-a", [
        {
          id: "op-color",
          property: "color",
          after: "purple",
        },
      ]),
    );
    frame.flush();
    await sessionA;

    const sessionB = engine.apply(
      createTransaction("session-e-b", [
        {
          id: "op-background",
          property: "background-color",
          after: "orange",
        },
      ]),
    );
    frame.flush();
    await sessionB;

    const revertPromise = engine.revertSession("session-e-a");
    frame.flush();
    const snapshot = await revertPromise;

    expect(target.style.getPropertyValue("color")).toBe("black");
    expect(target.style.getPropertyValue("background-color")).toBe("orange");
    expect(snapshot.applied).toEqual([
      expect.objectContaining({
        target,
        beforeInline: "white",
        after: "orange",
      }),
    ]);
  });

  it("undos and redos commands in order even when transaction ids are reused", async () => {
    const document = createDocument(`
      <div data-session="shared-session" style="color: black; background-color: white;"></div>
    `);
    const target = document.querySelector("[data-session='shared-session']") as HTMLElement;
    const frame = createFrameScheduler();
    const engine = createMutationEngine({
      resolveTargets: () => [target],
      scheduleFrame: frame.scheduleFrame,
    });

    const applyColor = engine.apply(
      createTransaction("shared-session", [
        {
          id: "op-color",
          property: "color",
          after: "purple",
        },
      ]),
    );
    frame.flush();
    await applyColor;

    const applyBackground = engine.apply(
      createTransaction("shared-session", [
        {
          id: "op-background",
          property: "background-color",
          after: "orange",
        },
      ]),
    );
    frame.flush();
    await applyBackground;

    const undoLatest = engine.undo();
    frame.flush();
    await undoLatest;

    expect(target.style.getPropertyValue("color")).toBe("purple");
    expect(target.style.getPropertyValue("background-color")).toBe("white");

    const undoEarlier = engine.undo();
    frame.flush();
    await undoEarlier;

    expect(target.style.getPropertyValue("color")).toBe("black");
    expect(target.style.getPropertyValue("background-color")).toBe("white");

    const redoEarlier = engine.redo();
    frame.flush();
    await redoEarlier;

    expect(target.style.getPropertyValue("color")).toBe("purple");
    expect(target.style.getPropertyValue("background-color")).toBe("white");

    const redoLatest = engine.redo();
    frame.flush();
    await redoLatest;

    expect(target.style.getPropertyValue("color")).toBe("purple");
    expect(target.style.getPropertyValue("background-color")).toBe("orange");
  });

  it("captures each target's live text baseline before grouped text edits", async () => {
    const document = createDocument(`
      <div data-session="shared-text"><strong>Alpha</strong></div>
      <div data-session="shared-text"><em>Beta</em></div>
    `);
    const targets = Array.from(
      document.querySelectorAll("[data-session='shared-text']"),
    ) as HTMLElement[];
    const frame = createFrameScheduler();
    const engine = createMutationEngine({
      resolveTargets: () => targets,
      scheduleFrame: frame.scheduleFrame,
    });

    const applyPromise = engine.apply(
      createSessionTransaction({
        id: "shared-text-session",
        scope: "similar",
        targets: [
          createTargetAnchor({
            runtimeId: "shared-text",
            selector: "[data-session='shared-text']",
            path: "body > div",
            role: null,
            classes: [],
          }),
        ],
        operations: [
          {
            id: "op-inner-html",
            property: "innerHTML",
            before: "<strong>Alpha</strong>",
            after: "<span>Updated</span>",
            semanticKind: "text",
          },
        ],
        createdAt: "2026-03-27T00:15:00.000Z",
      }),
    );
    frame.flush();
    await applyPromise;

    expect(targets.map((target) => target.innerHTML)).toEqual([
      "<span>Updated</span>",
      "<span>Updated</span>",
    ]);

    const undoPromise = engine.undo();
    frame.flush();
    await undoPromise;

    expect(targets.map((target) => target.innerHTML)).toEqual([
      "<strong>Alpha</strong>",
      "<em>Beta</em>",
    ]);
  });

  it("cleans up disconnected nodes from active state and ignores them during undo", async () => {
    const document = createDocument(`
      <div data-session="session-f" style="color: black;"></div>
      <div data-session="session-f" style="color: green;"></div>
    `);
    const targets = Array.from(
      document.querySelectorAll("[data-session='session-f']"),
    ) as HTMLElement[];
    const frame = createFrameScheduler();
    const engine = createMutationEngine({
      resolveTargets: () => targets,
      scheduleFrame: frame.scheduleFrame,
    });

    const applyPromise = engine.apply(
      createTransaction("session-f", [
        {
          id: "op-color",
          property: "color",
          after: "purple",
        },
      ]),
    );
    frame.flush();
    await applyPromise;

    targets[1].remove();

    const disconnectedSnapshot = engine.snapshot();
    expect(disconnectedSnapshot.applied).toEqual([
      expect.objectContaining({
        target: targets[0],
        after: "purple",
      }),
    ]);

    const undoPromise = engine.undo();
    frame.flush();
    const undoSnapshot = await undoPromise;

    expect(targets[0].style.getPropertyValue("color")).toBe("black");
    expect(undoSnapshot.applied).toHaveLength(0);
  });
});
