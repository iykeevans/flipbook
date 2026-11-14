# apps/api

Reserved for the Flipbook API service, written in Go (see `docs/ai/memory/backend-go.md`). Nothing is built here yet.

The web app talks to the backend only through `apps/web/src/lib/api/` (`FlipbookApi`). Today that interface is served by a localStorage-backed mock; the Go service will implement the PRD §11 `/api/v1/...` resources and an `HttpFlipbookApi` will replace the mock without changes to screens.

This directory is intentionally not a pnpm workspace package.
