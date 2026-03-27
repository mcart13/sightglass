# Sightglass

Sightglass is an open-source, local-first design review toolkit for real React apps. It runs on the live interface, records explicit transactions, and keeps critique, exploration, motion tuning, and session review in the same workflow.

## What it does

- Edits the running UI instead of a detached mock.
- Starts with semantic scopes, token hints, and repeated-component matches before raw CSS.
- Produces structured critique with source labels and perspective weighting.
- Keeps review sessions local-first and exports machine-readable artifacts as the source of truth.

## Monorepo layout

- `packages/core`: selection, mutation, text editing, and shared contracts.
- `packages/react`: provider, overlay shell, editor panels, and review-draft state.
- `packages/critique`: critique lenses, explore directions, and motion guidance.
- `packages/export`: change manifests, agent-ready prompts, and review artifacts.
- `packages/session`: local session persistence, snapshots, and restore flows.
- `apps/playground`: dogfood app for end-to-end editing and review flows.
- `apps/site`: public landing/docs site.

## Quick start

```bash
yarn install
yarn build
yarn test
```

Fresh checkout note: run `yarn build` before `yarn test`. The React package resolves `@sightglass/core` through its built `dist` entry.

Useful commands:

```bash
yarn typecheck
yarn dev:playground
yarn dev:site
yarn changeset
```

## Workflow

1. Select a real DOM target from the running app.
2. Apply explicit, reversible edits with semantic scope.
3. Run critique, explore stronger directions, and inspect motion quality.
4. Export the manifest, prompt-ready summary, and review artifact.
5. Save or restore the session locally.

## Publishing

Publishable packages:

- `@sightglass/core`
- `@sightglass/react`
- `@sightglass/critique`
- `@sightglass/export`
- `@sightglass/session`

Release flow:

```bash
yarn changeset
yarn version:packages
yarn release:packages
```
