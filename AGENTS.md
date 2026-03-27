# Repository Guidelines

## Project Structure & Module Organization
Sightglass is a Yarn 4 monorepo. Core editing and DOM-selection logic lives in `packages/core/src`, including `selection/`, `mutation/`, and `text/`. React bindings and UI shells live in `packages/react/src`, with components under `packages/react/src/components`. Supporting packages such as `packages/session`, `packages/export`, and `packages/critique` expose package-level entry points. Example apps live in `apps/playground/src` and `apps/site/src`. Planning notes live in `docs/plans/`. Treat `dist/`, `test-results/`, and `playwright-report/` as generated output; do not hand-edit them.

## Build, Test, and Development Commands
Run commands from the repo root unless a package-specific command is clearer.

- `yarn build` builds every workspace with its local `build` script.
- `yarn typecheck` runs strict TypeScript checks across the monorepo.
- `yarn test` runs each workspace test script; today the meaningful coverage is in `@sightglass/core` and `@sightglass/react`.
- `yarn workspace @sightglass/core test:e2e` runs the Playwright DOM-selection flow in `packages/core`.
- `yarn dev:playground` and `yarn dev:site` are reserved app entry points; some app scripts are still placeholder stubs, so verify package scripts before relying on them.

## Coding Style & Naming Conventions
Use TypeScript with ESM imports and keep code `strict`-safe. Match the existing 2-space indentation and trailing-comma style. Prefer named exports for package APIs. Use kebab-case for utility files such as `find-best-element.ts` and PascalCase for React component files such as `SelectionOverlay.tsx`. Keep modules small, explicit, and easy to trace.

## Testing Guidelines
Use Vitest for unit coverage and Playwright for browser-level flows. Name unit tests `*.test.ts` or `*.test.tsx`; reserve `*.e2e.ts` for Playwright coverage. Add or update tests whenever you change selection, mutation, text-editing, or provider behavior. Favor targeted runs like `yarn workspace @sightglass/core test` or `yarn workspace @sightglass/react test` while iterating, then finish with root `yarn test`.

## Commit & Pull Request Guidelines
Recent history uses Conventional Commit prefixes such as `feat:`, `fix:`, and `chore:`. Keep subjects imperative and specific. PRs should summarize changed packages, list verification commands, and include screenshots or short recordings for overlay or editor-panel UI changes. Call out any placeholder scripts, follow-up work, or contract changes in the PR body so reviewers are not left inferring repo state.
