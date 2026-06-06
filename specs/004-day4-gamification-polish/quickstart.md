# Quickstart: Day 4 — Gamification + Polish

**Date**: 2026-06-06
**Feature**: 004-day4-gamification-polish

## Prerequisites

- Days 1–3 complete
- On branch `004-day4-gamification-polish`

## Setup

```bash
npm install
npm run dev
```

## Verify Day 4 Deliverables

### 1. Gamification — Craft Completion
- [ ] Complete all steps of any craft (mark all done)
- [ ] Celebration message appears
- [ ] HUD stats update: craftsCompleted +1, items +N, points +50+steps×10
- [ ] Refresh page → stats persist
- [ ] Complete another craft → stats accumulate

### 2. Gamification — Coach Points
- [ ] Send coach message on Screen 2
- [ ] After response, HUD points increase by 5
- [ ] coachMessages counter increments

### 3. Gamification — Leveling
- [ ] Earn enough points to cross level threshold (e.g., 100 for L2)
- [ ] HUD level updates immediately
- [ ] Level correct after page refresh

### 4. Stats in Settings
- [ ] Open settings → stats section visible
- [ ] Shows: crafts completed, items recycled, active days
- [ ] Values match HUD

### 5. Floating Particles
- [ ] 15 colored particles floating upward on screen
- [ ] Different speeds and colors
- [ ] Smooth animation (no jank)
- [ ] Don't interfere with clicks (pointer-events: none)

### 6. Responsive — 1366x768
- [ ] Resize browser to 1366x768
- [ ] Screen 1: no horizontal scroll, grid fits
- [ ] Screen 2: 3-column fits viewport, no outer scroll
- [ ] All text readable, no truncation of critical content

### 7. Error States
- [ ] Kill internet → chat shows Vietnamese error
- [ ] Matcher still works without internet
- [ ] Steps still toggleable without internet
- [ ] Theme switching still works without internet

### 8. Vietnamese Text
- [ ] All UI text in Vietnamese
- [ ] No English error messages visible
- [ ] Diacritics render correctly: ắ, ặ, ề, ố, ừ, ữ

### 9. Attribution
- [ ] Footer shows Meshy attribution for 3D models

### 10. Build Check
```bash
npm run build
```
- [ ] Compiles without errors
