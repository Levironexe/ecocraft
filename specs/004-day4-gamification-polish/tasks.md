# Tasks: Day 4 — Gamification + Settings + Polish

**Input**: Design documents from `specs/004-day4-gamification-polish/`
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
- Data/lib: `app/lib/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create gamification module and particles component

- [x] T001 Build `app/lib/gamification.ts`: export `getStats(): GameStats` (read from localStorage key `ecocraft-stats`, return defaults if not found), `saveStats(stats: GameStats): void` (write to localStorage), `completeCraft(stats: GameStats, craft: Craft): GameStats` (craftsCompleted +1, itemsRecycled + sum of craft.materials[].quantity, points + 50 + craft.steps.length × 10, recalculate level from thresholds L1:0-99 L2:100-249 L3:250-499 L4:500-999 L5:1000+, add today ISO date to activityDates deduped, return new stats), `recordCoachMessage(stats: GameStats): GameStats` (coachMessages +1, points +5, recalculate level, add today date, return new stats)
- [x] T002 [P] Build `app/components/PixelParticles.tsx`: render 15 `<div>` elements with `pixel-particle` CSS class (already defined in globals.css), each with random inline styles for left position (spread across viewport width), animation-duration (15-35s range), animation-delay (0-20s staggered), and background-color cycling through theme colors (var(--primary), var(--accent), var(--primary-light), var(--accent-light), var(--border)), `pointer-events: none`, `z-index: 0`

**Checkpoint**: gamification.ts functions work. Particles render and animate.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Wire gamification state into page.tsx — all stories depend on this

- [x] T003 Update `app/page.tsx`: add `gameStats: GameStats` state (initialize from `getStats()` on mount via useEffect), add `handleCraftComplete(craft: Craft)` that calls `completeCraft()` + `saveStats()` + updates state, add `handleCoachMessage()` that calls `recordCoachMessage()` + `saveStats()` + updates state, pass gameStats to HUD, pass onCraftComplete to BuildScreen, pass onCoachMessage to BuildScreen

**Checkpoint**: gameStats state flows from page → HUD → BuildScreen.

---

## Phase 3: User Story 1 — Earn Points and Level Up (Priority: P1) 🎯 MVP

**Goal**: Complete craft → points awarded → HUD updates → stats persist

**Independent Test**: Complete all steps → celebration → HUD numbers change → refresh → numbers still there

### Implementation for User Story 1

- [x] T004 [US1] Update `app/components/HUD.tsx`: accept `gameStats: GameStats` prop, replace hardcoded "0" values with `gameStats.itemsRecycled`, `gameStats.level`, `gameStats.points` — keep existing layout and styling
- [x] T005 [US1] Update `app/components/screen2/BuildScreen.tsx`: accept `onCraftComplete: (craft: Craft) => void` and `onCoachMessage: () => void` props, add `hasAwarded` useRef<boolean> (reset to false when craft.id changes), in handleToggleStep: after updating completedSteps, check if new set size equals craft.steps.length AND !hasAwarded.current → if so, set hasAwarded.current = true, call onCraftComplete(craft), show celebration (window.alert or inline message "🎉 Tuyệt vời! Bạn đã hoàn thành {craft.name}! +{points} điểm!")
- [x] T006 [US1] Update `app/components/screen2/CoachChat.tsx`: accept `onCoachMessage: () => void` prop, call onCoachMessage() after each successful coach response (inside the try block after setMessages)

**Checkpoint**: Complete craft → celebration + stats update. Coach messages earn points. HUD live.

---

## Phase 4: User Story 2 — View Stats in Settings (Priority: P2)

**Goal**: Settings panel shows stats summary

**Independent Test**: Open settings → stats section visible → values match HUD

### Implementation for User Story 2

- [x] T007 [US2] Update `app/components/SettingsPanel.tsx`: accept `gameStats: GameStats` prop, add stats display section below LLM provider section — show "📊 Thống Kê" header, then "🏆 Đã hoàn thành: {craftsCompleted} sản phẩm", "♻️ Đã tái chế: {itemsRecycled} vật liệu", "📅 Ngày hoạt động: {activityDates.length} ngày", "💬 Tin nhắn Thợ Cả: {coachMessages}", styled in pixel-box container
- [x] T008 [US2] Update `app/components/HUD.tsx`: pass `gameStats` through to SettingsPanel

**Checkpoint**: Settings shows correct stats matching HUD.

---

## Phase 5: User Story 3 — Floating Particles and Visual Polish (Priority: P2)

**Goal**: Particles floating, hover effects smooth, scrollbars themed

**Independent Test**: Open app → 15 particles drifting up → hover buttons → themed scrollbars

### Implementation for User Story 3

- [x] T009 [US3] Add PixelParticles to `app/layout.tsx`: import and render `<PixelParticles />` inside body, before ThemeProvider children (so particles are behind content)
- [x] T010 [US3] Add Meshy attribution footer to `app/layout.tsx`: below `{children}` inside ThemeProvider, add a `<footer>` with text "Mô hình 3D: Meshy • Phông chữ: VT323" centered, styled with `text-[14px] text-[var(--text-muted)] py-[8px] text-center`

**Checkpoint**: Particles animate. Attribution visible in footer.

---

## Phase 6: User Story 4 — Responsive Fit on 1366x768 (Priority: P1)

**Goal**: Everything fits demo laptop screen without scrolling

**Independent Test**: Resize to 1366x768 → no horizontal scroll → Screen 2 fits viewport

### Implementation for User Story 4

- [x] T011 [US4] Verify and fix responsive layout in `app/globals.css` and components: check Screen 1 at 1366x768 — if inventory grid overflows, reduce to 3 columns at small widths; check Screen 2 3-column layout — if columns are too narrow, adjust minimum column widths; ensure HUD stats don't wrap; ensure suggestion cards grid handles narrow viewport (fall back to 2 columns if needed via responsive grid class)

**Checkpoint**: 1366x768 — no overflow, no scrollbar, all readable.

---

## Phase 7: User Story 5 — Error States Graceful Degradation (Priority: P1)

**Goal**: App never crashes; errors show Vietnamese messages

**Independent Test**: Kill internet → chat error in Vietnamese → matcher still works

### Implementation for User Story 5

- [x] T012 [US5] Audit all error paths in `app/api/chat/route.ts` and `app/api/coach/route.ts`: verify every catch block returns Vietnamese-only messages, no raw Error.message exposed to client, timeout errors return "AI đang bận quá, thử lại sau nhé!", connection errors return "Không thể kết nối AI", generic errors return "Mình đang gặp sự cố, thử lại nhé!"
- [x] T013 [US5] Verify `app/components/screen2/ModelViewer.tsx`: ensure missing GLB files don't crash — model-viewer web component handles missing src gracefully, but add onError handling if needed to switch to placeholder

**Checkpoint**: All error paths tested mentally. No English errors possible.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final wiring, build verification, full demo test

- [x] T014 Wire all remaining props in `app/page.tsx`: ensure gameStats flows to HUD → SettingsPanel, onCraftComplete and onCoachMessage flow to BuildScreen → CoachChat, llmConfig flows everywhere needed
- [x] T015 Run `npm run build` — must compile without errors
- [x] T016 Run `npm run dev` and manually test full quickstart.md checklist: gamification, stats, particles, responsive, errors, Vietnamese text, build

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on T001 (gamification.ts)
- **US1 (Phase 3)**: Depends on Foundation (gameStats in page.tsx)
- **US2 (Phase 4)**: Depends on US1 (gameStats prop flow)
- **US3 (Phase 5)**: Independent — particles + footer only
- **US4 (Phase 6)**: Independent — CSS verification
- **US5 (Phase 7)**: Independent — error audit
- **Polish (Phase 8)**: Depends on all

### Parallel Opportunities

- T001, T002 can run in parallel (different files)
- T004, T005, T006 can all run in parallel after T003 (different components)
- T009, T010 can run in parallel (both modify layout.tsx but different sections)
- T011, T012, T013 can all run in parallel (independent verification tasks)

---

## Implementation Strategy

### MVP First (US1)

1. T001+T002 (parallel) → gamification + particles
2. T003 → wire state
3. T004+T005+T006 (parallel) → HUD + BuildScreen + CoachChat updates
4. **STOP and VALIDATE**: Complete craft → points → HUD updates → persists
5. Then US2–US5 + Polish

### Recommended Execution Order

1. T001+T002 (parallel)
2. T003
3. T004+T005+T006 (parallel)
4. T007 → T008
5. T009+T010 (parallel)
6. T011+T012+T013 (parallel)
7. T014 → T015 → T016

---

## Notes

- [P] tasks = different files, no dependencies
- Completion detection uses hasAwarded ref to prevent double-awarding
- 3D model GLB files are NOT part of this coding task — placeholder works
- All gamification is localStorage-only, no backend
- Particles use CSS-only animation (GPU-accelerated)
