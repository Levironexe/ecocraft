# Tasks: Day 2 — Screen 2 Build Workshop + Matcher + Suggestions

**Input**: Design documents from `specs/002-day2-screen2-matcher/`
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

**Purpose**: Install dependencies, create directory structure, add shared types

- [x] T001 Install `@google/model-viewer` dependency: run `npm install @google/model-viewer`
- [x] T002 Create `app/components/screen2/` directory for Screen 2 components
- [x] T003 [P] Add `MatchResult` interface to `app/lib/types.ts`: `{ craft: Craft, matchPercent: number, matchedMaterials: string[], missingMaterials: string[] }`
- [x] T004 [P] Create `model-viewer.d.ts` in project root declaring the `model-viewer` custom element for JSX/TypeScript compatibility with props: `src`, `auto-rotate`, `camera-controls`, `shadow-intensity`, `style`

**Checkpoint**: Dependencies installed. Types defined. `npm run build` passes.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Deterministic matcher — all user stories depend on this for data flow

**⚠️ CRITICAL**: Matcher must be complete before suggestion cards or Screen 2 wiring

- [x] T005 Build `app/lib/matcher.ts`: export `matchCrafts(selected: SelectedItem[], allCrafts: Craft[]): MatchResult[]` — for each craft, compute set intersection of `craft.materials[].materialId` vs `selected[].materialId` (presence only, ignore quantity), calculate `matchPercent = matched / total × 100`, filter >= 40%, sort descending by matchPercent, return array. Handle edge cases: empty selected → return [], craft with 0 materials → skip

**Checkpoint**: Matcher function works. `matchCrafts([{materialId: 'chai-nhua',...}, {materialId: 'ong-hut',...}, {materialId: 'nap-chai',...}], crafts)` returns Tên Lửa at 100%.

---

## Phase 3: User Story 1 — View Build Workshop with Craft Details (Priority: P1) 🎯 MVP

**Goal**: Screen 2 shows 3-column layout with model viewer, materials bar

**Independent Test**: Navigate to Screen 2 with craft → 3-column fills viewport → materials bar shows chips → model viewer shows placeholder

### Implementation for User Story 1

- [x] T006 [P] [US1] Build `app/components/screen2/MaterialsBar.tsx`: full-width top bar showing craft name, difficulty (1-3 star emojis ⭐), `{timeMinutes} phút`, `{ageMin}+ tuổi`, material chips with primary border (emoji + name from materials library lookup), tool chips with accent border (tool name strings), `'use client'` directive
- [x] T007 [P] [US1] Build `app/components/screen2/ModelViewer.tsx`: if `craft.modelPath` exists → render `<model-viewer>` web component with `src={craft.modelPath}`, `auto-rotate`, `camera-controls`, `shadow-intensity="1"`, full width/height; if `craft.modelPath` is null → render centered placeholder text "📝 Gợi ý từ AI — không có mô hình 3D" in a PixelBox; import model-viewer script via `useEffect` or Script component, `'use client'` directive
- [x] T008 [US1] Build `app/components/screen2/BuildScreen.tsx`: Screen 2 container receiving `craft: Craft` and `selectedItems: SelectedItem[]` as props, CSS Grid 3-column layout (`55% 22.5% 22.5%`), height `calc(100dvh - 90px)` (below HUD + tabs), overflow hidden on outer container, renders MaterialsBar at top spanning all columns, then ModelViewer (col 1), StepsList placeholder (col 2), CoachChat placeholder (col 3), `'use client'` directive

**Checkpoint**: Screen 2 renders with 3-column layout, materials bar, and model viewer/placeholder

---

## Phase 4: User Story 2 — Follow Build Steps (Priority: P1)

**Goal**: Interactive step tracker with done/current/pending states and toggle

**Independent Test**: See steps → current pulses → click step 1 → done with checkmark → step 2 pulses → click step 1 again → undone

### Implementation for User Story 2

- [x] T009 [US2] Build `app/components/screen2/StepsList.tsx`: scrollable middle column receiving `steps: CraftStep[]` and `completedSteps: Set<number>` and `onToggleStep: (stepNumber: number) => void`, compute current step as lowest number not in completedSteps, render each step with three visual states — done: dimmed opacity + green "✓" + strikethrough text, current: `step-current` CSS class (orange pulse animation from globals.css), pending: default grey — each step shows number badge, title, detail text, optional tip with 💡 icon, click anywhere on step calls `onToggleStep(step.number)`, `'use client'` directive

**Checkpoint**: Steps render with correct states. Click toggles done/undone. Current step auto-advances.

---

## Phase 5: User Story 3 — Craft Suggestions from Matcher (Priority: P1)

**Goal**: Suggestion cards appear on Screen 1 based on selected materials, clicking loads Screen 2

**Independent Test**: Add chai-nhua + ong-hut + nap-chai → Tên Lửa 100% card appears → click → Screen 2 loads

### Implementation for User Story 3

- [x] T010 [US3] Build `app/components/screen1/SuggestionCards.tsx`: full-width section below Screen 1 content (outside the 2-column grid), receives `suggestions: MatchResult[]` and `onSelectCraft: (craft: Craft) => void`, if empty → show "Thêm vật liệu để xem gợi ý!" message, else → 3-column grid of PixelBox cards, each card shows: craft emoji (large), craft name, match % badge (colored: green >=80%, yellow >=60%, orange >=40%), description text, tag "🎮 Có 3D" if modelPath exists or "📝 Chỉ hướng dẫn" if null, click calls `onSelectCraft(craft)`, `'use client'` directive
- [x] T011 [US3] Wire matcher + suggestions + Screen 2 into `app/page.tsx`: add state `selectedCraft: Craft | null`, `completedSteps: Set<number>`, `suggestions: MatchResult[]`; add `useMemo` or `useEffect` to run `matchCrafts(selectedItems, crafts)` whenever selectedItems changes and take top 3; add handler `handleSelectCraft` that sets selectedCraft + resets completedSteps + switches to Screen 2; add handler `handleToggleStep`; update "Chế Tạo Ngay!" to use first suggestion or first showcase craft; render SuggestionCards below MaterialScreen; render BuildScreen when activeScreen === 2 with selectedCraft

**Checkpoint**: Full flow works — add materials → suggestions appear → click → Screen 2 with craft

---

## Phase 6: User Story 4 — Coach Chat Interface (Priority: P2)

**Goal**: Static chat panel with NPC header, mock messages, non-functional input

**Independent Test**: Screen 2 → coach panel visible → NPC header → mock messages → input bar present

### Implementation for User Story 4

- [x] T012 [US4] Build `app/components/screen2/CoachChat.tsx`: right column panel receiving `craftName: string` and `currentStep: number`, NPC header with avatar (🔧 emoji in styled box), "Thợ Cả" name, "Đang hỗ trợ" status text, scrollable message list with 2-3 hardcoded mock messages (bot messages: left-aligned white bubble with green-left border, user messages: right-aligned accent-colored bubble), input bar at bottom with text input + "Gửi" send button (both non-functional / disabled for Day 2), auto-scroll to bottom of messages, `'use client'` directive

**Checkpoint**: Coach chat renders in right column with styled mock messages

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final assembly, update BuildScreen placeholders, adjust Screen 1 layout, build verification

- [x] T013 Update `app/components/screen2/BuildScreen.tsx`: replace placeholder columns with actual StepsList and CoachChat components, pass `completedSteps`, `onToggleStep`, `craftName`, `currentStep` props, add completedSteps state management within BuildScreen or receive from page
- [x] T014 [P] Adjust `app/components/screen1/MaterialScreen.tsx`: change height from `calc(100dvh - 90px)` to `auto` or reduce to make room for SuggestionCards below, ensure suggestions section is visible without excessive scrolling
- [x] T015 Run `npm run build` — must compile without errors
- [x] T016 Run `npm run dev` and manually test full quickstart.md checklist: matcher accuracy, suggestion cards, Screen 2 layout, step tracking, coach chat, full flow

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on T003 (MatchResult type) from Setup
- **User Stories (Phase 3+)**: All depend on Foundational (matcher)
  - US1 and US2 can proceed in parallel (different components)
  - US3 depends on US1 (needs BuildScreen to exist for navigation)
  - US4 is independent of US1/US2/US3
- **Polish (Phase 7)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: Depends on Foundation only — builds Screen 2 shell
- **US2 (P1)**: Depends on Foundation only — builds StepsList (independent of US1)
- **US3 (P1)**: Depends on US1 (BuildScreen must exist to navigate to) + Foundation (matcher)
- **US4 (P2)**: Depends on Foundation only — builds CoachChat independently

### Parallel Opportunities

- T003, T004 can run in parallel (different files)
- T006, T007 can run in parallel (independent Screen 2 components)
- T009, T012 can run in parallel (StepsList vs CoachChat — different files, no deps)
- T014 can run in parallel with T013

---

## Implementation Strategy

### MVP First (US1 + US3)

1. Setup + Foundation → matcher ready
2. US1 → Screen 2 shell with model viewer + materials bar
3. US3 → Suggestion cards + full wiring
4. **STOP and VALIDATE**: Materials → suggestions → Screen 2 flow works
5. Then US2 + US4 → step tracker + coach chat

### Recommended Execution Order

Single developer:
1. T001 → T002 → T003+T004 (parallel)
2. T005 (matcher)
3. T006+T007 (parallel) → T008
4. T009+T012 (parallel)
5. T010 → T011
6. T013 → T014 (parallel with T013) → T015 → T016

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Coach chat is static — AI integration is Day 3
- model-viewer may need dynamic import for SSR compatibility
- GLB files don't exist yet — placeholder will show for all crafts on Day 2
