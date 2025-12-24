# Repository Guidelines

## Project Structure & Module Organization
- `src/` holds app code: entry `main.tsx`, routes/pages in `src/pages`, layouts in `src/layouts`, shared UI in `src/components`, hooks in `src/hooks`, utilities in `src/lib`, types in `src/types`, and static assets in `src/assets`. `public/` serves static files as-is. Keep new feature modules co-located under `src/pages/<feature>` with matching hooks/components.

## Build, Test, and Development Commands
- `pnpm install` installs dependencies.
- `pnpm dev` starts the Vite dev server with HMR.
- `pnpm build` runs TypeScript project references then builds production assets into `dist/`.
- `pnpm lint` runs ESLint per `eslint.config.js`.
- `pnpm preview` serves the built output locally for smoke testing.

## Coding Style & Naming Conventions
- TypeScript + JSX; prefer functional components and typed props. Run ESLint (with autofix) before commits; follow `tsconfig.app.json` paths if you add aliases.
- Formatting: use Prettier defaults; avoid manual spacing changes beyond formatter output.
- Components/directories use `PascalCase`; hooks start with `use`; utilities may be `camelCase` filenames. Keep Tailwind utility usage consistent with `index.css`/`App.css` patterns.

## Testing Guidelines
- No runner is wired yet; when adding tests, co-locate as `<name>.test.ts(x)` beside source.
- Favor React Testing Library + Vitest (or equivalent) for components and utilities; mock axios/network calls where possible. Aim to cover form validation paths, routing guards, and data transforms in tables/charts.
- Include test commands or rationale when tests are skipped in PRs.

## Commit & Pull Request Guidelines
- Write concise, imperative commit subjects (e.g., `Add login form validation`; conventional prefixes like `feat:`/`fix:` are welcome when clear).
- Each PR should include: summary of changes, testing notes/commands run, linked issue or task ID, screenshots/GIFs for UI changes (desktop + mobile), and a note on breaking changes or migrations. Keep scopes tight to ease review.

## Environment & Security Tips
- Store configuration in `.env` with Vite prefixes (e.g., `VITE_API_BASE`); do not commit secrets. Validate axios base URLs and auth tokens before merging. Keep dependencies synced via `pnpm-lock.yaml`; avoid manual edits.
