<!--
Sync Impact Report
==================
Version change: N/A → 1.0.0 (initial ratification)
Modified principles: N/A (first version)
Added sections:
  - Core Principles (7 principles)
  - Technology Constraints
  - Development Workflow
  - Governance
Removed sections: N/A
Templates requiring updates:
  - .specify/templates/plan-template.md — compatible (Constitution Check section exists)
  - .specify/templates/spec-template.md — compatible (user stories + requirements sections align)
  - .specify/templates/tasks-template.md — compatible (phase structure aligns with incremental delivery)
Follow-up TODOs: None
-->

# Rác Thải Xanh AI Constitution

## Core Principles

### I. Library-First, Deterministic-Primary
The deterministic craft library and matcher MUST be the primary path for craft
suggestions. AI is a secondary enhancement — never the sole source of truth.
Every craft recommendation MUST trace to either a curated library entry or an
explicitly AI-generated suggestion clearly labeled as such. If AI is unavailable,
the app MUST remain fully functional for browsing, selecting materials, and
viewing library crafts.

### II. Honest Refusal Over Hallucination (NON-NEGOTIABLE)
AI MUST refuse to suggest crafts it cannot verify are physically buildable from
the given materials. System prompts MUST enforce `canSuggest: false` when
uncertain. No craft suggestion may be fabricated. This is the project's core
differentiator and MUST be tested with adversarial inputs before every release.

### III. Vietnamese-Native UX
All user-facing text MUST be natural Vietnamese — not machine-translated. Font
rendering MUST support full Vietnamese diacritics (VT323 verified, fallback:
Be Vietnam Pro). LLM responses MUST read naturally to a Vietnamese child aged
8–14. English MUST NOT leak into any UI surface.

### IV. Offline-Capable Architecture
The app MUST function without internet connectivity. Local LLM (Ollama) MUST be
a supported fallback. All 3D models (GLB) MUST be served from `/public/models/`,
not fetched from CDN. Deterministic features (inventory, matcher, steps, themes)
MUST work with zero network calls.

### V. Ship Incrementally — Always Runnable
Each development day MUST end with a runnable deliverable. No multi-day work
without a working intermediate state. `npm run dev` and `npm run build` MUST
pass at end of every work session. Broken builds MUST NOT be committed to main.

### VI. Child-Safe Interactions
All AI interactions MUST be appropriate for children aged 8–14. Coach responses
MUST warn about dangerous tools (scissors, hot glue, knives) and remind to ask
an adult. No violent, inappropriate, or off-topic content may be generated. AI
MUST refuse off-topic questions that do not relate to the current craft.

### VII. Minimal Viable Polish
UI MUST match the pixel-art game aesthetic established in `demo/index.html`.
Four theme palettes MUST be supported. Gamification (points, levels, stats) MUST
use localStorage only — no backend persistence required. Visual polish (scanlines,
particles, animations) is required but MUST NOT block functionality.

## Technology Constraints

- **Framework**: Next.js (App Router) with TypeScript
- **Styling**: Tailwind CSS + CSS custom properties for theming
- **3D**: `@google/model-viewer` web component for GLB rendering
- **LLM Providers**: Gemini 2.0 Flash (primary, free tier) + Ollama (offline fallback)
- **Font**: VT323 (Google Fonts) — Vietnamese diacritics verified
- **Deployment**: Vercel (free tier)
- **State**: React state + localStorage — no database, no auth, no backend persistence
- **API Routes**: Next.js route handlers for LLM proxy (`/api/chat`, `/api/coach`)
- **Package Budget**: Minimal — `@google/generative-ai`, `@google/model-viewer`,
  Tailwind, and standard Next.js dependencies only. No UI component libraries.
  No state management libraries. No charting libraries.

## Development Workflow

- **Timeline**: ~4 build days + 2 weeks student usage before 2026-06-23 interview
- **Branching**: Feature branches per day, merge to main when deliverable passes
- **Quality Gates**:
  - `npm run build` MUST pass before merge
  - End-to-end demo flow MUST be manually tested
  - Vietnamese text MUST be reviewed for naturalness
  - Adversarial AI refusal MUST be tested (odd material combos)
- **Commit Style**: Conventional commits (`feat:`, `fix:`, `docs:`, `style:`)
- **No Tests Required**: Given timeline constraints, automated tests are NOT
  required. Manual end-to-end testing is the quality gate.
- **3D Models**: Generated via Meshy (image-to-3D) from physical craft photos.
  Target <5MB per GLB. Attribution required in app footer.

## Governance

This constitution supersedes all other development practices for Rác Thải Xanh AI.
All implementation decisions MUST be evaluated against these principles.

**Amendment Procedure**:
1. Document proposed change with rationale
2. Evaluate impact on existing code and dependent artifacts
3. Update constitution version per semver rules
4. Propagate changes to spec/plan/task templates

**Compliance**:
- Every spec MUST include a Constitution Check section
- Plans MUST verify alignment before Phase 0 research
- Violations MUST be justified in a Complexity Tracking table

**Version**: 1.0.0 | **Ratified**: 2026-06-06 | **Last Amended**: 2026-06-06
