# Progress tracking

Decided 2026-11-15: progress against the PRD is tracked in two places that must agree.

- `docs/ROADMAP.md`: every PRD requirement ID with a status (Done, UI (mock), Partial, Not started), where it lives in code, and its issue. Generated once from a data table; edit rows by hand from now on and keep the summary counts right.
- GitHub (iykeevans/flipbook): milestones "Phase 1: Foundation" to "Phase 6: Quality & beta", issues #2 to #30, labels `phase-N`, `area:web|api|ai`, `status:ui-mock`, `in-review`. Issue #1 is the merged PR for the initial web app.

"UI (mock)" means the screen works on the mock API; it is not Done. Done requires the real backend and verification. The gh token lacks the `project` scope, so there is no Projects board; add one after `gh auth refresh -s project` if wanted.
