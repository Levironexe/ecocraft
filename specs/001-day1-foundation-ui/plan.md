# Implementation Plan: Day 1 — Foundation + Data Layer + Screen 1 Static UI

**Branch**: `001-day1-foundation-ui` | **Date**: 2026-06-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-day1-foundation-ui/spec.md`

## Summary

Build the complete data layer (TypeScript types, material library, craft library,
theme palettes), theme system (CSS custom properties + React context + localStorage),
reusable pixel-art UI components, and Screen 1 interactive UI (material grid,
preview panel, selection bag, HUD, tab navigation). Day ends with a fully
interactive material selection flow — no AI, no matcher, no Screen 2 content.

## Technical Context

**Language/Version**: TypeScript 5.x on Next.js 16.2.7 (App Router)
**Primary Dependencies**: React 19.2.4, Tailwind CSS 4, next/font/google (VT323)
**Storage**: localStorage (theme + game stats persistence)
**Testing**: Manual end-to-end testing only (per constitution — no automated tests)
**Target Platform**: Desktop browsers (Chrome, Edge) on laptop screens (1366x768+)
**Project Type**: Web application (single-page feel, two-screen tab-based)
**Performance Goals**: Interactive in <3s, theme switch <200ms, search filter <100ms
**Constraints**: Offline-capable (no external API calls on Day 1), <100KB JS for data layer
**Scale/Scope**: 12+ materials, 8 crafts, 4 themes, 2 screens (only Screen 1 on Day 1)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Library-First, Deterministic-Primary | ✅ PASS | All data hardcoded in TS files, no AI on Day 1 |
| II. Honest Refusal | ✅ N/A | No AI integration on Day 1 |
| III. Vietnamese-Native UX | ✅ PASS | All strings Vietnamese, VT323 font with `latin-ext` subset |
| IV. Offline-Capable | ✅ PASS | Zero network calls — all data local, font self-hosted by Next.js |
| V. Ship Incrementally | ✅ PASS | Day ends with runnable interactive Screen 1 |
| VI. Child-Safe | ✅ N/A | No AI interactions on Day 1 |
| VII. Minimal Viable Polish | ✅ PASS | Pixel-art components, 4 themes, HUD with gamification placeholders |

All gates pass. No violations to track.

## Project Structure

### Documentation (this feature)

```text
specs/001-day1-foundation-ui/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
app/
├── layout.tsx              # Root layout — VT323 font, ThemeProvider wrapper
├── page.tsx                # Main page — tab state, selected items state
├── globals.css             # Tailwind base + CSS custom properties for themes
├── components/
│   ├── HUD.tsx             # Top bar — logo, stats, settings gear
│   ├── ScreenTabs.tsx      # Tab switcher — 2 tabs
│   ├── screen1/
│   │   ├── MaterialScreen.tsx    # Screen 1 container (2-column grid)
│   │   ├── InventoryGrid.tsx     # 4-col material card grid + search
│   │   ├── ItemPreview.tsx       # Material preview + size/qty selector
│   │   └── SelectedItems.tsx     # "Đã Chọn" bag list + "Chế Tạo Ngay!" button
│   ├── ui/
│   │   ├── PixelBox.tsx          # Reusable pixel-border container
│   │   ├── PixelButton.tsx       # Game button (primary/accent/ghost variants)
│   │   └── QuantityControl.tsx   # +/- quantity selector
│   ├── ThemeProvider.tsx         # Theme context, CSS var injection, localStorage
│   └── SettingsPanel.tsx         # Theme picker (minimal Day 1 — just theme swatches)
├── lib/
│   ├── types.ts            # All TypeScript interfaces
│   ├── materials.ts        # Material[] data (12+ items)
│   ├── crafts.ts           # Craft[] data (8 crafts, full Vietnamese steps)
│   └── themes.ts           # Theme palettes (4 themes)
```

**Structure Decision**: Next.js App Router convention. Components co-located in
`app/components/`, data/types in `app/lib/`. No `src/` prefix — matches existing
scaffold. Screen-specific components grouped in `screen1/` subdirectory.

## Complexity Tracking

> No constitution violations. Table intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
