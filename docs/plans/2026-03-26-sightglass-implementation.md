# Sightglass Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to resume this plan from Task 7 onward.

**Goal:** Build a separate product that starts where interface-kit stops: a fast in-browser design lab for real React apps with transactional live editing, design-system-aware controls, built-in critique intelligence, motion tuning, and shareable review sessions.

**Architecture:** Use a local-first monorepo with a headless DOM engine, a React overlay adapter, a critique and exploration engine, a structured export pipeline, and a demo app for constant dogfooding. The product should feel like a design copilot on top of the real app, not a prettier devtools panel.

**Tech Stack:** Yarn workspaces, TypeScript, React 19, Vite, Motion, Vitest, Playwright, tsup, IndexedDB for local sessions, optional hosted review service only if it does not slow the core product.

---

## Working assumptions

- Working repo path: `/Users/mason/sightglass`
- Working product name: `Sightglass`
- Publish targets:
  - `@sightglass/core`
  - `@sightglass/react`
  - `@sightglass/critique`
  - `@sightglass/export`
  - `@sightglass/session`
- Demo targets:
  - `apps/playground` for dogfooding
  - `apps/site` for docs and launch content

## Product thesis

Sightglass should beat interface-kit on four axes at once:

1. **Agent-native live editing**
   - Make edits in the running app
   - Record structured changes, not weak freeform prompts
   - Export a deterministic change manifest plus an agent-ready explanation

2. **Design-system-aware editing**
   - Detect token-backed values, repeated components, and variant-like patterns
   - Let users choose scope: this node, siblings, all similar, all component matches
   - Show semantic controls before raw CSS when the system can infer intent

3. **Built-in critique and exploration**
   - Critique the real UI with product-grade design, accessibility, motion, and performance lenses
   - Generate stronger directions, not just stronger prompts
   - Turn critique into concrete edit plans, not abstract advice

4. **Session-based review**
   - Support history, undo/redo, snapshots, named sessions, and review exports
   - Make it easy to hand changes to engineers, designers, and PMs
   - Start with local sessions and self-contained review artifacts
   - Add hosted share links only if the local artifact flow is already strong

## Embedded critique engines

Sightglass should treat the following skill families as product lenses, not just inspiration:

- **Art direction and composition**
  - Derived from `frontend-skill` and `frontend-design`
  - Critique for visual anchor, hierarchy, section purpose, card overuse, typography character, color intentionality, and overall thesis
  - Power Explore mode with alternate visual directions such as more editorial, more restrained, more premium, or more playful

- **UI polish and accessibility**
  - Derived from `emil-design-engineering` and `web-design-guidelines`
  - Critique for focus states, touch targets, keyboard flow, reduced layout shift, labels, semantic HTML, safe areas, content handling, and form quality
  - Produce fix-oriented findings with exact target, issue, impact, and recommended change

- **Motion craft and interaction feel**
  - Derived from `web-animation-design`, `interface-craft`, and `design-motion-principles`
  - Critique for easing choice, duration, paired-element timing, transform-origin, reduced-motion behavior, motion gaps, and interaction polish
  - Power a storyboard view plus live tuning dials for timing, spring, blur, offset, and stagger values

- **Motion performance**
  - Derived from `motion-audit`
  - Score motion paths by render-pipeline cost, flag bad properties or layout thrash, and suggest upgrades such as transform over layout or FLIP-style layout transitions

- **Critique methodology**
  - Derived from `interface-craft` and `design-motion-principles`
  - Organize findings by context, first impression, visual design, interface design, consistency, user context, and weighted motion perspectives
  - Support perspective switches such as Emil-first, Jakub-first, or Jhey-first when a user wants a stricter or more playful point of view

## Target repo layout

```text
/Users/mason/sightglass
  package.json
  tsconfig.base.json
  .gitignore
  docs/
    plans/
  packages/
    core/
    react/
    critique/
    export/
    session/
  apps/
    playground/
    site/
```

## Acceptance criteria for v1

- Users can activate an overlay, select real DOM nodes, and preview edits without mutating source files directly.
- Every edit is stored as a transaction with target scope, original value, current value, and semantic hints.
- Undo, redo, revert-property, and revert-session are reliable across grouped edits.
- The UI can detect likely tokens or repeated components and let the user choose local or broad scope.
- Users can run critique on a node, section, or full page and get structured findings grouped by:
  - visual design
  - interface design
  - consistency and conventions
  - user context
  - accessibility and standards
  - motion quality and motion performance
- The product can turn critique into action:
  - generate structured redesign directions
  - generate scope-aware edit plans
  - generate a readable motion storyboard for key interactions
- The motion inspector can:
  - score animations by pipeline tier
  - explain easing and duration choices
  - show reduced-motion gaps
  - expose live tuning controls for timing and springs
- The product exports:
  - a machine-readable change manifest
  - a human-readable agent prompt
  - a review artifact with before/after snapshots, critique summary, and change rationale
- The demo app is good enough to dogfood every release.

**Current status against v1 acceptance:**
- The live editing, transaction, undo/redo, and base React overlay criteria are materially in place from Tasks 1 through 6.
- The design-system-aware editing, critique, exploration, motion, export, session, and dogfood acceptance criteria remain open and map directly to Tasks 7 through 13.

## Progress update (2026-03-27)

### Current implementation status

- `main` is at `ebfc47b` and already includes the Phase 1 foundation plus review-loop fixes.
- Tasks 1 through 6 are complete.
- Tasks 7 through 13 are not started beyond workspace/package stubs.
- The next execution session should resume at **Task 7**.

### Completed commit trail

- `141036e` `chore: bootstrap sightglass monorepo`
- `490c14a` `feat: define core editing contracts`
- `e526194` `feat: add selection and target inspection engine`
- `0e008be` `feat: add transactional mutation engine`
- `c5db1bb` `feat: add structure-preserving text editing`
- `6a906ad` `feat: add react adapter and overlay shell`
- `65eb61f` `fix: address review findings`
- `ebfc47b` `fix: address follow-up review findings`

### Verified on the merged `main` branch

- `yarn install`
- `yarn build`
- `yarn typecheck`
- `yarn test`
- `yarn workspace @sightglass/core test:e2e`
- `yarn lint`

### Known plan drift and repo caveats

- The repo uses `yarn@4.13.0`, not `yarn@1.22.22`. Treat Yarn 4 as the canonical workspace setup unless there is a strong reason to revisit it.
- Root workspace scripts use `yarn workspaces foreach -Wpt ...` rather than the original `-pt` examples.
- `packages/critique`, `packages/export`, `packages/session`, `apps/playground`, and `apps/site` still expose only bootstrap placeholders, so the remainder is still the real product work rather than polish.
- On a fresh checkout, `yarn test` currently needs a prior `yarn build` because `@sightglass/react` resolves `@sightglass/core` through the built package entry in `dist`.

### Task 1: Bootstrap the monorepo shell

**Status:** Completed on `main` in `141036e`.

**Progress evidence:**
- Root workspace files exist: `package.json`, `tsconfig.base.json`, `.gitignore`.
- Workspace package manifests exist for all planned packages and apps.
- The repo installs and builds successfully under Yarn 4.
- Plan drift: the canonical workspace setup is Yarn 4, not Yarn 1.

**Files:**
- Create: `/Users/mason/sightglass/package.json`
- Create: `/Users/mason/sightglass/tsconfig.base.json`
- Create: `/Users/mason/sightglass/.gitignore`
- Create: `/Users/mason/sightglass/packages/core/package.json`
- Create: `/Users/mason/sightglass/packages/react/package.json`
- Create: `/Users/mason/sightglass/packages/critique/package.json`
- Create: `/Users/mason/sightglass/packages/export/package.json`
- Create: `/Users/mason/sightglass/packages/session/package.json`
- Create: `/Users/mason/sightglass/apps/playground/package.json`
- Create: `/Users/mason/sightglass/apps/site/package.json`

**Step 1: Create the root workspace config**

Include workspaces for `packages/*` and `apps/*`, plus scripts:

```json
{
  "private": true,
  "packageManager": "yarn@1.22.22",
  "workspaces": ["packages/*", "apps/*"],
  "scripts": {
    "build": "yarn workspaces foreach -pt run build",
    "typecheck": "yarn workspaces foreach -pt run typecheck",
    "test": "yarn workspaces foreach -pt run test",
    "lint": "yarn workspaces foreach -pt run lint",
    "dev:playground": "yarn workspace @sightglass/playground dev",
    "dev:site": "yarn workspace @sightglass/site dev"
  }
}
```

**Step 2: Create per-package manifests**

- `packages/core`: headless engine
- `packages/react`: overlay and adapter
- `packages/critique`: structured critique, motion analysis, and exploration recipes
- `packages/export`: manifest and prompt formatter
- `packages/session`: local session storage and snapshots
- `apps/playground`: Vite React dogfood app
- `apps/site`: docs and launch site

**Step 3: Install dependencies**

Run: `cd /Users/mason/sightglass && yarn install`
Expected: workspace install completes without peer dependency errors

**Step 4: Add baseline scripts**

Make each package expose `build`, `typecheck`, `test`, and `lint`, even if some scripts temporarily call `echo "todo"` while bootstrapping.

**Step 5: Commit**

```bash
cd /Users/mason/sightglass
git add .
git commit -m "chore: bootstrap sightglass monorepo"
```

### Task 2: Define the shared domain model before any UI

**Status:** Completed on `main` in `490c14a`.

**Progress evidence:**
- `packages/core/src/types.ts`, `packages/core/src/contracts.ts`, and `packages/core/src/types.test.ts` exist.
- Runtime guards and factory helpers are exported through `packages/core/src/index.ts`.
- Follow-up contract hardening from review loops landed in `65eb61f`.

**Files:**
- Create: `/Users/mason/sightglass/packages/core/src/types.ts`
- Create: `/Users/mason/sightglass/packages/core/src/contracts.ts`
- Test: `/Users/mason/sightglass/packages/core/src/types.test.ts`

**Step 1: Write failing tests for the core model**

Cover these shapes:

```ts
type EditScope = "single" | "siblings" | "similar" | "component" | "token";

interface TargetAnchor {
  runtimeId: string;
  selector: string;
  path: string;
  role: string | null;
  classes: string[];
}

interface EditOperation {
  id: string;
  property: string;
  before: string;
  after: string;
  semanticKind: "css" | "token" | "text" | "layout" | "component";
}

interface SessionTransaction {
  id: string;
  scope: EditScope;
  targets: TargetAnchor[];
  operations: EditOperation[];
  createdAt: string;
}
```

**Step 2: Run tests to confirm the model is not implemented**

Run: `cd /Users/mason/sightglass && yarn workspace @sightglass/core test`
Expected: failing import or shape assertions

**Step 3: Implement the minimal model**

- Export immutable types and factory helpers
- Add runtime guards for malformed transaction payloads

**Step 4: Re-run tests**

Run: `cd /Users/mason/sightglass && yarn workspace @sightglass/core test`
Expected: PASS

**Step 5: Commit**

```bash
cd /Users/mason/sightglass
git add packages/core
git commit -m "feat: define core editing contracts"
```

### Task 3: Build the headless selection and inspection engine

**Status:** Completed on `main` in `e526194`, with review-loop hardening in `65eb61f` and `ebfc47b`.

**Progress evidence:**
- Selection files exist under `packages/core/src/selection/`.
- Browser coverage exists in `packages/core/src/selection/selection.e2e.ts`.
- Follow-up fixes covered malformed selector tolerance and selector uniqueness ranking before confidence.

**Files:**
- Create: `/Users/mason/sightglass/packages/core/src/selection/identify.ts`
- Create: `/Users/mason/sightglass/packages/core/src/selection/find-best-element.ts`
- Create: `/Users/mason/sightglass/packages/core/src/selection/find-similar-elements.ts`
- Create: `/Users/mason/sightglass/packages/core/src/selection/generate-anchor.ts`
- Test: `/Users/mason/sightglass/packages/core/src/selection/selection.test.ts`
- Test: `/Users/mason/sightglass/packages/core/src/selection/selection.e2e.ts`

**Step 1: Write failing tests for best-element and similar-element detection**

Cover:
- interactive ancestor preference
- class-overlap grouping
- rejection of nested matches
- stable anchor generation when class names are hashed

**Step 2: Implement DOM heuristics**

Keep the useful parts of interface-kit:
- `elementFromPoint`
- interactive ancestor preference
- class overlap scoring

Improve the weak parts:
- store multiple anchors per target
- keep selector as fallback, not as identity
- return a confidence score with each match

**Step 3: Add browser-level tests**

Run Playwright against a fixture page with:
- repeated cards
- nested buttons
- token-like class names
- CSS module hashes

**Step 4: Verify**

Run:
- `cd /Users/mason/sightglass && yarn workspace @sightglass/core test`
- `cd /Users/mason/sightglass && yarn workspace @sightglass/core test:e2e`

Expected: PASS with grouped-match coverage

**Step 5: Commit**

```bash
cd /Users/mason/sightglass
git add packages/core
git commit -m "feat: add selection and target inspection engine"
```

### Task 4: Build a transactional mutation engine with history

**Status:** Completed on `main` in `0e008be`, with review-loop hardening in `65eb61f` and `ebfc47b`.

**Progress evidence:**
- `packages/core/src/mutation/mutation-engine.ts`, `history-store.ts`, `style-capture.ts`, and `mutation-engine.test.ts` exist.
- Review-loop fixes covered command identity in undo/redo stacks and per-target text baseline capture.
- Current verification passes include `yarn workspace @sightglass/core test`.

**Files:**
- Create: `/Users/mason/sightglass/packages/core/src/mutation/mutation-engine.ts`
- Create: `/Users/mason/sightglass/packages/core/src/mutation/history-store.ts`
- Create: `/Users/mason/sightglass/packages/core/src/mutation/style-capture.ts`
- Test: `/Users/mason/sightglass/packages/core/src/mutation/mutation-engine.test.ts`

**Step 1: Write failing tests**

Cover:
- batched style writes
- grouped targets with different original values
- undo and redo
- revert-property and revert-session
- disconnected node cleanup

**Step 2: Implement command-based mutations**

Do not track one `selector + property` record like interface-kit.

Implement:

```ts
interface AppliedTargetState {
  target: TargetAnchor;
  beforeInline: string | null;
  beforeComputed: string;
  after: string;
}
```

Each transaction should keep per-target originals.

**Step 3: Preserve performant writes**

- batch DOM writes with `requestAnimationFrame`
- dedupe per target and property
- expose a read-only snapshot API

**Step 4: Verify**

Run: `cd /Users/mason/sightglass && yarn workspace @sightglass/core test`
Expected: PASS with history semantics covered

**Step 5: Commit**

```bash
cd /Users/mason/sightglass
git add packages/core
git commit -m "feat: add transactional mutation engine"
```

### Task 5: Implement text editing that preserves structure

**Status:** Completed on `main` in `c5db1bb`, with follow-up fixes in `65eb61f` and `ebfc47b`.

**Progress evidence:**
- `packages/core/src/text/text-session.ts`, `serialize-rich-text.ts`, and `text-session.test.ts` exist.
- Review-loop fixes covered active-edit preservation on commit failure and related lifecycle safety.
- Current verification passes include nested markup preservation and undo/redo coverage.

**Files:**
- Create: `/Users/mason/sightglass/packages/core/src/text/text-session.ts`
- Create: `/Users/mason/sightglass/packages/core/src/text/serialize-rich-text.ts`
- Test: `/Users/mason/sightglass/packages/core/src/text/text-session.test.ts`

**Step 1: Write failing tests**

Cover:
- edit commit
- edit cancel
- nested text nodes
- inline markup preservation
- Escape behavior: cancel current text edit, not auto-commit

**Step 2: Implement a text-session model**

- snapshot the selected subtree before edit start
- preserve inline structure where possible
- separate `commitTextEdit()` from `cancelTextEdit()`

**Step 3: Integrate with the transaction engine**

Text edits should become proper transactions with before and after payloads.

**Step 4: Verify**

Run: `cd /Users/mason/sightglass && yarn workspace @sightglass/core test`
Expected: PASS with no lossy `textContent` fallback in normal paths

**Step 5: Commit**

```bash
cd /Users/mason/sightglass
git add packages/core
git commit -m "feat: add structure-preserving text editing"
```

### Task 6: Build the React adapter and overlay shell

**Status:** Completed for the bridge and base shell in `6a906ad`, with review-loop fixes in `65eb61f` and `ebfc47b`.

**Progress evidence:**
- `packages/react/src/provider.tsx`, `use-sightglass.ts`, `Toolbar.tsx`, `EditorPanel.tsx`, `SelectionOverlay.tsx`, and `provider.test.tsx` exist.
- The React package consumes `@sightglass/core` without re-implementing selection or history logic.
- The current shell is intentionally a base overlay: `EditorPanel.tsx` still says semantic token/component controls are pending, which is the expected handoff into Task 7 rather than a missing Task 6 bug.

**Files:**
- Create: `/Users/mason/sightglass/packages/react/src/provider.tsx`
- Create: `/Users/mason/sightglass/packages/react/src/use-sightglass.ts`
- Create: `/Users/mason/sightglass/packages/react/src/components/Toolbar.tsx`
- Create: `/Users/mason/sightglass/packages/react/src/components/EditorPanel.tsx`
- Create: `/Users/mason/sightglass/packages/react/src/components/SelectionOverlay.tsx`
- Test: `/Users/mason/sightglass/packages/react/src/provider.test.tsx`

**Step 1: Write failing tests for the bridge contract**

Cover:
- mount and destroy
- active state
- selection state
- history state passthrough
- no duplicated controller logic in the React package

**Step 2: Implement the adapter**

- React consumes `@sightglass/core`
- no duplicated selection heuristics
- split contexts by responsibility:
  - immutable session state
  - hover and overlay state
  - actions and commands

**Step 3: Implement a distinct UI**

Do not mimic interface-kit visually.

Goals:
- toolbar optimized for editing flow
- side panel optimized for semantic controls
- overlays that communicate scope clearly

**Step 4: Verify**

Run:
- `cd /Users/mason/sightglass && yarn workspace @sightglass/react test`
- `cd /Users/mason/sightglass && yarn workspace @sightglass/react typecheck`

Expected: PASS

**Step 5: Commit**

```bash
cd /Users/mason/sightglass
git add packages/react
git commit -m "feat: add react adapter and overlay shell"
```

### Task 7: Add design-system-aware analysis and semantic controls

**Status:** Not started.

**Evidence:**
- No `packages/core/src/analyze/` directory exists.
- No `packages/react/src/components/SemanticInspector.tsx` exists.
- The current `EditorPanel` is a placeholder shell for these controls.

**Files:**
- Create: `/Users/mason/sightglass/packages/core/src/analyze/token-detector.ts`
- Create: `/Users/mason/sightglass/packages/core/src/analyze/component-detector.ts`
- Create: `/Users/mason/sightglass/packages/core/src/analyze/scope-resolver.ts`
- Create: `/Users/mason/sightglass/packages/react/src/components/SemanticInspector.tsx`
- Test: `/Users/mason/sightglass/packages/core/src/analyze/token-detector.test.ts`

**Step 1: Write failing tests**

Cover:
- token-like CSS variable detection
- repeated component signatures
- scope options returned for a selected element

**Step 2: Implement token detection**

Start with:
- CSS variables on inline or computed styles
- common Tailwind utility groupings
- repeated exact values across similar elements

**Step 3: Implement component signature detection**

Use a lightweight signature:
- tag tree
- stable classes
- role
- child count
- text slots

**Step 4: Render semantic controls first**

Examples:
- “Update token `--button-radius`”
- “Update all card headers”
- “Only update this instance”

**Step 5: Verify**

Run:
- `cd /Users/mason/sightglass && yarn workspace @sightglass/core test`
- `cd /Users/mason/sightglass && yarn workspace @sightglass/react test`

Expected: PASS with semantic-scope coverage

**Step 6: Commit**

```bash
cd /Users/mason/sightglass
git add packages/core packages/react
git commit -m "feat: add design system aware editing"
```

### Task 8: Build the critique engine and perspective system

**Status:** Not started.

**Evidence:**
- `packages/critique/src/index.ts` is still a one-line readiness stub.
- None of the planned critique contracts, lenses, perspectives, or `CritiquePanel.tsx` files exist.

**Files:**
- Create: `/Users/mason/sightglass/packages/critique/src/contracts.ts`
- Create: `/Users/mason/sightglass/packages/critique/src/context/infer-context.ts`
- Create: `/Users/mason/sightglass/packages/critique/src/lenses/visual-design.ts`
- Create: `/Users/mason/sightglass/packages/critique/src/lenses/interface-design.ts`
- Create: `/Users/mason/sightglass/packages/critique/src/lenses/accessibility.ts`
- Create: `/Users/mason/sightglass/packages/critique/src/lenses/motion-quality.ts`
- Create: `/Users/mason/sightglass/packages/critique/src/lenses/motion-performance.ts`
- Create: `/Users/mason/sightglass/packages/critique/src/perspectives/emil.ts`
- Create: `/Users/mason/sightglass/packages/critique/src/perspectives/jakub.ts`
- Create: `/Users/mason/sightglass/packages/critique/src/perspectives/jhey.ts`
- Create: `/Users/mason/sightglass/packages/react/src/components/CritiquePanel.tsx`
- Test: `/Users/mason/sightglass/packages/critique/src/critique-engine.test.ts`

**Step 1: Write failing tests for critique contracts**

Cover:
- critique grouped by section
- severity ordering
- perspective weighting by context
- scope-aware findings for node, section, and page reviews

**Step 2: Implement critique contracts**

Start with:

```ts
interface CritiqueFinding {
  id: string;
  category:
    | "visual-design"
    | "interface-design"
    | "consistency"
    | "user-context"
    | "accessibility"
    | "motion-quality"
    | "motion-performance";
  severity: "critical" | "important" | "opportunity";
  target: TargetAnchor;
  title: string;
  observation: string;
  impact: string;
  recommendation: string;
  sourceLens: string;
}
```

**Step 3: Encode the named skill families as product lenses**

- `frontend-skill` and `frontend-design`
  - section purpose
  - dominant visual anchor
  - card overuse
  - typographic hierarchy
  - color intentionality
  - art-direction strength
- `interface-craft`
  - context
  - first impression
  - visual design
  - interface design
  - consistency
  - user context
- `emil-design-engineering` and `web-design-guidelines`
  - focus states
  - labels
  - semantic HTML
  - touch targets
  - keyboard flow
  - no layout shift
  - content handling
- `web-animation-design` and `design-motion-principles`
  - easing choice
  - duration
  - paired-element timing
  - transform-origin
  - motion gaps
  - reduced-motion coverage
- `motion-audit`
  - pipeline-tier scoring
  - bad animated properties
  - layout thrash detection
  - upgrade suggestions

**Step 4: Render critique UI**

The panel should support:
- page critique
- selected element critique
- perspective switches
- grouped findings
- direct “turn this into an edit plan” actions

**Step 5: Verify**

Run:
- `cd /Users/mason/sightglass && yarn workspace @sightglass/critique test`
- `cd /Users/mason/sightglass && yarn workspace @sightglass/react test`

Expected: PASS with structured critique coverage

**Step 6: Commit**

```bash
cd /Users/mason/sightglass
git add packages/critique packages/react
git commit -m "feat: add critique engine and perspective system"
```

### Task 9: Build Explore mode, motion storyboard, and live tuning

**Status:** Not started.

**Evidence:**
- No explore or motion files exist under `packages/critique/src/`.
- No `packages/react/src/components/ExplorePanel.tsx` or `MotionLab.tsx` exists.

**Files:**
- Create: `/Users/mason/sightglass/packages/critique/src/explore/design-directions.ts`
- Create: `/Users/mason/sightglass/packages/critique/src/explore/edit-plan.ts`
- Create: `/Users/mason/sightglass/packages/critique/src/motion/build-storyboard.ts`
- Create: `/Users/mason/sightglass/packages/critique/src/motion/tuning-schema.ts`
- Create: `/Users/mason/sightglass/packages/react/src/components/ExplorePanel.tsx`
- Create: `/Users/mason/sightglass/packages/react/src/components/MotionLab.tsx`
- Test: `/Users/mason/sightglass/packages/critique/src/explore/design-directions.test.ts`

**Step 1: Write failing tests**

Cover:
- alternate design directions created from critique findings
- structured edit plans produced from a chosen direction
- storyboard generation for a selected interaction
- live tuning constraints for spring, duration, blur, offset, and stagger

**Step 2: Implement Explore mode**

Support structured direction cards such as:
- more editorial
- more restrained
- more premium
- more playful
- more utilitarian

Each direction should include:
- visual thesis
- content plan
- interaction thesis
- concrete edit proposals

**Step 3: Implement Motion Lab**

Use the best parts of the named motion skills:
- readable storyboard sequencing from `interface-craft`
- live dial-style tuning inspired by DialKit
- easing and duration defaults from `web-animation-design`
- perspective guidance from `design-motion-principles`
- reduced-motion and performance guardrails from `emil-design-engineering` and `motion-audit`

**Step 4: Verify**

Run:
- `cd /Users/mason/sightglass && yarn workspace @sightglass/critique test`
- `cd /Users/mason/sightglass && yarn workspace @sightglass/react typecheck`

Expected: PASS with explore and motion-lab coverage

**Step 5: Commit**

```bash
cd /Users/mason/sightglass
git add packages/critique packages/react
git commit -m "feat: add explore mode and motion lab"
```

### Task 10: Build structured export and agent output

**Status:** Not started.

**Evidence:**
- `packages/export/src/index.ts` is still a one-line readiness stub.
- None of the planned export pipeline files or tests exist.

**Files:**
- Create: `/Users/mason/sightglass/packages/export/src/change-manifest.ts`
- Create: `/Users/mason/sightglass/packages/export/src/critique-report.ts`
- Create: `/Users/mason/sightglass/packages/export/src/exploration-bundle.ts`
- Create: `/Users/mason/sightglass/packages/export/src/prompt-formatter.ts`
- Create: `/Users/mason/sightglass/packages/export/src/review-artifact.ts`
- Test: `/Users/mason/sightglass/packages/export/src/change-manifest.test.ts`

**Step 1: Write failing tests**

Cover:
- deterministic manifest ordering
- route and component metadata inclusion
- grouped semantic edits
- critique findings included in export
- motion storyboard included in export
- prompt output derived from the same source data

**Step 2: Implement a richer manifest format**

Start with:

```ts
interface ChangeManifest {
  route: string;
  sessionId: string;
  targets: Array<{
    anchor: TargetAnchor;
    scope: EditScope;
    semanticLabel?: string;
  }>;
  transactions: SessionTransaction[];
  critique?: CritiqueFinding[];
  exploration?: Array<{
    directionId: string;
    title: string;
    proposedOperations: EditOperation[];
  }>;
}
```

**Step 3: Implement dual output**

- machine-readable JSON manifest
- concise agent prompt built from that manifest

The prompt formatter can be opinionated, but JSON remains the source of truth.

**Step 4: Verify**

Run: `cd /Users/mason/sightglass && yarn workspace @sightglass/export test`
Expected: PASS

**Step 5: Commit**

```bash
cd /Users/mason/sightglass
git add packages/export
git commit -m "feat: add structured export pipeline"
```

### Task 11: Add local sessions, history snapshots, and review artifacts

**Status:** Not started.

**Evidence:**
- `packages/session/src/index.ts` is still a one-line readiness stub.
- No IndexedDB/session schema files exist.
- No `SessionPanel.tsx` or `apps/playground/src/routes/review.tsx` exists.

**Files:**
- Create: `/Users/mason/sightglass/packages/session/src/indexeddb-store.ts`
- Create: `/Users/mason/sightglass/packages/session/src/session-schema.ts`
- Create: `/Users/mason/sightglass/packages/react/src/components/SessionPanel.tsx`
- Create: `/Users/mason/sightglass/apps/playground/src/routes/review.tsx`
- Test: `/Users/mason/sightglass/packages/session/src/indexeddb-store.test.ts`

**Step 1: Write failing tests for session persistence**

Cover:
- save session
- load session
- restore history stack
- export review bundle
- restore critique state
- restore selected exploration direction

**Step 2: Implement local-first sessions**

- use IndexedDB for active sessions
- store snapshots plus structured manifests
- store critique runs, chosen directions, and motion tuning state
- allow import and export to `.surface-session.json`

**Step 3: Add review artifact generation**

The review artifact should include:
- session metadata
- before and after screenshots
- transaction list
- semantic scope explanation
- critique summary
- selected redesign direction
- motion audit summary if present

**Step 4: Verify**

Run:
- `cd /Users/mason/sightglass && yarn workspace @sightglass/session test`
- `cd /Users/mason/sightglass && yarn workspace @sightglass/playground test`

Expected: PASS

**Step 5: Commit**

```bash
cd /Users/mason/sightglass
git add packages/session packages/react apps/playground
git commit -m "feat: add local sessions and review artifacts"
```

### Task 12: Build the dogfood playground and fixture suite

**Status:** Not started beyond bootstrap.

**Evidence:**
- `apps/playground/src/index.ts` is still a one-line readiness stub.
- None of the planned `main.tsx`, `App.tsx`, fixtures, or e2e tests exist.

**Files:**
- Create: `/Users/mason/sightglass/apps/playground/src/main.tsx`
- Create: `/Users/mason/sightglass/apps/playground/src/App.tsx`
- Create: `/Users/mason/sightglass/apps/playground/src/fixtures/cards.tsx`
- Create: `/Users/mason/sightglass/apps/playground/src/fixtures/forms.tsx`
- Create: `/Users/mason/sightglass/apps/playground/src/fixtures/tokens.tsx`
- Create: `/Users/mason/sightglass/apps/playground/src/fixtures/motion.tsx`
- Create: `/Users/mason/sightglass/apps/playground/src/fixtures/content-edge-cases.tsx`
- Test: `/Users/mason/sightglass/apps/playground/e2e/editing-flow.spec.ts`
- Test: `/Users/mason/sightglass/apps/playground/e2e/critique-flow.spec.ts`

**Step 1: Build fixture-heavy pages**

Include:
- repeated cards
- forms and buttons
- token-backed styles
- repeated components with slight variation
- deliberately weak hierarchy for critique testing
- animation samples with both good and bad motion patterns
- long content, empty states, and mobile-pressure layouts

**Step 2: Mount Sightglass in the playground**

Use the real packages, not mocks.

**Step 3: Write end-to-end tests**

Cover:
- activate tool
- select target
- change style
- change token-like value
- run critique
- choose a redesign direction
- export manifest
- restore session

**Step 4: Verify**

Run:
- `cd /Users/mason/sightglass && yarn dev:playground`
- `cd /Users/mason/sightglass && yarn workspace @sightglass/playground test:e2e`

Expected: editor and critique flows pass on real fixture pages

**Step 5: Commit**

```bash
cd /Users/mason/sightglass
git add apps/playground
git commit -m "feat: add dogfood playground"
```

### Task 13: Prepare packaging, docs, and launch

**Status:** Not started beyond bootstrap.

**Evidence:**
- `apps/site/src/index.ts` is still a one-line readiness stub.
- `README.md` does not exist.
- `.changeset/` does not exist.

**Files:**
- Create: `/Users/mason/sightglass/apps/site/src/routes/index.tsx`
- Create: `/Users/mason/sightglass/apps/site/src/routes/docs.tsx`
- Create: `/Users/mason/sightglass/README.md`
- Create: `/Users/mason/sightglass/.changeset/`

**Step 1: Write docs for the product thesis**

Explain:
- why this is not Figma
- why this is not a prompt toy
- why critique, exploration, and motion tuning belong next to live editing
- how the transactional workflow works

**Step 2: Add package publishing flow**

- `@sightglass/core`
- `@sightglass/react`
- `@sightglass/critique`
- `@sightglass/export`
- `@sightglass/session`

**Step 3: Ship an opinionated demo**

The site should show:
- live editing
- semantic scopes
- built-in critique
- explore mode
- motion lab
- review session export

**Step 4: Verify full repo**

Run:
- `cd /Users/mason/sightglass && yarn lint`
- `cd /Users/mason/sightglass && yarn typecheck`
- `cd /Users/mason/sightglass && yarn test`
- `cd /Users/mason/sightglass && yarn build`

Expected: PASS

**Step 5: Commit**

```bash
cd /Users/mason/sightglass
git add .
git commit -m "docs: prepare launch and packaging"
```

## Execution sequence

Ship this as one ambitious v1. Use phases only for execution order, not product deferral.

### Resume checkpoint

- Start the next implementation session at **Task 7**.
- Base branch is `main` at `ebfc47b`.
- Execute the remaining tasks in order unless a concrete blocker requires resequencing.
- Do not defer critique, exploration, or motion-lab work; they are part of the approved v1 scope.
- Recommended warm-up verification before new edits:
  - `cd /Users/mason/sightglass && yarn build`
  - `cd /Users/mason/sightglass && yarn typecheck`
  - `cd /Users/mason/sightglass && yarn test`

### Phase 1

- monorepo bootstrapped
- headless engine working
- React overlay working
- transactional editing working
- **Status:** Complete

### Phase 2

- design-system-aware scopes
- critique engine working
- motion-lab and explore mode working
- **Status:** Not started

### Phase 3

- structured export working
- local sessions working
- dogfood playground working
- launch docs and packaging working
- **Status:** Not started

## Non-goals for the first release

- full design file replacement
- arbitrary source code rewriting without manifest review
- mandatory hosted collaboration or auth before the local workflow is excellent
- massive backend collaboration layer before local workflow is excellent
- framework adapters other than React before the core contract is stable

## Critical product rules

- Do not duplicate core engine logic in the React adapter.
- Do not use selector strings as canonical target identity.
- Do not mutate source files directly from the overlay.
- Keep machine-readable export as the source of truth. Prompt output is derived.
- Keep critique output structured and source-labeled. No vague “AI taste” blobs.
- Keep motion advice tied to reduced-motion and pipeline-cost checks before style polish.
- Every broad-scope edit must show what scope is being edited before commit.
