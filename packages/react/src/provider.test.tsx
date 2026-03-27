// @vitest-environment jsdom

import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import type {
  MutationEngineSnapshot,
  SelectionPoint,
  SelectionResult,
  SessionTransaction,
  SightglassController,
  SightglassSessionSnapshot,
} from "@sightglass/core";
import { SightglassProvider } from "./provider";
import {
  useSightglassCommands,
  useSightglassOverlayState,
  useSightglassSessionState,
} from "./use-sightglass";
import { EditorPanel } from "./components/EditorPanel";
import { SelectionOverlay } from "./components/SelectionOverlay";
import { Toolbar } from "./components/Toolbar";

const emptyHistory = (): MutationEngineSnapshot => ({
  applied: [],
  canUndo: false,
  canRedo: false,
});

const testDirectory = dirname(fileURLToPath(import.meta.url));

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const emptySelection = (): SelectionResult => ({
  best: null,
  similar: [],
});

const createSnapshot = (
  overrides: Partial<SightglassSessionSnapshot> = {},
): SightglassSessionSnapshot => ({
  active: false,
  history: emptyHistory(),
  selectedElement: null,
  selection: emptySelection(),
  ...overrides,
});

const createSelection = (): Readonly<SelectionResult> =>
  Object.freeze({
    best: Object.freeze({
      confidence: 0.92,
      anchors: Object.freeze([
          Object.freeze({
            runtimeId: "selected-target",
            selector: "[data-testid='selected-target']",
            path: "main > button:nth-of-type(1)",
            role: "button",
            classes: Object.freeze([
              "cta",
              "card-action",
              "rounded-lg",
              "bg-slate-900",
              "px-4",
              "py-2",
            ]),
            confidence: 0.98,
            alternates: Object.freeze(["button.cta"]),
          }),
        ]),
      }),
    similar: Object.freeze([
      Object.freeze({
        confidence: 0.81,
        anchors: Object.freeze([
          Object.freeze({
            runtimeId: "similar-target",
            selector: "[data-testid='similar-target']",
            path: "aside > button:nth-of-type(1)",
            role: "button",
            classes: Object.freeze([
              "cta",
              "card-action",
              "rounded-lg",
              "bg-slate-900",
              "px-4",
              "py-2",
            ]),
            confidence: 0.86,
            alternates: Object.freeze(["button.card-action"]),
          }),
        ]),
      }),
    ]),
  });

const createController = (
  initialSnapshot: SightglassSessionSnapshot = createSnapshot(),
): SightglassController & {
  readonly mount: ReturnType<typeof vi.fn>;
  readonly destroy: ReturnType<typeof vi.fn>;
  readonly setActive: ReturnType<typeof vi.fn>;
  readonly inspectAtPoint: ReturnType<typeof vi.fn>;
  readonly undo: ReturnType<typeof vi.fn>;
  readonly redo: ReturnType<typeof vi.fn>;
} => {
  let snapshot = initialSnapshot;
  const listeners = new Set<() => void>();
  const emit = () => {
    for (const listener of listeners) {
      listener();
    }
  };

  return {
    mount: vi.fn(),
    destroy: vi.fn(),
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot() {
      return snapshot;
    },
    setActive: vi.fn((active: boolean) => {
      snapshot = createSnapshot({ ...snapshot, active });
      emit();
    }),
    inspectAtPoint: vi.fn((point: SelectionPoint) => {
      const selectedElement =
        point.x > 0
          ? document.querySelector("[data-testid='selected-target']")
          : null;

      snapshot = createSnapshot({
        ...snapshot,
        selectedElement,
        selection: selectedElement ? createSelection() : emptySelection(),
      });
      emit();
    }),
    apply: vi.fn(async (_transaction: Readonly<SessionTransaction>) => snapshot.history),
    undo: vi.fn(async () => {
      snapshot = createSnapshot({
        ...snapshot,
        history: {
          applied: [],
          canUndo: false,
          canRedo: true,
        },
      });
      emit();
      return snapshot.history;
    }),
    redo: vi.fn(async () => {
      snapshot = createSnapshot({
        ...snapshot,
        history: {
          applied: snapshot.history.applied,
          canUndo: true,
          canRedo: false,
        },
      });
      emit();
      return snapshot.history;
    }),
  };
};

class ClassBackedController implements SightglassController {
  private snapshot: SightglassSessionSnapshot;

  private readonly listeners = new Set<() => void>();

  readonly mount = vi.fn();

  readonly destroy = vi.fn();

  readonly setActive = vi.fn((active: boolean) => {
    this.snapshot = createSnapshot({ ...this.snapshot, active });
    this.emit();
  });

  readonly inspectAtPoint = vi.fn((_point: SelectionPoint) => undefined);

  readonly apply = vi.fn(async (_transaction: Readonly<SessionTransaction>) => this.snapshot.history);

  readonly undo = vi.fn(async () => this.snapshot.history);

  readonly redo = vi.fn(async () => this.snapshot.history);

  constructor(initialSnapshot: SightglassSessionSnapshot = createSnapshot()) {
    this.snapshot = initialSnapshot;
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getSnapshot() {
    return this.snapshot;
  }

  private emit() {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

const renderHarness = (controller = createController()) => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  activeRoot = root;
  activeContainer = container;

  const SessionProbe = () => {
    const session = useSightglassSessionState();
    const overlay = useSightglassOverlayState();

    return (
      <output
        data-testid="session-probe"
        data-active={String(session.active)}
        data-applied={String(session.history.applied.length)}
        data-hovered-scope={overlay.hoveredScope ?? "none"}
      >
        {session.selection.best?.anchors[0]?.selector ?? "none"}
      </output>
    );
  };

  const CommandProbe = () => {
    const commands = useSightglassCommands();

    return (
      <div>
        <button
          data-testid="activate"
          type="button"
          onClick={() => commands.setActive(true)}
        >
          activate
        </button>
        <button
          data-testid="inspect"
          type="button"
          onClick={() => commands.inspectAtPoint({ x: 12, y: 18 })}
        >
          inspect
        </button>
        <button
          data-testid="hover-similar"
          type="button"
          onClick={() => commands.setHoveredScope("similar")}
        >
          hover similar
        </button>
      </div>
    );
  };

  act(() => {
    root.render(
      <SightglassProvider controller={controller}>
        <main
          data-route="/playground/landing"
          style={{ ["--button-radius" as string]: "18px" }}
        >
          <button
            data-testid="selected-target"
            className="cta card-action rounded-lg bg-slate-900 px-4 py-2"
            style={{
              borderRadius: "var(--button-radius)",
              color: "rgb(15, 23, 42)",
              transition: "all 420ms ease",
            }}
            type="button"
          >
            <span>Primary action</span>
          </button>
          <button
            data-testid="similar-target"
            className="cta card-action rounded-lg bg-slate-900 px-4 py-2"
            style={{
              borderRadius: "var(--button-radius)",
              color: "rgb(15, 23, 42)",
              transition: "all 420ms ease",
            }}
            type="button"
          >
            <span>Secondary action</span>
          </button>
        </main>
        <Toolbar />
        <EditorPanel />
        <SelectionOverlay />
        <SessionProbe />
        <CommandProbe />
      </SightglassProvider>,
    );
  });

  return {
    container,
    controller,
    root,
    cleanup() {
      act(() => {
        root.unmount();
      });
      if (activeRoot === root) {
        activeRoot = null;
      }
      if (activeContainer === container) {
        activeContainer = null;
      }
      container.remove();
    },
  };
};

let activeRoot: Root | null = null;
let activeContainer: HTMLDivElement | null = null;

afterEach(() => {
  if (activeRoot) {
    act(() => {
      activeRoot?.unmount();
    });
  }

  activeRoot = null;

  if (activeContainer) {
    activeContainer.remove();
  }

  activeContainer = null;
  document.body.innerHTML = "";
});

describe("@sightglass/react provider", () => {
  it("mounts and destroys the controller with the provider lifecycle", () => {
    const controller = createController();
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    activeRoot = root;
    activeContainer = container;

    act(() => {
      root.render(
        <SightglassProvider controller={controller}>
          <div>ready</div>
        </SightglassProvider>,
      );
    });

    expect(controller.mount).toHaveBeenCalledTimes(1);

    act(() => {
      root.unmount();
    });

    activeRoot = null;
    activeContainer = null;

    expect(controller.destroy).toHaveBeenCalledTimes(1);
  });

  it("surfaces active state through the toolbar and session context", () => {
    const harness = renderHarness();

    expect(harness.container.textContent).toContain("Start editing");
    expect(
      harness.container.querySelector("[data-testid='session-probe']"),
    ).not.toBeNull();
    expect(
      harness.container
        .querySelector("[data-testid='session-probe']")
        ?.getAttribute("data-active"),
    ).toBe("false");

    act(() => {
      harness.container
        .querySelector("[data-testid='activate']")
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(harness.controller.setActive).toHaveBeenCalledWith(true);
    expect(harness.container.textContent).toContain("Editing live");
    expect(
      harness.container
        .querySelector("[data-testid='session-probe']")
        ?.getAttribute("data-active"),
    ).toBe("true");

    harness.cleanup();
  });

  it("surfaces selection state in the panel and overlay without React-side heuristics", () => {
    const harness = renderHarness();

    act(() => {
      harness.container
        .querySelector("[data-testid='inspect']")
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      harness.container
        .querySelector("[data-testid='hover-similar']")
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(harness.controller.inspectAtPoint).toHaveBeenCalledWith({ x: 12, y: 18 });
    expect(harness.container.textContent).toContain("[data-testid='selected-target']");
    expect(harness.container.textContent).toContain("2 live candidates");
    expect(harness.container.textContent).toContain("Scope preview");
    expect(
      harness.container
        .querySelector("[data-testid='session-probe']")
        ?.getAttribute("data-hovered-scope"),
    ).toBe("similar");

    harness.cleanup();
  });

  it("renders semantic token and component controls from core analysis", () => {
    const harness = renderHarness();

    act(() => {
      harness.container
        .querySelector("[data-testid='inspect']")
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(harness.container.textContent).toContain("Update token --button-radius");
    expect(harness.container.textContent).toContain("Update all card-action components");
    expect(
      harness.container.querySelector("[data-scope-option='component']"),
    ).not.toBeNull();
    expect(
      harness.container.querySelector("[data-scope-option='token']"),
    ).not.toBeNull();

    act(() => {
      harness.container
        .querySelector("[data-scope-option='component']")
        ?.dispatchEvent(new FocusEvent("focus", { bubbles: true }));
    });

    expect(harness.container.textContent).toContain("component");

    harness.cleanup();
  });

  it("renders grouped critique findings with perspective and scope switches", () => {
    const harness = renderHarness();

    act(() => {
      harness.container
        .querySelector("[data-testid='inspect']")
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(harness.container.textContent).toContain("Critique");
    expect(harness.container.textContent).toContain("Document language is missing");
    expect(harness.container.textContent).toContain(
      "The interaction animates broad or layout-affecting properties",
    );
    expect(
      harness.container.querySelector("[data-critique-scope='page']"),
    ).not.toBeNull();

    act(() => {
      harness.container
        .querySelector("[data-critique-perspective='jhey']")
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(
      harness.container
        .querySelector("[data-critique-perspective='jhey']")
        ?.getAttribute("aria-pressed"),
    ).toBe("true");
    expect(harness.container.textContent).toContain("Turn this into an edit plan");

    harness.cleanup();
  });

  it("passes mutation history state straight through to editing controls", () => {
    const controller = createController(
      createSnapshot({
        active: true,
        history: {
          applied: [
            {
              target: document.body,
              property: "color",
              semanticKind: "css",
              before: "#111111",
              beforeInline: "#111111",
              beforeComputed: "rgb(17, 17, 17)",
              after: "#ff3366",
            },
          ],
          canUndo: true,
          canRedo: false,
        },
      }),
    );
    const harness = renderHarness(controller);

    expect(harness.container.textContent).toContain("1 live change");
    expect(
      harness.container
        .querySelector("[data-command='undo']")
        ?.hasAttribute("disabled"),
    ).toBe(false);
    expect(
      harness.container
        .querySelector("[data-command='redo']")
        ?.hasAttribute("disabled"),
    ).toBe(true);

    harness.cleanup();
  });

  it("keeps controller logic in core instead of rebuilding selection or history in React", async () => {
    const originalCwd = process.cwd();
    let providerSource = "";
    let hookSource = "";

    try {
      process.chdir(join(testDirectory, "../.."));
      providerSource = await readFile(join(testDirectory, "provider.tsx"), "utf8");
      hookSource = await readFile(join(testDirectory, "use-sightglass.ts"), "utf8");
    } finally {
      process.chdir(originalCwd);
    }

    expect(providerSource).toContain("createSightglassController");
    expect(`${providerSource}\n${hookSource}`).not.toMatch(
      /identifySelection|resolveBestElement|findSimilarElements|createMutationEngine|MutationHistoryStore/,
    );
  });

  it("switches to a new controller prop when the parent provides one", () => {
    const firstController = createController(createSnapshot({ active: false }));
    const secondController = createController(createSnapshot({ active: true }));
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    activeRoot = root;
    activeContainer = container;

    act(() => {
      root.render(
        <SightglassProvider controller={firstController}>
          <Toolbar />
        </SightglassProvider>,
      );
    });

    expect(firstController.mount).toHaveBeenCalledTimes(1);
    expect(firstController.destroy).toHaveBeenCalledTimes(0);
    expect(container.textContent).toContain("Start editing");

    act(() => {
      root.render(
        <SightglassProvider controller={secondController}>
          <Toolbar />
        </SightglassProvider>,
      );
    });

    expect(firstController.destroy).toHaveBeenCalledTimes(1);
    expect(secondController.mount).toHaveBeenCalledTimes(1);
    expect(container.textContent).toContain("Editing live");

    act(() => {
      root.unmount();
    });

    activeRoot = null;
    activeContainer = null;
  });

  it("registers renderHarness roots with the shared teardown", () => {
    expect(activeRoot).toBeNull();
    expect(activeContainer).toBeNull();

    const harness = renderHarness();

    expect(activeRoot).toBe(harness.root);
    expect(activeContainer).toBe(harness.container);

    harness.cleanup();

    expect(activeRoot).toBeNull();
    expect(activeContainer).toBeNull();
  });

  it("supports controllers whose store methods rely on instance binding", () => {
    const controller = new ClassBackedController(createSnapshot({ active: false }));
    const harness = renderHarness(controller);

    expect(harness.container.textContent).toContain("Start editing");

    act(() => {
      harness.container
        .querySelector("[data-testid='activate']")
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(controller.setActive).toHaveBeenCalledWith(true);
    expect(harness.container.textContent).toContain("Editing live");

    harness.cleanup();
  });
});
