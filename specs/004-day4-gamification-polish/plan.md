# Implementation Plan: Day 4 — Gamification + Settings + Polish

**Branch**: `004-day4-gamification-polish` | **Date**: 2026-06-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/004-day4-gamification-polish/spec.md`

## Summary

Build gamification system (points, levels, stats persistence), wire live stats
into HUD, add stats display to settings, add floating pixel particles, verify
responsive layout on 1366x768, ensure all error states degrade gracefully with
Vietnamese messages. Add Meshy attribution footer.

## Technical Context

**Language/Version**: TypeScript 5.x on Next.js 16.2.7 (App Router)
**Primary Dependencies**: React 19.2.4, Tailwind CSS 4
**Storage**: localStorage (GameStats persistence)
**Testing**: Manual end-to-end — demo flow walkthrough
**Target Platform**: Desktop browsers 1366x768+
**Project Type**: Web application — polish + gamification layer
**Performance Goals**: Stats update <500ms, particles at 60fps CSS-only
**Constraints**: No JS animation libs, CSS-only particles, localStorage-only persistence
**Scale/Scope**: 1 gamification module, 15 particles, footer, responsive fixes

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Library-First | ✅ N/A | No new data paths — gamification is overlay |
| II. Honest Refusal | ✅ N/A | No AI changes |
| III. Vietnamese-Native UX | ✅ PASS | All new strings Vietnamese, error messages Vietnamese |
| IV. Offline-Capable | ✅ PASS | localStorage-only, no network calls |
| V. Ship Incrementally | ✅ PASS | Day ends with complete polished app |
| VI. Child-Safe | ✅ N/A | No new AI interactions |
| VII. Minimal Viable Polish | ✅ PASS | Particles, hover effects, themed scrollbars, attribution |

All gates pass.

## Project Structure

### Source Code (new/modified files)

```text
app/
├── page.tsx                    # MODIFIED — gamification callbacks, stats state
├── layout.tsx                  # MODIFIED — add footer with Meshy attribution
├── globals.css                 # MODIFIED — particle colors, responsive tweaks
├── components/
│   ├── HUD.tsx                 # MODIFIED — live stats from GameStats
│   ├── SettingsPanel.tsx       # MODIFIED — add stats display section
│   ├── PixelParticles.tsx      # NEW — 15 floating CSS-animated particles
│   ├── screen2/
│   │   ├── BuildScreen.tsx     # MODIFIED — craft completion detection + celebration
│   │   └── CoachChat.tsx       # MODIFIED — record coach message stats
├── lib/
│   └── gamification.ts         # NEW — getStats, saveStats, completeCraft, recordCoachMessage
```

**Structure Decision**: Gamification as pure utility functions in `lib/`. Particles as standalone component. Minimal modifications to existing components.

## Complexity Tracking

> No violations.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
