# EcoCraft AI — Project Proposal

*Working title: **EcoCraft AI** (Vietnamese: **"Sáng Tạo Từ Rác"** / alternatives: "Rác Kỳ Diệu", "Tái Chế Cùng AI")*

**Contest:** Cuộc thi Sáng tạo thanh thiếu niên, nhi đồng — Cụm 6, Đồng Nai, 2026
**Eligible fields targeted:** Sản phẩm thân thiện với môi trường · Đồ chơi trẻ em · Phần mềm tin học
**Format:** Software (web application) + physical craft display for the in-person interview round

> Note: This is the working concept/build spec, written in English for the build team. The official contest *bản thuyết minh đề cương* should be translated into Vietnamese before submission.

---

## 1. The idea in one sentence

A web app where a child describes — in plain Vietnamese — the recyclable items they have, and an AI assistant finds a craft they can build from a verified library, shows step-by-step instructions and a 3D model when one exists, and coaches them through the build when they get stuck.

## 2. The problem

Children throw away recyclable materials daily without knowing they can become toys, learning aids, or decorations. Existing "what to do with trash" resources are static lists that only help if you happen to have the exact items the list anticipated, and they offer no help once you start building. There is no friendly tool that lets a child say what they actually have, in their own words, and get a specific, verified, buildable idea with live guidance.

This matters locally: it reduces household waste, costs nothing in materials, and turns recycling into a creative, hands-on activity rather than a chore.

## 3. The solution

EcoCraft AI is built on a clear split between **what only AI can do** (understand language, coach, reason carefully) and **what a verified library does more reliably** (provide correct, buildable crafts with 3D models).

**a) Verified craft library (the backbone — deterministic, reliable).**
A curated collection of crafts. Each has clean Vietnamese instructions and a **pre-installed 3D model**, and the showcase ones have been physically built so they can be displayed at the booth. This is the trustworthy core: every craft in it is known-good and has a model.

**b) Natural-language assistant (AI — the interface and the careful reasoner).**
Instead of ticking boxes in a menu, the child types or speaks naturally: *"Em có 3 nắp chai, 2 chai nước ngọt, 1 tờ giấy ăn — làm được gì?"* The AI:
- **Understands** the free-form description and extracts the items.
- **Matches** them against the library. If a craft fits → show it with its 3D model and steps.
- **Reasons carefully** if there's no library match: only if it is *confident* a sensible craft is buildable, it suggests that idea with instructions but **no 3D model** (since it's not in the collection).
- **Refuses honestly** if it can't think of a genuine craft — *"Mình chưa nghĩ ra cách làm với những thứ này"* — rather than inventing nonsense. **The rule is: refuse, don't hallucinate.**

**c) Conversational build help (AI — the second irreplaceable use).**
While building, the child can ask for help in natural language — *"Em bị kẹt ở bước 3, cái nắp không dính được"* — and the AI coaches them through it. Open-ended natural language with no library fallback; impossible without AI.

## 4. Where the AI genuinely earns its place

The verified library is deliberately deterministic — that part needs no AI, and pretending otherwise would be AI-for-show. The AI is placed only where a lookup genuinely falls short:

- **Understanding free-form, messy human descriptions** of what a child has, in their own Vietnamese.
- **Careful bounded reasoning** to propose a buildable craft the library doesn't contain — *with the discipline to refuse rather than invent.*
- **Conversational coaching** during the build — the clearest case of something a static app simply cannot do.

So the honest story for the interview: the library guarantees reliability and the 3D models; the AI makes the tool feel like talking to a helpful person and helps in the moments a fixed list can't.

## 5. How it fits the contest rubric

| Rubric criterion | How EcoCraft AI satisfies it |
|---|---|
| **Tính mới** (novelty) | A conversational AI craft assistant for recycling is not a project type judges will have seen at this level. |
| **Tính sáng tạo** (creativity) | The app exists to spark creativity — meta-aligned with a contest literally named *Sáng tạo*. |
| **Tính khoa học** (scientific merit) | Clear architecture: deterministic verified library + AI language/coaching layer + measured usage data. |
| **Ứng dụng thực tiễn** (practical use) | Free, hands-on, reduces real household waste, usable today by any child with a phone or laptop. |

It also spans multiple eligible categories at once (environment, children's toys, software).

## 6. Technical architecture

**Build approach:** rapid AI-assisted ("vibecoded") web app, single-purpose, deployed simply.

**Runtime (in the app, when the child uses it) — no 3D is ever generated live:**
1. **Input:** the child describes their items in natural language (a simple menu remains as a fallback).
2. **Understand + match:** LLM extracts items → checks the verified library.
3. **Respond:**
   - Library match → show the craft, its **pre-installed 3D model**, and Vietnamese steps.
   - No match but a confident, sensible craft → show the idea + steps, **no 3D**.
   - Nothing sensible → honest "can't think of one."
4. **Build help:** chat panel; LLM answers follow-up questions about the current craft.

**Offline (done once, before the app ships):**
- Use **Meshy** to generate the library's 3D models. Generation happens *ahead of time only*. The running app never generates 3D, needs no GPU, and (with a local LLM) needs no internet at all.
- For faithful showcase models, build each craft physically, photograph it on a white background, and run image-to-3D on the real photo so the model matches reality.

**Stack & cost — only the 3D generation costs money:**
- **Database:** free tier (e.g. Supabase) or even a bundled JSON/SQLite file — $0.
- **Hosting:** free tier (e.g. Vercel) — $0.
- **LLM:** free tier (Gemini / Groq) *or* a **local model via LM Studio / Ollama** running on the demo laptop — $0. A local model also lets the entire app run **fully offline** (local LLM + pre-installed 3D), removing all venue-wifi risk. Trade-off: verify Vietnamese quality, as smaller local models are weaker at it than a hosted free tier.
- **3D model generation (Meshy):** the one real cost — a one-time batch for the library (~$20 or within free credits).
- Display: `<model-viewer>` for the pre-installed GLB files.

## 7. Demo plan (in-person interview, 23–24 June)

1. Open with the **physical showcase crafts** on the table — real toys made from trash. Tangible proof and instant charm.
2. Have a judge **describe items in their own words** to the app; show it understanding the free-form input, finding the matching craft, and displaying the 3D model and steps.
3. Show the **honesty**: give it an odd combination, and let it either suggest a sensible text-only idea or admit it can't — demonstrating the tool is smart *and* trustworthy, not faking.
4. Show the **chat coach** answering a "how do I fix this step" question — the live, undeniable AI moment.

**Robustness:** with a local LLM and pre-installed 3D, the whole demo runs offline. Keep a phone hotspot and a pre-recorded backup video regardless (the video is also required for the city-level round).

## 8. How this beats older (up to 18) competitors

A younger contestant wins not by out-engineering older ones, but with **high wow-per-sentence and evidence of real use**:
- **A conversational, honest AI** the judges can talk to live — most entries at this level have nothing comparable.
- **Real impact data:** after the build (~half a week), the student uses the app for ~2 weeks before the interview and brings a simple chart — items diverted from trash, crafts completed. Most older students skip user testing; this is where methodology points are won.
- **A personal "why me" story** in Vietnamese, delivered by the child — more believable from a 12-year-old than a polished 18-year-old pitch.

## 9. Timeline

- **Build:** ~half a week (app + verified library + 3D collection).
- **Usage + data collection + rehearsal:** the remaining ~2 weeks before the 23–24 June interview.
- *(Assumes the Round 1 proposal cleared and is compatible with this concept — confirm before building.)*

## 10. Risks and mitigations

| Risk | Mitigation |
|---|---|
| AI invents an unbuildable craft (hallucination) | Hard rule: refuse rather than invent; library crafts are the verified, 3D-backed set. |
| 3D doesn't match the real folded/assembled craft | Only library crafts have 3D, and those are generated from photos of the *real* built crafts; precision lives in text steps + diagrams. |
| Venue wifi fails | Local LLM + pre-installed 3D = fully offline app; hotspot + backup video as extra insurance. |
| Feature sprawl (classic vibecoding failure) | Lock scope to: describe → match/suggest/refuse → show steps + 3D → chat help. |
| Asset licensing for the contest | Verify the Meshy plan's asset license grants full/commercial rights (free tier requires attribution). |

## 11. Budget (~$350 / ~9M VND)

- **3D model generation (Meshy): the only required spend** (~$20, or within free credits).
- Database, hosting, LLM: $0 (free tiers or local model).
- Craft materials for physical showcase builds: minimal.
- Remainder: build effort + buffer.

## 12. Originality statement

The AI-generated 3D models are a visualization aid. The genuine creative contribution is the **application concept** (a conversational, honest AI recycling-craft assistant with build coaching) and the **physical crafts the student builds** — both clearly the student's own work, defensible under questioning and for any IP registration.
