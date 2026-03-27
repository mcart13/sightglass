# Close All interface-kit Feature Gaps

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the 6 feature gaps between Sightglass and interface-kit so Sightglass matches or exceeds interface-kit on every dimension it covers, while retaining the critique/explore/motion features interface-kit lacks.

**Architecture:** Add `motion` as a dependency to `@sightglass/react`. Build new interactive control components (Slider, ColorPicker, BoxSpacing, etc.) as small focused files under `packages/react/src/components/controls/`. Wire text editing through the controller by adding `startTextEdit`/`commitTextEdit`/`cancelTextEdit` to the `SightglassController` interface, with paste-as-text sanitization and lifecycle cleanup on deactivate/selection-change/destroy. Add cursor injection as a side effect managed by the provider using per-document reference counting. Add Tailwind conversion as a utility in `@sightglass/core`, wired end-to-end into the Copy Edits export flow. PropertyEditor derives control values from live computed styles keyed on history version, not stale snapshots.

**Tech Stack:** React 19, TypeScript, motion (v12+), Vitest, CSS-in-JS (inline styles matching existing pattern)

---

## File Map

### New files

| File                                                          | Responsibility                                                           |
| ------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `packages/react/src/components/controls/Slider.tsx`           | Drag-to-adjust numeric slider with stops, fill bar, value display        |
| `packages/react/src/components/controls/ColorPicker.tsx`      | HSL/hex color picker with swatch trigger and popover                     |
| `packages/react/src/components/controls/BoxSpacing.tsx`       | 4-sided padding/margin drag editor                                       |
| `packages/react/src/components/controls/AlignmentControl.tsx` | Flex alignment grid selector                                             |
| `packages/react/src/components/controls/index.ts`             | Barrel export for all controls                                           |
| `packages/react/src/components/PropertyEditor.tsx`            | Style tab replacement: interactive property editing using controls       |
| `packages/react/src/cursor-style.ts`                          | Crosshair cursor injection utility (per-document WeakMap tracking)       |
| `packages/react/src/components/InlineTextEditor.tsx`          | Plain-text contenteditable with paste sanitization and lifecycle cleanup |
| `packages/core/src/tailwind/css-to-tailwind.ts`               | CSS property+value to Tailwind class conversion                          |
| `packages/core/src/tailwind/tailwind-colors.ts`               | Tailwind color palette + closest-match lookup                            |

### Modified files

| File                                                 | Changes                                                                                                                                                                    |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/react/package.json`                        | Add `motion` dependency                                                                                                                                                    |
| `packages/react/src/components/SelectionOverlay.tsx` | Replace CSS transitions with motion spring animations                                                                                                                      |
| `packages/react/src/components/EditorPanel.tsx`      | Add motion animations for panel open/close, staggered children, integrate PropertyEditor + InlineTextEditor                                                                |
| `packages/react/src/components/panel-styles.ts`      | Add styles for new control components                                                                                                                                      |
| `packages/react/src/provider.tsx`                    | Add cursor injection side effect, expose text editing commands, add `applyStyle` command, add `tailwindMode` state, cancel active text edit on deactivate/selection-change |
| `packages/core/src/controller.ts`                    | Add `startTextEdit`/`commitTextEdit`/`cancelTextEdit` to controller, add `applyStyleToSelected`, cancel text edit on `setActive(false)` and `inspectAtPoint`               |
| `packages/react/src/provider.test.tsx`               | Update controller mock to include new methods (`startTextEdit`, `commitTextEdit`, `cancelTextEdit`, `applyStyleToSelected`)                                                |
| `packages/core/src/index.ts`                         | Export tailwind utilities                                                                                                                                                  |
| `packages/react/src/index.ts`                        | Export new components                                                                                                                                                      |

### Test files

| File                                                      | Tests                                                    |
| --------------------------------------------------------- | -------------------------------------------------------- |
| `packages/core/src/tailwind/css-to-tailwind.test.ts`      | CSS-to-Tailwind conversion for all supported properties  |
| `packages/core/src/tailwind/tailwind-colors.test.ts`      | Color matching accuracy                                  |
| `packages/react/src/components/controls/Slider.test.tsx`  | Slider renders, drag interaction, stop snapping          |
| `packages/react/src/components/InlineTextEditor.test.tsx` | Text edit activation, commit, cancel, paste sanitization |

---

## Task 0: Preflight -- branch and reconciliation

**Files:**

- Modify: `packages/react/package.json` (test script)

- [ ] **Step 1: Create feature branch from current state**

```bash
cd /Users/mason/sightglass && git checkout -b feat/close-interface-kit-gaps
```

- [ ] **Step 2: Stage and commit any in-progress work**

```bash
cd /Users/mason/sightglass && git add -A && git status
```

Review staged files. If there are meaningful local changes, commit them as a checkpoint:

```bash
git commit -m "chore: checkpoint in-progress work before interface-kit gap closure"
```

- [ ] **Step 3: Verify clean build baseline**

```bash
cd /Users/mason/sightglass && yarn build && yarn typecheck && yarn test
```

Expected: All pass. If any fail, fix them before proceeding.

- [ ] **Step 4: Widen React test script**

In `packages/react/package.json`, update the test script to run all test files:

```json
"test": "yarn run -T vitest run --environment jsdom src/"
```

This ensures new test files under `src/components/controls/` and `src/components/` are picked up.

- [ ] **Step 5: Commit**

```bash
git add packages/react/package.json
git commit -m "chore: widen react test script to cover all src/ test files"
```

---

## Task 1: Install motion dependency

**Files:**

- Modify: `packages/react/package.json`

- [ ] **Step 1: Add motion to @sightglass/react**

```bash
cd /Users/mason/sightglass && yarn workspace @sightglass/react add motion
```

- [ ] **Step 2: Verify installation**

```bash
cd /Users/mason/sightglass && yarn workspace @sightglass/react exec node -e "require.resolve('motion/react')"
```

Expected: Resolves without error.

- [ ] **Step 3: Verify build**

```bash
cd /Users/mason/sightglass && yarn build
```

Expected: Clean build with no errors.

- [ ] **Step 4: Commit**

```bash
git add packages/react/package.json yarn.lock
git commit -m "chore: add motion dependency to @sightglass/react"
```

---

## Task 2: Crosshair cursor injection

**Files:**

- Create: `packages/react/src/cursor-style.ts`
- Modify: `packages/react/src/provider.tsx:127-131`

- [ ] **Step 1: Create cursor-style.ts**

```typescript
// packages/react/src/cursor-style.ts

const CURSOR_STYLE_ID = "sightglass-cursor-style";

const CURSOR_CSS = `
body { cursor: crosshair !important; }
body * { cursor: crosshair !important; }
[data-sightglass-chrome], [data-sightglass-chrome] * { cursor: default !important; }
[data-sightglass-chrome] button { cursor: pointer !important; }
[data-sightglass-chrome] input[type="range"] { cursor: ew-resize !important; }
[contenteditable] { cursor: text !important; caret-color: #2563eb !important; outline: none !important; }
`.trim();

// Per-document reference counting so multiple providers or iframes work correctly
const counts = new WeakMap<Document, number>();

export const mountCursorStyle = (ownerDocument: Document): void => {
  const prev = counts.get(ownerDocument) ?? 0;
  counts.set(ownerDocument, prev + 1);
  if (prev > 0) return;

  const existing = ownerDocument.getElementById(CURSOR_STYLE_ID);
  if (existing) return;

  const style = ownerDocument.createElement("style");
  style.id = CURSOR_STYLE_ID;
  style.textContent = CURSOR_CSS;
  ownerDocument.head.appendChild(style);
};

export const unmountCursorStyle = (ownerDocument: Document): void => {
  const prev = counts.get(ownerDocument) ?? 0;
  const next = Math.max(0, prev - 1);
  counts.set(ownerDocument, next);
  if (next > 0) return;

  const existing = ownerDocument.getElementById(CURSOR_STYLE_ID);
  if (existing) {
    existing.remove();
  }
};
```

- [ ] **Step 2: Wire cursor injection into provider**

In `packages/react/src/provider.tsx`, add an effect after the existing `useEffect` (around line 127) that mounts/unmounts the cursor style based on `sessionState.active`:

```typescript
// Add import at top of provider.tsx
import { mountCursorStyle, unmountCursorStyle } from "./cursor-style";

// Add after the existing destroy effect (line 131)
// Key on selectedElement?.ownerDocument so cursor re-mounts if selection moves to an iframe
const selectedDoc =
  sessionState.selectedElement?.ownerDocument ?? globalThis.document;
useEffect(() => {
  if (!sessionState.active) return;

  mountCursorStyle(selectedDoc);
  return () => unmountCursorStyle(selectedDoc);
}, [sessionState.active, selectedDoc]);
```

Note: `sessionState` is already available in scope at line 107-111.

- [ ] **Step 3: Verify build**

```bash
cd /Users/mason/sightglass && yarn build
```

Expected: Clean build.

- [ ] **Step 4: Manual verification**

```bash
cd /Users/mason/sightglass && yarn dev:playground
```

Open playground. Click the wand button to activate. Cursor should become crosshair everywhere except Sightglass chrome elements. Deactivate and cursor should revert.

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/cursor-style.ts packages/react/src/provider.tsx
git commit -m "feat: inject crosshair cursor when sightglass is active"
```

---

## Task 3: Spring-animated selection overlay

**Files:**

- Modify: `packages/react/src/components/SelectionOverlay.tsx`

- [ ] **Step 1: Rewrite SelectionOverlay with motion springs**

Replace the entire file with:

```tsx
// packages/react/src/components/SelectionOverlay.tsx
import { useEffect, useState, type CSSProperties } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useSightglassSessionState } from "../use-sightglass";

const SELECTION_PADDING = 8;

const labelBaseStyle: CSSProperties = {
  position: "fixed",
  zIndex: 99998,
  padding: "2px 8px",
  borderRadius: 4,
  color: "#fff",
  fontSize: 12,
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontWeight: 500,
  whiteSpace: "nowrap",
  pointerEvents: "none",
};

const springConfig = { stiffness: 500, damping: 35, mass: 0.8 };

export const SelectionOverlay = () => {
  const session = useSightglassSessionState();
  const [rect, setRect] = useState<DOMRect | null>(null);
  const selectedElement = session.selectedElement;
  const primaryAnchor = session.selection.best?.anchors[0] ?? null;

  // Spring-animated position/size values
  const rawTop = useMotionValue(0);
  const rawLeft = useMotionValue(0);
  const rawWidth = useMotionValue(0);
  const rawHeight = useMotionValue(0);

  const springTop = useSpring(rawTop, springConfig);
  const springLeft = useSpring(rawLeft, springConfig);
  const springWidth = useSpring(rawWidth, springConfig);
  const springHeight = useSpring(rawHeight, springConfig);

  useEffect(() => {
    if (!selectedElement) {
      setRect(null);
      return;
    }

    let frameId: number;
    const update = () => {
      if (!selectedElement.isConnected) {
        setRect(null);
        return;
      }
      const r = selectedElement.getBoundingClientRect();
      setRect(r);
      rawTop.set(r.top - SELECTION_PADDING);
      rawLeft.set(r.left - SELECTION_PADDING);
      rawWidth.set(r.width + SELECTION_PADDING * 2);
      rawHeight.set(r.height + SELECTION_PADDING * 2);
      frameId = requestAnimationFrame(update);
    };
    update();

    return () => cancelAnimationFrame(frameId);
  }, [selectedElement, rawTop, rawLeft, rawWidth, rawHeight]);

  if (!rect || !primaryAnchor) {
    return null;
  }

  const tag = selectedElement?.tagName.toLowerCase() ?? "";
  const label = primaryAnchor.role ? `${tag} "${primaryAnchor.role}"` : tag;

  return (
    <>
      {/* Label above selection */}
      <motion.div
        style={{
          ...labelBaseStyle,
          background: "#2563eb",
          top: springTop,
          left: springLeft,
          y: -24,
          x: 8,
        }}
        initial={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ type: "spring", visualDuration: 0.2, bounce: 0.1 }}
      >
        {label}
      </motion.div>

      {/* Selection outline */}
      <motion.div
        style={{
          position: "fixed",
          zIndex: 99998,
          border: "2px solid #2563eb",
          borderRadius: 4,
          pointerEvents: "none",
          top: springTop,
          left: springLeft,
          width: springWidth,
          height: springHeight,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
      />
    </>
  );
};
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/mason/sightglass && yarn build
```

Expected: Clean build.

- [ ] **Step 3: Verify typecheck**

```bash
cd /Users/mason/sightglass && yarn typecheck
```

Expected: No type errors.

- [ ] **Step 4: Run existing tests**

```bash
cd /Users/mason/sightglass && yarn test
```

Expected: All existing tests pass.

- [ ] **Step 5: Manual verification**

Open playground. Select elements. The overlay should spring smoothly to new positions instead of linearly sliding. The label should fade/scale in on first appearance.

- [ ] **Step 6: Commit**

```bash
git add packages/react/src/components/SelectionOverlay.tsx
git commit -m "feat: spring-animated selection overlay using motion"
```

---

## Task 4: Panel open/close and staggered child animations

**Files:**

- Modify: `packages/react/src/components/EditorPanel.tsx`

- [ ] **Step 1: Add motion imports and animated collapsed button**

At the top of `EditorPanel.tsx`, add:

```typescript
import { motion, AnimatePresence } from "motion/react";
```

- [ ] **Step 2: Replace collapsed button with animated version**

Replace the collapsed state return (lines 233-247) with:

```tsx
if (!overlay.panelOpen) {
  return (
    <motion.button
      type="button"
      data-sightglass-chrome="true"
      style={collapsedStyle}
      onClick={() => {
        commands.setPanelOpen(true);
        commands.setActive(true);
      }}
      initial={{ scale: 0.5, opacity: 0, filter: "blur(8px)" }}
      animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", visualDuration: 0.2, bounce: 0.15 }}
    >
      <WandIcon />
    </motion.button>
  );
}
```

- [ ] **Step 3: Wrap toolbar in motion container**

Replace the toolbar `<div style={toolbarStyle}>` with:

```tsx
<motion.div
  style={toolbarStyle}
  initial={{ scale: 0.9, opacity: 0, filter: "blur(8px)" }}
  animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
  transition={{ type: "spring", visualDuration: 0.25, bounce: 0.1 }}
>
```

And close with `</motion.div>` instead of `</div>`.

- [ ] **Step 4: Wrap panel in AnimatePresence with staggered children**

Replace the panel `<aside>` (lines 296-345) with:

```tsx
<AnimatePresence>
  {showPanel && (
    <motion.aside
      aria-label="Sightglass inspector"
      style={panelShellStyle}
      initial={{ opacity: 0, y: -8, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
      transition={{ type: "spring", visualDuration: 0.25, bounce: 0.05 }}
    >
      <motion.div
        style={panelTabRowStyle}
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.03 } },
        }}
      >
        {TABS.map((tab) => (
          <motion.button
            key={tab}
            type="button"
            style={panelTabStyle(activeTab === tab)}
            onClick={() => setActiveTab(tab)}
            variants={{
              hidden: { opacity: 0, scale: 0.8 },
              visible: { opacity: 1, scale: 1 },
            }}
            transition={{ type: "spring", visualDuration: 0.15, bounce: 0.1 }}
          >
            {tab}
          </motion.button>
        ))}
      </motion.div>

      <div style={panelScrollStyle}>
        <div style={panelSectionStyle}>
          <span style={panelSectionLabelStyle}>Selection</span>
          <div style={panelRowStyle}>
            <span style={panelRowLabelStyle}>Target</span>
            <span style={{ ...panelRowValueStyle, maxWidth: 150 }}>
              {primaryAnchor?.selector ?? "Click an element"}
            </span>
          </div>
          <div style={panelRowStyle}>
            <span style={panelRowLabelStyle}>Role</span>
            <span style={panelRowValueStyle}>
              {primaryAnchor?.role ?? "\u2014"}
            </span>
          </div>
          <div style={panelRowStyle}>
            <span style={panelRowLabelStyle}>Scope</span>
            <span style={panelRowValueStyle}>
              {scopeCount <= 1 ? "\u2014" : `${scopeCount} candidates`}
            </span>
          </div>
        </div>

        {activeTab === "Style" && (
          <SemanticInspector
            commands={commands}
            overlay={overlay}
            session={session}
          />
        )}
        {activeTab === "Issues" && <CritiquePanel session={session} />}
        {activeTab === "Explore" && <ExplorePanel session={session} />}
        {activeTab === "Motion" && <MotionLab session={session} />}
      </div>
    </motion.aside>
  )}
</AnimatePresence>
```

- [ ] **Step 5: Verify build and tests**

```bash
cd /Users/mason/sightglass && yarn build && yarn typecheck && yarn test
```

Expected: All pass.

- [ ] **Step 6: Commit**

```bash
git add packages/react/src/components/EditorPanel.tsx
git commit -m "feat: spring animations for panel open/close and staggered tabs"
```

---

## Task 5: Inline text editing

This task exposes the existing `createTextSession` from core through the controller and provides a UI activation mechanism.

**Files:**

- Modify: `packages/core/src/controller.ts`
- Create: `packages/react/src/components/InlineTextEditor.tsx`
- Modify: `packages/react/src/provider.tsx`
- Modify: `packages/react/src/components/EditorPanel.tsx`

### Part A: Extend controller with text editing

- [ ] **Step 1: Add text session to controller interface**

In `packages/core/src/controller.ts`, add imports at the top:

```typescript
import {
  createTextSession,
  type TextSession,
  type ActiveTextEdit,
} from "./text/text-session.js";
import { generateAnchor } from "./selection/generate-anchor.js";
```

- [ ] **Step 2: Extend SightglassSessionSnapshot**

Add `isEditingText` to the snapshot interface (line 16-21):

```typescript
export interface SightglassSessionSnapshot {
  readonly active: boolean;
  readonly selectedElement: Element | null;
  readonly selection: Readonly<SelectionResult>;
  readonly history: Readonly<MutationEngineSnapshot>;
  readonly isEditingText: boolean;
}
```

- [ ] **Step 3: Extend SightglassController**

Add text editing methods to the controller interface (line 22-34):

```typescript
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
  startTextEdit(): void;
  commitTextEdit(): Promise<void>;
  cancelTextEdit(): void;
}
```

- [ ] **Step 4: Update createSnapshot default**

In the `createSnapshot` function, add `isEditingText` default:

```typescript
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
```

- [ ] **Step 5: Implement text editing in createSightglassController**

Inside `createSightglassController`, after the `mutationEngine` declaration (line 98-102), add:

```typescript
const textSession = createTextSession({ engine: mutationEngine });
```

Then add the three methods to the returned object (after `redo`):

```typescript
    startTextEdit() {
      const el = snapshot.selectedElement;
      if (!el || textSession.current()) return;

      const anchor = generateAnchor(el);
      textSession.startTextEdit({ target: el, anchor });
      el.setAttribute("contenteditable", "plaintext-only");
      el.focus();
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
```

**Important:** `contenteditable="plaintext-only"` prevents HTML injection from paste. This is supported in Chrome 120+, Safari 16.4+, and Firefox 131+. For the `setActive` and `inspectAtPoint` methods, add cleanup of any active text edit:

In the existing `setActive` method, add at the top:

```typescript
    setActive(active) {
      // Cancel any active text edit when deactivating
      if (!active && textSession.current()) {
        const edit = textSession.current()!;
        edit.target.removeAttribute("contenteditable");
        textSession.cancelTextEdit();
        // isEditingText will be set false in the snapshot below
      }

      if (snapshot.active === active) return;
      updateSnapshot({ active, isEditingText: false });
    },
```

In the existing `inspectAtPoint` method, add cleanup at the top:

```typescript
    inspectAtPoint(point) {
      // Cancel any active text edit when selecting a new element
      if (textSession.current()) {
        const edit = textSession.current()!;
        edit.target.removeAttribute("contenteditable");
        textSession.cancelTextEdit();
      }

      const selectedElement = resolveBestElement(options.document, point);
      // ... rest unchanged
    },
```

In the existing `destroy` method, add cleanup:

```typescript
    destroy() {
      if (textSession.current()) {
        const edit = textSession.current()!;
        edit.target.removeAttribute("contenteditable");
        textSession.cancelTextEdit();
      }
      listeners.clear();
    },
```

### Part B: Expose text commands in provider + wire double-click

- [ ] **Step 6: Add text commands to SightglassCommands**

In `packages/react/src/provider.tsx`, update the `SightglassCommands` interface (lines 33-40):

```typescript
interface SightglassCommands {
  setActive(active: boolean): void;
  inspectAtPoint(point: SelectionPoint): void;
  undo(): Promise<unknown>;
  redo(): Promise<unknown>;
  setHoveredScope(scope: EditScope | null): void;
  setPanelOpen(open: boolean): void;
  startTextEdit(): void;
  commitTextEdit(): Promise<void>;
  cancelTextEdit(): void;
}
```

- [ ] **Step 7: Wire commands in provider useMemo**

Update the `commands` useMemo (lines 140-150) to include the new methods:

```typescript
const commands = useMemo<SightglassCommands>(
  () => ({
    setActive: (active) => resolvedController.setActive(active),
    inspectAtPoint: (point) => resolvedController.inspectAtPoint(point),
    undo: () => resolvedController.undo(),
    redo: () => resolvedController.redo(),
    setHoveredScope,
    setPanelOpen,
    startTextEdit: () => resolvedController.startTextEdit(),
    commitTextEdit: () => resolvedController.commitTextEdit(),
    cancelTextEdit: () => resolvedController.cancelTextEdit(),
  }),
  [resolvedController]
);
```

### Part C: Create InlineTextEditor component

- [ ] **Step 8: Create InlineTextEditor.tsx**

```tsx
// packages/react/src/components/InlineTextEditor.tsx
import { useEffect, useCallback } from "react";
import {
  useSightglassCommands,
  useSightglassSessionState,
} from "../use-sightglass";

/**
 * Headless component that listens for double-click on the selected element
 * to activate plaintext-only contenteditable text editing.
 * Commits on blur or Enter, cancels on Escape.
 * Paste is intercepted and inserted as plain text for safety.
 */
export const InlineTextEditor = () => {
  const session = useSightglassSessionState();
  const commands = useSightglassCommands();
  const { selectedElement, isEditingText } = session;

  // Double-click to start editing
  useEffect(() => {
    if (!selectedElement || isEditingText) return;

    const handleDblClick = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      commands.startTextEdit();
    };

    selectedElement.addEventListener("dblclick", handleDblClick);
    return () =>
      selectedElement.removeEventListener("dblclick", handleDblClick);
  }, [selectedElement, isEditingText, commands]);

  // Commit on blur, cancel on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        commands.cancelTextEdit();
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        commands.commitTextEdit();
      }
    },
    [commands]
  );

  const handleBlur = useCallback(() => {
    commands.commitTextEdit();
  }, [commands]);

  // Paste interceptor: strip HTML, insert plain text only.
  // This is a defense-in-depth measure alongside contenteditable="plaintext-only".
  const handlePaste = useCallback((e: ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData?.getData("text/plain") ?? "";
    document.execCommand("insertText", false, text);
  }, []);

  useEffect(() => {
    if (!selectedElement || !isEditingText) return;

    selectedElement.addEventListener("keydown", handleKeyDown);
    selectedElement.addEventListener("blur", handleBlur);
    selectedElement.addEventListener("paste", handlePaste);

    return () => {
      selectedElement.removeEventListener("keydown", handleKeyDown);
      selectedElement.removeEventListener("blur", handleBlur);
      selectedElement.removeEventListener("paste", handlePaste);
    };
  }, [selectedElement, isEditingText, handleKeyDown, handleBlur, handlePaste]);

  return null;
};
```

- [ ] **Step 9: Mount InlineTextEditor in EditorPanel**

In `packages/react/src/components/EditorPanel.tsx`, add the import:

```typescript
import { InlineTextEditor } from "./InlineTextEditor";
```

Then add `<InlineTextEditor />` inside the `<div data-sightglass-chrome="true">` wrapper, just before the toolbar div:

```tsx
<div data-sightglass-chrome="true">
  <InlineTextEditor />
  {/* Toolbar bar - always visible when open */}
  <motion.div style={toolbarStyle}>
```

- [ ] **Step 10: Update ALL test mocks for new controller methods**

In `packages/react/src/provider.test.tsx`, there are **two** mock implementations that must be updated:

**A) The `createController()` factory function** (object literal mock):

```typescript
// Add to the returned object:
startTextEdit: vi.fn(),
commitTextEdit: vi.fn().mockResolvedValue(undefined),
cancelTextEdit: vi.fn(),
applyStyleToSelected: vi.fn().mockResolvedValue({ applied: [], canUndo: false, canRedo: false }),
```

**B) The `ClassBackedController implements SightglassController` class:**

```typescript
// Add these method stubs to the class body:
startTextEdit() {}
async commitTextEdit() {}
cancelTextEdit() {}
async applyStyleToSelected(_property: string, _value: string) {
  return { applied: [], canUndo: false, canRedo: false };
}
```

**C) The shared `createSnapshot()` helper:**

```typescript
// Add to the returned snapshot object:
isEditingText: false,
```

All three changes are required or `yarn typecheck` will fail.

- [ ] **Step 11: Verify build and tests**

```bash
cd /Users/mason/sightglass && yarn build && yarn typecheck && yarn test
```

Expected: All pass (including existing provider tests with updated mocks).

- [ ] **Step 12: Manual verification**

Open playground. Select a text element (heading, paragraph, button label). Double-click it. The text should become editable with a blue caret. Type changes. Press Escape to cancel (text reverts) or click away to commit (text persists and appears in history). Verify that selecting a different element cancels any active text edit.

- [ ] **Step 13: Commit**

```bash
git add packages/core/src/controller.ts packages/react/src/provider.tsx packages/react/src/provider.test.tsx packages/react/src/components/InlineTextEditor.tsx packages/react/src/components/EditorPanel.tsx
git commit -m "feat: inline text editing via double-click with plaintext-only sanitization"
```

---

## Task 6: Interactive Slider control

**Files:**

- Create: `packages/react/src/components/controls/Slider.tsx`
- Test: `packages/react/src/components/controls/Slider.test.tsx`

- [ ] **Step 1: Write Slider test**

```tsx
// packages/react/src/components/controls/Slider.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Slider } from "./Slider";

describe("Slider", () => {
  it("renders with label and value", () => {
    render(
      <Slider
        label="Opacity"
        value={50}
        min={0}
        max={100}
        onChange={() => {}}
      />
    );
    expect(screen.getByText("Opacity")).toBeTruthy();
    expect(screen.getByText("50")).toBeTruthy();
  });

  it("displays suffix when provided", () => {
    render(
      <Slider
        label="Size"
        value={16}
        min={0}
        max={100}
        suffix="px"
        onChange={() => {}}
      />
    );
    expect(screen.getByText("16px")).toBeTruthy();
  });

  it("calls onChange on track click", () => {
    const onChange = vi.fn();
    render(
      <Slider label="Test" value={50} min={0} max={100} onChange={onChange} />
    );
    const track = screen.getByTestId("slider-track");
    // Simulate a click at 75% of the track width
    Object.defineProperty(track, "getBoundingClientRect", {
      value: () => ({ left: 0, width: 100, top: 0, height: 10 }),
    });
    fireEvent.pointerDown(track, { clientX: 75, pointerId: 1 });
    expect(onChange).toHaveBeenCalledWith(75);
  });

  it("calls onReset when reset button clicked", () => {
    const onReset = vi.fn();
    render(
      <Slider
        label="Test"
        value={50}
        min={0}
        max={100}
        changed
        onChange={() => {}}
        onReset={onReset}
      />
    );
    const reset = screen.getByTitle("Reset");
    fireEvent.click(reset);
    expect(onReset).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/mason/sightglass && yarn workspace @sightglass/react exec vitest run --environment jsdom src/components/controls/Slider.test.tsx
```

Expected: FAIL (module not found).

- [ ] **Step 3: Create Slider component**

```tsx
// packages/react/src/components/controls/Slider.tsx
import { useCallback, useRef, useState, type CSSProperties } from "react";

export interface SliderStop {
  readonly value: number;
  readonly label: string;
}

export interface SliderProps {
  readonly label: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly step?: number;
  readonly suffix?: string;
  readonly changed?: boolean;
  readonly formatValue?: (value: number) => string;
  readonly stops?: readonly SliderStop[];
  readonly onChange: (value: number) => void;
  readonly onReset?: () => void;
}

const trackStyle: CSSProperties = {
  position: "relative",
  height: 10,
  borderRadius: 10,
  background: "rgba(255, 255, 255, 0.025)",
  cursor: "ew-resize",
  overflow: "hidden",
  transition: "background 0.15s",
};

const trackHoverStyle: CSSProperties = {
  ...trackStyle,
  background: "rgba(255, 255, 255, 0.04)",
};

const fillStyle = (pct: number): CSSProperties => ({
  position: "absolute",
  top: 0,
  left: 0,
  height: "100%",
  width: `${pct}%`,
  background: "#363636",
  borderRadius: "10px 0 0 10px",
  pointerEvents: "none",
});

const handleStyle = (pct: number, visible: boolean): CSSProperties => ({
  position: "absolute",
  top: "50%",
  left: `${pct}%`,
  width: 14,
  height: 14,
  borderRadius: "50%",
  border: "2px solid white",
  background: "#242424",
  transform: "translate(-50%, -50%)",
  opacity: visible ? 0.9 : 0,
  transition: "opacity 0.15s",
  pointerEvents: "none",
  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
});

const rowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
  minHeight: 28,
};

const labelStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  color: "#999",
  flexShrink: 0,
};

const valueStyle = (changed: boolean): CSSProperties => ({
  fontSize: 13,
  fontWeight: 500,
  fontVariantNumeric: "tabular-nums",
  color: changed ? "#93c5fd" : "rgba(255, 255, 255, 0.4)",
  transition: "color 0.15s",
});

const resetBtnStyle: CSSProperties = {
  padding: 0,
  border: "none",
  background: "transparent",
  color: "rgba(255, 255, 255, 0.3)",
  cursor: "pointer",
  fontSize: 11,
  lineHeight: 1,
};

export const Slider = ({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  changed = false,
  formatValue,
  stops,
  onChange,
  onReset,
}: SliderProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const displayValue = formatValue ? formatValue(value) : `${value}${suffix}`;

  const resolveValue = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return value;

      const rect = track.getBoundingClientRect();
      const ratio = Math.max(
        0,
        Math.min(1, (clientX - rect.left) / rect.width)
      );
      let resolved = min + ratio * (max - min);

      // Snap to stops if within 5% range
      if (stops) {
        for (const stop of stops) {
          const stopPct = (stop.value - min) / (max - min);
          if (Math.abs(ratio - stopPct) < 0.05) {
            resolved = stop.value;
            break;
          }
        }
      }

      // Round to step
      resolved = Math.round(resolved / step) * step;
      return Math.max(min, Math.min(max, resolved));
    },
    [min, max, step, stops, value]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setIsDragging(true);
      onChange(resolveValue(e.clientX));
    },
    [onChange, resolveValue]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      onChange(resolveValue(e.clientX));
    },
    [isDragging, onChange, resolveValue]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div
      style={{ display: "grid", gap: 4, padding: "4px 0" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={rowStyle}>
        <span style={labelStyle}>{label}</span>
        <span style={valueStyle(changed)}>{displayValue}</span>
        {changed && onReset && (
          <button
            type="button"
            style={resetBtnStyle}
            title="Reset"
            onClick={onReset}
          >
            \u21A9
          </button>
        )}
      </div>
      <div
        ref={trackRef}
        data-testid="slider-track"
        style={isHovered || isDragging ? trackHoverStyle : trackStyle}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div style={fillStyle(pct)} />
        <div style={handleStyle(pct, isHovered || isDragging)} />
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Run tests**

```bash
cd /Users/mason/sightglass && yarn workspace @sightglass/react exec vitest run --environment jsdom src/components/controls/Slider.test.tsx
```

Expected: All 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/components/controls/Slider.tsx packages/react/src/components/controls/Slider.test.tsx
git commit -m "feat: interactive Slider control with fill bar, handle, stops"
```

---

## Task 7: Color picker control

**Files:**

- Create: `packages/react/src/components/controls/ColorPicker.tsx`

- [ ] **Step 1: Create ColorPicker**

```tsx
// packages/react/src/components/controls/ColorPicker.tsx
import {
  useState,
  useCallback,
  useRef,
  useEffect,
  type CSSProperties,
} from "react";

export interface ColorPickerProps {
  readonly label: string;
  readonly value: string; // hex color
  readonly changed?: boolean;
  readonly onChange: (color: string) => void;
  readonly onReset?: () => void;
}

const swatchStyle = (color: string): CSSProperties => ({
  width: 14,
  height: 14,
  borderRadius: 4,
  border: "1px solid rgba(255,255,255,0.1)",
  background: color,
  flexShrink: 0,
});

const triggerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  width: "100%",
  height: 40,
  padding: "0 14px",
  border: "none",
  borderRadius: 10,
  background: "rgba(255,255,255,0.025)",
  color: "rgba(255,255,255,0.6)",
  fontSize: 13,
  fontFamily: "ui-monospace, SFMono-Regular, monospace",
  cursor: "pointer",
  transition: "background 0.15s",
};

const popoverStyle: CSSProperties = {
  position: "fixed",
  zIndex: 100000,
  width: 224,
  padding: 12,
  background: "#242424",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
  display: "grid",
  gap: 10,
};

const inputStyle: CSSProperties = {
  width: "100%",
  height: 32,
  padding: "0 8px",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 6,
  background: "transparent",
  color: "#e5e5e7",
  fontSize: 13,
  fontFamily: "ui-monospace, SFMono-Regular, monospace",
  outline: "none",
};

const sliderRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const sliderLabelStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  color: "#999",
  width: 12,
  flexShrink: 0,
};

const rangeStyle: CSSProperties = {
  flex: 1,
  height: 4,
  appearance: "none",
  background: "rgba(255,255,255,0.1)",
  borderRadius: 2,
  outline: "none",
};

const hexToHsl = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0, 0, 50];

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const maxC = Math.max(r, g, b);
  const minC = Math.min(r, g, b);
  const l = (maxC + minC) / 2;

  if (maxC === minC) return [0, 0, Math.round(l * 100)];

  const d = maxC - minC;
  const s = l > 0.5 ? d / (2 - maxC - minC) : d / (maxC + minC);
  let h = 0;
  if (maxC === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (maxC === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
};

const hslToHex = (h: number, s: number, l: number): string => {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const a = sNorm * Math.min(lNorm, 1 - lNorm);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = lNorm - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

export const ColorPicker = ({
  label,
  value,
  changed = false,
  onChange,
  onReset,
}: ColorPickerProps) => {
  const [open, setOpen] = useState(false);
  const [hsl, setHsl] = useState(() => hexToHsl(value));
  // Local draft state so the input stays responsive during partial typing
  const [hexDraft, setHexDraft] = useState(value);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Sync external value changes (undo/redo, prop updates)
  useEffect(() => {
    setHsl(hexToHsl(value));
    setHexDraft(value);
  }, [value]);

  const updateHsl = useCallback(
    (index: number, newVal: number) => {
      const next: [number, number, number] = [...hsl];
      next[index] = newVal;
      setHsl(next);
      const hex = hslToHex(next[0], next[1], next[2]);
      setHexDraft(hex);
      onChange(hex);
    },
    [hsl, onChange]
  );

  const handleHexInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const hex = e.target.value;
      setHexDraft(hex); // Always update draft so typing is responsive
      if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
        setHsl(hexToHsl(hex));
        onChange(hex);
      }
    },
    [onChange]
  );

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", handleClick);
    return () => document.removeEventListener("pointerdown", handleClick);
  }, [open]);

  const triggerRect = triggerRef.current?.getBoundingClientRect();

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: 28,
          marginBottom: 4,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 500, color: "#999" }}>
          {label}
        </span>
        {changed && onReset && (
          <button
            type="button"
            style={{
              padding: 0,
              border: "none",
              background: "transparent",
              color: "rgba(255,255,255,0.3)",
              cursor: "pointer",
              fontSize: 11,
            }}
            title="Reset"
            onClick={onReset}
          >
            {"\u21A9"}
          </button>
        )}
      </div>
      <button
        ref={triggerRef}
        type="button"
        style={triggerStyle}
        onClick={() => setOpen(!open)}
      >
        <div style={swatchStyle(value)} />
        <span style={{ color: changed ? "#93c5fd" : "rgba(255,255,255,0.6)" }}>
          {value}
        </span>
      </button>

      {open && triggerRect && (
        <div
          ref={popoverRef}
          style={{
            ...popoverStyle,
            top: triggerRect.bottom + 8,
            right: 16,
          }}
        >
          <input
            type="text"
            value={hexDraft}
            style={inputStyle}
            onChange={handleHexInput}
            spellCheck={false}
          />
          {(["H", "S", "L"] as const).map((channel, i) => (
            <div key={channel} style={sliderRowStyle}>
              <span style={sliderLabelStyle}>{channel}</span>
              <input
                type="range"
                min={0}
                max={i === 0 ? 360 : 100}
                value={hsl[i]}
                style={rangeStyle}
                onChange={(e) => updateHsl(i, Number(e.target.value))}
              />
              <span
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.4)",
                  width: 28,
                  textAlign: "right",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {hsl[i]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/mason/sightglass && yarn build && yarn typecheck
```

Expected: Clean build.

- [ ] **Step 3: Commit**

```bash
git add packages/react/src/components/controls/ColorPicker.tsx
git commit -m "feat: color picker control with HSL sliders and hex input"
```

---

## Task 8: Box spacing control

**Files:**

- Create: `packages/react/src/components/controls/BoxSpacing.tsx`

- [ ] **Step 1: Create BoxSpacing component**

```tsx
// packages/react/src/components/controls/BoxSpacing.tsx
import { useState, useCallback, useRef, type CSSProperties } from "react";

type Side = "top" | "right" | "bottom" | "left";

export interface BoxSpacingProps {
  readonly label: string;
  readonly values: Readonly<Record<Side, number>>;
  readonly onChange: (side: Side, value: number) => void;
  readonly onReset?: () => void;
  readonly changed?: boolean;
}

const SIDES: readonly Side[] = ["top", "right", "bottom", "left"];

const containerStyle: CSSProperties = {
  display: "grid",
  gap: 4,
  padding: "4px 0",
};

const boxStyle: CSSProperties = {
  position: "relative",
  display: "grid",
  gridTemplateColumns: "1fr auto 1fr",
  gridTemplateRows: "auto auto auto",
  alignItems: "center",
  justifyItems: "center",
  gap: 2,
  padding: 4,
  borderRadius: 8,
  border: "1px dashed rgba(255,255,255,0.1)",
  minHeight: 80,
};

const badgeStyle = (active: boolean): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 28,
  height: 20,
  padding: "0 4px",
  borderRadius: 4,
  background: active ? "#363636" : "transparent",
  color: active ? "#93c5fd" : "rgba(255,255,255,0.4)",
  fontSize: 11,
  fontVariantNumeric: "tabular-nums",
  cursor: "ew-resize",
  userSelect: "none",
  transition: "background 0.15s, color 0.15s",
});

const innerBoxStyle: CSSProperties = {
  width: 40,
  height: 24,
  borderRadius: 4,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
};

export const BoxSpacing = ({
  label,
  values,
  onChange,
  onReset,
  changed = false,
}: BoxSpacingProps) => {
  const [activeSide, setActiveSide] = useState<Side | null>(null);
  const dragRef = useRef<{
    side: Side;
    startX: number;
    startVal: number;
  } | null>(null);

  const handlePointerDown = useCallback(
    (side: Side, e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      dragRef.current = { side, startX: e.clientX, startVal: values[side] };
      setActiveSide(side);
    },
    [values]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const newVal = Math.max(
        0,
        Math.min(64, dragRef.current.startVal + Math.round(dx / 2))
      );
      onChange(dragRef.current.side, newVal);
    },
    [onChange]
  );

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
    setActiveSide(null);
  }, []);

  return (
    <div style={containerStyle}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: 28,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 500, color: "#999" }}>
          {label}
        </span>
        {changed && onReset && (
          <button
            type="button"
            style={{
              padding: 0,
              border: "none",
              background: "transparent",
              color: "rgba(255,255,255,0.3)",
              cursor: "pointer",
              fontSize: 11,
            }}
            title="Reset"
            onClick={onReset}
          >
            {"\u21A9"}
          </button>
        )}
      </div>
      <div
        style={boxStyle}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Top */}
        <div style={{ gridColumn: 2, gridRow: 1 }}>
          <div
            style={badgeStyle(activeSide === "top")}
            onPointerDown={(e) => handlePointerDown("top", e)}
          >
            {values.top}
          </div>
        </div>
        {/* Left */}
        <div style={{ gridColumn: 1, gridRow: 2 }}>
          <div
            style={badgeStyle(activeSide === "left")}
            onPointerDown={(e) => handlePointerDown("left", e)}
          >
            {values.left}
          </div>
        </div>
        {/* Center box */}
        <div style={{ gridColumn: 2, gridRow: 2 }}>
          <div style={innerBoxStyle} />
        </div>
        {/* Right */}
        <div style={{ gridColumn: 3, gridRow: 2 }}>
          <div
            style={badgeStyle(activeSide === "right")}
            onPointerDown={(e) => handlePointerDown("right", e)}
          >
            {values.right}
          </div>
        </div>
        {/* Bottom */}
        <div style={{ gridColumn: 2, gridRow: 3 }}>
          <div
            style={badgeStyle(activeSide === "bottom")}
            onPointerDown={(e) => handlePointerDown("bottom", e)}
          >
            {values.bottom}
          </div>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/mason/sightglass && yarn build && yarn typecheck
```

- [ ] **Step 3: Commit**

```bash
git add packages/react/src/components/controls/BoxSpacing.tsx
git commit -m "feat: box spacing control with drag-to-adjust sides"
```

---

## Task 9: Alignment control

**Files:**

- Create: `packages/react/src/components/controls/AlignmentControl.tsx`

- [ ] **Step 1: Create AlignmentControl**

```tsx
// packages/react/src/components/controls/AlignmentControl.tsx
import type { CSSProperties } from "react";

type AlignValue =
  | "flex-start"
  | "center"
  | "flex-end"
  | "stretch"
  | "space-between";

export interface AlignmentControlProps {
  readonly label: string;
  readonly value: string;
  readonly options?: readonly AlignValue[];
  readonly onChange: (value: string) => void;
}

const ALIGN_LABELS: Record<string, string> = {
  "flex-start": "\u2B06",
  center: "\u2B0C",
  "flex-end": "\u2B07",
  stretch: "\u2194",
  "space-between": "\u2725",
};

const DEFAULT_OPTIONS: readonly AlignValue[] = [
  "flex-start",
  "center",
  "flex-end",
  "stretch",
];

const gridStyle: CSSProperties = {
  display: "flex",
  gap: 2,
};

const cellStyle = (active: boolean): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 32,
  height: 28,
  border: "none",
  borderRadius: 6,
  background: active ? "#363636" : "transparent",
  color: active ? "#93c5fd" : "rgba(255,255,255,0.4)",
  fontSize: 14,
  cursor: "pointer",
  transition: "background 0.15s, color 0.15s",
});

export const AlignmentControl = ({
  label,
  value,
  options = DEFAULT_OPTIONS,
  onChange,
}: AlignmentControlProps) => (
  <div style={{ display: "grid", gap: 4, padding: "4px 0" }}>
    <span style={{ fontSize: 13, fontWeight: 500, color: "#999" }}>
      {label}
    </span>
    <div style={gridStyle}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          style={cellStyle(value === opt)}
          onClick={() => onChange(opt)}
          title={opt}
        >
          {ALIGN_LABELS[opt] ?? opt}
        </button>
      ))}
    </div>
  </div>
);
```

- [ ] **Step 2: Create barrel export**

```typescript
// packages/react/src/components/controls/index.ts
export { Slider } from "./Slider";
export type { SliderProps, SliderStop } from "./Slider";
export { ColorPicker } from "./ColorPicker";
export type { ColorPickerProps } from "./ColorPicker";
export { BoxSpacing } from "./BoxSpacing";
export type { BoxSpacingProps } from "./BoxSpacing";
export { AlignmentControl } from "./AlignmentControl";
export type { AlignmentControlProps } from "./AlignmentControl";
```

- [ ] **Step 3: Verify build**

```bash
cd /Users/mason/sightglass && yarn build && yarn typecheck
```

- [ ] **Step 4: Commit**

```bash
git add packages/react/src/components/controls/AlignmentControl.tsx packages/react/src/components/controls/index.ts
git commit -m "feat: alignment control and controls barrel export"
```

---

## Task 10: PropertyEditor - interactive style editing panel

This replaces the read-only SemanticInspector on the Style tab with a full property editor.

**Files:**

- Create: `packages/react/src/components/PropertyEditor.tsx`
- Modify: `packages/react/src/components/EditorPanel.tsx`
- Modify: `packages/core/src/controller.ts`
- Modify: `packages/react/src/provider.tsx`

### Part A: Add applyStyleToSelected to the controller

- [ ] **Step 1: Extend SightglassController with style application**

In `packages/core/src/controller.ts`, add to the `SightglassController` interface:

```typescript
  applyStyleToSelected(
    property: string,
    value: string,
    semanticKind?: import("./types").EditSemanticKind
  ): Promise<Readonly<MutationEngineSnapshot>>;
```

- [ ] **Step 2: Implement applyStyleToSelected**

In the returned object from `createSightglassController`, add (after `cancelTextEdit`):

```typescript
    async applyStyleToSelected(property, value, semanticKind = "css") {
      const el = snapshot.selectedElement;
      if (!el) return snapshot.history;

      const anchor = generateAnchor(el);
      const transaction = createSessionTransaction({
        id: `style-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
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
```

Add the import for `createSessionTransaction` at the top:

```typescript
import { createSessionTransaction } from "./contracts.js";
```

### Part B: Expose applyStyle command

- [ ] **Step 3: Add to SightglassCommands in provider.tsx**

Add to the `SightglassCommands` interface:

```typescript
  applyStyle(property: string, value: string): Promise<void>;
```

Wire it in the `commands` useMemo:

```typescript
  applyStyle: async (property, value) => {
    await resolvedController.applyStyleToSelected(property, value);
  },
```

### Part C: Build the PropertyEditor

- [ ] **Step 4: Create PropertyEditor.tsx**

```tsx
// packages/react/src/components/PropertyEditor.tsx
import { useState, useEffect, useMemo, type CSSProperties } from "react";
import type { SightglassSessionSnapshot } from "@sightglass/core";
import type { SightglassCommands } from "../provider";
import { Slider } from "./controls/Slider";
import { ColorPicker } from "./controls/ColorPicker";
import { BoxSpacing } from "./controls/BoxSpacing";
import { AlignmentControl } from "./controls/AlignmentControl";
import {
  panelButtonStyle,
  panelSectionStyle,
  panelSectionLabelStyle,
  panelMutedStyle,
} from "./panel-styles";

interface PropertyEditorProps {
  readonly session: Readonly<SightglassSessionSnapshot>;
  readonly commands: Pick<SightglassCommands, "applyStyle">;
}

type Side = "top" | "right" | "bottom" | "left";

const parsePx = (v: string): number => parseFloat(v) || 0;

/**
 * Re-reads computed styles whenever the element changes OR history changes
 * (undo/redo/new apply). This ensures controls stay in sync with actual DOM.
 */
const useComputedStyles = (
  element: Element | null,
  historyVersion: unknown
) => {
  return useMemo(() => {
    // historyVersion is used purely as a cache-bust key
    void historyVersion;
    if (!element) return null;
    return getComputedStyle(element);
  }, [element, historyVersion]);
};

export const PropertyEditor = ({ session, commands }: PropertyEditorProps) => {
  const { selectedElement } = session;
  // Key on session.history so undo/redo refreshes computed styles
  const computed = useComputedStyles(selectedElement, session.history);

  // Local state for interactive controls - synced from computed styles
  const [bgColor, setBgColor] = useState("#000000");
  const [textColor, setTextColor] = useState("#ffffff");
  const [fontSize, setFontSize] = useState(16);
  const [fontWeight, setFontWeight] = useState(400);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [opacity, setOpacity] = useState(100);
  const [borderRadius, setBorderRadius] = useState(0);
  const [padding, setPadding] = useState<Record<Side, number>>({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });
  const [margin, setMargin] = useState<Record<Side, number>>({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  // Sync from computed styles when selection OR history changes (undo/redo)
  useEffect(() => {
    if (!computed) return;
    setBgColor(rgbToHex(computed.backgroundColor));
    setTextColor(rgbToHex(computed.color));
    setFontSize(parsePx(computed.fontSize));
    setFontWeight(parseInt(computed.fontWeight, 10) || 400);
    setLineHeight(
      computed.lineHeight === "normal"
        ? 1.5
        : parsePx(computed.lineHeight) / (parsePx(computed.fontSize) || 16)
    );
    setLetterSpacing(parsePx(computed.letterSpacing));
    setOpacity(Math.round(parseFloat(computed.opacity) * 100));
    setBorderRadius(parsePx(computed.borderRadius));
    setPadding({
      top: parsePx(computed.paddingTop),
      right: parsePx(computed.paddingRight),
      bottom: parsePx(computed.paddingBottom),
      left: parsePx(computed.paddingLeft),
    });
    setMargin({
      top: parsePx(computed.marginTop),
      right: parsePx(computed.marginRight),
      bottom: parsePx(computed.marginBottom),
      left: parsePx(computed.marginLeft),
    });
  }, [computed]); // computed already re-creates when history changes via useComputedStyles

  if (!selectedElement || !computed) {
    return (
      <div style={panelSectionStyle}>
        <span style={panelSectionLabelStyle}>Properties</span>
        <span style={panelMutedStyle}>Select an element to edit.</span>
      </div>
    );
  }

  const apply = (property: string, value: string) => {
    commands.applyStyle(property, value);
  };

  return (
    <>
      {/* Background */}
      <div style={panelSectionStyle}>
        <span style={panelSectionLabelStyle}>Background</span>
        <ColorPicker
          label="Color"
          value={bgColor}
          onChange={(c) => {
            setBgColor(c);
            apply("background-color", c);
          }}
        />
        <Slider
          label="Opacity"
          value={opacity}
          min={0}
          max={100}
          suffix="%"
          onChange={(v) => {
            setOpacity(v);
            apply("opacity", String(v / 100));
          }}
        />
      </div>

      {/* Typography */}
      <div style={panelSectionStyle}>
        <span style={panelSectionLabelStyle}>Typography</span>
        <ColorPicker
          label="Color"
          value={textColor}
          onChange={(c) => {
            setTextColor(c);
            apply("color", c);
          }}
        />
        <Slider
          label="Size"
          value={fontSize}
          min={8}
          max={96}
          suffix="px"
          step={1}
          stops={[
            { value: 12, label: "xs" },
            { value: 14, label: "sm" },
            { value: 16, label: "base" },
            { value: 18, label: "lg" },
            { value: 20, label: "xl" },
            { value: 24, label: "2xl" },
            { value: 30, label: "3xl" },
            { value: 36, label: "4xl" },
            { value: 48, label: "5xl" },
          ]}
          onChange={(v) => {
            setFontSize(v);
            apply("font-size", `${v}px`);
          }}
        />
        <Slider
          label="Weight"
          value={fontWeight}
          min={100}
          max={900}
          step={100}
          formatValue={(v) =>
            ({
              100: "Thin",
              200: "XLight",
              300: "Light",
              400: "Regular",
              500: "Medium",
              600: "Semi",
              700: "Bold",
              800: "XBold",
              900: "Black",
            }[v] ?? String(v))
          }
          onChange={(v) => {
            setFontWeight(v);
            apply("font-weight", String(v));
          }}
        />
        <Slider
          label="Leading"
          value={Math.round(lineHeight * 100) / 100}
          min={0.8}
          max={3}
          step={0.05}
          onChange={(v) => {
            setLineHeight(v);
            apply("line-height", String(v));
          }}
        />
        <Slider
          label="Tracking"
          value={letterSpacing}
          min={-2}
          max={10}
          step={0.25}
          suffix="px"
          onChange={(v) => {
            setLetterSpacing(v);
            apply("letter-spacing", `${v}px`);
          }}
        />
      </div>

      {/* Border */}
      <div style={panelSectionStyle}>
        <span style={panelSectionLabelStyle}>Border</span>
        <Slider
          label="Radius"
          value={borderRadius >= 9999 ? 50 : borderRadius}
          min={0}
          max={50}
          suffix="px"
          stops={[
            { value: 0, label: "none" },
            { value: 4, label: "sm" },
            { value: 8, label: "md" },
            { value: 12, label: "lg" },
            { value: 16, label: "xl" },
          ]}
          onChange={(v) => {
            setBorderRadius(v);
            apply("border-radius", `${v}px`);
          }}
        />
        {/* Full (pill) toggle - separate from numeric slider */}
        <button
          type="button"
          style={{
            ...panelButtonStyle,
            ...(borderRadius >= 9999
              ? { background: "#363636", color: "#93c5fd" }
              : {}),
          }}
          onClick={() => {
            const next = borderRadius >= 9999 ? 0 : 9999;
            setBorderRadius(next);
            apply("border-radius", `${next}px`);
          }}
        >
          Full (pill)
        </button>
      </div>

      {/* Spacing */}
      <div style={panelSectionStyle}>
        <span style={panelSectionLabelStyle}>Spacing</span>
        <BoxSpacing
          label="Padding"
          values={padding}
          onChange={(side, v) => {
            setPadding((p) => ({ ...p, [side]: v }));
            apply(`padding-${side}`, `${v}px`);
          }}
        />
        <BoxSpacing
          label="Margin"
          values={margin}
          onChange={(side, v) => {
            setMargin((m) => ({ ...m, [side]: v }));
            apply(`margin-${side}`, `${v}px`);
          }}
        />
      </div>

      {/* Layout */}
      {computed.display.includes("flex") && (
        <div style={panelSectionStyle}>
          <span style={panelSectionLabelStyle}>Flex</span>
          <AlignmentControl
            label="Align Items"
            value={computed.alignItems}
            onChange={(v) => apply("align-items", v)}
          />
          <AlignmentControl
            label="Justify"
            value={computed.justifyContent}
            options={["flex-start", "center", "flex-end", "space-between"]}
            onChange={(v) => apply("justify-content", v)}
          />
        </div>
      )}
    </>
  );
};

/** Convert `rgb(r, g, b)` or `rgba(r, g, b, a)` to `#rrggbb`. */
function rgbToHex(rgb: string): string {
  const match = rgb.match(/\d+/g);
  if (!match || match.length < 3) return "#000000";
  const [r, g, b] = match.map(Number);
  return "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
}
```

### Part D: Wire PropertyEditor into EditorPanel

- [ ] **Step 5: Replace Style tab content in EditorPanel**

In `EditorPanel.tsx`, add the import:

```typescript
import { PropertyEditor } from "./PropertyEditor";
```

Replace the Style tab conditional (the `activeTab === "Style"` block) with:

```tsx
{
  activeTab === "Style" && (
    <>
      <PropertyEditor session={session} commands={commands} />
      <SemanticInspector
        commands={commands}
        overlay={overlay}
        session={session}
      />
    </>
  );
}
```

This keeps the SemanticInspector below the new interactive controls.

- [ ] **Step 6: Verify build and tests**

```bash
cd /Users/mason/sightglass && yarn build && yarn typecheck && yarn test
```

Expected: All pass.

- [ ] **Step 7: Commit**

```bash
git add packages/core/src/controller.ts packages/react/src/provider.tsx packages/react/src/components/PropertyEditor.tsx packages/react/src/components/EditorPanel.tsx
git commit -m "feat: interactive property editor with sliders, color pickers, box spacing"
```

---

## Task 11: Tailwind CSS-to-class conversion

**Files:**

- Create: `packages/core/src/tailwind/css-to-tailwind.ts`
- Create: `packages/core/src/tailwind/tailwind-colors.ts`
- Test: `packages/core/src/tailwind/css-to-tailwind.test.ts`
- Test: `packages/core/src/tailwind/tailwind-colors.test.ts`
- Modify: `packages/core/src/index.ts`

- [ ] **Step 1: Write css-to-tailwind tests**

```typescript
// packages/core/src/tailwind/css-to-tailwind.test.ts
import { describe, it, expect } from "vitest";
import { cssToTailwind } from "./css-to-tailwind";

describe("cssToTailwind", () => {
  it("converts padding to Tailwind class", () => {
    expect(cssToTailwind("padding", "16px")).toBe("p-4");
    expect(cssToTailwind("padding-top", "8px")).toBe("pt-2");
    expect(cssToTailwind("padding-left", "4px")).toBe("pl-1");
  });

  it("converts margin to Tailwind class", () => {
    expect(cssToTailwind("margin", "24px")).toBe("m-6");
    expect(cssToTailwind("margin-bottom", "32px")).toBe("mb-8");
  });

  it("converts font-size to Tailwind class", () => {
    expect(cssToTailwind("font-size", "14px")).toBe("text-sm");
    expect(cssToTailwind("font-size", "16px")).toBe("text-base");
    expect(cssToTailwind("font-size", "24px")).toBe("text-2xl");
  });

  it("converts border-radius to Tailwind class", () => {
    expect(cssToTailwind("border-radius", "0px")).toBe("rounded-none");
    expect(cssToTailwind("border-radius", "4px")).toBe("rounded");
    expect(cssToTailwind("border-radius", "8px")).toBe("rounded-lg");
    expect(cssToTailwind("border-radius", "9999px")).toBe("rounded-full");
  });

  it("converts font-weight to Tailwind class", () => {
    expect(cssToTailwind("font-weight", "700")).toBe("font-bold");
    expect(cssToTailwind("font-weight", "400")).toBe("font-normal");
  });

  it("converts opacity to Tailwind class", () => {
    expect(cssToTailwind("opacity", "0.5")).toBe("opacity-50");
    expect(cssToTailwind("opacity", "1")).toBe("opacity-100");
  });

  it("falls back to arbitrary value for unknown values", () => {
    expect(cssToTailwind("padding", "13px")).toBe("p-[13px]");
    expect(cssToTailwind("font-size", "17px")).toBe("text-[17px]");
  });

  it("converts gap to Tailwind class", () => {
    expect(cssToTailwind("gap", "16px")).toBe("gap-4");
  });

  it("converts display to Tailwind class", () => {
    expect(cssToTailwind("display", "flex")).toBe("flex");
    expect(cssToTailwind("display", "grid")).toBe("grid");
    expect(cssToTailwind("display", "none")).toBe("hidden");
  });
});
```

- [ ] **Step 2: Write tailwind-colors tests**

```typescript
// packages/core/src/tailwind/tailwind-colors.test.ts
import { describe, it, expect } from "vitest";
import { findClosestTailwindColor } from "./tailwind-colors";

describe("findClosestTailwindColor", () => {
  it("finds exact match for red-500", () => {
    const result = findClosestTailwindColor("#ef4444");
    expect(result?.name).toBe("red-500");
  });

  it("finds exact match for blue-600", () => {
    const result = findClosestTailwindColor("#2563eb");
    expect(result?.name).toBe("blue-600");
  });

  it("finds close match for near-white", () => {
    const result = findClosestTailwindColor("#fefefe");
    expect(result?.name).toMatch(/gray-50|white|slate-50/);
  });

  it("returns null for no reasonable match", () => {
    // Very specific off-palette color
    const result = findClosestTailwindColor("#123456");
    // Should still return closest, but might have high distance
    expect(result).toBeTruthy();
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
cd /Users/mason/sightglass && yarn workspace @sightglass/core exec vitest run src/tailwind/
```

Expected: FAIL (modules not found).

- [ ] **Step 4: Create tailwind-colors.ts**

```typescript
// packages/core/src/tailwind/tailwind-colors.ts

export interface TailwindColorMatch {
  readonly name: string;
  readonly hex: string;
  readonly distance: number;
}

// Tailwind v4 default palette (subset of most-used shades)
const PALETTE: ReadonlyArray<readonly [string, string]> = [
  ["slate-50", "#f8fafc"],
  ["slate-100", "#f1f5f9"],
  ["slate-200", "#e2e8f0"],
  ["slate-300", "#cbd5e1"],
  ["slate-400", "#94a3b8"],
  ["slate-500", "#64748b"],
  ["slate-600", "#475569"],
  ["slate-700", "#334155"],
  ["slate-800", "#1e293b"],
  ["slate-900", "#0f172a"],
  ["slate-950", "#020617"],
  ["gray-50", "#f9fafb"],
  ["gray-100", "#f3f4f6"],
  ["gray-200", "#e5e7eb"],
  ["gray-300", "#d1d5db"],
  ["gray-400", "#9ca3af"],
  ["gray-500", "#6b7280"],
  ["gray-600", "#4b5563"],
  ["gray-700", "#374151"],
  ["gray-800", "#1f2937"],
  ["gray-900", "#111827"],
  ["gray-950", "#030712"],
  ["red-50", "#fef2f2"],
  ["red-100", "#fee2e2"],
  ["red-200", "#fecaca"],
  ["red-300", "#fca5a5"],
  ["red-400", "#f87171"],
  ["red-500", "#ef4444"],
  ["red-600", "#dc2626"],
  ["red-700", "#b91c1c"],
  ["red-800", "#991b1b"],
  ["red-900", "#7f1d1d"],
  ["red-950", "#450a0a"],
  ["orange-500", "#f97316"],
  ["amber-500", "#f59e0b"],
  ["yellow-500", "#eab308"],
  ["green-50", "#f0fdf4"],
  ["green-100", "#dcfce7"],
  ["green-200", "#bbf7d0"],
  ["green-300", "#86efac"],
  ["green-400", "#4ade80"],
  ["green-500", "#22c55e"],
  ["green-600", "#16a34a"],
  ["green-700", "#15803d"],
  ["green-800", "#166534"],
  ["green-900", "#14532d"],
  ["blue-50", "#eff6ff"],
  ["blue-100", "#dbeafe"],
  ["blue-200", "#bfdbfe"],
  ["blue-300", "#93c5fd"],
  ["blue-400", "#60a5fa"],
  ["blue-500", "#3b82f6"],
  ["blue-600", "#2563eb"],
  ["blue-700", "#1d4ed8"],
  ["blue-800", "#1e40af"],
  ["blue-900", "#1e3a8a"],
  ["blue-950", "#172554"],
  ["indigo-500", "#6366f1"],
  ["violet-500", "#8b5cf6"],
  ["purple-500", "#a855f7"],
  ["pink-500", "#ec4899"],
  ["rose-500", "#f43f5e"],
  ["white", "#ffffff"],
  ["black", "#000000"],
];

const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
};

const colorDistance = (
  a: [number, number, number],
  b: [number, number, number]
): number =>
  Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);

export const findClosestTailwindColor = (
  hex: string
): TailwindColorMatch | null => {
  const target = hexToRgb(hex.toLowerCase());
  let best: TailwindColorMatch | null = null;

  for (const [name, paletteHex] of PALETTE) {
    const d = colorDistance(target, hexToRgb(paletteHex));
    if (!best || d < best.distance) {
      best = { name, hex: paletteHex, distance: d };
    }
  }

  return best;
};

export const TAILWIND_PALETTE = PALETTE;
```

- [ ] **Step 5: Create css-to-tailwind.ts**

```typescript
// packages/core/src/tailwind/css-to-tailwind.ts

const SPACING_SCALE: ReadonlyArray<readonly [number, string]> = [
  [0, "0"],
  [1, "px"],
  [2, "0.5"],
  [4, "1"],
  [6, "1.5"],
  [8, "2"],
  [10, "2.5"],
  [12, "3"],
  [14, "3.5"],
  [16, "4"],
  [20, "5"],
  [24, "6"],
  [28, "7"],
  [32, "8"],
  [36, "9"],
  [40, "10"],
  [44, "11"],
  [48, "12"],
  [56, "14"],
  [64, "16"],
  [80, "20"],
  [96, "24"],
];

const FONT_SIZE_SCALE: ReadonlyArray<readonly [number, string]> = [
  [12, "xs"],
  [14, "sm"],
  [16, "base"],
  [18, "lg"],
  [20, "xl"],
  [24, "2xl"],
  [30, "3xl"],
  [36, "4xl"],
  [48, "5xl"],
  [60, "6xl"],
  [72, "7xl"],
  [96, "8xl"],
  [128, "9xl"],
];

const FONT_WEIGHT_SCALE: ReadonlyArray<readonly [string, string]> = [
  ["100", "thin"],
  ["200", "extralight"],
  ["300", "light"],
  ["400", "normal"],
  ["500", "medium"],
  ["600", "semibold"],
  ["700", "bold"],
  ["800", "extrabold"],
  ["900", "black"],
];

const BORDER_RADIUS_SCALE: ReadonlyArray<readonly [number, string]> = [
  [0, "none"],
  [2, "sm"],
  [4, ""],
  [6, "md"],
  [8, "lg"],
  [12, "xl"],
  [16, "2xl"],
  [24, "3xl"],
  [9999, "full"],
];

const SPACING_PREFIXES: Record<string, string> = {
  padding: "p",
  "padding-top": "pt",
  "padding-right": "pr",
  "padding-bottom": "pb",
  "padding-left": "pl",
  margin: "m",
  "margin-top": "mt",
  "margin-right": "mr",
  "margin-bottom": "mb",
  "margin-left": "ml",
  gap: "gap",
  width: "w",
  height: "h",
  "min-width": "min-w",
  "max-width": "max-w",
};

const DISPLAY_MAP: Record<string, string> = {
  block: "block",
  "inline-block": "inline-block",
  inline: "inline",
  flex: "flex",
  "inline-flex": "inline-flex",
  grid: "grid",
  "inline-grid": "inline-grid",
  none: "hidden",
};

const lookupSpacing = (px: number): string | null => {
  for (const [size, token] of SPACING_SCALE) {
    if (size === px) return token;
  }
  return null;
};

const parsePxValue = (value: string): number | null => {
  const match = value.match(/^(-?\d+(?:\.\d+)?)\s*px$/);
  return match ? parseFloat(match[1]) : null;
};

export const cssToTailwind = (property: string, value: string): string => {
  // Display
  if (property === "display") {
    return DISPLAY_MAP[value] ?? `${value}`;
  }

  // Spacing properties (padding, margin, gap, width, height)
  const spacingPrefix = SPACING_PREFIXES[property];
  if (spacingPrefix) {
    const px = parsePxValue(value);
    if (px !== null) {
      const token = lookupSpacing(px);
      if (token !== null) return `${spacingPrefix}-${token}`;
      return `${spacingPrefix}-[${value}]`;
    }
    return `${spacingPrefix}-[${value}]`;
  }

  // Font size
  if (property === "font-size") {
    const px = parsePxValue(value);
    if (px !== null) {
      for (const [size, token] of FONT_SIZE_SCALE) {
        if (size === px) return `text-${token}`;
      }
      return `text-[${value}]`;
    }
    return `text-[${value}]`;
  }

  // Font weight
  if (property === "font-weight") {
    for (const [weight, token] of FONT_WEIGHT_SCALE) {
      if (weight === value) return `font-${token}`;
    }
    return `font-[${value}]`;
  }

  // Border radius
  if (property === "border-radius") {
    const px = parsePxValue(value);
    if (px !== null) {
      for (const [size, token] of BORDER_RADIUS_SCALE) {
        if (size === px) return token === "" ? "rounded" : `rounded-${token}`;
      }
      return `rounded-[${value}]`;
    }
    return `rounded-[${value}]`;
  }

  // Opacity
  if (property === "opacity") {
    const num = parseFloat(value);
    if (!isNaN(num)) return `opacity-${Math.round(num * 100)}`;
  }

  // Line height
  if (property === "line-height") {
    return `leading-[${value}]`;
  }

  // Letter spacing
  if (property === "letter-spacing") {
    return `tracking-[${value}]`;
  }

  // Fallback: arbitrary value
  return `[${property}:${value}]`;
};
```

- [ ] **Step 6: Export from core index**

Add to `packages/core/src/index.ts`:

```typescript
export { cssToTailwind } from "./tailwind/css-to-tailwind.js";
export {
  findClosestTailwindColor,
  TAILWIND_PALETTE,
} from "./tailwind/tailwind-colors.js";
export type { TailwindColorMatch } from "./tailwind/tailwind-colors.js";
```

- [ ] **Step 7: Run tests**

```bash
cd /Users/mason/sightglass && yarn workspace @sightglass/core exec vitest run src/tailwind/
```

Expected: All tests pass.

- [ ] **Step 8: Verify full build**

```bash
cd /Users/mason/sightglass && yarn build && yarn typecheck && yarn test
```

Expected: All pass.

- [ ] **Step 9: Commit**

```bash
git add packages/core/src/tailwind/ packages/core/src/index.ts
git commit -m "feat: Tailwind CSS-to-class conversion and color matching"
```

---

## Task 12: Tailwind mode toggle in provider and export

**Files:**

- Modify: `packages/react/src/provider.tsx`
- Modify: `packages/react/src/components/EditorPanel.tsx`

- [ ] **Step 1: Add tailwindMode state to provider**

In `packages/react/src/provider.tsx`, add state and commands for Tailwind mode.

Add to the `OverlayState` interface:

```typescript
interface OverlayState {
  readonly hoveredScope: EditScope | null;
  readonly panelOpen: boolean;
  readonly tailwindMode: boolean;
}
```

Add state:

```typescript
const [tailwindMode, setTailwindMode] = useState(false);
```

Update the `overlayState` useMemo:

```typescript
const overlayState = useMemo<OverlayState>(
  () => ({
    hoveredScope,
    panelOpen,
    tailwindMode,
  }),
  [hoveredScope, panelOpen, tailwindMode]
);
```

Add to `SightglassCommands`:

```typescript
  setTailwindMode(enabled: boolean): void;
```

Wire it in the `commands` useMemo:

```typescript
  setTailwindMode,
```

- [ ] **Step 2: Add Tailwind toggle to EditorPanel settings button**

In `EditorPanel.tsx`, replace the settings button (around line 277-279) with a toggle that flips Tailwind mode:

```tsx
<button
  type="button"
  style={{
    ...barBtn,
    ...(overlay.tailwindMode
      ? { background: "rgba(59,130,246,0.2)", color: "#60a5fa" }
      : {}),
  }}
  onClick={() => commands.setTailwindMode(!overlay.tailwindMode)}
  title={overlay.tailwindMode ? "Tailwind mode on" : "Tailwind mode off"}
>
  <GearIcon />
</button>
```

- [ ] **Step 3: Wire Tailwind into Copy Edits button**

In `EditorPanel.tsx`, add the import at the top:

```typescript
import { cssToTailwind } from "@sightglass/core";
```

Replace the Copy Edits button `onClick` handler to format changes as Tailwind classes when `tailwindMode` is active:

```tsx
<button
  type="button"
  style={copyBtn}
  title="Copy edits"
  onClick={() => {
    const applied = session.history.applied;
    if (applied.length === 0) return;

    // session.history.applied is a flat AppliedTargetState[]
    // Each entry has { property, after, semanticKind, ... }
    const lines = applied.map((state) => {
      const base = `${state.property}: ${state.after}`;
      if (!overlay.tailwindMode) return base;
      const tw = cssToTailwind(state.property, state.after);
      return `${base}  →  ${tw}`;
    });

    navigator.clipboard.writeText(lines.join("\n"));
  }}
>
  <ClipboardIcon />
  <span>Copy Edits</span>
  {changeCount > 0 && (
    <span
      style={{
        padding: "0 2px",
        borderRadius: 2,
        background: "#242424",
        fontSize: 8,
        fontWeight: 600,
        lineHeight: "8px",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {changeCount}
    </span>
  )}
</button>
```

This provides the full end-to-end flow: when Tailwind mode is on, "Copy Edits" exports each change with its Tailwind class equivalent appended.

- [ ] **Step 4: Verify build**

```bash
cd /Users/mason/sightglass && yarn build && yarn typecheck && yarn test
```

Expected: All pass.

- [ ] **Step 4: Commit**

```bash
git add packages/react/src/provider.tsx packages/react/src/components/EditorPanel.tsx
git commit -m "feat: Tailwind mode toggle in toolbar and provider state"
```

---

## Task 13: Export and index updates

**Files:**

- Modify: `packages/react/src/index.ts`

- [ ] **Step 1: Export new components from @sightglass/react**

Update `packages/react/src/index.ts`:

```typescript
export { SightglassProvider } from "./provider";
export type {
  OverlayState,
  SightglassCommands,
  SightglassProviderProps,
} from "./provider";
export {
  useSightglassCommands,
  useSightglassOverlayState,
  useSightglassReviewDraftCommands,
  useSightglassReviewDraftState,
  useSightglassSessionState,
} from "./use-sightglass";
export { Toolbar } from "./components/Toolbar";
export { EditorPanel } from "./components/EditorPanel";
export { SelectionOverlay } from "./components/SelectionOverlay";
export { PropertyEditor } from "./components/PropertyEditor";
export { InlineTextEditor } from "./components/InlineTextEditor";
export {
  Slider,
  ColorPicker,
  BoxSpacing,
  AlignmentControl,
} from "./components/controls";
export type {
  SliderProps,
  ColorPickerProps,
  BoxSpacingProps,
  AlignmentControlProps,
} from "./components/controls";
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/mason/sightglass && yarn build && yarn typecheck && yarn test
```

Expected: All pass.

- [ ] **Step 3: Commit**

```bash
git add packages/react/src/index.ts
git commit -m "feat: export new controls, PropertyEditor, InlineTextEditor from @sightglass/react"
```

---

## Summary of gap coverage

| Gap                             | Task(s)     | Status  |
| ------------------------------- | ----------- | ------- |
| 1. Spring-animated overlay      | Task 3      | Covered |
| 2. Interactive editing controls | Tasks 6-10  | Covered |
| 3. Inline text editing          | Task 5      | Covered |
| 4. Tailwind mode                | Tasks 11-12 | Covered |
| 5. Panel animations             | Task 4      | Covered |
| 6. Crosshair cursor             | Task 2      | Covered |
