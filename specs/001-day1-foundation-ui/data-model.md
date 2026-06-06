# Data Model: Day 1 — Foundation + Data Layer + Screen 1 Static UI

**Date**: 2026-06-06
**Feature**: 001-day1-foundation-ui

## Entities

### Material
Represents a recyclable item that children can select.

| Field | Type | Description |
|-------|------|-------------|
| id | string | Kebab-case unique identifier (e.g., `'chai-nhua'`) |
| name | string | Vietnamese display name (e.g., `'Chai nhựa'`) |
| emoji | string | Single emoji for visual representation |
| sizeOptions | string[] | Available size variants for this material |
| category | enum | One of: `plastic`, `paper`, `metal`, `fabric`, `wood`, `glass`, `other` |

**Constraints**: id must be unique. sizeOptions must have at least 1 entry.
**Count**: 12+ materials defined in initial library.

### Craft
Represents a buildable project with materials, tools, and step-by-step instructions.

| Field | Type | Description |
|-------|------|-------------|
| id | string | Kebab-case unique identifier |
| name | string | Vietnamese display name |
| emoji | string | Single emoji |
| description | string | Short Vietnamese description (1-2 sentences) |
| difficulty | 1 \| 2 \| 3 | Star difficulty rating |
| ageMin | number | Minimum recommended age |
| timeMinutes | number | Estimated build time |
| materials | CraftMaterial[] | Required materials with quantities |
| tools | string[] | Required tools (Vietnamese names) |
| steps | CraftStep[] | Ordered build instructions |
| modelPath | string \| null | Path to GLB file or null if no 3D model |
| isShowcase | boolean | Whether this craft has a physical build + 3D model |

**Constraints**: materials array must have at least 1 entry. steps must have
at least 2 entries. modelPath is null for catalog-only crafts.
**Count**: 8 crafts in initial library (4 showcase, 4 catalog-only).

### CraftMaterial (embedded in Craft)

| Field | Type | Description |
|-------|------|-------------|
| materialId | string | References Material.id |
| quantity | number | Required quantity (>= 1) |
| sizePreference | string? | Optional preferred size from Material.sizeOptions |

### CraftStep (embedded in Craft)

| Field | Type | Description |
|-------|------|-------------|
| number | number | Step sequence number (1-based) |
| title | string | Short Vietnamese title |
| detail | string | Full Vietnamese instruction text |
| tip | string? | Optional safety or technique tip |

### SelectedItem (runtime state)
Represents a material chosen by the user with specific configuration.

| Field | Type | Description |
|-------|------|-------------|
| materialId | string | References Material.id |
| size | string | Chosen size from Material.sizeOptions |
| quantity | number | Chosen quantity (>= 1) |

**Constraints**: Unique by (materialId, size) — same material with different
sizes are separate entries. Same material + same size → quantity increments.

### Theme
Color palette for the entire application.

| Field | Type | Description |
|-------|------|-------------|
| id | string | Kebab-case identifier |
| name | string | Vietnamese display name |
| bg | string | Main background color (hex) |
| bgWarm | string | Warm accent background (hex) |
| bgCard | string | Card/panel background (hex) |
| text | string | Primary text color (hex) |
| textLight | string | Secondary text color (hex) |
| textMuted | string | Muted/disabled text color (hex) |
| primary | string | Primary action color (hex) |
| primaryLight | string | Light variant of primary (hex) |
| primaryDark | string | Dark variant of primary (hex) |
| accent | string | Accent/highlight color (hex) |
| accentLight | string | Light variant of accent (hex) |
| hudGradientFrom | string | HUD gradient start (hex) |
| hudGradientTo | string | HUD gradient end (hex) |
| hudBorder | string | HUD border color (hex) |
| border | string | Default border color (hex) |
| borderDark | string | Dark border color (hex) |

**Count**: 4 themes: sky-coral, teal-peach, indigo-mint, brown-orange.

### GameStats (Day 1: read-only defaults)

| Field | Type | Description |
|-------|------|-------------|
| craftsCompleted | number | Total crafts finished (default: 0) |
| itemsRecycled | number | Total materials used (default: 0) |
| coachMessages | number | Total coach interactions (default: 0) |
| level | number | Current level 1-5 (default: 1) |
| points | number | Current points (default: 0) |
| activityDates | string[] | ISO date strings of active days |

**Day 1 note**: GameStats interface is defined but values are hardcoded defaults.
Live tracking comes Day 4.

### ChatMessage (Day 1: interface only)

| Field | Type | Description |
|-------|------|-------------|
| role | 'user' \| 'assistant' | Message sender |
| content | string | Message text |
| timestamp | number | Unix timestamp |

**Day 1 note**: Interface defined for type completeness. Chat UI is Day 3.

## Relationships

```
Material (12+)
  └── referenced by → Craft.materials[].materialId
  └── selected into → SelectedItem.materialId

Craft (8)
  ├── contains → CraftStep[] (ordered)
  ├── requires → CraftMaterial[] → Material
  └── optional → modelPath → /public/models/*.glb

Theme (4)
  └── stored in → localStorage('ecocraft-theme')
  └── injected into → CSS custom properties on :root

GameStats (1 instance)
  └── stored in → localStorage('ecocraft-stats')
```

## State Transitions

### SelectedItem lifecycle
1. User clicks material in grid → preview shows
2. User picks size + quantity → clicks "Thêm vào túi"
3. If (materialId, size) exists in bag → increment quantity
4. If new → add to bag
5. User can remove (✕) → item deleted from bag
6. User can adjust quantity → if 0, auto-remove
7. "Chế Tạo Ngay!" → bag contents passed to Screen 2 (Day 2)

### Theme lifecycle
1. App loads → read localStorage('ecocraft-theme')
2. If found → apply immediately (no default flash)
3. If not found → apply 'sky-coral' default
4. User selects new theme → inject CSS vars → save to localStorage
