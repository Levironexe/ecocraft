# Data Model: Day 4 — Gamification + Polish

**Date**: 2026-06-06
**Feature**: 004-day4-gamification-polish

## Entities

### GameStats (persisted in localStorage)

Already defined in `app/lib/types.ts` from Day 1:

| Field | Type | Description |
|-------|------|-------------|
| craftsCompleted | number | Total crafts finished |
| itemsRecycled | number | Total materials used across all crafts |
| coachMessages | number | Total coach chat messages sent |
| level | number | Current level 1-5 |
| points | number | Current total points |
| activityDates | string[] | ISO date strings of days the app was used |

**Storage key**: `ecocraft-stats`
**Default**: `{ craftsCompleted: 0, itemsRecycled: 0, coachMessages: 0, level: 1, points: 0, activityDates: [] }`

## Gamification Rules

### Points Awarded
| Action | Points |
|--------|--------|
| Complete a craft (all steps done) | 50 |
| Per step completed (in craft completion) | 10 |
| Send coach message | 5 |

### Level Thresholds
| Level | Points Required |
|-------|----------------|
| 1 | 0–99 |
| 2 | 100–249 |
| 3 | 250–499 |
| 4 | 500–999 |
| 5 | 1000+ |

### Craft Completion Logic
1. `completedSteps.size === craft.steps.length` → trigger
2. `craftsCompleted += 1`
3. `itemsRecycled += sum(craft.materials[].quantity)`
4. `points += 50 + (craft.steps.length × 10)`
5. Recalculate level from new points total
6. Add today's ISO date to activityDates (deduplicated)
7. Save to localStorage

### Coach Message Logic
1. After successful coach response
2. `coachMessages += 1`
3. `points += 5`
4. Recalculate level
5. Add today's date to activityDates
6. Save to localStorage

## State Flow

```
page.tsx
  ├── gameStats: GameStats (read from localStorage on mount)
  ├── onCraftComplete(craft) → completeCraft() → saveStats() → setGameStats()
  ├── onCoachMessage() → recordCoachMessage() → saveStats() → setGameStats()
  └── passes gameStats to HUD (live display)
        └── HUD shows: itemsRecycled, level, points
```
