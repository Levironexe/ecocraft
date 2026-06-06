# Tasks: Day 1 — Foundation + Data Layer + Screen 1 Static UI

**Input**: Design documents from `specs/001-day1-foundation-ui/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Next.js App Router**: `app/` at repository root
- Components: `app/components/`
- Data/types: `app/lib/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, dependencies, and base configuration

- [x] T001 Update `app/globals.css` with Tailwind base, CSS custom property declarations for all theme tokens, pixel-art utility classes (scanline overlay, pixel-border box-shadow patterns)
- [x] T002 [P] Define all TypeScript interfaces in `app/lib/types.ts`: Material, Craft, CraftStep, CraftMaterial, SelectedItem, ChatMessage, Theme, GameStats
- [x] T003 [P] Write 4 theme palettes (sky-coral, teal-peach, indigo-mint, brown-orange) in `app/lib/themes.ts` as typed `Record<string, Theme>`
- [x] T004 [P] Write complete material data library (12+ items) in `app/lib/materials.ts` as typed `Material[]` with all fields populated
- [x] T005 Write complete craft data library (8 crafts) with full Vietnamese step instructions in `app/lib/crafts.ts` as typed `Craft[]`
- [x] T006 Update `app/layout.tsx`: replace Geist fonts with VT323 from `next/font/google` using `latin-ext` subset, set `lang="vi"`, wrap children with ThemeProvider

**Checkpoint**: All data files compilable. `npm run build` passes with types only.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Theme system and reusable UI components — MUST complete before any user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Build `app/components/ThemeProvider.tsx`: React context providing current theme + `setTheme(id)`, read from localStorage(`ecocraft-theme`) on mount, inject all CSS custom properties onto `:root` via `useEffect`, default to `sky-coral`, `'use client'` directive
- [x] T008 [P] Build `app/components/ui/PixelBox.tsx`: reusable container `<div>` with pixel-art box-shadow borders using theme CSS variables, props: `children`, `className`
- [x] T009 [P] Build `app/components/ui/PixelButton.tsx`: game-styled button with variants `primary` (green/blue), `accent` (coral/red), `ghost` (outlined), props: `children`, `onClick`, `variant`, `fullWidth`, `disabled`, pixel border + hover effects using theme vars
- [x] T010 [P] Build `app/components/ui/QuantityControl.tsx`: `-` button, numeric display, `+` button, props: `value`, `onChange`, `min` (default 1), `'use client'` directive

**Checkpoint**: Foundation ready — all UI primitives usable. Theme switching works via context.

---

## Phase 3: User Story 1 — Browse Recyclable Materials (Priority: P1) 🎯 MVP

**Goal**: Child sees 4-column grid of 12+ materials, can search and click to preview

**Independent Test**: Open app → 12+ cards visible → type "chai" → filtered → click card → preview updates

### Implementation for User Story 1

- [x] T011 [US1] Build `app/components/screen1/InventoryGrid.tsx`: 4-column scrollable grid rendering all materials from `app/lib/materials.ts`, search bar at top with diacritics-insensitive filtering (Unicode NFD normalization), click handler calls `onSelect(material)`, selected material gets highlight border + checkmark, empty state message "Không tìm thấy vật liệu nào.", `'use client'` directive
- [x] T012 [US1] Build `app/components/screen1/ItemPreview.tsx`: large emoji display, material name, size dropdown populated from `material.sizeOptions`, QuantityControl component, "➕ Thêm vào túi" PixelButton, props: `material`, `onAdd(selectedItem)`, `'use client'` directive
- [x] T013 [US1] Build `app/components/screen1/MaterialScreen.tsx`: Screen 1 container with 2-column grid layout (left 50% inventory/chat, right 50% preview/bag), height `calc(100dvh - HUD - tabs)`, receives state props and passes to children

**Checkpoint**: Material browsing and preview fully functional

---

## Phase 4: User Story 2 — Select Materials and Build a Bag (Priority: P1)

**Goal**: Child adds materials to bag, sees selected list, can remove items, "Chế Tạo Ngay!" switches tabs

**Independent Test**: Select material → pick size → set qty → add → appears in bag → remove → gone → "Chế Tạo Ngay!" switches tab

### Implementation for User Story 2

- [x] T014 [US2] Build `app/components/screen1/SelectedItems.tsx`: "🎒 Đã Chọn" header in PixelBox, list of SelectedItem entries with emoji + name + size + quantity badge + ✕ remove button, "🚀 Chế Tạo Ngay!" PixelButton (accent variant, disabled when bag empty), props: `items`, `onRemove(index)`, `onCraft()`, `'use client'` directive
- [x] T015 [US2] Wire state management in `app/page.tsx`: `selectedMaterial: Material | null`, `selectedItems: SelectedItem[]`, `activeScreen: 1 | 2`, `previewSize: string`, `previewQty: number`, handlers for `addItem` (dedup by materialId+size → increment qty), `removeItem`, `setActiveScreen`, pass all props to MaterialScreen and child components, `'use client'` directive

**Checkpoint**: Full material selection flow works end-to-end — browse → preview → add → bag → "Chế Tạo Ngay!" switches tab

---

## Phase 5: User Story 3 — Switch Themes (Priority: P2)

**Goal**: Child opens settings, picks from 4 themes, colors change instantly, persists across reload

**Independent Test**: Open settings → click theme swatch → colors change → refresh → theme persists

### Implementation for User Story 3

- [x] T016 [US3] Build `app/components/SettingsPanel.tsx`: overlay/modal panel, 4 theme swatches as colored circles with Vietnamese names (Trời Xanh, Nhiệt Đới, Bạc Hà, Xưởng Gỗ), click calls `setTheme(id)` from ThemeProvider context, close button, `'use client'` directive

**Checkpoint**: Theme switching fully functional with persistence

---

## Phase 6: User Story 4 — View HUD and Stats Bar (Priority: P2)

**Goal**: Top bar with logo, stats counters, settings gear icon

**Independent Test**: Open app → HUD visible → logo + stats + gear rendered → gear clickable

### Implementation for User Story 4

- [x] T017 [US4] Build `app/components/HUD.tsx`: top bar with theme HUD gradient background, leaf emoji + "EcoCraft AI" logo, stats display (♻️ Đã tái chế: 0, ⭐ Cấp độ: 1, 🏆 Điểm: 0 — hardcoded defaults), gear ⚙️ icon button that toggles SettingsPanel visibility, `'use client'` directive

**Checkpoint**: HUD renders with themed gradient, stats, and working settings toggle

---

## Phase 7: User Story 5 — Navigate Between Screens via Tabs (Priority: P2)

**Goal**: Two tabs switch between Screen 1 and Screen 2 (placeholder)

**Independent Test**: Click Screen 2 tab → highlights → placeholder shown → click Screen 1 → back

### Implementation for User Story 5

- [x] T018 [US5] Build `app/components/ScreenTabs.tsx`: two tabs "🎒 Chọn Vật Liệu" and "🔨 Xưởng Chế Tạo", active tab gets visual indicator (underline + background highlight using theme colors), props: `activeScreen: 1 | 2`, `onTabChange(screen)`, `'use client'` directive

**Checkpoint**: Tab navigation works, Screen 2 shows placeholder content

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Wire everything together in page.tsx, visual polish, build verification

- [x] T019 Assemble all components in `app/page.tsx`: import and render HUD → ScreenTabs → conditional MaterialScreen (screen 1) or placeholder div "Xưởng Chế Tạo — coming soon" (screen 2), ensure all state flows correctly between components
- [x] T020 [P] Add pixel-art visual polish in `app/globals.css`: scanline overlay (`::after` pseudo-element with repeating gradient), floating pixel particles (CSS keyframe animations), leaf bob animation for HUD logo, hover effects on interactive elements, themed scrollbar styling
- [x] T021 [P] Verify Vietnamese text rendering: confirm VT323 renders all diacritics (ắ, ặ, ề, ố, ừ, ữ, đ) correctly across all components, no English text visible in any UI surface
- [x] T022 Run `npm run build` — must compile without errors
- [x] T023 Run `npm run dev` and manually test full quickstart.md checklist: material grid, search, preview, bag, themes, HUD, tabs

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on T002 (types) and T003 (themes) from Setup
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - US1 and US2 are sequential (US2 needs US1 components)
  - US3, US4, US5 can proceed in parallel once Foundation complete
- **Polish (Phase 8)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: Depends on Foundation only — no other story deps
- **US2 (P1)**: Depends on US1 (needs InventoryGrid, ItemPreview, MaterialScreen)
- **US3 (P2)**: Depends on Foundation (ThemeProvider) — independent of US1/US2
- **US4 (P2)**: Depends on US3 (SettingsPanel toggled from HUD gear) — independent of US1/US2
- **US5 (P2)**: Depends on Foundation only — independent of other stories

### Within Each User Story

- Models/data before components
- Container components before child components
- State wiring after all components exist

### Parallel Opportunities

- T002, T003, T004 can all run in parallel (different files, no deps)
- T008, T009, T010 can all run in parallel (independent UI primitives)
- T016, T017, T018 can run in parallel (independent components, all depend on Foundation only)
- T020, T021 can run in parallel (CSS polish vs text verification)

---

## Parallel Example: Setup Phase

```bash
# Launch all data layer tasks together:
Task: "Define TypeScript interfaces in app/lib/types.ts"        # T002
Task: "Write theme palettes in app/lib/themes.ts"               # T003
Task: "Write material data in app/lib/materials.ts"             # T004
```

## Parallel Example: Foundation Phase

```bash
# Launch all UI primitives together:
Task: "Build PixelBox in app/components/ui/PixelBox.tsx"        # T008
Task: "Build PixelButton in app/components/ui/PixelButton.tsx"  # T009
Task: "Build QuantityControl in app/components/ui/QuantityControl.tsx"  # T010
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2 Only)

1. Complete Phase 1: Setup (data layer)
2. Complete Phase 2: Foundation (theme + UI primitives)
3. Complete Phase 3: US1 — Browse Materials
4. Complete Phase 4: US2 — Build Selection Bag
5. **STOP and VALIDATE**: Full material selection flow works
6. Deploy/demo if ready — this alone is a working app

### Incremental Delivery

1. Setup + Foundation → Data and components ready
2. US1 → Material browsing works (MVP core!)
3. US2 → Selection bag works (MVP complete!)
4. US3 → Theme switching works
5. US4 → HUD with stats and settings
6. US5 → Tab navigation
7. Polish → Visual refinement + build verification

### Recommended Execution Order

Single developer — sequential by priority:
1. T001 → T002+T003+T004 (parallel) → T005 → T006
2. T007 → T008+T009+T010 (parallel)
3. T011 → T012 → T013
4. T014 → T015
5. T016+T017+T018 (parallel)
6. T019 → T020+T021 (parallel) → T022 → T023

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Each user story independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- No test tasks generated — manual testing per quickstart.md
