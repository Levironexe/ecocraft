# Data Model: Day 3 — AI Integration

**Date**: 2026-06-06
**Feature**: 003-day3-ai-integration

## New Entities

### LLMConfig (persisted in localStorage)

| Field | Type | Description |
|-------|------|-------------|
| provider | 'gemini' \| 'ollama' | Active LLM provider |
| ollamaUrl | string | Ollama server URL (default: http://localhost:11434) |
| ollamaModel | string | Ollama model name (default: qwen2.5:7b) |

**Lifecycle**: Created on first settings interaction. Persisted in localStorage
key `ecocraft-llm-config`. Read by client, sent in API request body.

### ChatRequest (API input)

| Field | Type | Description |
|-------|------|-------------|
| message | string | User's Vietnamese text message |
| history | ChatMessage[] | Prior conversation messages |
| selectedItems | SelectedItem[] | Current bag contents |
| llmConfig | LLMConfig | Provider configuration |

### ChatResponse (API output)

| Field | Type | Description |
|-------|------|-------------|
| reply | string | Vietnamese text to display in chat |
| extractedItems | SelectedItem[]? | Items parsed from user message |
| suggestedCraft | Craft? | AI-generated craft (if no library match) |
| matchedCrafts | MatchResult[]? | Library crafts matching extracted items |

### CoachRequest (API input)

| Field | Type | Description |
|-------|------|-------------|
| message | string | Child's question |
| history | ChatMessage[] | Coach conversation history |
| craftId | string | Current craft being built |
| currentStep | number | Step number child is on |
| llmConfig | LLMConfig | Provider configuration |

### CoachResponse (API output)

| Field | Type | Description |
|-------|------|-------------|
| reply | string | Coach's Vietnamese response |

## API Contracts

### POST /api/chat

```
Request:  ChatRequest
Response: ChatResponse

Flow:
1. Extract items from message using ITEM_EXTRACTION_PROMPT → JSON array
2. Map extracted IDs to SelectedItems (default size, parsed quantity)
3. Run matchCrafts() on extracted items
4. If matches ≥40% → return matchedCrafts
5. If no matches → call LLM with CRAFT_SUGGESTION_PROMPT
6. If canSuggest → construct Craft with modelPath:null, isShowcase:false
7. Build natural Vietnamese reply summarizing results
```

### POST /api/coach

```
Request:  CoachRequest
Response: CoachResponse

Flow:
1. Lookup craft by craftId from library
2. Build BUILD_COACH_PROMPT with craft name, current step details, all steps
3. Send user message + history + system prompt to LLM
4. Return response text as reply
```

## State Additions

### Screen 1 — ChatMode state
| State | Type | Default |
|-------|------|---------|
| chatMessages | ChatMessage[] | [] |
| isTyping | boolean | false |
| mode | 'inventory' \| 'chat' | 'inventory' |

### Screen 2 — CoachChat state
| State | Type | Default |
|-------|------|---------|
| coachMessages | ChatMessage[] | [initial greeting] |
| isTyping | boolean | false |

### Settings — LLM config
| State | Type | Default |
|-------|------|---------|
| llmConfig | LLMConfig | { provider: 'gemini', ollamaUrl: 'http://localhost:11434', ollamaModel: 'qwen2.5:7b' } |
