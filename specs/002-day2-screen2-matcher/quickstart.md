# Quickstart: Day 2 — Screen 2 + Matcher + Suggestions

**Date**: 2026-06-06
**Feature**: 002-day2-screen2-matcher

## Prerequisites

- Day 1 complete (Screen 1 interactive, data layer in place)
- On branch `002-day2-screen2-matcher`
- `@google/model-viewer` installed (`npm install @google/model-viewer`)

## Setup

```bash
npm install
npm run dev
```

## Verify Day 2 Deliverables

### 1. Deterministic Matcher
- [ ] Add "Chai nhựa" + "Ống hút" + "Nắp chai" → suggestion cards appear
- [ ] "Tên Lửa Tái Chế" shows 100% match
- [ ] Remove one material → match % drops, order may change
- [ ] Clear all items → "Thêm vật liệu để xem gợi ý!" message shown
- [ ] Max 3 suggestion cards displayed

### 2. Suggestion Cards
- [ ] Each card shows: emoji, name, match %, description
- [ ] Cards show tag: "🎮 Có 3D" or "📝 Chỉ hướng dẫn"
- [ ] Cards sorted by match % (highest first)
- [ ] Click card → switches to Screen 2 with that craft loaded

### 3. Screen 2 Layout
- [ ] 3-column layout fills viewport (no outer scrollbar)
- [ ] Left column (55%): 3D viewer or placeholder
- [ ] Middle column (22.5%): step list, scrollable
- [ ] Right column (22.5%): coach chat panel

### 4. Materials Bar
- [ ] Shows craft name, difficulty stars, time, age
- [ ] Material chips (styled) + tool chips (different style)

### 5. Model Viewer
- [ ] Craft with modelPath → 3D viewer (auto-rotate, camera controls)
- [ ] Craft without modelPath → "📝 Gợi ý từ AI — không có mô hình 3D"

### 6. Step Tracker
- [ ] All steps visible with number, title, detail
- [ ] Steps with tips show 💡 icon
- [ ] Current step (lowest incomplete) has pulsing orange border
- [ ] Click step → toggles done/undone
- [ ] Done steps: dimmed, green checkmark, strikethrough
- [ ] Click done step → reverts to pending

### 7. Coach Chat (static)
- [ ] "Thợ Cả" header with avatar
- [ ] Mock messages displayed (bot left, user right)
- [ ] Input bar visible (non-functional)

### 8. Full Flow
- [ ] Screen 1 → add materials → suggestions appear → click one →
      Screen 2 loads → interact with steps → switch back to Screen 1 →
      materials still in bag → suggestions still visible

### 9. Build Check
```bash
npm run build
```
- [ ] Compiles without errors
