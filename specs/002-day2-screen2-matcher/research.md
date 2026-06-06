# Research: Day 2 — Screen 2 + Matcher + Suggestions

**Date**: 2026-06-06
**Feature**: 002-day2-screen2-matcher

## Decision 1: model-viewer Integration

**Decision**: Use `@google/model-viewer` as a web component loaded via `<script>`
tag, with TypeScript declaration for JSX compatibility.
**Rationale**: model-viewer is a web component — not a React component. In
Next.js App Router, load via script tag in layout or dynamic import. Declare
custom element in a `.d.ts` file for TypeScript.
**Alternatives considered**:
- Three.js directly — much more code, model-viewer handles GLTF natively
- React-three-fiber — heavy dependency, not in constitution's package budget
- Note: @google/model-viewer npm package not yet installed. Need to add it or
  use CDN script. Given offline requirement, npm package preferred.

## Decision 2: Matcher Algorithm

**Decision**: Simple set-intersection matcher. For each craft, count how many
of its required `materialId`s appear in the selected items (presence only,
ignoring quantity). Match % = matched / total required × 100. Filter >= 40%.
Sort descending.
**Rationale**: Deterministic, fast, zero dependencies. Aligns with constitution
principle I (Library-First). O(crafts × materials) which is O(8 × 12) = trivial.
**Alternatives considered**:
- Weighted matching (consider quantity) — adds complexity, spec says ignore qty
- Fuzzy matching — unnecessary for exact materialId comparison
- Category-based matching — could be future enhancement, not Day 2 scope

## Decision 3: Screen 2 Layout Strategy

**Decision**: CSS Grid with `grid-template-columns: 55% 22.5% 22.5%` and
`height: 100dvh - HUD - tabs`. Overflow hidden on outer container, scroll
only within individual columns.
**Rationale**: Matches demo/index.html pattern. `100dvh` accounts for mobile
viewport but we target desktop. Each column independently scrollable.
**Alternatives considered**:
- Flexbox — harder to get exact proportions with gap
- Fixed pixel widths — doesn't adapt to different screen sizes

## Decision 4: Step State Management

**Decision**: `Set<number>` in React state tracking completed step numbers.
Current step = `Math.min(...allStepNumbers.filter(n => !completedSteps.has(n)))`.
Click toggles: add if absent, delete if present.
**Rationale**: Simple, performant, matches spec exactly. Set operations are O(1).
State resets on craft change (no persistence needed per spec assumptions).
**Alternatives considered**:
- Array of booleans — less semantic, Set is cleaner for toggle operations
- useReducer — overkill for single toggle action

## Decision 5: Suggestion Cards Placement

**Decision**: Render below the Screen 1 two-column grid, outside the pixel-box.
Full-width section with 3-column grid of cards.
**Rationale**: Matches dev plan's "full-width bottom section" requirement. Not
inside the viewport-height grid to avoid scroll conflicts.
**Alternatives considered**:
- Inside right column — not enough space alongside selected items
- Floating overlay — disrupts material selection flow
