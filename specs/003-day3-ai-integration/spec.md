# Feature Specification: Day 3 — AI Integration (All 3 Modes)

**Feature Branch**: `003-day3-ai-integration`
**Created**: 2026-06-06
**Status**: Draft
**Input**: EcoCraft AI Dev Plan — Day 3 scope

## User Scenarios & Testing

### User Story 1 — Chat with AI to Describe Materials (Priority: P1)

A child switches to chat mode on Screen 1 and types a natural Vietnamese
message like "Em có 3 cái chai nhựa, mấy cái ống hút và nắp chai nữa."
The AI understands the message, extracts the recyclable materials, and offers
to add them to the selection bag. Suggestion cards update accordingly.

**Why this priority**: AI chat is the headline feature — the primary way
children interact differently from a simple grid. Without it, the app is
just a catalog browser.

**Independent Test**: Open chat → type "Em có chai nhựa và ống hút" → AI
responds in Vietnamese listing extracted items → items offered for addition
to bag → suggestions update with matching crafts.

**Acceptance Scenarios**:

1. **Given** the child types a Vietnamese message with material names, **When**
   the AI processes it, **Then** the extracted materials appear as addable items
   and a natural Vietnamese reply explains what was found.
2. **Given** the AI extracts materials, **When** the child confirms adding them,
   **Then** the items appear in the "Đã Chọn" bag and suggestions recalculate.
3. **Given** the message mentions materials not in the library, **When** the AI
   processes it, **Then** unknown materials are silently ignored — only valid
   items are extracted.
4. **Given** the AI service is unavailable, **When** a message is sent, **Then**
   a friendly error message appears in the chat: "Mình đang gặp sự cố, thử
   lại nhé!"

---

### User Story 2 — Get AI Craft Suggestions for Unmatched Materials (Priority: P1)

When the child's materials don't match any library craft above 40%, the AI
attempts to suggest a custom craft. If the AI is confident the craft is
buildable, it provides a name, description, and step-by-step instructions.
If uncertain, it honestly refuses rather than inventing something unbuildable.

**Why this priority**: Honest AI suggestion vs refusal is the project's core
differentiator — directly tested during the interview demo.

**Independent Test**: Type "Em có vỏ trứng và dây ruy băng" → AI either
suggests a simple craft OR honestly says "Mình chưa nghĩ ra cách làm hay" →
no fabricated unbuildable craft appears.

**Acceptance Scenarios**:

1. **Given** extracted materials match no library craft, **When** the AI is
   confident, **Then** it returns a suggested craft with name, emoji, description,
   and full step instructions — clearly labeled as AI-generated with no 3D model.
2. **Given** extracted materials match no library craft, **When** the AI is
   uncertain, **Then** it refuses with a friendly message and does NOT invent
   a craft.
3. **Given** an AI-suggested craft is returned, **When** the child clicks it,
   **Then** Screen 2 loads with the AI craft, showing steps but a placeholder
   instead of a 3D model.

---

### User Story 3 — Get Build Help from AI Coach (Priority: P1)

On Screen 2, the child asks the AI coach ("Thợ Cả") for help during building.
The coach knows which craft is being built and which step the child is on.
Responses are short, practical, child-friendly Vietnamese. Safety warnings
appear when steps involve sharp tools or hot glue.

**Why this priority**: Coach interaction is the second AI mode demonstrated
at the interview and directly supports the build experience.

**Independent Test**: On Screen 2 building a craft → type "Keo không dính,
làm sao?" → coach responds with practical advice in 2-4 sentences → mentions
current step context.

**Acceptance Scenarios**:

1. **Given** the child asks a build-related question, **When** the coach
   responds, **Then** the response is 2-4 sentences, practical, and references
   the current craft and step.
2. **Given** a step involves scissors or hot glue, **When** the child asks
   about it, **Then** the coach always reminds to ask an adult for help.
3. **Given** the child asks an off-topic question, **When** processed, **Then**
   the coach politely redirects to the current craft.
4. **Given** the coach service is unavailable, **When** a message is sent,
   **Then** a friendly error appears in the chat bubble.

---

### User Story 4 — Switch Between Online and Offline AI (Priority: P2)

Through the settings panel, the child (or parent) can switch between an
online AI provider and a local offline AI. The app remembers this choice.
When offline mode is selected, a local server URL and model name can be
configured.

**Why this priority**: Offline capability is a constitution requirement but
configuring it is lower priority than the AI features themselves.

**Independent Test**: Open settings → switch to offline AI → enter server
URL → send chat message → response comes from local AI → switch back to
online → response comes from cloud AI.

**Acceptance Scenarios**:

1. **Given** online mode is active, **When** the child sends a chat message,
   **Then** the response comes from the cloud provider.
2. **Given** offline mode is selected, **When** the child sends a chat message,
   **Then** the response comes from the configured local server.
3. **Given** the local server is not running, **When** a message is sent, **Then**
   a clear error appears: "Không thể kết nối AI ngoại tuyến."
4. **Given** a provider choice is made, **When** the app is reopened, **Then**
   the same provider is active (persisted).

---

### Edge Cases

- What if the AI returns malformed JSON? → Parse error caught, user sees
  friendly error message, no crash.
- What if the AI response is too slow (>30s)? → Timeout, show error message
  in chat.
- What if the child sends empty message? → Send button disabled when input empty.
- What if the child rapidly sends multiple messages? → Each message queued,
  typing indicator shown, responses arrive in order.
- What if Gemini rate limit (15 RPM) is hit? → Retry with backoff, show
  "Đợi chút nhé..." if still failing.
- What if the AI generates a craft suggestion with zero steps? → Reject it,
  treat as refusal.

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide a chat interface on Screen 1 where children
  can describe their materials in natural Vietnamese.
- **FR-002**: System MUST extract recyclable material IDs from Vietnamese text
  using AI, mapping informal names to the 12 known material IDs.
- **FR-003**: System MUST offer extracted items for addition to the selection
  bag after AI processing.
- **FR-004**: System MUST attempt AI craft suggestions when extracted materials
  don't match any library craft above 40%.
- **FR-005**: System MUST enforce honest refusal — AI suggestions MUST only
  appear when the AI is confident the craft is buildable.
- **FR-006**: System MUST clearly label AI-suggested crafts as having no 3D
  model ("📝 Chỉ hướng dẫn").
- **FR-007**: System MUST provide a build coach chat on Screen 2 that knows
  the current craft and step number.
- **FR-008**: System MUST generate coach responses that are 2-4 sentences,
  practical, and child-friendly (ages 8-14).
- **FR-009**: System MUST include safety warnings when steps involve dangerous
  tools (scissors, knives, hot glue).
- **FR-010**: System MUST refuse to answer off-topic questions in coach mode.
- **FR-011**: System MUST support switching between online (cloud) and offline
  (local) AI providers.
- **FR-012**: System MUST persist the chosen AI provider in local storage.
- **FR-013**: System MUST show a typing indicator while waiting for AI responses.
- **FR-014**: System MUST handle AI errors gracefully with Vietnamese error
  messages in the chat — no crashes, no English error text.
- **FR-015**: System MUST timeout AI requests after 30 seconds.
- **FR-016**: System MUST provide server-side API endpoints for chat and coach
  to keep API keys secure.

### Key Entities

- **ChatMessage**: User or assistant message with role, content, timestamp.
  Maintained in chat component state.
- **LLMConfig**: Provider type (online/offline), server URL, model name.
  Persisted in localStorage, read by API routes via request headers or body.
- **ChatResponse**: AI response containing reply text, optionally extracted
  items, matched crafts, or suggested craft.
- **CoachResponse**: AI response containing reply text for build guidance.

## Success Criteria

### Measurable Outcomes

- **SC-001**: AI correctly extracts materials from 90%+ of natural Vietnamese
  messages containing known material names.
- **SC-002**: AI responses appear within 5 seconds for online mode under
  normal conditions.
- **SC-003**: Honest refusal triggers on at least 50% of adversarial inputs
  (unusual material combinations that have no reasonable craft).
- **SC-004**: Coach responses always stay under 5 sentences and reference the
  current craft context.
- **SC-005**: All AI error states show Vietnamese-only messages — zero English
  error text visible to children.
- **SC-006**: Switching between online/offline providers takes effect immediately
  on the next message — no app restart needed.

## Assumptions

- Gemini 2.0 Flash (free tier, 15 RPM) is the primary online provider.
- Ollama with Qwen 2.5 7B is the offline fallback.
- API keys are stored in `.env.local` on the server — never exposed to the client.
- LLM provider configuration (online vs offline) is stored in localStorage and
  sent with each request.
- Chat history is not persisted across page reloads — only maintained in
  component state during the session.
- The chat mode and inventory mode on Screen 1 are alternate views of the
  left panel — toggled by a mode switch.
- AI-suggested crafts are ephemeral — they don't get saved to the craft library.
