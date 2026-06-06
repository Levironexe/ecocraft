# Implementation Plan: Day 2 — Screen 2 Build Workshop + Matcher + Suggestions

**Branch**: `002-day2-screen2-matcher` | **Date**: 2026-06-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/002-day2-screen2-matcher/spec.md`

## Summary

Build Screen 2 (3-column build workshop with model viewer, step tracker, coach
chat), deterministic craft-material matcher, and suggestion cards on Screen 1.
Wire the full flow: select materials → see suggestions → click → workshop loads.
No AI on Day 2 — everything deterministic.

## Technical Context

**Language/Version**: TypeScript 5.x on Next.js 16.2.7 (App Router)
**Primary Dependencies**: React 19.2.4, Tailwind CSS 4, @google/model-viewer (web component)
**Storage**: React state (ephemeral — completed steps, selected craft)
**Testing**: Manual end-to-end testing only
**Target Platform**: Desktop browsers (Chrome, Edge) on laptop screens (1366x768+)
**Project Type**: Web application (single-page, two-screen tab-based)
**Performance Goals**: Matcher <200ms, tab switch <300ms, step toggle instant
**Constraints**: Offline-capable, viewport-height layout for Screen 2
**Scale/Scope**: 8 crafts to match against, 3 suggestion cards max, 5-6 steps per craft

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Library-First, Deterministic-Primary | ✅ PASS | Matcher is purely deterministic; no AI suggestions on Day 2 |
| II. Honest Refusal | ✅ N/A | No AI integration on Day 2 |
| III. Vietnamese-Native UX | ✅ PASS | All new UI strings Vietnamese |
| IV. Offline-Capable | ✅ PASS | Matcher runs client-side, GLBs from /public/models/ |
| V. Ship Incrementally | ✅ PASS | Day ends with both screens interactive + working matcher |
| VI. Child-Safe | ✅ N/A | No AI interactions; tips warn about tools |
| VII. Minimal Viable Polish | ✅ PASS | 3-column pixel-art layout, step animations, suggestion cards |

All gates pass.

## Project Structure

### Documentation (this feature)

```text
specs/002-day2-screen2-matcher/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (new/modified files)

```text
app/
├── page.tsx                    # MODIFIED — add craft state, matcher wiring, suggestions
├── components/
│   ├── screen1/
│   │   └── SuggestionCards.tsx  # NEW — 3-col suggestion cards below Screen 1
│   └── screen2/
│       ├── BuildScreen.tsx     # NEW — Screen 2 container (3-column layout)
│       ├── MaterialsBar.tsx    # NEW — Top bar with materials + tools chips
│       ├── ModelViewer.tsx     # NEW — <model-viewer> wrapper or placeholder
│       ├── StepsList.tsx       # NEW — Quest-style step tracker
│       └── CoachChat.tsx       # NEW — Static coach chat panel
├── lib/
│   └── matcher.ts              # NEW — Deterministic craft-material matching
```

**Structure Decision**: Extends Day 1 structure. New `screen2/` subdirectory
mirrors `screen1/` pattern. Matcher in `lib/` as pure function.

## Complexity Tracking

> No constitution violations. Table intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
