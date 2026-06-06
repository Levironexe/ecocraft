# Implementation Plan: Day 3 — AI Integration (All 3 Modes)

**Branch**: `003-day3-ai-integration` | **Date**: 2026-06-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/003-day3-ai-integration/spec.md`

## Summary

Integrate AI into all three interaction modes: (1) chat-based material extraction
on Screen 1, (2) AI craft suggestions when no library match, (3) build coach on
Screen 2. Build LLM abstraction supporting Gemini (online) and Ollama (offline).
Create server-side API routes to keep API keys secure. Wire chat UI components
into both screens.

## Technical Context

**Language/Version**: TypeScript 5.x on Next.js 16.2.7 (App Router)
**Primary Dependencies**: React 19.2.4, @google/generative-ai (Gemini SDK), Ollama REST API
**Storage**: localStorage (LLM provider config), React state (chat history)
**Testing**: Manual end-to-end testing — adversarial inputs for refusal validation
**Target Platform**: Desktop browsers (Chrome, Edge), server-side API routes
**Project Type**: Web application with server-side AI proxy routes
**Performance Goals**: AI response <5s online, <10s offline, 30s timeout
**Constraints**: Gemini free tier 15 RPM, offline-capable via Ollama, API keys server-only
**Scale/Scope**: 3 AI modes, 2 API routes, 3 system prompts, 2 LLM providers

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Library-First, Deterministic-Primary | ✅ PASS | Matcher runs first; AI only for unmatched items or chat |
| II. Honest Refusal | ✅ PASS | System prompt enforces canSuggest:false when uncertain; tested with adversarial inputs |
| III. Vietnamese-Native UX | ✅ PASS | All prompts, responses, error messages in Vietnamese |
| IV. Offline-Capable | ✅ PASS | Ollama fallback supported; provider switchable in settings |
| V. Ship Incrementally | ✅ PASS | Day ends with all 3 AI modes working |
| VI. Child-Safe | ✅ PASS | Coach warns about dangerous tools; refuses off-topic; age-appropriate language |
| VII. Minimal Viable Polish | ✅ PASS | Chat bubbles, typing indicator, NPC headers |

All gates pass.

## Project Structure

### Source Code (new/modified files)

```text
app/
├── page.tsx                        # MODIFIED — add chat mode state, AI suggestion handling
├── api/
│   ├── chat/route.ts               # NEW — POST: item extraction + craft suggestion
│   └── coach/route.ts              # NEW — POST: build coach conversation
├── components/
│   ├── screen1/
│   │   ├── MaterialScreen.tsx      # MODIFIED — add mode switch (inventory/chat)
│   │   └── ChatMode.tsx            # NEW — AI conversation panel
│   ├── screen2/
│   │   └── CoachChat.tsx           # MODIFIED — wire to /api/coach, add real messaging
│   └── SettingsPanel.tsx           # MODIFIED — add LLM provider toggle
├── lib/
│   ├── llm.ts                      # NEW — LLM provider abstraction (Gemini + Ollama)
│   └── prompts.ts                  # NEW — System prompts for all 3 AI modes
```

**Structure Decision**: API routes in `app/api/` per Next.js convention. LLM
abstraction in `lib/` — pure server-side, imported only by route handlers.

## Complexity Tracking

> No violations.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
