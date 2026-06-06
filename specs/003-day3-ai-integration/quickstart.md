# Quickstart: Day 3 — AI Integration

**Date**: 2026-06-06
**Feature**: 003-day3-ai-integration

## Prerequisites

- Day 1 + Day 2 complete
- `@google/generative-ai` installed (`npm install @google/generative-ai`)
- `.env.local` with `GEMINI_API_KEY=<your-key>` (from Google AI Studio)
- Optional: Ollama installed + `qwen2.5:7b` pulled for offline testing

## Setup

```bash
npm install
npm run dev
```

## Verify Day 3 Deliverables

### 1. Chat Material Extraction
- [ ] Switch to chat mode on Screen 1 (mode toggle visible)
- [ ] Type "Em có 3 cái chai nhựa và ống hút"
- [ ] AI responds in Vietnamese listing found materials
- [ ] Extracted items offered for addition to bag
- [ ] Accept → items appear in "Đã Chọn" bag
- [ ] Suggestion cards update with matching crafts

### 2. AI Craft Suggestion (Honest Refusal)
- [ ] Type "Em có vỏ trứng và dây ruy băng"
- [ ] AI either suggests a simple craft OR honestly refuses
- [ ] If suggests → craft appears as "📝 Chỉ hướng dẫn" in suggestions
- [ ] If refuses → friendly message, no fake craft
- [ ] Click AI suggestion → Screen 2 loads with steps but no 3D model

### 3. Build Coach
- [ ] Navigate to Screen 2 with any craft
- [ ] Type "Keo không dính, làm sao?" in coach chat
- [ ] Coach responds with practical advice (2-4 sentences)
- [ ] Response references current craft and step
- [ ] Ask off-topic question → coach redirects
- [ ] Step involving scissors → safety warning included

### 4. Online/Offline Switch
- [ ] Open settings → LLM provider toggle visible
- [ ] Switch to offline → URL + model fields appear
- [ ] Send message → response from local AI (if Ollama running)
- [ ] Switch back to online → response from Gemini
- [ ] Refresh page → provider choice persisted

### 5. Error Handling
- [ ] Disconnect internet → send chat message → Vietnamese error in chat
- [ ] Stop Ollama → switch to offline → send message → connection error in Vietnamese
- [ ] Wait >30s (simulate slow response) → timeout error in Vietnamese
- [ ] Send empty message → send button disabled

### 6. Build Check
```bash
npm run build
```
- [ ] Compiles without errors
