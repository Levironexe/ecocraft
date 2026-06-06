# Feature Specification: Day 4 — Gamification + Settings + Polish

**Feature Branch**: `004-day4-gamification-polish`
**Created**: 2026-06-06
**Status**: Draft
**Input**: EcoCraft AI Dev Plan — Day 4 scope

## User Scenarios & Testing

### User Story 1 — Earn Points and Level Up (Priority: P1)

The child completes a craft by marking all steps as done. The app awards points,
increments their recycling counter, levels them up, and shows a celebration
message. Stats update live in the HUD bar. Using the coach chat also earns
points. Progress persists across sessions.

**Why this priority**: Gamification is the engagement hook — makes children
want to return and build more. Required for the 2-week usage period data.

**Independent Test**: Complete all steps of a craft → celebration message → HUD
stats update (crafts +1, items recycled +N, points +50+steps×10) → refresh page
→ stats still there → level up when crossing threshold.

**Acceptance Scenarios**:

1. **Given** the child marks all steps as done, **When** the last step is toggled,
   **Then** a celebration message appears and stats update: craftsCompleted +1,
   itemsRecycled + sum of craft materials, points + 50 + (steps × 10).
2. **Given** the child sends a coach message, **When** the response arrives,
   **Then** coachMessages +1 and points +5.
3. **Given** points cross a level threshold, **When** stats recalculate, **Then**
   the level in the HUD updates (L1: 0-99, L2: 100-249, L3: 250-499, L4: 500-999,
   L5: 1000+).
4. **Given** stats have been earned, **When** the page is refreshed or reopened,
   **Then** all stats persist from local storage.
5. **Given** the child uses the app on a new day, **When** any action is recorded,
   **Then** today's date is added to activity dates (no duplicates).

---

### User Story 2 — View Stats in Settings (Priority: P2)

The settings panel shows a stats summary: total crafts completed, total items
recycled, and number of active days. This gives the child a sense of
accomplishment and provides data for the interview demo.

**Why this priority**: Stats display supports interview narrative but is not
interactive — lower priority than earning points.

**Independent Test**: Open settings → stats section shows correct counts →
matches HUD values.

**Acceptance Scenarios**:

1. **Given** the child has completed 3 crafts, **When** settings opens, **Then**
   "Đã hoàn thành: 3 sản phẩm" is displayed.
2. **Given** 15 items have been recycled, **When** settings opens, **Then**
   "Đã tái chế: 15 vật liệu" is displayed.
3. **Given** the child has used the app on 5 different days, **When** settings
   opens, **Then** "Ngày hoạt động: 5 ngày" is displayed.

---

### User Story 3 — See Floating Pixel Particles and Visual Polish (Priority: P2)

The app has floating pixel particles, smooth hover effects, themed scrollbars,
and polished animations matching the demo aesthetic. The visual experience
feels like a retro game — not a generic web app.

**Why this priority**: Polish differentiates the app at the interview booth.
Functional without it, but less impressive.

**Independent Test**: Open app → floating colored particles drift upward →
hover over buttons → pixel-art hover effect → scrollbars are thin and themed →
scanline overlay visible → leaf bobs in HUD.

**Acceptance Scenarios**:

1. **Given** the app is loaded, **When** rendered, **Then** 15 floating pixel
   particles animate upward at different speeds with theme-derived colors.
2. **Given** any interactive element, **When** hovered, **Then** a visible
   hover effect (scale, color shift, or shadow change) occurs within 150ms.
3. **Given** any scrollable area, **When** a scrollbar appears, **Then** it
   uses thin themed styling (not browser default).
4. **Given** the HUD logo, **When** rendered, **Then** the leaf icon has a
   gentle bobbing animation.

---

### User Story 4 — App Works on Demo Laptop Screen (Priority: P1)

The app must fit a 1366x768 laptop screen without horizontal scrolling. Screen 2
fits within the viewport. The inventory grid doesn't overflow. All text is
readable at the pixel-art font size.

**Why this priority**: The interview demo runs on a laptop. If it doesn't fit,
the demo fails.

**Independent Test**: Open app at 1366x768 → no horizontal scroll → Screen 2
3-column layout fits viewport → inventory grid visible without overflow →
all text readable.

**Acceptance Scenarios**:

1. **Given** a 1366x768 viewport, **When** Screen 1 loads, **Then** the full
   layout (HUD + tabs + 2-column grid + suggestions) fits without horizontal
   scrolling.
2. **Given** a 1366x768 viewport, **When** Screen 2 loads, **Then** the 3-column
   layout fits within the viewport height without outer scrollbar.
3. **Given** the inventory grid, **When** all 12 materials display, **Then**
   the 4-column grid fits within the left panel without horizontal overflow.

---

### User Story 5 — Error States Don't Break the App (Priority: P1)

When things go wrong (no internet, no AI, missing 3D model files), the app
degrades gracefully. Deterministic features always work. Error messages are
in Vietnamese. No crashes, no English error text.

**Why this priority**: The demo must not crash at the interview. Graceful
degradation is non-negotiable.

**Independent Test**: Kill internet → chat shows Vietnamese error → matcher
still works → 3D model missing → placeholder shows → all buttons still work.

**Acceptance Scenarios**:

1. **Given** the AI service is unavailable, **When** the child uses chat, **Then**
   a Vietnamese error message appears in the chat and all non-AI features
   (inventory, matcher, steps) continue working.
2. **Given** a 3D model file is missing, **When** Screen 2 loads, **Then** the
   text placeholder shows instead of a broken viewer.
3. **Given** no internet and no local AI, **When** any action is attempted,
   **Then** "Không có kết nối AI" message appears but deterministic features work.
4. **Given** the selected items bag is empty, **When** "Chế Tạo Ngay!" button
   renders, **Then** it is disabled with a visual hint.

---

### Edge Cases

- What if localStorage is full? → Stats save silently fails; app doesn't crash.
- What if the user completes a craft, then unchecks steps? → Completion is
  already recorded; un-checking doesn't undo the award.
- What if the same craft is completed twice? → Points awarded again (each
  completion counts).
- What if a particle animation causes performance issues on slow hardware? →
  Use CSS animations only (GPU-accelerated), limit to 15 particles.
- What if the user resizes the window mid-session? → Layout adapts via CSS
  units (dvh, %, grid); no JS resize handler needed.

## Requirements

### Functional Requirements

- **FR-001**: System MUST track crafts completed, items recycled, coach messages,
  points, level, and activity dates in persistent local storage.
- **FR-002**: System MUST award 50 points + 10 per step when all steps are marked
  done, plus increment craftsCompleted and itemsRecycled.
- **FR-003**: System MUST award 5 points per coach message sent.
- **FR-004**: System MUST calculate level from points: L1 (0-99), L2 (100-249),
  L3 (250-499), L4 (500-999), L5 (1000+).
- **FR-005**: System MUST display a celebration message when a craft is completed.
- **FR-006**: System MUST display live stats in the HUD: items recycled, level,
  points.
- **FR-007**: System MUST display stats summary (crafts, items, active days) in
  the settings panel.
- **FR-008**: System MUST render 15 floating pixel particles with theme-derived
  colors and staggered upward animations.
- **FR-009**: System MUST apply hover effects to all interactive elements.
- **FR-010**: System MUST style scrollbars with thin themed appearance.
- **FR-011**: System MUST fit all layouts within 1366x768 without horizontal
  scrolling.
- **FR-012**: System MUST show Vietnamese error messages for all error states.
- **FR-013**: System MUST keep deterministic features (inventory, matcher, steps)
  working when AI is unavailable.
- **FR-014**: System MUST show text placeholder when 3D model files are missing.
- **FR-015**: System MUST add Meshy attribution in the app footer for 3D models.

### Key Entities

- **GameStats**: Persistent stats object in localStorage. Tracks crafts completed,
  items recycled, coach messages, points, level, activity dates.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Points and level update within 500ms of completing a craft or
  sending a coach message.
- **SC-002**: Stats persist across page reloads — zero data loss on refresh.
- **SC-003**: All layouts fit 1366x768 with zero horizontal scrolling.
- **SC-004**: All error states show Vietnamese messages — zero English error text.
- **SC-005**: Floating particles animate at 60fps with no visible jank on a
  standard laptop.
- **SC-006**: The complete demo flow (from dev plan demo script) can be performed
  in under 7 minutes without any crashes or broken UI.

## Assumptions

- 3D model GLB files are NOT generated as part of this coding task — they require
  physical craft building + Meshy upload. This spec covers the code to load and
  display them. Placeholder images or cubes are acceptable until real GLBs are ready.
- Gamification stats are intentionally simple — no leaderboards, no badges, no
  social features. Just points, levels, and counters.
- Completion is one-way: once all steps are marked done, the reward is given.
  Un-checking steps afterward doesn't revoke points.
- The polish pass covers CSS animations only — no JavaScript animation libraries.
- Meshy attribution is a simple text line in the footer, not a logo.
- The app already has most visual polish from prior days (scanlines, leaf bob,
  step pulse). Day 4 adds particles and ensures consistency.
