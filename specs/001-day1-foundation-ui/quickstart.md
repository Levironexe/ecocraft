# Quickstart: Day 1 — Foundation + Data Layer + Screen 1 Static UI

**Date**: 2026-06-06
**Feature**: 001-day1-foundation-ui

## Prerequisites

- Node.js 18+ installed
- Project cloned and on branch `001-day1-foundation-ui`

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in Chrome or Edge.

## Verify Day 1 Deliverables

### 1. Material Grid (Screen 1 left panel)
- [ ] 12+ material cards visible in 4-column grid
- [ ] Each card shows emoji + Vietnamese name
- [ ] Search bar filters materials (type "chai" → only chai-related items)
- [ ] Diacritics-insensitive (type "ong" → matches "Ống hút")

### 2. Preview Panel (Screen 1 right top)
- [ ] Click any material card → right panel shows large emoji
- [ ] Size dropdown populated with material's sizeOptions
- [ ] Quantity control (+/-) works, minimum 1
- [ ] "Thêm vào túi" button adds item to selection bag

### 3. Selection Bag (Screen 1 right bottom)
- [ ] Added items appear with emoji, name, size, quantity badge
- [ ] ✕ button removes item
- [ ] Adding same material + same size → quantity increments
- [ ] Adding same material + different size → separate entry
- [ ] "Chế Tạo Ngay!" button switches to Screen 2 tab

### 4. Theme System
- [ ] Default theme (sky-coral) applies on first load
- [ ] Settings gear in HUD → theme swatches visible
- [ ] Click different theme → colors change instantly
- [ ] Refresh page → theme persists

### 5. HUD
- [ ] Logo visible: leaf icon + "EcoCraft AI"
- [ ] Stats show: ♻️ Đã tái chế: 0, ⭐ Cấp độ: 1, 🏆 Điểm: 0
- [ ] Gear icon visible and clickable

### 6. Tab Navigation
- [ ] Two tabs visible: "🎒 Chọn Vật Liệu" (active) and "🔨 Xưởng Chế Tạo"
- [ ] Click Screen 2 tab → tab highlights, placeholder content shows
- [ ] Click Screen 1 tab → back to material selection

### 7. Vietnamese Text
- [ ] All UI text in Vietnamese — no English visible
- [ ] VT323 font renders diacritics correctly: ắ, ặ, ề, ố, ừ, ữ

### 8. Build Check
```bash
npm run build
```
- [ ] Compiles without errors
