# Backend is Go

Decided 2026-11-14 by the user: the backend is written in Go and lives in `apps/api`. The PRD (`docs/reference/prd.pdf`, §8.2) proposes NestJS; that part of the PRD is superseded.

The web app talks to the backend only through the typed client in `apps/web/src/lib/api/`, shaped after the PRD §11 REST resources (`/api/v1/...`), so the Go service can replace the mock implementation without touching screens.
