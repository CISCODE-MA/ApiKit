# React TypeScript DeveloperKit (Template)

Template repository for building reusable React TypeScript **npm libraries**
(components + hooks + utilities).

## What you get

- ESM + CJS + Types build (tsup)
- Vitest testing
- ESLint + Prettier (flat config)
- Changesets (manual release flow, no automation PR)
- Husky (pre-commit + pre-push)
- Enforced public API via `src/index.ts`
- Dependency-free styling (Tailwind-compatible by convention only)
- `react` and `react-dom` as peerDependencies

## Package structure

- `src/components` – reusable UI components
- `src/hooks` – reusable React hooks
- `src/utils` – framework-agnostic utilities
- `src/index.ts` – **only public API** (no deep imports allowed)

Anything not exported from `src/index.ts` is considered private.

## Scripts

- `npm run build` – build to `dist/` (tsup)
- `npm test` – run tests (vitest)
- `npm run typecheck` – TypeScript typecheck
- `npm run lint` – ESLint
- `npm run format` / `npm run format:write` – Prettier
- `npx changeset` – create a changeset

## Release flow (summary)

- Work on a `feature` branch from `develop`
- Merge to `develop`
- Add a changeset for user-facing changes: `npx changeset`
- Promote `develop` → `master`
- Tag `vX.Y.Z` to publish (npm OIDC)

This repository is a **template**. Teams should clone it and focus only on
library logic, not tooling or release mechanics.
