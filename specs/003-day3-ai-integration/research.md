# Research: Day 3 — AI Integration

**Date**: 2026-06-06
**Feature**: 003-day3-ai-integration

## Decision 1: Gemini SDK Usage

**Decision**: Use `@google/generative-ai` SDK with `gemini-2.0-flash-lite` model.
**Rationale**: Free tier (15 RPM, 1M tokens/day). SDK handles auth, streaming,
safety settings. Flash-lite is fastest for simple extraction/suggestion tasks.
**Alternatives considered**:
- Gemini Pro — higher quality but slower, unnecessary for extraction tasks
- Direct REST API — more code, SDK is simpler
- Claude — not free tier, overkill for this use case

## Decision 2: Ollama Integration Pattern

**Decision**: Direct REST API calls to Ollama (`POST /api/chat`), no SDK.
**Rationale**: Ollama's REST API is simple — one endpoint, JSON body with
model + messages + stream:false. No npm package needed. Qwen2.5:7b handles
Vietnamese well for its size.
**Alternatives considered**:
- Ollama npm SDK — adds dependency for a single POST call
- LangChain — massive dependency, constitution's package budget prohibits

## Decision 3: LLM Config Propagation

**Decision**: Store provider config in localStorage. Client sends config in
request body to API routes. Server reads config per-request.
**Rationale**: No database, no auth — simplest approach. API keys stay
server-side in env vars. Only the provider choice + ollama URL travel
client→server.
**Alternatives considered**:
- Server-side config file — can't switch dynamically from UI
- Cookies — works but request body is more explicit
- Headers — viable but body is cleaner for POST requests

## Decision 4: Chat Flow Architecture

**Decision**: Two-phase flow in /api/chat: (1) always extract items via LLM,
(2) if no library match ≥40%, attempt AI suggestion. Return combined response.
**Rationale**: Extraction is always useful (populates bag). Suggestion is
fallback only — aligns with Library-First principle. Single request, two
sequential LLM calls max.
**Alternatives considered**:
- Separate extraction and suggestion endpoints — more roundtrips from client
- Client-side extraction — exposes API key
- Streaming — adds complexity, responses are short enough for non-streaming

## Decision 5: System Prompt Strategy

**Decision**: Three separate system prompts: ITEM_EXTRACTION (JSON-only output),
CRAFT_SUGGESTION (JSON-only, enforces refusal), BUILD_COACH (natural Vietnamese,
context-aware). All in a dedicated `prompts.ts` file.
**Rationale**: Each AI mode has distinct output format and behavioral constraints.
Separating prompts makes testing and tuning easier. JSON-only prompts reduce
parsing errors.
**Alternatives considered**:
- Single multi-purpose prompt — harder to enforce format per mode
- Prompt templates with variables — same approach, just different syntax

## Decision 6: Error Handling Strategy

**Decision**: Try-catch around LLM calls. On error: return Vietnamese error
message in the response `reply` field. Client displays it as a chat bubble.
No raw error text exposed.
**Rationale**: Constitution requires Vietnamese-only error messages. Treating
errors as chat messages gives a natural UX. 30s timeout prevents hanging.
**Alternatives considered**:
- Error toast/modal — disrupts chat flow
- Retry indefinitely — bad UX on persistent failures
