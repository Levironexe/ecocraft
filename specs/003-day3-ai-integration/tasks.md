# Tasks: Day 3 — AI Integration (All 3 Modes)

**Input**: Design documents from `specs/003-day3-ai-integration/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Next.js App Router**: `app/` at repository root
- API Routes: `app/api/`
- Components: `app/components/`
- Data/lib: `app/lib/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies, create API route directories, env file

- [x] T001 Install `@google/generative-ai` dependency: run `npm install @google/generative-ai`
- [x] T002 Create `app/api/chat/` and `app/api/coach/` directories
- [x] T003 [P] Create `.env.local` with `GEMINI_API_KEY=` placeholder (user fills in real key)
- [x] T004 [P] Add `LLMConfig` interface to `app/lib/types.ts`: `{ provider: 'gemini' | 'ollama', ollamaUrl?: string, ollamaModel?: string }`

**Checkpoint**: Dependencies installed. Directories exist. Types defined.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: LLM abstraction + system prompts — all AI user stories depend on these

**⚠️ CRITICAL**: No AI features can work until LLM client and prompts are ready

- [x] T005 Build `app/lib/llm.ts`: export async `chat(systemPrompt: string, messages: {role: 'user'|'assistant', content: string}[], config: LLMConfig): Promise<string>` — if config.provider === 'gemini': use `@google/generative-ai` SDK with model `gemini-2.0-flash-lite`, API key from `process.env.GEMINI_API_KEY`, convert messages to Gemini format (systemInstruction + contents), handle errors with retry (1 retry after 2s for rate limits); if config.provider === 'ollama': POST to `${config.ollamaUrl || 'http://localhost:11434'}/api/chat` with `{model: config.ollamaModel || 'qwen2.5:7b', messages: [{role:'system', content: systemPrompt}, ...messages], stream: false}`, parse response.message.content; both: 30s timeout via AbortController, catch all errors → throw with Vietnamese-friendly message
- [x] T006 [P] Build `app/lib/prompts.ts`: export three string constants — `ITEM_EXTRACTION_PROMPT` (instructs LLM to return JSON array of `{id, quantity}` from Vietnamese text, lists all 12 material IDs with common names, default qty 2-3 if unclear, ignore unknown materials, JSON-only output), `CRAFT_SUGGESTION_PROMPT` (takes `{materials_json}` placeholder, enforces 100% certainty rule, returns `{canSuggest, name, emoji, description, steps}` or `{canSuggest: false, message}`, JSON-only), `BUILD_COACH_PROMPT` (takes `{craft_name}`, `{step_number}`, `{step_title}`, `{step_detail}`, `{steps_summary}` placeholders, 2-4 sentences, child-friendly, safety warnings, refuse off-topic, emoji ≤2)

**Checkpoint**: `chat()` function callable from API routes. All 3 prompts defined and tested mentally.

---

## Phase 3: User Story 1 — Chat Material Extraction (Priority: P1) 🎯 MVP

**Goal**: Child types Vietnamese message → AI extracts materials → items offered for bag → suggestions update

**Independent Test**: Chat mode → type "Em có chai nhựa và ống hút" → AI replies → extracted items offered → add to bag → suggestions appear

### Implementation for User Story 1

- [x] T007 [US1] Build `app/api/chat/route.ts`: POST handler accepting `{message, history, selectedItems, llmConfig}` body — Step 1: call `chat()` with ITEM_EXTRACTION_PROMPT + user message to extract items; Step 2: parse JSON array response, map each `{id, quantity}` to SelectedItem (use first sizeOption as default size, parsed quantity); Step 3: run `matchCrafts()` on extracted items; Step 4: if matches ≥40% → include in response as `matchedCrafts`; Step 5: if no matches → call `chat()` with CRAFT_SUGGESTION_PROMPT (replace `{materials_json}` with extracted material names); Step 6: parse suggestion JSON, if `canSuggest` → construct ad-hoc Craft with `modelPath: null, isShowcase: false, id: 'ai-suggestion-' + Date.now()`; Step 7: build Vietnamese reply summarizing found items and suggestions; return `{reply, extractedItems, matchedCrafts, suggestedCraft}` — wrap all in try/catch, on error return `{reply: "Mình đang gặp sự cố, thử lại nhé!"}`
- [x] T008 [US1] Build `app/components/screen1/ChatMode.tsx`: `'use client'` component with NPC header (🤖 avatar, "Trợ Lý AI", "Giúp bạn tìm vật liệu"), scrollable message list (auto-scroll on new message via useRef + scrollIntoView), input bar + send button (disabled when empty or isTyping), on send: add user message to state → set isTyping true → POST `/api/chat` with message + history + selectedItems + llmConfig → set isTyping false → add assistant reply → if extractedItems: show "Thêm vào túi?" buttons for each item → if matchedCrafts/suggestedCraft: call parent callbacks to update suggestions; typing indicator: 3 animated dots in bot bubble while isTyping; error: display error reply as normal bot message; props: `selectedItems`, `onAddItems: (items: SelectedItem[]) => void`, `onUpdateSuggestions: (crafts: MatchResult[], aiCraft?: Craft) => void`, `llmConfig: LLMConfig`
- [x] T009 [US1] Modify `app/components/screen1/MaterialScreen.tsx`: add mode state `'inventory' | 'chat'`, add mode toggle buttons at top of left panel (📦 Kho Vật Liệu / 💬 Chat AI), show InventoryGrid when inventory mode, show ChatMode when chat mode, pass required props (selectedItems, handlers, llmConfig) to ChatMode
- [x] T010 [US1] Wire ChatMode into `app/page.tsx`: add `llmConfig` state (read from localStorage on mount, default: `{provider: 'gemini'}`), add `aiSuggestion: Craft | null` state, add handler `handleAddItems` that batch-adds extracted items to selectedItems, add handler `handleUpdateSuggestions` that merges AI suggestion into suggestions display, pass llmConfig to MaterialScreen/ChatMode, update SuggestionCards to include AI suggestion card if present

**Checkpoint**: Full chat extraction flow works — type Vietnamese → AI responds → items extractable → suggestions update

---

## Phase 4: User Story 2 — AI Craft Suggestion with Honest Refusal (Priority: P1)

**Goal**: When no library match, AI suggests craft or honestly refuses

**Independent Test**: Type "vỏ trứng và dây ruy băng" → AI refuses or suggests simple craft → no fake craft

**Note**: Most of this is already implemented in T007 (chat route). This phase covers the UI handling.

### Implementation for User Story 2

- [x] T011 [US2] Update `app/components/screen1/SuggestionCards.tsx`: handle AI-suggested craft — if `aiSuggestion` prop is present, render as additional card with distinct styling (dashed border or different background to indicate AI-generated), tag always shows "📝 Gợi ý từ AI", clicking loads into Screen 2 like library crafts; add prop `aiSuggestion: Craft | null`
- [x] T012 [US2] Update `app/page.tsx`: when AI suggestion craft is selected for Screen 2, pass it as selectedCraft (already works since it conforms to Craft interface); ensure BuildScreen handles crafts with `modelPath: null` gracefully (already handled by ModelViewer placeholder)

**Checkpoint**: AI suggestions appear distinctly in cards. Refusal shows message, no fake card. AI craft loads in Screen 2.

---

## Phase 5: User Story 3 — Build Coach (Priority: P1)

**Goal**: Coach chat on Screen 2 sends real messages to AI, gets context-aware responses

**Independent Test**: Screen 2 → type "Keo không dính, làm sao?" → coach responds with practical advice mentioning current step

### Implementation for User Story 3

- [x] T013 [US3] Build `app/api/coach/route.ts`: POST handler accepting `{message, history, craftId, currentStep, llmConfig}` body — look up craft by ID from crafts library (import crafts array), if not found check if craftId starts with 'ai-suggestion-' and return generic guidance; build BUILD_COACH_PROMPT by replacing `{craft_name}` with craft.name, `{step_number}` with currentStep, `{step_title}` and `{step_detail}` from matching step, `{steps_summary}` with all steps as numbered list; call `chat()` with built prompt + history; return `{reply}` — wrap in try/catch, error → `{reply: "Mình đang gặp sự cố, thử lại nhé!"}`
- [x] T014 [US3] Rewrite `app/components/screen2/CoachChat.tsx`: remove mock messages, add real state `coachMessages: ChatMessage[]` (initialize with greeting), `isTyping: boolean`, input handling: on send → add user message → set isTyping → POST `/api/coach` with message + history + craft.id + currentStep + llmConfig → add reply as assistant message → set isTyping false; typing indicator (3 dots); error handling (error as bot message); auto-scroll to bottom; add props: `craft: Craft`, `currentStep: number`, `llmConfig: LLMConfig`; reset messages when craft changes (useEffect on craft.id)
- [x] T015 [US3] Update `app/components/screen2/BuildScreen.tsx`: pass `craft`, `currentStep`, and `llmConfig` to CoachChat; add `llmConfig` prop to BuildScreen interface; compute and pass currentStep from completedSteps state

**Checkpoint**: Coach responds with real AI. Knows craft + step. Safety warnings work. Off-topic refused.

---

## Phase 6: User Story 4 — Online/Offline Switch (Priority: P2)

**Goal**: Settings panel lets user switch LLM provider, persists choice

**Independent Test**: Settings → switch to offline → configure URL → send message → response from local AI

### Implementation for User Story 4

- [x] T016 [US4] Update `app/components/SettingsPanel.tsx`: add LLM provider section below theme picker — radio buttons "🌐 Gemini (Online)" / "💻 Ollama (Ngoại tuyến)", when Ollama selected show text inputs for server URL (default http://localhost:11434) and model name (default qwen2.5:7b), read/write from `llmConfig` prop, call `onConfigChange(config)` on any change
- [x] T017 [US4] Update `app/components/HUD.tsx`: pass `llmConfig` and `onConfigChange` through to SettingsPanel
- [x] T018 [US4] Update `app/page.tsx`: add `llmConfig` state with localStorage persistence (read on mount, save on change), pass to HUD + SettingsPanel + MaterialScreen + BuildScreen; add `handleConfigChange` that updates state + localStorage

**Checkpoint**: Provider switch works. Choice persists. Offline URL configurable.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final wiring, error handling verification, build check

- [x] T019 Update `app/page.tsx`: pass `llmConfig` to BuildScreen component
- [x] T020 Verify all error paths show Vietnamese-only messages — no English error text leaks from LLM SDK or fetch errors
- [x] T021 Run `npm run build` — must compile without errors
- [x] T022 Run `npm run dev` and manually test full quickstart.md checklist: chat extraction, AI suggestions, honest refusal, coach interaction, provider switching, error handling

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on T001 (Gemini SDK) + T004 (types)
- **US1 (Phase 3)**: Depends on Foundation (llm.ts + prompts.ts)
- **US2 (Phase 4)**: Depends on US1 (chat route builds the suggestion)
- **US3 (Phase 5)**: Depends on Foundation only — independent of US1/US2
- **US4 (Phase 6)**: Depends on Foundation only — independent of US1/US2/US3
- **Polish (Phase 7)**: Depends on all user stories

### User Story Dependencies

- **US1**: Foundation → chat route → ChatMode → MaterialScreen → page.tsx wiring
- **US2**: US1 (chat route returns suggestions) → SuggestionCards update
- **US3**: Foundation → coach route → CoachChat rewrite → BuildScreen update
- **US4**: Foundation → SettingsPanel → HUD → page.tsx persistence

### Parallel Opportunities

- T003, T004 can run in parallel (env file vs types)
- T005, T006 can run in parallel (llm.ts vs prompts.ts)
- T007, T013 can run in parallel after Foundation (chat route vs coach route)
- T016, T017, T018 can run in parallel (settings components)

---

## Implementation Strategy

### MVP First (US1 Only)

1. Setup + Foundation → LLM ready
2. US1 → Chat extraction works end-to-end
3. **STOP and VALIDATE**: Type Vietnamese → AI extracts → items addable
4. Then US2 → AI suggestions visible
5. Then US3 → Coach works
6. Then US4 → Provider switching

### Recommended Execution Order

1. T001 → T002 → T003+T004 (parallel)
2. T005+T006 (parallel)
3. T007 → T008 → T009 → T010
4. T011 → T012
5. T013 → T014 → T015
6. T016+T017+T018 (parallel)
7. T019 → T020 → T021 → T022

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- GEMINI_API_KEY must be set in .env.local for online mode to work
- Ollama must be running locally for offline mode testing
- AI-suggested crafts use `id: 'ai-suggestion-...'` pattern — coach route handles this
- All LLM errors → Vietnamese chat message, never crash
