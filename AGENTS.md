# Flipbook — Shared Agent Instructions

## Shared Context

- This is the project guide for Claude and Codex. `CLAUDE.md` imports it and adds only Claude-specific guidance.
- At the start of a task, read `docs/ai/memory/MEMORY.md`, then the notes relevant to the task. They are the shared project memory for both agents.
- Record durable decisions, user corrections, rationale and recurring pitfalls in `docs/ai/memory/` (the `remember` skill). Update an existing note when one covers the topic, date substantive changes, and keep `MEMORY.md` a short linked index. Check a remembered code fact against the source before relying on it.
- Put temporary work state in `docs/ai/HANDOFF.md` when handing work to another session or agent (the `handoff` skill). Read it when present and check its branch and date before acting on it. Completed task logs stay out of memory.
- Memory and the handoff are versioned project docs. Keep credentials and unrelated personal information out of them. Read a file before updating it so another agent's changes survive.

## Agent config

Skills read this block. Keys a project doesn't use can be deleted; a skill that needs a missing key asks for it.

```yaml
default_branch: main
protected_branches: [main, "release/*"]
branch_prefixes:
  feat: feat/
  fix: fix/
  chore: chore/
  refactor: refactor/
commit_style: conventional
ai_attribution: false                      # never add Co-Authored-By or other AI trailers
gates:
  type_check: "pnpm typecheck"
  lint: "pnpm lint"
  test: "pnpm test"
never_stage: [".env*", "!.env.example"]
tracker:
  kind: none
  issue_prefix: ""
  shipped_status: ""
compare_url: ""
memory_dir: docs/ai/memory
handoff_file: docs/ai/HANDOFF.md
graphify: false
humanizer: false
feature_layout:
  root: apps/web/src/features/{feature}
  files: [index.ts]
  optional_files: [types.ts, constants.ts]
  dirs: [components]
  utils: flat
  test_suffix: .test.ts
  filename_case: kebab
```

## Project Overview

Flipbook is an AI-powered creative developer workspace: upload a screen recording of a website, get a working reconstruction, inspect its animations, and learn to rebuild them through lessons and challenges. Product requirements: `docs/reference/prd.pdf`. The approved interaction design is the prototype in `docs/reference/prototype.html` (markup) and `docs/reference/prototype-logic.js` (state and behaviour).

## Tech Stack

- `apps/web`: Next.js (App Router), React, TypeScript (strict), Tailwind CSS, Motion for animation, Zustand for client state. Vitest + Testing Library for unit tests, Playwright for end-to-end.
- `apps/api`: Go (reserved; not built yet). See `docs/ai/memory/backend-go.md`.
- pnpm workspaces.

## Repo Structure

- `apps/web/src/app/` routes; `apps/web/src/features/<feature>/` screen-level features; `apps/web/src/components/` shared UI; `apps/web/src/lib/api/` typed API client (mock implementation now, Go service later); `apps/web/src/lib/domain/` pure domain logic (scoring, levels, versions).
- `apps/api/` Go service (placeholder).
- `docs/reference/` PRD and prototype; `docs/ai/` shared agent memory and handoff.

## Commands

Run from the repo root (Node ≥ 20.9, pnpm 12). Each script forwards to `apps/web`.

- `pnpm install` — install workspace dependencies. First time only: `pnpm --filter @flipbook/web exec playwright install chromium`.
- `pnpm dev` — Next.js dev server on http://localhost:3000.
- `pnpm build` — production build (`next build`).
- `pnpm start` — serve the production build on http://localhost:3100.
- `pnpm typecheck` — `tsc --noEmit`.
- `pnpm lint` — ESLint (`eslint-config-next` core-web-vitals + TypeScript).
- `pnpm test` — Vitest unit tests (`src/**/*.test.ts(x)`).
- `pnpm e2e` — builds, then runs Playwright (`apps/web/e2e/`) against `next start` on port 3100. Port 3100 must be free.
- Demo state lives in the browser's localStorage under `flipbook:v1`; Settings → "Reset demo data" reseeds it.

## Testing Conventions

- Pure domain logic gets Vitest unit tests next to the source (`*.test.ts`).
- User journeys get Playwright tests in `apps/web/e2e/`, run against a production build.
- Mocked data must stay behind the API client; tests may use the mock client but screens never import fixtures directly.
- E2E tests get a fresh browser context, so each starts from seed data. Next.js renders a `role="alert"` route announcer: locate headings and errors by role name or test id, not `getByRole("alert")` alone.

## Coding Conventions

- **Comments**: default to none. Keep one only if deleting it would let someone break something or make a correct line look like a bug: a platform or library quirk, a guard whose purpose isn't obvious, a trap in a tempting rewrite, a contract callers must meet. Delete comments that restate the code, narrate steps, or are stale, commented-out code or section banners, in the lines you change and the code around them. Lint and type directives get a short reason. Don't sweep untouched files in a feature change.
- Interactive elements are real `<button>`/`<a>`/`<input>` elements, keyboard reachable with visible focus. Honour `prefers-reduced-motion` and the in-app reduced-motion setting.
- Never label simulated output as real AI analysis.

## Git Conventions

- Branch prefixes, commit style and AI attribution follow the Agent config block above.
- Commit subjects say what changed for the user in plain words, not which function moved.

## Skills

- Skills live in `.claude/skills/<name>/`, the only real copy. `.agents/skills/<name>` is a relative symlink to each so Codex finds the same skill; add both when you add a skill.
- Skills with a `.synced-from` file came from a shared repo. Edit them freely; a later sync leaves edited copies alone and prints the upstream diff.
