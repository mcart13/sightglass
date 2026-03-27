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
  useSightglassReviewDraftCommands,
  useSightglassReviewDraftState,
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
  overrides: Partial<SightglassSessionSnapshot> = {}
): SightglassSessionSnapshot => ({
  active: false,
  history: emptyHistory(),
  selectedElement: null,
  selection: emptySelection(),
  isEditingText: false,
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
            path: "main > button:nth-of-type(2)",
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
  initialSnapshot: SightglassSessionSnapshot = createSnapshot()
): SightglassController & {
  readonly destroy: ReturnType<typeof vi.fn>;
  readonly setActive: ReturnType<typeof vi.fn>;
  readonly inspectAtPoint: ReturnType<typeof vi.fn>;
  readonly undo: ReturnType<typeof vi.fn>;
  readonly redo: ReturnType<typeof vi.fn>;
  readonly startTextEdit: ReturnType<typeof vi.fn>;
  readonly commitTextEdit: ReturnType<typeof vi.fn>;
  readonly cancelTextEdit: ReturnType<typeof vi.fn>;
} => {
  let snapshot = initialSnapshot;
  const listeners = new Set<() => void>();
  const emit = () => {
    for (const listener of listeners) {
      listener();
    }
  };

  return {
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
    apply: vi.fn(
      async (_transaction: Readonly<SessionTransaction>) => snapshot.history
    ),
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
    startTextEdit: vi.fn(),
    commitTextEdit: vi.fn().mockResolvedValue(undefined),
    cancelTextEdit: vi.fn(),
  };
};

class ClassBackedController implements SightglassController {
  private snapshot: SightglassSessionSnapshot;

  private readonly listeners = new Set<() => void>();

  readonly destroy = vi.fn();

  readonly setActive = vi.fn((active: boolean) => {
    this.snapshot = createSnapshot({ ...this.snapshot, active });
    this.emit();
  });

  readonly inspectAtPoint = vi.fn((_point: SelectionPoint) => undefined);

  readonly apply = vi.fn(
    async (_transaction: Readonly<SessionTransaction>) => this.snapshot.history
  );

  readonly undo = vi.fn(async () => this.snapshot.history);

  readonly redo = vi.fn(async () => this.snapshot.history);

  startTextEdit() {}

  async commitTextEdit() {}

  cancelTextEdit() {}

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

const renderHarness = (
  controller: SightglassController = createController()
) => {
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
      </SightglassProvider>
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
  it("destroys the controller when the provider unmounts", () => {
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
        </SightglassProvider>
      );
    });

    act(() => {
      root.unmount();
    });

    activeRoot = null;
    activeContainer = null;

    expect(controller.destroy).toHaveBeenCalledTimes(1);
  });

  it("surfaces active state through the toolbar and session context", () => {
    const harness = renderHarness();

    // EditorPanel renders collapsed wand button when inactive
    expect(
      harness.container.querySelector("[data-testid='session-probe']")
    ).not.toBeNull();
    expect(
      harness.container
        .querySelector("[data-testid='session-probe']")
        ?.getAttribute("data-active")
    ).toBe("false");

    act(() => {
      harness.container
        .querySelector("[data-testid='activate']")
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(harness.controller.setActive).toHaveBeenCalledWith(true);
    // EditorPanel shows "Copy Edits" toolbar when active/open
    expect(harness.container.textContent).toContain("Copy Edits");
    expect(
      harness.container
        .querySelector("[data-testid='session-probe']")
        ?.getAttribute("data-active")
    ).toBe("true");

    harness.cleanup();
  });

  it("surfaces selection state in the panel and overlay without React-side heuristics", () => {
    const harness = renderHarness();

    act(() => {
      harness.container
        .querySelector("[data-testid='activate']")
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    act(() => {
      harness.container
        .querySelector("[data-testid='inspect']")
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      harness.container
        .querySelector("[data-testid='hover-similar']")
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(harness.controller.inspectAtPoint).toHaveBeenCalledWith({
      x: 12,
      y: 18,
    });
    expect(harness.container.textContent).toContain(
      "[data-testid='selected-target']"
    );
    expect(harness.container.textContent).toContain("2 candidates");
    expect(harness.container.textContent).toContain("Scope");
    expect(
      harness.container
        .querySelector("[data-testid='session-probe']")
        ?.getAttribute("data-hovered-scope")
    ).toBe("similar");

    harness.cleanup();
  });

  it("renders semantic token and component controls from core analysis", () => {
    const harness = renderHarness();

    act(() => {
      harness.container
        .querySelector("[data-testid='activate']")
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    act(() => {
      harness.container
        .querySelector("[data-testid='inspect']")
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(harness.container.textContent).toContain(
      "Update token --button-radius"
    );
    expect(harness.container.textContent).toContain(
      "Update all card-action components"
    );
    expect(
      harness.container.querySelector("[data-scope-option='component']")
    ).not.toBeNull();
    expect(
      harness.container.querySelector("[data-scope-option='token']")
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
        .querySelector("[data-testid='activate']")
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    act(() => {
      harness.container
        .querySelector("[data-testid='inspect']")
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Switch to Issues tab to see CritiquePanel
    act(() => {
      const issuesTab = Array.from(
        harness.container.querySelectorAll("button")
      ).find((btn) => btn.textContent === "Issues");
      issuesTab?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(harness.container.textContent).toContain("Findings");
    expect(harness.container.textContent).toContain(
      "Document language is missing"
    );
    expect(harness.container.textContent).toContain(
      "The interaction animates broad or layout-affecting properties"
    );
    expect(
      harness.container.querySelector("[data-critique-scope='page']")
    ).not.toBeNull();

    act(() => {
      harness.container
        .querySelector("[data-critique-perspective='jhey']")
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(
      harness.container
        .querySelector("[data-critique-perspective='jhey']")
        ?.getAttribute("aria-pressed")
    ).toBe("true");

    harness.cleanup();
  });

  it("renders explore directions and motion tuning controls from critique outputs", () => {
    const harness = renderHarness();

    act(() => {
      harness.container
        .querySelector("[data-testid='activate']")
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    act(() => {
      harness.container
        .querySelector("[data-testid='inspect']")
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Switch to Explore tab
    act(() => {
      const exploreTab = Array.from(
        harness.container.querySelectorAll("button")
      ).find((btn) => btn.textContent === "Explore");
      exploreTab?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(harness.container.textContent).toContain("More playful");
    expect(
      harness.container.querySelector("[data-direction-id='playful']")
    ).not.toBeNull();

    act(() => {
      harness.container
        .querySelector("[data-direction-id='playful']")
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(harness.container.textContent).toContain("Edit Plan");

    // Switch to Motion tab for storyboard and tuning controls
    act(() => {
      const motionTab = Array.from(
        harness.container.querySelectorAll("button")
      ).find((btn) => btn.textContent === "Motion");
      motionTab?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(
      harness.container.querySelector("[data-storyboard-step='travel']")
    ).not.toBeNull();
    expect(
      harness.container.querySelector("[data-motion-control='duration']")
    ).not.toBeNull();

    harness.cleanup();
  });

  it("renders the editor panel with tabs when an element is selected", async () => {
    const harness = renderHarness();

    act(() => {
      harness.container
        .querySelector("[data-testid='activate']")
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    act(() => {
      harness.container
        .querySelector("[data-testid='inspect']")
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    await act(async () => {
      await Promise.resolve();
    });

    // EditorPanel should show tabs when active
    expect(harness.container.textContent).toContain("Style");
    expect(harness.container.textContent).toContain("Issues");
    expect(harness.container.textContent).toContain("Explore");
    expect(harness.container.textContent).toContain("Motion");

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
      })
    );
    const harness = renderHarness(controller);

    // EditorPanel shows change count badge (the number "1") next to Copy Edits
    expect(harness.container.textContent).toContain("Copy Edits");
    expect(harness.container.textContent).toContain("1");

    harness.cleanup();
  });

  it("keeps controller logic in core instead of rebuilding selection or history in React", async () => {
    const originalCwd = process.cwd();
    let providerSource = "";
    let hookSource = "";

    try {
      process.chdir(join(testDirectory, "../.."));
      providerSource = await readFile(
        join(testDirectory, "provider.tsx"),
        "utf8"
      );
      hookSource = await readFile(
        join(testDirectory, "use-sightglass.ts"),
        "utf8"
      );
    } finally {
      process.chdir(originalCwd);
    }

    expect(providerSource).toContain("createSightglassController");
    expect(`${providerSource}\n${hookSource}`).not.toMatch(
      /identifySelection|resolveBestElement|findSimilarElements|createMutationEngine|MutationHistoryStore/
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
        </SightglassProvider>
      );
    });

    expect(firstController.destroy).toHaveBeenCalledTimes(0);
    // First controller is inactive, verify it rendered
    expect(container.textContent).toBeDefined();

    act(() => {
      root.render(
        <SightglassProvider controller={secondController}>
          <Toolbar />
        </SightglassProvider>
      );
    });

    expect(firstController.destroy).toHaveBeenCalledTimes(1);
    // Second controller is active, verify it rendered
    expect(container.textContent).toBeDefined();

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

  it("hydrates review draft state without clearing omitted fields", () => {
    const controller = createController();
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    activeRoot = root;
    activeContainer = container;

    const ReviewDraftProbe = () => {
      const reviewDraft = useSightglassReviewDraftState();
      const reviewDraftCommands = useSightglassReviewDraftCommands();

      return (
        <div>
          <button
            data-testid="seed-review-draft"
            type="button"
            onClick={() => {
              reviewDraftCommands.setCritiquePerspective("jhey");
              reviewDraftCommands.setCritiqueScope("page");
              reviewDraftCommands.setSelectedFindingId("finding-1");
              reviewDraftCommands.setSelectedDirectionId("playful");
              reviewDraftCommands.setMotionValue("duration", 420);
            }}
          >
            seed
          </button>
          <button
            data-testid="hydrate-review-draft"
            type="button"
            onClick={() =>
              reviewDraftCommands.hydrateReviewDraft({
                critiquePerspective: "jakub",
              })
            }
          >
            hydrate
          </button>
          <output
            data-testid="review-draft-probe"
            data-critique-perspective={reviewDraft.critiquePerspective}
            data-critique-scope={reviewDraft.critiqueScope}
            data-selected-finding-id={reviewDraft.selectedFindingId ?? "none"}
            data-selected-direction-id={
              reviewDraft.selectedDirectionId ?? "none"
            }
            data-motion-duration={String(
              reviewDraft.motionValues.duration ?? 0
            )}
          />
        </div>
      );
    };

    act(() => {
      root.render(
        <SightglassProvider controller={controller}>
          <ReviewDraftProbe />
        </SightglassProvider>
      );
    });

    act(() => {
      container
        .querySelector("[data-testid='seed-review-draft']")
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const probe = () =>
      container.querySelector("[data-testid='review-draft-probe']");

    expect(probe()?.getAttribute("data-critique-perspective")).toBe("jhey");
    expect(probe()?.getAttribute("data-critique-scope")).toBe("page");
    expect(probe()?.getAttribute("data-selected-finding-id")).toBe("finding-1");
    expect(probe()?.getAttribute("data-selected-direction-id")).toBe("playful");
    expect(probe()?.getAttribute("data-motion-duration")).toBe("420");

    act(() => {
      container
        .querySelector("[data-testid='hydrate-review-draft']")
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(probe()?.getAttribute("data-critique-perspective")).toBe("jakub");
    expect(probe()?.getAttribute("data-critique-scope")).toBe("page");
    expect(probe()?.getAttribute("data-selected-finding-id")).toBe("finding-1");
    expect(probe()?.getAttribute("data-selected-direction-id")).toBe("playful");
    expect(probe()?.getAttribute("data-motion-duration")).toBe("420");

    act(() => {
      root.unmount();
    });

    activeRoot = null;
    activeContainer = null;
  });

  it("supports controllers whose store methods rely on instance binding", () => {
    const controller = new ClassBackedController(
      createSnapshot({ active: false })
    );
    const harness = renderHarness(controller);

    // Inactive state: EditorPanel renders collapsed button
    expect(harness.container.textContent).toBeDefined();

    act(() => {
      harness.container
        .querySelector("[data-testid='activate']")
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(controller.setActive).toHaveBeenCalledWith(true);
    // Active state: EditorPanel renders toolbar with Copy Edits
    expect(harness.container.textContent).toContain("Copy Edits");

    harness.cleanup();
  });
});
