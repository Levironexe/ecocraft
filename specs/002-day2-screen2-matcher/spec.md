# Feature Specification: Day 2 — Screen 2 Build Workshop + Deterministic Matcher + Suggestions

**Feature Branch**: `002-day2-screen2-matcher`
**Created**: 2026-06-06
**Status**: Draft
**Input**: EcoCraft AI Dev Plan — Day 2 scope

## User Scenarios & Testing

### User Story 1 — View Build Workshop with Craft Details (Priority: P1)

After selecting a craft suggestion, the child lands on Screen 2 and sees a
3-column workshop view: a large 3D model viewer (or placeholder) on the left,
step-by-step instructions in the middle, and a coach chat panel on the right.
A top bar shows required materials and tools.

**Why this priority**: Screen 2 is the core build experience — the reason the
app exists. Without it, selected materials lead nowhere.

**Independent Test**: Navigate to Screen 2 with a craft loaded → 3-column
layout fills viewport → materials bar shows required items and tools → 3D
viewer shows placeholder → steps list displays all craft steps → coach chat
shows mock messages.

**Acceptance Scenarios**:

1. **Given** a craft is selected, **When** Screen 2 loads, **Then** a 3-column
   layout (55% / 22.5% / 22.5%) fills the viewport with no outer scrolling.
2. **Given** Screen 2 is active, **When** the materials bar renders, **Then**
   it shows craft name, difficulty stars, time estimate, age range, material
   chips (styled differently from tool chips).
3. **Given** a craft has a 3D model path, **When** the model viewer renders,
   **Then** it shows an interactive 3D viewer with auto-rotate and camera controls.
4. **Given** a craft has no 3D model, **When** the viewer renders, **Then** it
   shows a placeholder message "📝 Gợi ý từ AI — không có mô hình 3D".

---

### User Story 2 — Follow Build Steps (Priority: P1)

The child follows step-by-step craft instructions. Each step has a number,
title, details, and optional safety tip. Clicking a step marks it done. The
current step (lowest incomplete) gets a pulsing highlight. Completed steps
show a strikethrough with green checkmark.

**Why this priority**: Step tracking is the interactive core of the build
experience — the child's primary activity during crafting.

**Independent Test**: See 5 steps listed → current step pulses → click step 1
→ it dims with checkmark + strikethrough → step 2 now pulses → click step 2
again → it undoes (back to current).

**Acceptance Scenarios**:

1. **Given** steps are loaded, **When** displayed, **Then** each step shows
   number, title, detail text, and tip icon (💡) if tip exists.
2. **Given** step 1 is incomplete, **When** rendered, **Then** step 1 has an
   orange pulsing border (current step indicator).
3. **Given** the child clicks a pending step, **When** toggled, **Then** it
   changes to done state (dimmed, green checkmark, strikethrough text).
4. **Given** step 1 is done and step 2 is pending, **When** rendered, **Then**
   step 2 becomes the current step with pulsing highlight.
5. **Given** a done step is clicked again, **When** toggled, **Then** it reverts
   to pending state.

---

### User Story 3 — See Craft Suggestions Based on Selected Materials (Priority: P1)

After adding materials to their bag on Screen 1, the child sees suggestion
cards appear at the bottom showing which crafts they can build. Each card
shows a match percentage, craft name, emoji, description, and whether it has
a 3D model. Clicking a suggestion loads that craft in Screen 2.

**Why this priority**: The matcher is the bridge between material selection
and the build workshop — the core app loop.

**Independent Test**: Add "Chai nhựa", "Ống hút", "Nắp chai" to bag →
suggestion cards appear → "Tên Lửa Tái Chế" shows 100% match → click card →
Screen 2 loads with that craft.

**Acceptance Scenarios**:

1. **Given** the child selects materials matching a craft, **When** suggestions
   update, **Then** matching crafts appear sorted by match percentage (highest
   first), showing only crafts with >= 40% match.
2. **Given** a suggestion card is displayed, **When** rendered, **Then** it shows
   emoji, craft name, match %, short description, and a tag indicating 3D model
   availability ("🎮 Có 3D" or "📝 Chỉ hướng dẫn").
3. **Given** the child clicks a suggestion card, **When** the craft loads, **Then**
   Screen 2 activates with that craft's details, steps, and 3D viewer.
4. **Given** no materials are selected, **When** suggestions render, **Then** a
   message "Thêm vật liệu để xem gợi ý!" is shown instead of cards.
5. **Given** materials are selected but no craft matches >= 40%, **When**
   suggestions render, **Then** the same empty message is shown.

---

### User Story 4 — View Coach Chat Interface (Priority: P2)

On Screen 2, the child sees a "Thợ Cả AI" chat panel with mock messages. The
interface has an NPC header, message bubbles, and an input bar. On Day 2 the
chat is static — no AI responses yet.

**Why this priority**: UI structure needed now; AI wiring comes Day 3. Lower
priority because non-interactive on Day 2.

**Independent Test**: Screen 2 loads → coach chat panel visible on right →
NPC header shows "Thợ Cả" avatar and name → mock messages displayed → input
bar and send button visible (non-functional).

**Acceptance Scenarios**:

1. **Given** Screen 2 is active, **When** the coach panel renders, **Then** it
   shows an NPC header with avatar, "Thợ Cả" name, and status indicator.
2. **Given** mock messages exist, **When** displayed, **Then** bot messages are
   left-aligned white bubbles and user messages are right-aligned colored bubbles.
3. **Given** the chat panel is rendered, **When** the input area shows, **Then**
   it has a text input and send button (disabled or non-functional on Day 2).

---

### Edge Cases

- What happens when a craft has only 2 steps? → Steps list works normally,
  just shorter. Current step logic still applies.
- What happens when all steps are marked done? → No step has pulsing border.
  All are dimmed with checkmarks.
- What happens when the 3D model file doesn't exist at the given path? →
  Show the text placeholder instead of a broken viewer.
- What happens when two crafts have the same match percentage? → Sort is
  stable; order among equal matches is by array position (first defined wins).
- What happens on a 1366x768 screen? → 3-column layout must fit without
  scrolling. Columns may need minimum widths adjusted.
- What happens when the child navigates back to Screen 1 from Screen 2? →
  Selected items and suggestions persist; craft state resets.

## Requirements

### Functional Requirements

- **FR-001**: System MUST display Screen 2 as a 3-column layout (55% / 22.5% /
  22.5%) that fills the viewport height with no outer scrolling.
- **FR-002**: System MUST show a materials bar at the top of Screen 2 with
  craft name, difficulty rating (1–3 stars), estimated time, minimum age, and
  chips for required materials and tools.
- **FR-003**: System MUST render an interactive 3D viewer for crafts with a
  model file, supporting auto-rotate and camera controls.
- **FR-004**: System MUST show a text placeholder for crafts without a 3D model.
- **FR-005**: System MUST display craft steps with three visual states: current
  (pulsing orange border), done (dimmed, green checkmark, strikethrough), and
  pending (default grey).
- **FR-006**: System MUST allow clicking steps to toggle between done and
  pending states.
- **FR-007**: System MUST identify the current step as the lowest-numbered
  incomplete step.
- **FR-008**: System MUST show optional tips (💡) on steps that have them.
- **FR-009**: System MUST display a coach chat panel with NPC header, message
  bubbles (bot left-aligned, user right-aligned), and input bar.
- **FR-010**: System MUST compute craft-material match percentages by counting
  how many of a craft's required material IDs are present in the selected items
  (ignoring quantity, presence-only).
- **FR-011**: System MUST display suggestion cards for all crafts with match
  percentage >= 40%, sorted by match percentage descending.
- **FR-012**: System MUST show each suggestion card with emoji, name, match %,
  description, and 3D availability tag.
- **FR-013**: System MUST allow clicking a suggestion card to load that craft
  into Screen 2 and switch to the workshop tab.
- **FR-014**: System MUST show "Thêm vật liệu để xem gợi ý!" when no crafts
  match or no materials are selected.
- **FR-015**: System MUST recalculate suggestions whenever the selected items
  list changes.
- **FR-016**: System MUST limit displayed suggestions to the top 3 matches.

### Key Entities

- **MatchResult**: Computed match between selected materials and a craft.
  Contains craft reference, match percentage, matched material IDs, and missing
  material IDs. Ephemeral — computed on every selection change.
- **CompletedSteps**: Set of step numbers the child has marked as done.
  Ephemeral — lives in React state, resets when navigating away.

## Success Criteria

### Measurable Outcomes

- **SC-001**: User can select materials on Screen 1 and see relevant craft
  suggestions within 200ms of the selection change.
- **SC-002**: Clicking a suggestion card transitions to Screen 2 with full
  craft details in under 300ms.
- **SC-003**: All craft steps can be toggled (done/undone) with immediate
  visual feedback — no perceptible delay.
- **SC-004**: 3-column layout fits a 1366x768 screen without horizontal
  scrolling or vertical scrollbar on the outer container.
- **SC-005**: 100% match accuracy: selecting the exact materials for a craft
  always produces a 100% match result.
- **SC-006**: All Vietnamese text in Screen 2 renders correctly with proper
  diacritics.

## Assumptions

- 3D model files (GLB) do not exist yet — the 3D viewer will show placeholder
  or spinning cube until Day 4 when physical crafts are photographed and
  converted via Meshy.
- Coach chat is static on Day 2. Mock messages are hardcoded. AI integration
  comes Day 3.
- The matcher ignores material quantities — only checks presence of material
  IDs.
- "Chế Tạo Ngay!" button from Day 1 now loads the first matched craft (if
  any) or defaults to the first showcase craft.
- Completed steps state does not persist across tab switches — resets when
  navigating back to Screen 1.
- Suggestion cards appear below the Screen 1 main content area, not inside
  the two-column grid.
