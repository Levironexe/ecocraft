# Data Model: Day 2 — Screen 2 + Matcher + Suggestions

**Date**: 2026-06-06
**Feature**: 002-day2-screen2-matcher

## New Entities

### MatchResult (runtime, computed)

| Field | Type | Description |
|-------|------|-------------|
| craft | Craft | Reference to matched craft from library |
| matchPercent | number | 0–100, percentage of required materials present |
| matchedMaterials | string[] | Material IDs that matched |
| missingMaterials | string[] | Material IDs that are missing |

**Constraints**: matchPercent = matchedMaterials.length / craft.materials.length × 100.
Only crafts with matchPercent >= 40 are included in results.
**Lifecycle**: Recomputed every time selectedItems changes. Not persisted.

### CompletedSteps (runtime state)

| Field | Type | Description |
|-------|------|-------------|
| (set) | Set<number> | Step numbers the child has marked as done |

**Constraints**: Valid step numbers only (1-based, within craft.steps range).
**Lifecycle**: Resets when craft changes or when navigating to Screen 1.

## State Additions to page.tsx

| State Variable | Type | Default | Description |
|---------------|------|---------|-------------|
| selectedCraft | Craft \| null | null | Craft loaded in Screen 2 |
| completedSteps | Set<number> | new Set() | Steps marked done |
| suggestions | MatchResult[] | [] | Current craft suggestions |

## Relationships

```
SelectedItem[] (from Day 1)
  └── fed into → matchCrafts() → MatchResult[]
       └── displayed as → SuggestionCards (top 3)
       └── on click → selectedCraft → BuildScreen

Craft (from Day 1 library)
  ├── matched against → SelectedItem[] via materialId
  ├── loaded into → BuildScreen
  │   ├── craft.materials → MaterialsBar chips
  │   ├── craft.tools → MaterialsBar chips
  │   ├── craft.steps → StepsList
  │   ├── craft.modelPath → ModelViewer
  │   └── craft.name → CoachChat context
  └── completedSteps ← Set<number> ← StepsList toggle
```

## State Transitions

### Matcher flow
1. selectedItems changes → trigger matchCrafts(selectedItems, crafts)
2. Filter results >= 40% → sort descending by matchPercent
3. Take top 3 → set suggestions state
4. Render SuggestionCards

### Craft selection flow
1. User clicks suggestion card → setSelectedCraft(matchResult.craft)
2. Reset completedSteps → new Set()
3. Switch to Screen 2 → setActiveScreen(2)

### Step toggle flow
1. User clicks step N in StepsList
2. If N in completedSteps → remove (undo)
3. If N not in completedSteps → add (mark done)
4. Current step recalculates: lowest number not in set
