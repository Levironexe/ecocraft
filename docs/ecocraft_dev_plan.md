# EcoCraft AI — Development Plan

**Timeline:** ~4 build days + 2 weeks usage period before interview  
**Deadline:** Round 2 interview, 23–24 June 2026  
**Working hours:** Assume full-day focused build  
**Methodology:** Ship incrementally — each day ends with something runnable  
**Status:** Design locked, demo mockup complete (`demo/index.html`), app not yet scaffolded

---

## Pre-Development (Day 0)

**Blockers to resolve before writing any product code:**

- [ ] **Confirm Round 1 status.** Did the student submit a compatible *đề cương* by 3 June? If yes, get a copy — Round 2 must realize what was proposed. If no, contact Xuân Trang (0934.238.720) immediately. **This is a hard blocker.**
- [ ] **LLM provider test.** Run this exact input through each candidate:
  ```
  "Em có 3 cái chai nhựa, mấy cái ống hút và nắp chai nữa — làm được gì?"
  ```
  Test on: (a) Gemini 2.0 Flash free tier, (b) Groq free tier (Llama 3.1), (c) Ollama local (Qwen2.5-7B). Grade each on: correct item extraction, natural Vietnamese response, response time. Pick primary + fallback.
- [ ] **Define craft library contents.** Finalize exactly which crafts go in. For each craft, write down: name, materials, tools, steps. Separate into "showcase" (physically built for booth, gets 3D model) vs. "catalog-only" (steps only, no 3D). Target: 8–12 total, 3–5 showcase.
- [ ] **Install dependencies:**
  ```bash
  npm install @google/model-viewer @google/generative-ai
  ```
- [ ] **Create project structure:**
  ```
  ecocraft/
  ├── app/
  │   ├── layout.tsx              # Root layout, font loading, theme provider
  │   ├── page.tsx                # Main single-page app with tab switching
  │   ├── globals.css             # Tailwind base + CSS variables for themes
  │   ├── components/
  │   │   ├── HUD.tsx             # Top game bar (logo, stats, settings gear)
  │   │   ├── ScreenTabs.tsx      # Tab switcher (Chọn Vật Liệu / Xưởng Chế Tạo)
  │   │   ├── screen1/
  │   │   │   ├── MaterialScreen.tsx    # Screen 1 container (grid layout)
  │   │   │   ├── InventoryGrid.tsx     # 4-col material selection grid (left)
  │   │   │   ├── ChatMode.tsx          # AI free-form chat (left, alternate)
  │   │   │   ├── ItemPreview.tsx       # Single item preview + size/qty (right top)
  │   │   │   ├── SelectedItems.tsx     # "Đã Chọn" list + "Chế Tạo Ngay!" (right bottom)
  │   │   │   └── SuggestionCards.tsx   # Craft suggestions (full-width bottom section)
  │   │   ├── screen2/
  │   │   │   ├── BuildScreen.tsx       # Screen 2 container (3-col, viewport height)
  │   │   │   ├── MaterialsBar.tsx      # Materials + tools chips bar (top)
  │   │   │   ├── ModelViewer.tsx       # <model-viewer> wrapper (55% left column)
  │   │   │   ├── StepsList.tsx         # Quest-style craft steps (22.5% middle)
  │   │   │   └── CoachChat.tsx         # "Thợ Cả AI" build coach (22.5% right)
  │   │   ├── ui/
  │   │   │   ├── PixelBox.tsx          # Reusable pixel-border container
  │   │   │   ├── PixelButton.tsx       # Styled game button (green/coral variants)
  │   │   │   └── QuantityControl.tsx   # +/- quantity selector with display
  │   │   ├── ThemeProvider.tsx         # Theme context, CSS var injection, localStorage
  │   │   └── SettingsPanel.tsx         # Theme picker, LLM toggle, Ollama URL
  │   ├── lib/
  │   │   ├── crafts.ts           # Craft library — typed array of all crafts
  │   │   ├── materials.ts        # Material definitions (id, name, emoji, sizes)
  │   │   ├── themes.ts           # 4 theme palettes as typed objects
  │   │   ├── llm.ts              # LLM client abstraction (Gemini/Ollama switch)
  │   │   ├── prompts.ts          # System prompts (extraction, suggestion, coaching)
  │   │   ├── matcher.ts          # Deterministic craft-material matching
  │   │   ├── types.ts            # Shared TypeScript interfaces
  │   │   └── gamification.ts     # Points, level, localStorage read/write
  │   └── api/
  │       ├── chat/route.ts       # POST: item extraction + craft matching
  │       └── coach/route.ts      # POST: build coach conversation
  ├── public/
  │   └── models/                 # Pre-installed GLB files (one per showcase craft)
  │       ├── ten-lua.glb
  │       ├── chau-hoa.glb
  │       └── ...
  ├── demo/                       # Static HTML mockups (reference, not deployed)
  │   ├── index.html              # Default pixel sky-coral theme
  │   └── style-modern-minimal.html
  ├── docs/
  │   ├── ecocraft_ai_proposal.md
  │   ├── ecocraft_ai_handoff.md
  │   └── ecocraft_dev_plan.md    # This file
  └── package.json
  ```
- [ ] **Verify setup:**
  ```bash
  npm run dev     # localhost:3000 loads
  npm run build   # compiles without error
  ```

**Deliverable:** Empty but runnable project. Structure in place. Dependencies installed. LLM provider chosen.

---

## Day 1: Foundation + Data Layer + Screen 1 Static UI

### Morning: Data Models + Theme System (3–4 hours)

- [ ] Define all TypeScript interfaces in `lib/types.ts`:
  ```typescript
  interface Material {
    id: string;              // 'chai-nhua'
    name: string;            // 'Chai nhựa'
    emoji: string;           // '🧴'
    sizeOptions: string[];   // ['Lớn (1.5L)', 'Vừa (500ml)', 'Nhỏ (330ml)']
    category: 'plastic' | 'paper' | 'metal' | 'fabric' | 'wood' | 'glass' | 'other';
  }

  interface Craft {
    id: string;              // 'ten-lua-tai-che'
    name: string;            // 'Tên Lửa Tái Chế'
    emoji: string;           // '🚀'
    description: string;     // Short Vietnamese description
    difficulty: 1 | 2 | 3;
    ageMin: number;
    timeMinutes: number;
    materials: { materialId: string; quantity: number; sizePreference?: string }[];
    tools: string[];         // ['Kéo', 'Keo dán', 'Băng keo']
    steps: CraftStep[];
    modelPath: string | null;  // '/models/ten-lua.glb' or null
    isShowcase: boolean;
  }

  interface CraftStep {
    number: number;
    title: string;
    detail: string;
    tip?: string;
  }

  interface SelectedItem {
    materialId: string;
    size: string;
    quantity: number;
  }

  interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }

  interface Theme {
    id: string;
    name: string;            // Vietnamese display name
    bg: string;
    bgWarm: string;
    bgCard: string;
    text: string;
    textLight: string;
    textMuted: string;
    primary: string;
    primaryLight: string;
    primaryDark: string;
    accent: string;
    accentLight: string;
    hudGradientFrom: string;
    hudGradientTo: string;
    hudBorder: string;
    border: string;
    borderDark: string;
  }

  interface GameStats {
    craftsCompleted: number;
    itemsRecycled: number;
    coachMessages: number;
    level: number;
    points: number;
    activityDates: string[];  // ISO date strings
  }
  ```

- [ ] Write material data in `lib/materials.ts` — all 12+ items:
  ```typescript
  export const materials: Material[] = [
    { id: 'chai-nhua', name: 'Chai nhựa', emoji: '🧴', sizeOptions: ['Lớn (1.5L)', 'Vừa (500ml)', 'Nhỏ (330ml)'], category: 'plastic' },
    { id: 'ong-hut', name: 'Ống hút', emoji: '🥤', sizeOptions: ['Nhựa thường', 'Giấy', 'Inox'], category: 'plastic' },
    { id: 'giay-bao', name: 'Giấy báo', emoji: '📰', sizeOptions: ['Tờ lớn', 'Tờ nhỏ'], category: 'paper' },
    { id: 'lon-nuoc', name: 'Lon nước', emoji: '🥫', sizeOptions: ['330ml', '250ml'], category: 'metal' },
    { id: 'nap-chai', name: 'Nắp chai', emoji: '🧢', sizeOptions: ['Nắp nhựa', 'Nắp kim loại'], category: 'plastic' },
    { id: 'thung-carton', name: 'Thùng carton', emoji: '📦', sizeOptions: ['Lớn', 'Vừa', 'Nhỏ'], category: 'paper' },
    { id: 'loi-giay', name: 'Lõi giấy', emoji: '🧻', sizeOptions: ['Lõi giấy vệ sinh', 'Lõi giấy bếp'], category: 'paper' },
    { id: 'vai-vun', name: 'Vải vụn', emoji: '👕', sizeOptions: ['Vải cotton', 'Vải tổng hợp'], category: 'fabric' },
    { id: 'dua-go', name: 'Đũa gỗ', emoji: '🥢', sizeOptions: ['Đũa dài', 'Đũa ngắn'], category: 'wood' },
    { id: 'chai-thuy-tinh', name: 'Chai thủy tinh', emoji: '🍶', sizeOptions: ['Lớn', 'Nhỏ'], category: 'glass' },
    { id: 'day-ruy-bang', name: 'Dây ruy băng', emoji: '🎀', sizeOptions: ['Rộng', 'Hẹp'], category: 'fabric' },
    { id: 'vo-trung', name: 'Vỏ trứng', emoji: '🥚', sizeOptions: ['Trứng gà', 'Trứng vịt'], category: 'other' },
  ];
  ```

- [ ] Write craft library in `lib/crafts.ts` — all 8–12 crafts with complete Vietnamese steps. Example:
  ```typescript
  export const crafts: Craft[] = [
    {
      id: 'ten-lua-tai-che',
      name: 'Tên Lửa Tái Chế',
      emoji: '🚀',
      description: 'Tên lửa siêu ngầu từ chai nhựa, cánh làm từ ống hút, nắp chai làm cửa sổ phi hành gia!',
      difficulty: 2,
      ageMin: 8,
      timeMinutes: 30,
      materials: [
        { materialId: 'chai-nhua', quantity: 2, sizePreference: 'Vừa (500ml)' },
        { materialId: 'ong-hut', quantity: 4 },
        { materialId: 'nap-chai', quantity: 3 },
      ],
      tools: ['Kéo', 'Keo dán', 'Băng keo', 'Bút lông'],
      steps: [
        { number: 1, title: 'Chuẩn bị thân tên lửa', detail: 'Rửa sạch 1 chai nhựa lớn, lau khô. Đây là thân tên lửa chính.' },
        { number: 2, title: 'Cắt cánh tên lửa', detail: 'Cắt chai nhựa thứ 2 thành 4 miếng hình tam giác. Đây là cánh ổn định.', tip: 'Nhờ người lớn giúp khi dùng kéo cắt nhựa cứng!' },
        { number: 3, title: 'Gắn cánh vào thân', detail: 'Dùng keo dán gắn 4 cánh đều quanh đáy chai. Đợi keo khô 5 phút.', tip: 'Dán đối xứng 2 cánh trước, rồi 2 cánh còn lại.' },
        { number: 4, title: 'Làm đầu tên lửa', detail: 'Cuộn giấy thành hình nón, dán lên nắp chai. Gắn nón lên đầu chai.' },
        { number: 5, title: 'Trang trí & hoàn thiện', detail: 'Dán nắp chai làm cửa sổ phi hành gia. Dùng bút lông vẽ họa tiết. Gắn ống hút làm ăng-ten.' },
      ],
      modelPath: '/models/ten-lua.glb',
      isShowcase: true,
    },
    // ... 7-11 more crafts
  ];
  ```

- [ ] Write 4 theme palettes in `lib/themes.ts`:
  ```typescript
  export const themes: Record<string, Theme> = {
    'sky-coral': {
      id: 'sky-coral', name: 'Trời Xanh',
      bg: '#fff8f0', bgWarm: '#ffe8d6', bgCard: '#fffaf5',
      text: '#2d3436', textLight: '#636e72', textMuted: '#b2bec3',
      primary: '#2196f3', primaryLight: '#bbdefb', primaryDark: '#1565c0',
      accent: '#ff6b6b', accentLight: '#ffd0d0',
      hudGradientFrom: '#42a5f5', hudGradientTo: '#1565c0', hudBorder: '#0d47a1',
      border: '#d4c4b0', borderDark: '#9e8e7e',
    },
    'teal-peach': { /* ... */ },
    'indigo-mint': { /* ... */ },
    'brown-orange': { /* ... */ },
  };
  ```

- [ ] Build `ThemeProvider.tsx`:
  - Read theme from `localStorage` key `ecocraft-theme` (default: `sky-coral`)
  - Inject all CSS variables onto `:root` via `useEffect`
  - Expose `setTheme(id)` via React context
  - On mount, apply saved theme immediately (no flash of default)

- [ ] Build reusable UI components:
  - `PixelBox.tsx`: styled `<div>` with pixel borders matching `demo/index.html` `.pixel-box` class
  - `PixelButton.tsx`: variants — `primary` (green/blue), `accent` (coral/red), `ghost` (outlined). Props: `children`, `onClick`, `variant`, `fullWidth`, `disabled`
  - `QuantityControl.tsx`: `-` button, value display, `+` button. Props: `value`, `onChange`, `min` (default 1)

**Deliverable:** All data defined. Theme system working. UI primitives ready.

### Afternoon: Screen 1 Static UI (3–4 hours)

- [ ] Build `HUD.tsx`:
  - Logo (leaf icon + "EcoCraft AI")
  - Stats bar: ♻️ Đã tái chế: {n}, ⭐ Cấp độ: {n}, 🏆 Điểm: {n}
  - Gear icon → opens settings panel (build later)
  - Styled per theme (HUD gradient, border)
  - Read stats from `GameStats` context (hardcode for now)

- [ ] Build `ScreenTabs.tsx`:
  - Two tabs: "🎒 Chọn Vật Liệu" and "🔨 Xưởng Chế Tạo"
  - Active tab state stored in parent page component
  - Underline/border-top style per pixel theme
  - `onTabChange(tab: 1 | 2)` callback

- [ ] Build `MaterialScreen.tsx` (Screen 1 container):
  - Two-column grid layout: left 50%, right 50%
  - Height: `calc(100dvh - 70px)` (below HUD + tabs)
  - Left column has mode switch (inventory / chat) + search bar at top
  - Right column has item preview (top) + selected items (bottom)

- [ ] Build `InventoryGrid.tsx`:
  - 4-column grid, scrollable
  - Renders all materials from `lib/materials.ts`
  - Click → calls `onSelect(material)` to show in preview
  - Selected material gets highlight border + checkmark
  - Search bar filters by `material.name` (case-insensitive, diacritics-insensitive)

- [ ] Build `ItemPreview.tsx`:
  - Big emoji display
  - Material name
  - Size dropdown (populated from `material.sizeOptions`)
  - Quantity control (QuantityControl component)
  - "➕ Thêm vào túi" button → calls `onAdd(selectedItem)`

- [ ] Build `SelectedItems.tsx`:
  - "🎒 Đã Chọn" header
  - List of `SelectedItem` with emoji, name, size, quantity badge, remove ✕
  - "🚀 Chế Tạo Ngay!" button → calls `onCraft()` → switches to Screen 2

- [ ] Wire state in `page.tsx`:
  - `activeScreen: 1 | 2`
  - `selectedMaterial: Material | null`
  - `selectedItems: SelectedItem[]`
  - `previewSize: string`
  - `previewQty: number`
  - Pass handlers down to child components

**Day 1 deliverable:** Screen 1 fully interactive (no AI yet). Select materials from grid → preview → add to bag → click "Chế Tạo Ngay" → tab switches. Theme applied. VT323 font loaded and rendering Vietnamese correctly.

---

## Day 2: Screen 2 Static UI + Deterministic Matcher + Suggestions

### Morning: Screen 2 Build Workshop (3–4 hours)

- [ ] Build `BuildScreen.tsx` (Screen 2 container):
  - Receives `craft: Craft` and `selectedItems: SelectedItem[]` as props
  - Viewport height, no scrolling on outer container
  - 3-column grid: 55% | 22.5% | 22.5%
  - `body.screen2-active` class for overflow hidden on body

- [ ] Build `MaterialsBar.tsx`:
  - Full-width top bar
  - Chips for required materials (green/blue border) from `craft.materials`
  - Chips for required tools (brown border) from `craft.tools`
  - Craft name, difficulty stars, time, age range

- [ ] Build `ModelViewer.tsx`:
  - If `craft.modelPath` exists: render `<model-viewer>` web component
    ```tsx
    <model-viewer
      src={craft.modelPath}
      auto-rotate
      camera-controls
      shadow-intensity="1"
      style={{ width: '100%', height: '100%' }}
    />
    ```
  - If `craft.modelPath` is null: render placeholder
    ```
    📝 Gợi ý từ AI — không có mô hình 3D
    ```
  - Viewer controls overlay: rotate reset, zoom in, zoom out
  - Note: `<model-viewer>` is a web component — use `declare` in a `model-viewer.d.ts` file to suppress TypeScript errors:
    ```typescript
    declare namespace JSX {
      interface IntrinsicElements {
        'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
          src?: string; 'auto-rotate'?: boolean; 'camera-controls'?: boolean; 'shadow-intensity'?: string;
        };
      }
    }
    ```

- [ ] Build `StepsList.tsx`:
  - Scrollable middle column
  - Receives `steps: CraftStep[]` and `completedSteps: Set<number>`
  - Three visual states per step:
    - **Done:** dimmed, green checkmark, strikethrough
    - **Current:** orange pulse border, highlighted
    - **Pending:** grey, default
  - Current step = lowest step number not in `completedSteps`
  - Click step to toggle done/undone
  - Each step shows: number, title, detail, optional tip (💡)

- [ ] Build `CoachChat.tsx` (static, no AI yet):
  - "Thợ Cả AI" header with avatar, name, status indicator
  - Message list (scrollable, auto-scroll to bottom)
  - Messages styled: bot = left-aligned white bubble, kid = right-aligned colored bubble
  - Input bar + send button (non-functional for now, hardcode mock messages)
  - Props: `craftName: string`, `currentStep: number`

**Deliverable:** Screen 2 renders with mock data. 3-column layout fits viewport. Steps are clickable. 3D viewer placeholder shows spinning cube.

### Afternoon: Deterministic Matcher + Suggestions (3–4 hours)

- [ ] Build `lib/matcher.ts` — deterministic craft-material matching:
  ```typescript
  interface MatchResult {
    craft: Craft;
    matchPercent: number;     // 0-100
    matchedMaterials: string[];
    missingMaterials: string[];
  }

  function matchCrafts(selected: SelectedItem[], crafts: Craft[]): MatchResult[] {
    // For each craft:
    //   Count how many of its required materials are in the selected items
    //   matchPercent = matched / required * 100
    //   Ignore quantity for matching (just presence)
    //   Sort results by matchPercent descending
    //   Return all crafts with matchPercent >= 40%
  }
  ```
  - Edge case: if selected items is empty, return empty array
  - Edge case: if a craft requires 0 materials (shouldn't happen), skip it
  - Test: `['chai-nhua', 'ong-hut', 'nap-chai']` → Tên Lửa should match 100%

- [ ] Build `SuggestionCards.tsx`:
  - Full-width section below Screen 1 main area (standalone, not inside pixel-box)
  - 3-column grid of suggestion cards
  - Each card shows: emoji, craft name, match %, description, tag (🎮 Có 3D / 📝 Chỉ hướng dẫn)
  - Click → load that craft into Screen 2 and switch tabs
  - If no matches → show message: "Thêm vật liệu để xem gợi ý!"

- [ ] Wire matcher into Screen 1 state:
  - Whenever `selectedItems` changes → run `matchCrafts()` → update suggestions
  - Pass top 3 results to `SuggestionCards`
  - Pass selected craft to `BuildScreen` when switching to Screen 2

**Day 2 deliverable:** Both screens fully interactive with real data flow. Select items → see matching craft suggestions → click one → Screen 2 loads with that craft's 3D placeholder, steps, materials bar. No AI calls yet — everything is deterministic.

---

## Day 3: AI Integration (All 3 Modes)

### Morning: LLM Abstraction + API Routes (3–4 hours)

- [ ] Build `lib/llm.ts` — provider abstraction:
  ```typescript
  type LLMProvider = 'gemini' | 'ollama';

  interface LLMConfig {
    provider: LLMProvider;
    ollamaUrl?: string;      // default: 'http://localhost:11434'
    ollamaModel?: string;    // default: 'qwen2.5:7b'
  }

  async function chat(
    systemPrompt: string,
    messages: { role: 'user' | 'assistant'; content: string }[],
    config: LLMConfig
  ): Promise<string> {
    if (config.provider === 'gemini') {
      // Use @google/generative-ai SDK
      // Model: 'gemini-2.0-flash-lite' (free tier)
      // API key from process.env.GEMINI_API_KEY
    } else {
      // POST to config.ollamaUrl + '/api/chat'
      // Body: { model: config.ollamaModel, messages: [...], stream: false }
    }
  }
  ```
  - Gemini: handle rate limits (15 RPM on free tier) — add simple retry with backoff
  - Ollama: handle connection refused (server not running) — return friendly error
  - Both: timeout after 30 seconds

- [ ] Write system prompts in `lib/prompts.ts`:

  **ITEM_EXTRACTION_PROMPT:**
  ```
  Bạn là trợ lý của ứng dụng EcoCraft AI. Nhiệm vụ: đọc tin nhắn tiếng Việt của trẻ em và trích xuất các vật liệu tái chế.

  Trả về CHÍNH XÁC JSON array (không có text khác): [{"id": "material-id", "quantity": number}]

  Danh sách vật liệu hợp lệ (id — các tên thường gặp):
  - chai-nhua — chai nhựa, chai nước, chai pet, chai coca
  - ong-hut — ống hút, ống hút nhựa
  - giay-bao — giấy báo, giấy, báo cũ, giấy vụn
  - lon-nuoc — lon, lon bia, lon nước ngọt, lon pepsi
  - nap-chai — nắp chai, nắp nhựa, nắp lon
  - thung-carton — thùng carton, hộp giấy, hộp carton, thùng bìa
  - loi-giay — lõi giấy, lõi giấy vệ sinh, ống giấy
  - vai-vun — vải vụn, vải cũ, áo cũ, quần cũ
  - dua-go — đũa gỗ, đũa, que gỗ, que kem
  - chai-thuy-tinh — chai thủy tinh, chai lọ, bình thủy tinh
  - day-ruy-bang — dây ruy băng, ruy băng, dây, dây nơ
  - vo-trung — vỏ trứng

  Nếu số lượng không rõ, ước lượng hợp lý (mặc định 2-3).
  Nếu vật liệu không trong danh sách, bỏ qua nó.
  CHỈ trả về JSON array, không giải thích gì thêm.
  ```

  **CRAFT_SUGGESTION_PROMPT:**
  ```
  Bạn là trợ lý sáng tạo của EcoCraft AI. Trẻ em có các vật liệu tái chế sau nhưng KHÔNG khớp với thư viện sản phẩm có sẵn.

  Vật liệu có: {materials_json}

  QUY TẮC TUYỆT ĐỐI — vi phạm bất kỳ quy tắc nào đều KHÔNG CHẤP NHẬN:
  1. Chỉ gợi ý nếu bạn CHẮC CHẮN 100% rằng sản phẩm có thể làm được từ CHÍNH XÁC các vật liệu này.
  2. Nếu không chắc chắn → trả lời canSuggest = false.
  3. KHÔNG BAO GIỜ bịa ra sản phẩm không thể làm được.
  4. KHÔNG nói có mô hình 3D.

  Trả về CHÍNH XÁC JSON (không text khác):
  Nếu gợi ý được:
  {"canSuggest": true, "name": "tên sản phẩm", "emoji": "emoji", "description": "mô tả ngắn 1 câu", "steps": [{"number": 1, "title": "bước 1", "detail": "chi tiết"}, ...]}

  Nếu không:
  {"canSuggest": false, "message": "Mình chưa nghĩ ra cách làm hay với những thứ này. Bạn thử thêm vật liệu khác xem sao nhé!"}
  ```

  **BUILD_COACH_PROMPT:**
  ```
  Bạn là "Thợ Cả", trợ lý hướng dẫn thủ công cho trẻ em Việt Nam trong ứng dụng EcoCraft AI.

  Sản phẩm đang làm: {craft_name}
  Bước hiện tại (bước {step_number}): {step_title} — {step_detail}
  Tất cả các bước: {steps_summary}

  QUY TẮC:
  - Trả lời ngắn gọn (2-4 câu), thân thiện, dễ hiểu cho trẻ 8-14 tuổi.
  - Cho lời khuyên thực tế cụ thể (cách dán, cách cắt, cách trang trí).
  - Nếu bước nguy hiểm (kéo, dao, keo nóng), LUÔN nhắc nhờ người lớn.
  - Khuyến khích khi trẻ gặp khó khăn.
  - Dùng emoji ít thôi (1-2 per message max).
  - KHÔNG trả lời câu hỏi không liên quan đến sản phẩm đang làm.
  - KHÔNG bịa thông tin kỹ thuật sai.
  ```

- [ ] Build `/api/chat/route.ts`:
  ```typescript
  // POST request body:
  interface ChatRequest {
    message: string;
    history: ChatMessage[];
    selectedItems: SelectedItem[];
    mode: 'extract' | 'suggest';
  }

  // Response:
  interface ChatResponse {
    reply: string;                    // Vietnamese response text to display
    extractedItems?: SelectedItem[];  // If extraction mode
    suggestedCraft?: Craft;           // If AI suggests a new craft (not in library)
    matchedCrafts?: MatchResult[];    // If library matches found
  }

  // Logic:
  // 1. Send user message + ITEM_EXTRACTION_PROMPT to LLM
  // 2. Parse JSON response → extracted items
  // 3. Run matcher against library with extracted items
  // 4. If matches found → return matchedCrafts
  // 5. If no matches → send materials to LLM with CRAFT_SUGGESTION_PROMPT
  // 6. Parse JSON → if canSuggest, construct ad-hoc Craft with modelPath: null
  // 7. Build natural Vietnamese reply text summarizing what was found
  ```

- [ ] Build `/api/coach/route.ts`:
  ```typescript
  // POST request body:
  interface CoachRequest {
    message: string;
    history: ChatMessage[];
    craftId: string;
    currentStep: number;
  }

  // Response:
  interface CoachResponse {
    reply: string;
  }

  // Logic:
  // 1. Look up craft by ID from library
  // 2. Build BUILD_COACH_PROMPT with craft context
  // 3. Send user message + history + system prompt to LLM
  // 4. Return response text
  ```

- [ ] Add `.env.local` with `GEMINI_API_KEY=xxx` (get from Google AI Studio)

### Afternoon: Wire AI Into UI (3–4 hours)

- [ ] Build `ChatMode.tsx` — AI conversation for Screen 1 left panel:
  - NPC header (avatar, name, role)
  - Message list (scrollable, auto-scroll on new message)
  - Input + send button
  - On send:
    1. Add user message to list
    2. Show typing indicator (animated dots)
    3. `POST /api/chat` with message + history + selectedItems
    4. Parse response
    5. Add assistant reply to list
    6. If `extractedItems` returned → offer to add to selected items
    7. If `matchedCrafts` returned → update suggestion cards
    8. If `suggestedCraft` returned → add to suggestions as "📝 Chỉ hướng dẫn"
  - Error handling: if API fails, show "Mình đang gặp sự cố, thử lại nhé!" in chat

- [ ] Wire `CoachChat.tsx` to `/api/coach`:
  - Same pattern: send message → typing indicator → display reply
  - Automatically include `craftId` and `currentStep` from BuildScreen state
  - Coach is context-aware: knows which step the kid is on

- [ ] Test the full flow end-to-end:
  1. Open chat → type "Em có 3 cái chai nhựa và ống hút"
  2. AI extracts items → suggestions appear
  3. Click suggestion → Screen 2 loads
  4. In coach chat → type "Keo không dính, làm sao?"
  5. Coach responds with practical Vietnamese advice
  6. Test refusal: type "Em có vỏ trứng và dây ruy băng" → AI should either suggest something simple or refuse honestly

- [ ] Test offline mode (if Ollama chosen as fallback):
  ```bash
  ollama serve
  ollama run qwen2.5:7b
  # Set provider to ollama in settings
  # Verify app works without internet
  ```

**Day 3 deliverable:** Full AI pipeline working. Chat extracts items, matcher finds crafts, AI suggests when no library match (or refuses), coach helps during build. "Refuse, don't invent" rule enforced. Both Gemini and Ollama paths tested.

---

## Day 4: 3D Models + Gamification + Settings + Polish

### Morning: 3D Model Pipeline + Gamification (3–4 hours)

- [ ] **3D model generation** (partially parallel — can start builds physically earlier):
  1. For each showcase craft (3–5 crafts):
     - Physically build the craft
     - Photograph on white/clean background, best angle
     - Upload to Meshy (image-to-3D)
     - Download GLB file
     - Check file size (target <5MB per model)
     - Test in `<model-viewer>` — verify it loads and looks reasonable
  2. Place files in `public/models/{craft-id}.glb`
  3. Update `craft.modelPath` in `lib/crafts.ts` to match filenames
  4. Verify: navigate to craft in app → 3D model loads and auto-rotates

- [ ] Build `lib/gamification.ts`:
  ```typescript
  const STORAGE_KEY = 'ecocraft-stats';

  function getStats(): GameStats {
    // Read from localStorage, return default if not found
    return { craftsCompleted: 0, itemsRecycled: 0, coachMessages: 0, level: 1, points: 0, activityDates: [] };
  }

  function saveStats(stats: GameStats): void {
    // Write to localStorage
  }

  function completeCraft(stats: GameStats, craft: Craft): GameStats {
    // +1 craftsCompleted
    // +N itemsRecycled (sum of craft material quantities)
    // +50 points (craft completion bonus)
    // +10 points per step completed
    // Recalculate level: 1 (0-99pts), 2 (100-249), 3 (250-499), 4 (500-999), 5 (1000+)
    // Add today's date to activityDates (dedup)
  }

  function recordCoachMessage(stats: GameStats): GameStats {
    // +1 coachMessages, +5 points
  }
  ```

- [ ] Wire gamification into HUD — read stats from localStorage, display live
- [ ] Wire into Screen 2:
  - When all steps marked done → trigger `completeCraft()` → show celebration message
  - When coach message sent → trigger `recordCoachMessage()`

### Afternoon: Settings Panel + Polish (3–4 hours)

- [ ] Build `SettingsPanel.tsx`:
  - Accessible from gear icon in HUD
  - **Theme picker:** 4 options shown as color swatch circles with names (Trời Xanh, Nhiệt Đới, Bạc Hà, Xưởng Gỗ). Click → apply immediately. Save to localStorage.
  - **LLM provider toggle:** Radio buttons — Gemini (online) / Ollama (offline). When Ollama selected, show URL input field (default: `http://localhost:11434`) and model name input (default: `qwen2.5:7b`). Save to localStorage.
  - **Stats display:** Total crafts completed, total items recycled, days active (read from GameStats)
  - Close button

- [ ] Polish pass — match `demo/index.html` aesthetics:
  - Scanline overlay (subtle CSS repeating gradient on `::after` pseudo-element)
  - Floating pixel particles (CSS animated divs, 15 particles, random colors from theme)
  - Leaf bob animation on HUD logo
  - Coach avatar idle animation (gentle bounce)
  - Step pulse animation on current step
  - Hover effects on all interactive elements
  - Scrollbar styling (thin, themed)

- [ ] Responsive check:
  - Test on laptop screen (1366x768 — common for demo at venue)
  - Ensure Screen 2 fits viewport without scrolling
  - Ensure inventory grid doesn't overflow

- [ ] Vietnamese text check:
  - Verify VT323 renders all diacritics correctly: ắ, ặ, ề, ố, ừ, etc.
  - Check all UI strings are Vietnamese (no English leaking)
  - Verify LLM responses are natural Vietnamese (not translation-sounding)

- [ ] Error state handling:
  - API down → show error message in chat, don't crash
  - GLB file missing → show text placeholder, don't break layout
  - No internet + no Ollama → show "Không có kết nối AI" message, keep deterministic features working
  - Empty selected items → disable "Chế Tạo Ngay!" button, show hint

**Day 4 deliverable:** Complete app with 3D models, gamification, settings, and polish. Ready for deployment.

---

## Day 5 (buffer): Testing + Demo Prep + Deployment

### Testing (2 hours)

- [ ] Test the complete demo flow end-to-end (record screen while testing):
  1. Open app → Screen 1 visible
  2. Click materials in grid → preview updates → add to bag
  3. See suggestion cards update with matches
  4. Switch to chat mode → type Vietnamese description → AI responds
  5. Click suggestion → Screen 2 loads with craft
  6. 3D model rotates, steps list shows, coach chat works
  7. Click steps to mark done → gamification counter increments
  8. Ask coach for help → get practical Vietnamese response
  9. Complete all steps → celebration / points awarded

- [ ] Test honest refusal:
  - Type "vỏ trứng và dây ruy băng — làm được gì?" → AI should refuse or suggest something very simple
  - Verify response includes honest admission, not a made-up craft

- [ ] Test offline mode:
  - Kill internet → verify local LLM still works
  - Verify 3D models still load (they're in /public/, no network needed)
  - Verify deterministic features (inventory, matcher, steps) work without AI

- [ ] Test theme switching:
  - Switch between all 4 themes → verify colors update instantly
  - Refresh page → verify theme persists

### Deployment (1 hour)

- [ ] Push to GitHub
- [ ] Connect to Vercel:
  - Add `GEMINI_API_KEY` as environment variable
  - Deploy
  - Verify production build works at deployed URL

- [ ] Test deployed version:
  - Open on phone browser (judge might use phone)
  - Test on laptop in Chrome and Edge

### Demo Video (1 hour)

- [ ] Record backup demo video (required for city-level round anyway):
  - Screen recording showing the full flow
  - Voiceover in Vietnamese by the student
  - Keep under 3 minutes
  - Save to USB drive as backup for interview day

**Day 5 deliverable:** App deployed, tested, demo video recorded. Ready for usage period.

---

## Usage Period (June 10–22, ~2 weeks)

The student uses the app daily. This generates the real usage data for the interview.

### What the student does:
- [ ] Use the app every day (even just 5 minutes)
- [ ] Try different material combinations
- [ ] Build at least 3 crafts physically using the app's instructions
- [ ] Use the coach chat when stuck
- [ ] Photograph each completed craft

### What gets tracked (in localStorage → `GameStats`):
- Crafts completed (count)
- Items recycled (sum of materials used)
- Coach messages sent
- Points and level
- Activity dates (for usage frequency chart)

### Interview prep (June 22):
- [ ] Build simple stats display (can be a "Thống Kê" section or modal):
  - Bar chart: crafts per day (simple CSS bars, no library needed)
  - Total items diverted from trash
  - Favorite materials
  - Days active
- [ ] Student practices demo flow 3+ times
- [ ] Student can explain in Vietnamese:
  - What the app does ("Ứng dụng giúp em biến rác tái chế thành đồ chơi")
  - What AI does vs. what the library does ("Thư viện có sẵn đồ chắc chắn, AI giúp hiểu lời em nói và trò chuyện")
  - Why honest refusal matters ("Nếu AI không biết, nó nói thẳng, không bịa ra")
  - How they used it and what they learned

---

## Craft Library (Starter Set)

| # | ID | Name | Materials | Tools | Showcase? | Difficulty | 3D? |
|---|---|---|---|---|---|---|---|
| 1 | ten-lua-tai-che | Tên Lửa Tái Chế | Chai nhựa x2, ống hút x4, nắp chai x3 | Kéo, keo dán, băng keo, bút lông | Yes | ⭐⭐ | Yes |
| 2 | chau-hoa-mini | Chậu Hoa Mini | Chai nhựa x1, nắp chai x5 | Kéo, sơn, bút lông | Yes | ⭐ | Yes |
| 3 | robot-hop-giay | Robot Hộp Giấy | Thùng carton x2, nắp chai x4, lõi giấy x2 | Kéo, keo dán, bút lông | Yes | ⭐⭐⭐ | Yes |
| 4 | ong-nhom-phieu-luu | Ống Nhòm Phiêu Lưu | Lõi giấy x2, dây ruy băng x1 | Kéo, keo dán, bút lông | No | ⭐ | No |
| 5 | xe-dua-chai-nhua | Xe Đua Chai Nhựa | Chai nhựa x1, nắp chai x4, đũa gỗ x2 | Kéo, keo dán | Yes | ⭐⭐ | Yes |
| 6 | heo-tiet-kiem | Heo Tiết Kiệm | Chai nhựa x1, giấy báo, nắp chai x4 | Kéo, keo dán, sơn | No | ⭐⭐ | No |
| 7 | chuong-gio | Chuông Gió | Lon nước x3, dây ruy băng, đũa gỗ x1 | Kéo, búa nhỏ (đục lỗ lon) | No | ⭐ | No |
| 8 | buom-loi-giay | Bướm Lõi Giấy | Lõi giấy x1, giấy báo, vải vụn | Kéo, keo dán, bút lông | No | ⭐ | No |

**Showcase crafts** (physically built, Meshy 3D generated): #1, #2, #3, #5  
**Catalog-only** (steps + AI coach, no 3D): #4, #6, #7, #8

---

## Risk Checklist

| Risk | Mitigation | Owner | Status |
|---|---|---|---|
| Round 1 proposal incompatible | Check IMMEDIATELY — hard blocker | Builder | **URGENT** |
| AI hallucinates unbuildable craft | System prompt enforces refusal; deterministic matcher is primary path; test with 10+ edge cases | Builder | Designed |
| Venue wifi fails | Ollama + local GLBs = fully offline app; phone hotspot as backup; pre-recorded video on USB | Builder | Designed |
| Meshy GLBs too large (>5MB) | Optimize in Meshy settings; compress with gltf-pipeline if needed; target <3MB each | Builder | Pending |
| Vietnamese quality poor on local model | Test before committing; keep Gemini as primary; tune prompts for local model separately | Builder | Pending |
| VT323 font missing Vietnamese diacritics | Already tested — VT323 supports Vietnamese. Fallback: Be Vietnam Pro | Builder | Verified |
| Meshy license issues | Check plan terms; free tier requires attribution → add in app footer: "3D models: Meshy" | Builder | Pending |
| Student can't explain AI | Rehearse 3+ times; prepare 3 simple sentences student memorizes | Builder + Student | Pending |
| Feature creep | This plan IS the scope. No additions without removing something equal. | Builder | Active |
| Gemini free tier rate limit (15 RPM) | Add retry logic with backoff; demo typically needs <5 requests total | Builder | Designed |

---

## Budget

| Item | Cost | Status |
|---|---|---|
| Meshy 3D generation (4 showcase models) | ~$20 | Pending |
| Craft materials for physical builds | ~$10–20 | Pending |
| Gemini API (free tier) | $0 | Ready |
| Vercel hosting (free tier) | $0 | Ready |
| VT323 font (Google Fonts) | $0 | Ready |
| **Total** | **~$30–40** | — |

Remaining from $350 budget: ~$310 buffer.

---

## Demo Script (23–24 June Interview)

### Setup Checklist
- [ ] Laptop charged, app running at localhost (offline mode ready)
- [ ] Phone hotspot configured as backup internet
- [ ] Pre-recorded demo video on USB
- [ ] 3–4 physical showcase crafts on table
- [ ] Student has practiced full flow 3+ times

### Script (5–7 minutes)

1. **[30s — Physical]** Student points to crafts on table: *"Đây là các đồ chơi em đã làm từ rác tái chế bằng ứng dụng EcoCraft AI."*

2. **[60s — Chat Demo]** Open app → Chat mode → Judge names some items → Student types (or judge types) → AI recognizes, extracts, shows matching crafts with match percentages.

3. **[30s — 3D Preview]** Click top suggestion → Screen 2 → 3D model rotates on screen. *"Mỗi sản phẩm trong thư viện đều có mô hình 3D để em hình dung trước khi làm."*

4. **[60s — Steps + Coach]** Show step list → Click a step → Ask coach: *"Keo không dính, làm sao anh?"* → Coach responds with practical Vietnamese advice. *"AI Thợ Cả giúp em khi bị kẹt ở bước nào."*

5. **[30s — Honest Refusal]** Back to chat → Give odd combo (*"vỏ trứng và ống hút"*) → AI refuses honestly. *"Ứng dụng không bịa — nếu không biết thì nói thẳng."*

6. **[30s — Data]** Show usage stats: *"Em đã dùng app 2 tuần. Tái chế X vật liệu, làm Y sản phẩm."*

7. **[60s — Explain]** Student explains:
   - *"Thư viện cho đồ chắc chắn có thể làm được. AI giúp hiểu lời em nói và hướng dẫn khi em gặp khó khăn."*
   - *"Ứng dụng chạy được cả khi không có wifi."*
   - *"Em muốn giúp các bạn nhỏ biến rác thành đồ chơi thay vì vứt đi."*

### If Asked:
- **"AI có tự nghĩ ra đồ chơi không?"** → *"Có, nhưng chỉ khi chắc chắn làm được. Nếu không chắc, nó nói thẳng là chưa nghĩ ra."*
- **"Em tự làm ứng dụng này à?"** → *"Dạ, em được anh/chị hỗ trợ phần code. Em hiểu cách nó hoạt động và tự dùng nó để làm đồ chơi."*
- **"Mô hình 3D có chính xác không?"** → *"Mô hình 3D là hình minh họa để em hình dung. Hướng dẫn chi tiết từng bước mới là cách làm chính xác."*

---

*End of development plan.*
