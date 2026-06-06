# Feature Specification: Day 1 — Foundation + Data Layer + Screen 1 Static UI

**Feature Branch**: `001-day1-foundation-ui`
**Created**: 2026-06-06
**Status**: Draft
**Input**: EcoCraft AI Dev Plan — Day 1 scope

## User Scenarios & Testing

### User Story 1 — Browse Recyclable Materials (Priority: P1)

A child opens EcoCraft AI and sees a grid of recyclable materials (plastic bottles,
straws, newspaper, cans, etc.) displayed as colorful emoji cards. They can scroll
through the grid, search by name, and tap any material to see its details.

**Why this priority**: Material browsing is the entry point for the entire app.
Without it, nothing downstream (preview, selection, suggestions) can function.

**Independent Test**: Open app → 12+ material cards visible in 4-column grid →
type "chai" in search → only matching materials shown → click a card → preview
panel updates with material details.

**Acceptance Scenarios**:

1. **Given** the app is loaded, **When** the user views Screen 1, **Then** all 12+
   materials display in a 4-column scrollable grid with emoji, name visible.
2. **Given** the user types "ống" in the search bar, **When** the filter runs,
   **Then** only materials containing "ống" (diacritics-insensitive) are shown.
3. **Given** the user clicks a material card, **When** the preview updates, **Then**
   the right panel shows the material's emoji (large), name, size dropdown, and
   quantity control.

---

### User Story 2 — Select Materials and Build a Bag (Priority: P1)

After previewing a material, the child picks a size from the dropdown, adjusts
quantity, and taps "Thêm vào túi" to add it to their selected items bag. They
can see all selected items, remove any, and adjust quantities.

**Why this priority**: The selection bag is the core data structure that feeds
the craft matcher and AI suggestions. Co-equal with browsing.

**Independent Test**: Select "Chai nhựa" → pick "Vừa (500ml)" → set qty 2 →
tap "Thêm vào túi" → item appears in "Đã Chọn" list → tap ✕ to remove → item
gone.

**Acceptance Scenarios**:

1. **Given** a material is previewed, **When** the user selects a size and taps
   "Thêm vào túi", **Then** the item appears in the "Đã Chọn" list with correct
   emoji, name, size, and quantity badge.
2. **Given** 3 items are in the bag, **When** the user taps ✕ on one, **Then**
   that item is removed and the list updates immediately.
3. **Given** items are in the bag, **When** the user taps "Chế Tạo Ngay!", **Then**
   the app switches to Screen 2 (tab changes to "Xưởng Chế Tạo").

---

### User Story 3 — Switch Themes (Priority: P2)

The child opens settings and picks from 4 pixel-art color themes. The entire app
recolors instantly. On next visit, the chosen theme persists.

**Why this priority**: Theming is foundational infrastructure (CSS variables) that
all other components depend on for styling. Must be built early but is not
user-facing critical path.

**Independent Test**: Open settings → click "Nhiệt Đới" theme swatch → all colors
change → refresh page → same theme still active.

**Acceptance Scenarios**:

1. **Given** the app is loaded, **When** no theme has been set, **Then** the
   default "Trời Xanh" (sky-coral) theme applies.
2. **Given** the user selects a different theme, **When** the selection is made,
   **Then** all CSS custom properties update instantly — no page reload needed.
3. **Given** a theme was selected previously, **When** the app is reopened, **Then**
   the saved theme loads from localStorage immediately (no flash of default).

---

### User Story 4 — View HUD and Stats Bar (Priority: P2)

The child sees a top bar with the EcoCraft AI logo, recycling stats (items
recycled, level, points), and a gear icon for settings. Stats are hardcoded
for Day 1 but the layout is final.

**Why this priority**: HUD is the persistent navigation frame. Visual only for
now; functional stats come Day 4.

**Independent Test**: Open app → HUD visible at top → logo, stats counters,
gear icon all rendered → gear icon is clickable (no action yet).

**Acceptance Scenarios**:

1. **Given** the app loads, **When** the HUD renders, **Then** it shows logo
   (leaf + "EcoCraft AI"), stats (♻️ Đã tái chế: 0, ⭐ Cấp độ: 1, 🏆 Điểm: 0),
   and gear icon.
2. **Given** any theme is active, **When** the HUD renders, **Then** it uses
   the theme's HUD gradient colors and border.

---

### User Story 5 — Navigate Between Screens via Tabs (Priority: P2)

Two tabs ("🎒 Chọn Vật Liệu" and "🔨 Xưởng Chế Tạo") let the child switch
between Screen 1 (material selection) and Screen 2 (build workshop). Only
Screen 1 content exists on Day 1.

**Why this priority**: Tab infrastructure needed for navigation, but Screen 2
is Day 2 work.

**Independent Test**: Click "🔨 Xưởng Chế Tạo" tab → tab highlights → empty
Screen 2 placeholder shown → click "🎒 Chọn Vật Liệu" → back to Screen 1.

**Acceptance Scenarios**:

1. **Given** the app loads, **When** tabs render, **Then** Screen 1 tab is active
   by default with visual indicator (underline/highlight).
2. **Given** Screen 1 is active, **When** the user clicks Screen 2 tab, **Then**
   the active tab switches and Screen 2 content area shows.

---

### Edge Cases

- What happens when the user adds the same material twice with different sizes?
  → Both entries appear separately in the bag (size distinguishes them).
- What happens when the user adds the same material + same size again?
  → Quantity increments on existing entry, no duplicate.
- What happens when search yields no results?
  → Empty grid with message "Không tìm thấy vật liệu nào."
- What happens when quantity is reduced to 0?
  → Item is removed from the bag automatically.
- What happens on a very small screen (1366x768)?
  → Layout must fit without horizontal scrolling; grid may reduce to 3 columns.

## Requirements

### Functional Requirements

- **FR-001**: System MUST display all 12+ recyclable materials in a 4-column
  scrollable grid with emoji and Vietnamese name.
- **FR-002**: System MUST provide a search bar that filters materials by name,
  supporting Vietnamese diacritics-insensitive matching.
- **FR-003**: System MUST show a preview panel with large emoji, material name,
  size dropdown (populated from material's sizeOptions), and quantity control.
- **FR-004**: System MUST maintain a "Đã Chọn" (selected items) list showing
  all added materials with emoji, name, size, quantity badge, and remove button.
- **FR-005**: System MUST provide a "Chế Tạo Ngay!" button that switches to
  Screen 2 tab.
- **FR-006**: System MUST support 4 theme palettes (sky-coral, teal-peach,
  indigo-mint, brown-orange) switchable without page reload.
- **FR-007**: System MUST persist selected theme to localStorage and restore
  on app load without flash of default.
- **FR-008**: System MUST render a HUD bar with logo, stats counters, and
  settings gear icon.
- **FR-009**: System MUST render tab navigation between Screen 1 and Screen 2.
- **FR-010**: System MUST render all UI text in Vietnamese using VT323 font
  with correct diacritics.
- **FR-011**: System MUST define TypeScript interfaces for Material, Craft,
  CraftStep, SelectedItem, ChatMessage, Theme, and GameStats.
- **FR-012**: System MUST contain a complete material data library (12+ items)
  with id, name, emoji, sizeOptions, and category.
- **FR-013**: System MUST contain a complete craft data library (8 crafts) with
  full Vietnamese step instructions.
- **FR-014**: System MUST provide reusable pixel-art styled UI components
  (PixelBox, PixelButton, QuantityControl).

### Key Entities

- **Material**: Recyclable item with id, name, emoji, size options, category.
  Core building block of the entire app.
- **Craft**: A buildable project with materials list, tools, steps, difficulty,
  optional 3D model path. Referenced by matcher and AI.
- **SelectedItem**: A material chosen by the user with specific size and quantity.
  Ephemeral, lives in React state.
- **Theme**: Color palette with 16+ CSS custom properties. Persisted in localStorage.

## Success Criteria

### Measurable Outcomes

- **SC-001**: User can browse all 12+ materials and add items to bag within 30
  seconds of first opening the app.
- **SC-002**: Search filters materials within 100ms of typing, with correct
  Vietnamese diacritics handling.
- **SC-003**: Theme switches apply visually within 200ms with no page reload.
- **SC-004**: All Vietnamese text renders correctly — no missing diacritics,
  no English text visible in any UI surface.
- **SC-005**: Page loads and is interactive within 3 seconds on a standard laptop.
- **SC-006**: Layout fits a 1366x768 screen without horizontal scrolling.

## Assumptions

- VT323 font supports all required Vietnamese diacritics (verified per dev plan).
- Material and craft data will be hardcoded in TypeScript files, not fetched from
  an API or database.
- GameStats in the HUD are hardcoded to defaults (0 crafts, level 1, 0 points)
  for Day 1; live data comes Day 4.
- Screen 2 content is a placeholder on Day 1 — only the tab switching mechanism
  is required.
- The app targets desktop browsers (Chrome, Edge) on laptops. Mobile responsive
  is not required for Day 1.
- The "Chế Tạo Ngay!" button switches tabs but does not trigger craft matching
  (matcher is Day 2).
