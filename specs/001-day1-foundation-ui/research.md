# Research: Day 1 — Foundation + Data Layer + Screen 1 Static UI

**Date**: 2026-06-06
**Feature**: 001-day1-foundation-ui

## Decision 1: Font Loading Strategy

**Decision**: Use `next/font/google` with VT323, subset `latin-ext`
**Rationale**: Next.js 16 self-hosts Google Fonts at build time — no runtime
requests to Google. `latin-ext` subset includes Vietnamese diacritics. VT323
is verified to support full Vietnamese character set.
**Alternatives considered**:
- Manual font file in `/public/fonts/` — unnecessary, Next.js handles this
- Be Vietnam Pro as primary — doesn't match pixel-art aesthetic; keep as fallback

## Decision 2: Theme Implementation

**Decision**: CSS custom properties on `:root`, injected via React context + useEffect
**Rationale**: Tailwind CSS 4 supports `var()` references natively. CSS custom
properties update instantly without re-render. localStorage persistence means
no server-side concern.
**Alternatives considered**:
- Tailwind dark mode classes — limited to 2 modes, not 4 themes
- CSS-in-JS (styled-components) — adds dependency, not in constitution's package budget
- Data attributes (`data-theme`) — viable but CSS vars are more flexible for
  the 16+ color tokens each theme defines

## Decision 3: State Management

**Decision**: React useState in page.tsx, prop drilling to child components
**Rationale**: Constitution prohibits state management libraries. App has 2 screens
and ~5 state variables. Prop drilling is sufficient and simplest.
**Alternatives considered**:
- React Context for selected items — overkill for single-page prop depth of 2-3
- URL state (searchParams) — adds complexity, not needed for client-only state

## Decision 4: Search / Diacritics-Insensitive Filtering

**Decision**: Use `String.normalize('NFD').replace(/[̀-ͯ]/g, '')` for
diacritics removal, then case-insensitive includes
**Rationale**: Standard Unicode normalization approach. No library needed. Works
for Vietnamese tones (sắc, huyền, hỏi, ngã, nặng) and special chars (đ→d).
**Alternatives considered**:
- `Intl.Collator` with sensitivity 'base' — good for sorting but awkward for
  substring matching
- Library like `remove-accents` — unnecessary dependency for one function

## Decision 5: Pixel-Art UI Component Approach

**Decision**: Custom Tailwind classes + CSS for pixel borders, matching demo/index.html
**Rationale**: Demo already defines the visual language. Components need box-shadow
based pixel borders, specific color tokens, and hover states. Tailwind utility
classes + a few custom CSS rules are sufficient.
**Alternatives considered**:
- NES.css library — close aesthetic but adds dependency and may conflict with
  theme system
- Inline styles — harder to maintain, no hover/focus support

## Decision 6: Component File Organization

**Decision**: `app/components/` with `screen1/` subdirectory, `app/lib/` for data
**Rationale**: Next.js 16 App Router convention. Flat `components/` for shared
components (HUD, tabs, theme, settings), screen-specific subdirectory for
encapsulation. `lib/` for pure data/types — no React dependencies.
**Alternatives considered**:
- `src/` prefix — not in existing scaffold, would require tsconfig changes
- Feature-based folders — overkill for 2-screen app
