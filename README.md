# Sightglass

Sightglass is a local-first design lab for real React apps. It sits on the running UI, lets you edit the live surface with explicit transactions, and keeps critique, exploration, motion tuning, and session review in the same workflow.

## Why it exists

Sightglass is not Figma in the browser and it is not a prompt toy.

- It edits the real app instead of a detached canvas.
- It records deterministic transactions instead of relying on hidden prompt state.
- It treats design-system-aware controls, critique, exploration, and motion tuning as first-class editing tools.
- It keeps review sessions local-first and exports machine-readable artifacts as the source of truth.

## Workspace layout

- `packages/core`: target inspection, transactional edits, text editing, and shared contracts
- `packages/react`: provider, overlay shell, editor controls, critique UI, and review-draft wiring
- `packages/critique`: critique lenses, perspective weighting, explore directions, motion guidance
- `packages/export`: machine-readable manifests, agent-ready prompts, critique summaries, review artifacts
- `packages/session`: local session storage, review snapshots, restore flows
- `apps/playground`: dogfood app for live editing, critique, export, and restore flows
- `apps/site`: launch/docs site that explains the workflow and package surface

## Local development

Install once:

```bash
yarn install
```

Fresh-checkout caveat: run `yarn build` before `yarn test`. The React package currently resolves `@sightglass/core` through the built `dist` entry.

Common commands:

```bash
yarn build
yarn typecheck
yarn test
yarn lint
yarn dev:playground
yarn dev:site
```

## Product workflow

1. Activate the overlay and select a real DOM target.
2. Apply live edits with explicit scope and semantic hints.
3. Run critique, explore alternate directions, and inspect motion quality/performance.
4. Export the machine-readable manifest, agent prompt, and review artifact.
5. Save or restore the local session as needed.

## Package publishing

Sightglass now has the Changesets workflow wired for versioning and release prep. The current package manifests can stay private until registry publishing is intentionally enabled.

```bash
yarn changeset
yarn version:packages
yarn release:packages
```

Intended publish targets:

- `@sightglass/core`
- `@sightglass/react`
- `@sightglass/critique`
- `@sightglass/export`
- `@sightglass/session`
