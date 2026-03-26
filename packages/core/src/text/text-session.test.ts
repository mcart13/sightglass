import { JSDOM } from "jsdom";
import { describe, expect, it, vi } from "vitest";
import {
  createMutationEngine,
  createTargetAnchor,
  createTextSession,
} from "../index";

const createDocument = (body: string) => {
  const dom = new JSDOM(`<!doctype html><html><body>${body}</body></html>`);
  return dom.window.document;
};

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

const createAnchor = (selector: string) =>
  createTargetAnchor({
    runtimeId: selector,
    selector,
    path: `Document/${selector}`,
    role: null,
    classes: [],
  });

describe("text session", () => {
  it("commits a text edit as an undoable transaction with before and after markup", async () => {
    const document = createDocument(`
      <div data-text-target="editor">Hello <strong>world</strong></div>
    `);
    const frame = createFrameScheduler();
    const engine = createMutationEngine({
      resolveTargets: (transaction) =>
        transaction.targets.flatMap((target) =>
          Array.from(document.querySelectorAll(target.selector)),
        ),
      scheduleFrame: frame.scheduleFrame,
    });
    const session = createTextSession({
      engine,
      createSessionId: () => "text-session-commit",
      now: () => "2026-03-26T20:00:00.000Z",
    });
    const target = document.querySelector("[data-text-target='editor']") as HTMLElement;

    session.startTextEdit({
      target,
      anchor: createAnchor("[data-text-target='editor']"),
    });

    target.innerHTML = "Hello <strong>there</strong>";

    const commitPromise = session.commitTextEdit();
    frame.flush();
    const snapshot = await commitPromise;

    expect(target.innerHTML).toBe("Hello <strong>there</strong>");
    expect(snapshot.applied).toEqual([
      expect.objectContaining({
        target,
        property: "innerHTML",
        beforeInline: "Hello <strong>world</strong>",
        after: "Hello <strong>there</strong>",
      }),
    ]);

    const undoPromise = engine.undo();
    frame.flush();
    await undoPromise;

    expect(target.innerHTML).toBe("Hello <strong>world</strong>");

    const redoPromise = engine.redo();
    frame.flush();
    await redoPromise;

    expect(target.innerHTML).toBe("Hello <strong>there</strong>");
  });

  it("cancels an edit by restoring the start snapshot without recording a transaction", () => {
    const document = createDocument(`
      <div data-text-target="editor">Keep <em>this</em></div>
    `);
    const engine = createMutationEngine({
      resolveTargets: () => [],
    });
    const session = createTextSession({
      engine,
      createSessionId: () => "text-session-cancel",
      now: () => "2026-03-26T20:05:00.000Z",
    });
    const target = document.querySelector("[data-text-target='editor']") as HTMLElement;

    session.startTextEdit({
      target,
      anchor: createAnchor("[data-text-target='editor']"),
    });

    target.innerHTML = "Drop <strong>that</strong>";
    session.cancelTextEdit();

    expect(target.innerHTML).toBe("Keep <em>this</em>");
    expect(engine.snapshot().applied).toHaveLength(0);
  });

  it("preserves nested text nodes when committing and undoing", async () => {
    const document = createDocument(`
      <div data-text-target="editor">Hello <span>dear <em>reader</em></span>!</div>
    `);
    const frame = createFrameScheduler();
    const engine = createMutationEngine({
      resolveTargets: (transaction) =>
        transaction.targets.flatMap((target) =>
          Array.from(document.querySelectorAll(target.selector)),
        ),
      scheduleFrame: frame.scheduleFrame,
    });
    const session = createTextSession({
      engine,
      createSessionId: () => "text-session-nested",
      now: () => "2026-03-26T20:10:00.000Z",
    });
    const target = document.querySelector("[data-text-target='editor']") as HTMLElement;
    const nested = target.querySelector("span") as HTMLSpanElement;
    const emphasis = target.querySelector("em") as HTMLElement;

    session.startTextEdit({
      target,
      anchor: createAnchor("[data-text-target='editor']"),
    });

    nested.firstChild!.textContent = "curious ";
    emphasis.textContent = "friend";

    const commitPromise = session.commitTextEdit();
    frame.flush();
    await commitPromise;

    expect(target.innerHTML).toBe(
      "Hello <span>curious <em>friend</em></span>!",
    );

    const undoPromise = engine.undo();
    frame.flush();
    await undoPromise;

    expect(target.innerHTML).toBe("Hello <span>dear <em>reader</em></span>!");
  });

  it("preserves inline markup in the committed payload instead of flattening to raw text", async () => {
    const document = createDocument(`
      <div data-text-target="editor">Say <strong>hello</strong> to <a href="/team">me</a></div>
    `);
    const frame = createFrameScheduler();
    const engine = createMutationEngine({
      resolveTargets: (transaction) =>
        transaction.targets.flatMap((target) =>
          Array.from(document.querySelectorAll(target.selector)),
        ),
      scheduleFrame: frame.scheduleFrame,
    });
    const session = createTextSession({
      engine,
      createSessionId: () => "text-session-inline",
      now: () => "2026-03-26T20:15:00.000Z",
    });
    const target = document.querySelector("[data-text-target='editor']") as HTMLElement;
    const strong = target.querySelector("strong") as HTMLElement;
    const link = target.querySelector("a") as HTMLAnchorElement;

    session.startTextEdit({
      target,
      anchor: createAnchor("[data-text-target='editor']"),
    });

    strong.innerHTML = "goodbye <em>now</em>";
    link.textContent = "you";

    const commitPromise = session.commitTextEdit();
    frame.flush();
    const snapshot = await commitPromise;

    expect(snapshot.applied).toEqual([
      expect.objectContaining({
        after: 'Say <strong>goodbye <em>now</em></strong> to <a href="/team">you</a>',
      }),
    ]);
    expect(snapshot.applied[0]?.after).not.toBe("Say goodbye now to you");
  });

  it("treats Escape as cancel and does not auto-commit the current edit", async () => {
    const document = createDocument(`
      <div data-text-target="editor">Press <strong>escape</strong></div>
    `);
    const frame = createFrameScheduler();
    const engine = createMutationEngine({
      resolveTargets: (transaction) =>
        transaction.targets.flatMap((target) =>
          Array.from(document.querySelectorAll(target.selector)),
        ),
      scheduleFrame: frame.scheduleFrame,
    });
    const session = createTextSession({
      engine,
      createSessionId: () => "text-session-escape",
      now: () => "2026-03-26T20:20:00.000Z",
    });
    const target = document.querySelector("[data-text-target='editor']") as HTMLElement;
    const preventDefault = vi.fn();
    const stopPropagation = vi.fn();

    session.startTextEdit({
      target,
      anchor: createAnchor("[data-text-target='editor']"),
    });

    target.innerHTML = "Press <strong>escape now</strong>";

    const result = await session.handleKeyDown({
      key: "Escape",
      preventDefault,
      stopPropagation,
    });

    expect(result).toBe("cancel");
    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(stopPropagation).toHaveBeenCalledTimes(1);
    expect(target.innerHTML).toBe("Press <strong>escape</strong>");
    expect(engine.snapshot().applied).toHaveLength(0);

    const redoPromise = engine.redo();
    frame.flush();
    const redoSnapshot = await redoPromise;
    expect(redoSnapshot.applied).toHaveLength(0);
  });
});
