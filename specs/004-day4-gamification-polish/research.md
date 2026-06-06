# Research: Day 4 — Gamification + Polish

**Date**: 2026-06-06
**Feature**: 004-day4-gamification-polish

## Decision 1: Gamification Architecture

**Decision**: Pure functions in `lib/gamification.ts`. `getStats()` reads
localStorage, `saveStats()` writes, `completeCraft()` and `recordCoachMessage()`
return new stats objects (immutable pattern). Caller saves.
**Rationale**: No React state management needed for persistence — just read/write
at key moments. Pure functions are testable and don't couple to React lifecycle.
**Alternatives considered**:
- React context for stats — adds re-render overhead, stats change infrequently
- Custom hook `useGameStats` — viable but pure functions are simpler

## Decision 2: Completion Detection

**Decision**: Check `completedSteps.size === craft.steps.length` after each
toggle. Trigger once — use a `hasAwarded` ref to prevent double-awarding.
**Rationale**: Simple equality check. Ref prevents re-triggering if user
un-checks and re-checks the last step.
**Alternatives considered**:
- Dedicated "Complete" button — adds UI but deviates from spec (auto-detect)
- useEffect watching completedSteps — effect runs on every toggle, wasteful

## Decision 3: Floating Particles Implementation

**Decision**: 15 fixed `<div>` elements with CSS `animation: float-particle`
(already defined in globals.css). Stagger delays via inline style. Colors
derived from theme CSS variables.
**Rationale**: Pure CSS — GPU-accelerated, no JS overhead, no animation library.
15 particles is light enough for any laptop.
**Alternatives considered**:
- Canvas particles — more control but adds JS complexity
- requestAnimationFrame — constitution prohibits JS animation libraries
- CSS Houdini — limited browser support

## Decision 4: Responsive Strategy

**Decision**: Verify existing CSS units (dvh, %, grid) work at 1366x768.
Adjust only if overflow found — reduce font sizes or column gaps.
**Rationale**: Layout already uses responsive units. Day 4 is verification +
minor fixes, not a responsive rewrite.
**Alternatives considered**:
- Media queries for specific breakpoints — premature; check first
- Container queries — overkill for single-breakpoint target

## Decision 5: Stats in HUD

**Decision**: Read stats in page.tsx, pass as props to HUD. HUD re-renders
when stats change (after craft completion or coach message).
**Rationale**: Stats change infrequently — prop drilling is fine. No need for
context or subscription pattern.
**Alternatives considered**:
- HUD reads localStorage directly — bypasses React, causes stale display
- useSyncExternalStore — overkill for localStorage reads
