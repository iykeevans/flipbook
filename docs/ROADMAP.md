# Roadmap

Where Flipbook stands against the PRD (`docs/reference/prd.pdf`). Update this file in the same commit as any change that moves a requirement. Work items live in [GitHub milestones](https://github.com/iykeevans/flipbook/milestones) and on the [Flipbook MVP board](https://github.com/users/iykeevans/projects/2).

Last updated: 2026-11-15.

## Status key

| Status | Meaning |
|---|---|
| Done | Real implementation, verified end to end |
| UI (mock) | The screen and interaction exist and are tested, but run on the mock API or simulated data |
| Partial | Some of the requirement is real, some is missing |
| Not started | Nothing built yet |

## Summary

The web app (`apps/web`) covers most of the PRD's user-facing screens as a working, tested design on a localStorage mock API. Nothing on the backend side exists yet: no Go API, auth, database, uploads, video analysis, code generation, editing or real export. No PRD requirement is Done yet.

| Phase | UI built | Real (Done) | Requirements | Milestone |
|---|---|---|---|---|
| 1. Foundation | █████████░ 88% | 0% | 8 | [Phase 1](https://github.com/iykeevans/flipbook/milestone/1) |
| 2. Video understanding | ███████░░░ 67% | 0% | 6 | [Phase 2](https://github.com/iykeevans/flipbook/milestone/2) |
| 3. Website generation | █████░░░░░ 50% | 0% | 16 | [Phase 3](https://github.com/iykeevans/flipbook/milestone/3) |
| 4. Animation intelligence | ██████████ 100% | 0% | 12 | [Phase 4](https://github.com/iykeevans/flipbook/milestone/4) |
| 5. Learning environment | ████████░░ 80% | 0% | 10 | [Phase 5](https://github.com/iykeevans/flipbook/milestone/5) |
| 6. Quality & beta | n/a | n/a | 0 | [Phase 6](https://github.com/iykeevans/flipbook/milestone/6) |
| **All** | ████████░░ 75% | 0% | 52 | |

"UI built" counts requirements that are UI (mock) or Partial. Phase 6 has no numbered requirements; its work is in the platform table below.

## Requirements by module

Paths are relative to `apps/web/src` unless they start with `/` (a route).

### 5.1 Project management

| ID | Requirement | Phase | Status | Where it lives today | Issue |
|---|---|---|---|---|---|
| PRJ-001 | Create a project manually or by uploading a recording | 1 | UI (mock) | `/new`, `features/new-project` | [#5](https://github.com/iykeevans/flipbook/issues/5) |
| PRJ-002 | Dashboard shows name, thumbnail, dates, processing and project status | 1 | UI (mock) | `/dashboard`, `features/dashboard` | [#5](https://github.com/iykeevans/flipbook/issues/5) |
| PRJ-003 | Rename, delete, duplicate, archive and reopen projects | 1 | Not started |  | [#5](https://github.com/iykeevans/flipbook/issues/5) |
| PRJ-004 | Project versions with restore | 1 | UI (mock) | `/projects/[id]/history`, `lib/domain/versions.ts` | [#9](https://github.com/iykeevans/flipbook/issues/9) |
| PRJ-005 | Access recordings, frames, assets, code and analyses | 1 | UI (mock) | `/projects/[id]/assets` | [#6](https://github.com/iykeevans/flipbook/issues/6) |

### 5.2 Video ingestion and analysis

| ID | Requirement | Phase | Status | Where it lives today | Issue |
|---|---|---|---|---|---|
| VID-001 | Upload a supported recording | 1 | UI (mock) | `features/new-project` | [#6](https://github.com/iykeevans/flipbook/issues/6) |
| VID-002 | Validate format, size, duration, resolution, integrity | 1 | Partial | `lib/domain/upload.ts` (type and size, client only) | [#6](https://github.com/iykeevans/flipbook/issues/6) [#10](https://github.com/iykeevans/flipbook/issues/10) |
| VID-003 | Adaptive key-frame extraction | 2 | UI (mock) | `features/review` frame strip (fixed data) | [#11](https://github.com/iykeevans/flipbook/issues/11) |
| VID-004 | Segment recording into page sections | 2 | UI (mock) | `features/review` overlays (fixed data) | [#11](https://github.com/iykeevans/flipbook/issues/11) |
| VID-005 | Identify scroll, hover, click, modal and navigation states | 2 | Not started |  | [#12](https://github.com/iykeevans/flipbook/issues/12) |
| VID-006 | Identify fade, slide, scale, parallax, stagger and other effects | 2 | Not started |  | [#12](https://github.com/iykeevans/flipbook/issues/12) |
| VID-007 | Structured analysis before code generation | 2 | UI (mock) | mock `analysis` in `lib/api/mock` | [#13](https://github.com/iykeevans/flipbook/issues/13) |
| VID-008 | Review frames and analysis before generating | 2 | UI (mock) | `/projects/[id]/review` | [#13](https://github.com/iykeevans/flipbook/issues/13) |

### 5.3 Reconstruction engine

| ID | Requirement | Phase | Status | Where it lives today | Issue |
|---|---|---|---|---|---|
| GEN-001 | Generate a working website from recording and analysis | 3 | Not started |  | [#14](https://github.com/iykeevans/flipbook/issues/14) |
| GEN-002 | Recreate sections, layout, typography, colour, hierarchy | 3 | Not started |  | [#14](https://github.com/iykeevans/flipbook/issues/14) |
| GEN-003 | Extract usable assets or suggest replacements | 3 | UI (mock) | `/projects/[id]/assets` (replace card-2) | [#14](https://github.com/iykeevans/flipbook/issues/14) |
| GEN-004 | Reusable React components, not one monolith | 3 | Not started |  | [#14](https://github.com/iykeevans/flipbook/issues/14) |
| GEN-005 | Recreate identified animations | 3 | Not started |  | [#15](https://github.com/iykeevans/flipbook/issues/15) |
| GEN-006 | Responsive layouts with marked assumptions | 3 | Not started |  | [#14](https://github.com/iykeevans/flipbook/issues/14) |
| GEN-007 | TypeScript, naming, accessibility, error handling | 3 | Not started |  | [#14](https://github.com/iykeevans/flipbook/issues/14) |
| GEN-008 | Full-site or section regeneration | 3 | UI (mock) | `features/build` regenerate links | [#19](https://github.com/iykeevans/flipbook/issues/19) |
| GEN-009 | Edit generated source code | 3 | Not started | code view is read-only | [#18](https://github.com/iykeevans/flipbook/issues/18) |
| GEN-010 | Export the project as a ZIP | 3 | UI (mock) | `/projects/[id]/export` (simulated) | [#20](https://github.com/iykeevans/flipbook/issues/20) |

### 5.4 Animation intelligence

| ID | Requirement | Phase | Status | Where it lives today | Issue |
|---|---|---|---|---|---|
| ANI-001 | Identify animations visible in the recording | 4 | UI (mock) | `features/animations` timeline (fixed 5) | [#12](https://github.com/iykeevans/flipbook/issues/12) |
| ANI-002 | Classify animations by behaviour and trigger | 4 | UI (mock) | `lib/domain/animations.ts` | [#12](https://github.com/iykeevans/flipbook/issues/12) |
| ANI-003 | Extract or infer target, type, trigger, duration, easing, states | 4 | UI (mock) | inspector property table | [#12](https://github.com/iykeevans/flipbook/issues/12) |
| ANI-004 | Confidence; observed, inferred and unknown kept distinct | 4 | UI (mock) | inspector legend; unknown never fabricated | [#12](https://github.com/iykeevans/flipbook/issues/12) |
| ANI-005 | Explain how the animation is implemented | 4 | UI (mock) | inspector note (fixed copy) | [#21](https://github.com/iykeevans/flipbook/issues/21) |
| ANI-006 | Highlight the source when an animation is selected | 4 | Partial | "Open code" goes to Build; no line highlight | [#21](https://github.com/iykeevans/flipbook/issues/21) |
| ANI-007 | Replay individual animations | 4 | UI (mock) | inspector Replay and 0.25× | [#22](https://github.com/iykeevans/flipbook/issues/22) |
| ANI-008 | Modify properties and see the result | 4 | UI (mock) | inspector duration −/+ (mock) | [#22](https://github.com/iykeevans/flipbook/issues/22) |
| ANI-009 | Suggest alternative implementations | 4 | UI (mock) | Build stack switcher (fixed code) | [#23](https://github.com/iykeevans/flipbook/issues/23) |
| ANI-010 | Suggest libraries without claiming the original's | 4 | UI (mock) | inspector note | [#23](https://github.com/iykeevans/flipbook/issues/23) |

### 5.5 Learning environment

| ID | Requirement | Phase | Status | Where it lives today | Issue |
|---|---|---|---|---|---|
| LRN-001 | Generate lessons from detected animations | 5 | Not started | one hard-coded lesson | [#24](https://github.com/iykeevans/flipbook/issues/24) |
| LRN-002 | Beginner, intermediate, advanced difficulty | 5 | UI (mock) | `features/lesson` difficulty switch | [#24](https://github.com/iykeevans/flipbook/issues/24) |
| LRN-003 | Explain transitions, keyframes, easing, scroll-driven, GSAP, performance | 5 | Partial | stagger and easing only | [#24](https://github.com/iykeevans/flipbook/issues/24) |
| LRN-004 | Line-by-line code explanations | 5 | UI (mock) | lesson step 3 walkthrough | [#24](https://github.com/iykeevans/flipbook/issues/24) |
| LRN-005 | Interactive playground for animation properties | 5 | UI (mock) | lesson step 2 | [#24](https://github.com/iykeevans/flipbook/issues/24) |
| LRN-006 | Guided implementation challenges | 5 | UI (mock) | `/projects/[id]/learn/challenge` | [#25](https://github.com/iykeevans/flipbook/issues/25) |
| LRN-007 | Evaluate user implementations against expected behaviour | 5 | Not started | slider scoring only | [#25](https://github.com/iykeevans/flipbook/issues/25) |
| LRN-008 | AI tutor | 5 | UI (mock) | three canned answers | [#26](https://github.com/iykeevans/flipbook/issues/26) |
| LRN-009 | Track lessons, exercises, challenges, milestones | 5 | UI (mock) | `/skills`, `lib/domain/xp.ts` (local) | [#27](https://github.com/iykeevans/flipbook/issues/27) |
| LRN-010 | Independent recreation exercises | 5 | UI (mock) | challenge "from memory" | [#25](https://github.com/iykeevans/flipbook/issues/25) |

### 5.6 Code editor and preview

| ID | Requirement | Phase | Status | Where it lives today | Issue |
|---|---|---|---|---|---|
| IDE-001 | Interactive browser environment for the generated site | 3 | UI (mock) | Build preview (mock site) | [#16](https://github.com/iykeevans/flipbook/issues/16) |
| IDE-002 | View and edit source | 3 | Partial | view only | [#18](https://github.com/iykeevans/flipbook/issues/18) |
| IDE-003 | Sync source changes with the preview | 3 | Not started |  | [#18](https://github.com/iykeevans/flipbook/issues/18) |
| IDE-004 | Responsive viewport inspection | 3 | UI (mock) | Build viewport toggle | [#16](https://github.com/iykeevans/flipbook/issues/16) |
| IDE-005 | Element selection and animation inspection | 4 | UI (mock) | `features/animations` | [#21](https://github.com/iykeevans/flipbook/issues/21) |
| IDE-006 | Navigate from an element or animation to its source | 4 | UI (mock) | "Open code" link | [#21](https://github.com/iykeevans/flipbook/issues/21) |
| IDE-007 | Show compile and runtime errors | 3 | UI (mock) | Build error banner (simulated) | [#16](https://github.com/iykeevans/flipbook/issues/16) |
| IDE-008 | Restore previously saved versions | 1 | UI (mock) | `/projects/[id]/history` | [#9](https://github.com/iykeevans/flipbook/issues/9) |
| IDE-009 | Export the complete project | 3 | UI (mock) | `/projects/[id]/export` (simulated) | [#20](https://github.com/iykeevans/flipbook/issues/20) |

## Platform work

Needed for the phases but not a numbered PRD requirement.

| Phase | Work | Status | Issue |
|---|---|---|---|
| 1 | Go API skeleton, health, logging | Not started | [#2](https://github.com/iykeevans/flipbook/issues/2) |
| 1 | Auth | Not started | [#3](https://github.com/iykeevans/flipbook/issues/3) |
| 1 | Postgres schema (§10) | Not started | [#4](https://github.com/iykeevans/flipbook/issues/4) |
| 1 | Background jobs and live status | Not started | [#7](https://github.com/iykeevans/flipbook/issues/7) |
| 1 | HTTP client replacing the mock API | Not started | [#8](https://github.com/iykeevans/flipbook/issues/8) |
| 2 | FFmpeg ingestion | Not started | [#10](https://github.com/iykeevans/flipbook/issues/10) |
| 3 | Sandboxed build and preview | Not started | [#16](https://github.com/iykeevans/flipbook/issues/16) |
| 3 | Visual comparison and repair loop | Not started | [#17](https://github.com/iykeevans/flipbook/issues/17) |
| 6 | Security hardening | Not started | [#28](https://github.com/iykeevans/flipbook/issues/28) |
| 6 | Analytics and success metrics | Not started | [#29](https://github.com/iykeevans/flipbook/issues/29) |
| 6 | Beta readiness | Not started | [#30](https://github.com/iykeevans/flipbook/issues/30) |

## Acceptance criteria (PRD §13)

| ID | Area | Status | Notes | Issues |
|---|---|---|---|---|
| AC-01 | Recording upload | Partial | client validation only; no real upload or retry | [#6](https://github.com/iykeevans/flipbook/issues/6) |
| AC-02 | Video analysis | UI (mock) | review screen on fixed analysis | [#10](https://github.com/iykeevans/flipbook/issues/10) [#11](https://github.com/iykeevans/flipbook/issues/11) [#12](https://github.com/iykeevans/flipbook/issues/12) [#13](https://github.com/iykeevans/flipbook/issues/13) |
| AC-03 | Website generation | Not started |  | [#14](https://github.com/iykeevans/flipbook/issues/14) [#16](https://github.com/iykeevans/flipbook/issues/16) |
| AC-04 | Animation detection | UI (mock) | observed/inferred/unknown rendered; nothing detected | [#12](https://github.com/iykeevans/flipbook/issues/12) [#21](https://github.com/iykeevans/flipbook/issues/21) |
| AC-05 | Animation inspection | UI (mock) |  | [#21](https://github.com/iykeevans/flipbook/issues/21) [#22](https://github.com/iykeevans/flipbook/issues/22) |
| AC-06 | Interactive learning | UI (mock) | one lesson; progress local | [#24](https://github.com/iykeevans/flipbook/issues/24) [#27](https://github.com/iykeevans/flipbook/issues/27) |
| AC-07 | Code editing | Not started | read-only code view | [#18](https://github.com/iykeevans/flipbook/issues/18) |
| AC-08 | Project persistence | Partial | localStorage only | [#8](https://github.com/iykeevans/flipbook/issues/8) [#9](https://github.com/iykeevans/flipbook/issues/9) [#27](https://github.com/iykeevans/flipbook/issues/27) |
| AC-09 | Export | Not started | simulated | [#20](https://github.com/iykeevans/flipbook/issues/20) |

## MVP Definition of Done (PRD §18)

- [ ] Create an account and project: Not started (project creation is UI (mock); no accounts)
- [ ] Upload a screen recording: Partial (UI and client validation)
- [ ] Analyse the recording; review structure and animations: Partial (review UI on fixed data)
- [ ] Generate a functional React website and preview it: Not started
- [ ] Edit its source code: Not started
- [ ] Select an animated element and inspect its properties: Partial (UI (mock))
- [ ] Understand how the animation was implemented: Partial (UI (mock))
- [ ] Modify and replay the animation: Partial (UI (mock))
- [ ] Complete a relevant interactive lesson: Partial (one hard-coded lesson)
- [ ] Save the project and export the implementation: Not started (versions local; export simulated)

## Next up

1. Go API skeleton ([#2](https://github.com/iykeevans/flipbook/issues/2)), Postgres schema ([#4](https://github.com/iykeevans/flipbook/issues/4)) and auth ([#3](https://github.com/iykeevans/flipbook/issues/3)).
2. Projects API including rename/delete/duplicate/archive ([#5](https://github.com/iykeevans/flipbook/issues/5)), and versions ([#9](https://github.com/iykeevans/flipbook/issues/9)).
3. HTTP client replacing the mock API ([#8](https://github.com/iykeevans/flipbook/issues/8)), so the existing screens run on real data.
4. Uploads to object storage ([#6](https://github.com/iykeevans/flipbook/issues/6)) and the job queue ([#7](https://github.com/iykeevans/flipbook/issues/7)), which complete Phase 1.
5. Phase 2: FFmpeg ingestion ([#10](https://github.com/iykeevans/flipbook/issues/10)), frame extraction ([#11](https://github.com/iykeevans/flipbook/issues/11)), vision analysis ([#12](https://github.com/iykeevans/flipbook/issues/12)) and the IR ([#13](https://github.com/iykeevans/flipbook/issues/13)).
