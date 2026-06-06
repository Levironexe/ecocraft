# EcoCraft AI — Session Handoff

> **Purpose of this document.** This is a context transfer for a *new* LLM session. It summarizes a project's current design, the reasoning behind it, the alternatives already rejected (so they are not re-proposed), and the open questions. Read the "Hard constraints" section before suggesting anything.

---

## TL;DR (current state)

Building a **web app for a ~7th-grade student** to enter (and win) a Vietnamese youth creativity contest. The app: a child describes the recyclable items they have in plain Vietnamese; an **AI assistant** matches them to a **verified craft library**, shows steps + a **pre-installed 3D model**, and **coaches them through the build** via chat. The design is locked at the concept level. A full proposal exists (`ecocraft_ai_proposal.md`). The app has **not** been scaffolded yet.

## Who / what

- **Builder:** an experienced developer (the person in the conversation), building the app on behalf of the student. Comfortable with Next.js/React, .NET, Supabase, TypeScript, LLM/agent tooling, LM Studio.
- **Contestant:** a ~7th grader (age ~12–13) who must **present and be interviewed** in person. The student must be able to explain and own the project.
- **Budget:** ~$350 USD (~9M VND).

## Contest facts (from the official plan PDF)

- **Event:** Cuộc thi Sáng tạo thanh thiếu niên, nhi đồng — Cụm 6, Đồng Nai, 2026.
- **Ages:** 6–18 (so a 12-yo competes against up to 18-yo). Encourages disabled/disadvantaged entrants.
- **Eligible fields (5):** study aids; computer software; eco-friendly products; household items & children's toys; climate/environment/economic-development solutions. *(Environment is the most-weighted theme.)*
- **Two rounds:**
  - Round 1 = written proposal (*đề cương*), **due 3 June 2026**, judged 8–9 June.
  - Round 2 = **build the model + in-person interview**, 23–24 June. Winners advance to city level (submit by 28 June).
- **Rubric (memorize):** *tính mới* (novelty), *tính sáng tạo* (creativity), *tính khoa học* (scientific merit), *ứng dụng thực tiễn* (practical applicability).
- **Prizes:** 1st 7M / 2nd 5M / 3rd 3.5M / consolation 2.5M VND + medals.

## FINAL DESIGN (decided)

**Three components, split by what only AI can do vs. what a library does reliably:**

1. **Verified craft library = deterministic backbone.** Curated crafts, each with Vietnamese steps and a **pre-installed 3D model (GLB)**. A few "showcase" crafts are also **physically built** for the booth. Everything in the library is known-good and has a model.

2. **Natural-language assistant = the AI interface + careful reasoner.** Child types/speaks freely (e.g. *"3 nắp chai, 2 chai nước ngọt, 1 tờ giấy ăn — làm được gì?"*). The AI:
   - understands free-form input and extracts items;
   - matches against the library → if hit, show craft + 3D + steps;
   - if no library match **and** it is confident a sensible craft is buildable → suggest it as **text only, no 3D**;
   - otherwise **refuses honestly** ("can't think of one"). **Rule: refuse, don't invent.**

3. **Conversational build coach = the second irreplaceable AI use.** Free-form help while building (*"kẹt ở bước 3, nắp không dính"*).

**Where the AI genuinely earns its place** (not decoration): free-form NL understanding, bounded careful reasoning (with honest refusal), and live coaching. The library itself is intentionally non-AI.

**Tech & cost:**
- Vibecoded web app, single-purpose, Vietnamese UI.
- 3D shown via `<model-viewer>` from **pre-installed GLBs only — no runtime 3D generation, ever.**
- 3D models generated **offline, once**, with **Meshy** (image-to-3D from photos of the real crafts for fidelity).
- **Only the 3D generation costs money.** Database (Supabase/SQLite free tier), hosting (Vercel free tier), and LLM (Gemini/Groq free tier **or local via LM Studio/Ollama**) are all $0. A local LLM makes the whole app **offline-capable** (kills venue-wifi risk) — trade-off is weaker Vietnamese, so test it.

**Demo plan:** physical showcase crafts on the table → judge describes items → app understands + shows craft/3D → show honest refusal on an odd combo → show the chat coach live. Backup: hotspot + pre-recorded video (video also required for city round).

**Win strategy vs. older entrants:** high wow-per-sentence; **real usage data** (student uses the app ~2 weeks before the interview, brings a chart); a personal "why me" story; the child must be able to explain everything.

## DECISION LOG — rejected alternatives (do NOT re-propose)

- **Other project ideas** (vision assistant for the blind; Socratic anti-cheating tutor; AI trash-*sorting* app) — considered, set aside in favor of the craft assistant.
- **Hardware / IoT** (e.g. a smart sorting bin) — rejected: builder cannot do hardware. Software only.
- **Live / runtime 3D generation** — rejected: latency, reliability, and wifi risk on stage. 3D is pre-installed.
- **Faithful generative 3D of a specific assembly** (e.g. "these exact folds") — not achievable; generative 3D yields generic objects. 3D is an illustrative *concept preview*; precision lives in text steps + diagrams.
- **Self-hosting TRELLIS** (or similar) — rejected for this timeline: needs a 16GB+ NVIDIA GPU, Linux, CUDA compilation. (If self-host ever needed, rent a GPU for a one-time batch — don't run a server.)
- **Generation-as-core** (AI invents crafts for arbitrary inputs as the main feature) — **explicitly rejected by the user.** The AI must NOT generate crafts it can't confidently reason out; refuse instead. The library, not the AI, is the source of buildable+3D crafts.
- **Camera/vision input as the primary flow** — deflated: a child with two items will just use the menu, so vision wasn't load-bearing. Input is now **free-form text (primary) + simple menu (fallback)**. (Vision could be a later optional stretch, not core.)
- **AI bolted onto a pure lookup** — avoided on principle: if a non-AI path is easier, the AI is optional/gimmicky. AI lives only where there's no non-AI alternative.

## OPEN QUESTIONS (unresolved — confirm before/while building)

1. **Round 1 status (gating).** Did the student already submit a compatible *đề cương* by the 3 June deadline? Round 2 must realize whatever was proposed. The deadline has passed, so either it's submitted (need to know what it said) or entry needs confirming with the contact (Xuân Trang, 0934.238.720).
2. **Vietnamese translation** of the proposal for official submission (current proposal is English build-spec).
3. **LLM choice:** hosted free tier vs. local model — pending a Vietnamese-quality test.
4. **Library scope:** exact number and contents of crafts; which are "showcase" (physically built) vs. catalog-only.
5. **App not yet built** — scaffolding is the next concrete step.

## HARD CONSTRAINTS (must hold in any future work)

- **Refuse, don't hallucinate.** The AI never invents an unbuildable craft to fill a gap.
- **No runtime 3D generation.** Only pre-installed GLBs are displayed.
- **Cost lives only in 3D generation.** Keep DB/hosting/LLM on free tiers or local.
- **The child must own and explain it.** Nothing so complex the student can't present it.
- **Vietnamese-language app.** In-person interview is in Vietnamese.
- **AI only where there's no non-AI alternative** (NL understanding, coaching, careful reasoning).

## NEXT STEPS (candidate)

- Scaffold the app: free-form input → item extraction → library match → suggest/refuse → steps + `<model-viewer>` → chat coach. Include the library schema and the "refuse, don't invent" system prompt.
- Translate the proposal into a Vietnamese submission version.
- Define the craft library contents and generate the GLB collection (offline, Meshy).

## ARTIFACTS PRODUCED THIS SESSION

- `ecocraft_ai_proposal.md` — full project proposal (problem, solution, rubric fit, architecture, demo, risks, budget, originality).
- `ecocraft_ai_handoff.md` — this document.
