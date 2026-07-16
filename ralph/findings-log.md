# Findings Log

## Summary

Learnings, failures, and escalations from the ralph_20260714 P0 session. Lines containing `Fix Applied:`, `STUCK`, or `ESCALATE` are the aggregation markers.

## Detailed Findings

- 2026-07-14: Session ralph_20260714 started on branch `ralph/p0` — six P0 tasks queued from ROADMAP.md.

- 2026-07-15: Session ralph_p1_20260715 started on branch `ralph/p1` — six P1 core-interaction accessibility tasks queued from ROADMAP.md (P1 tier). P0 tier complete and merged to main.

- 2026-07-15: Session ralph_p2_20260715 started on branch `ralph/p2` — five remaining P2 state-architecture & rendering tasks queued from ROADMAP.md (P2-2 through P2-6; P2-1 SettingsProvider already complete and merged to main). New this tier: every task touching `src/` requires a Playwright browser smoke check after `npm run validate` and before commit (app renders, zero console errors, chord card plays, piano keys respond, settings drawer opens). Opus assigned to the two architectural items (P2-2 toggle-state dedup, P2-3 context split); sonnet to the three memoization items (P2-4 PianoKey memo, P2-5 PianoPreview hoist, P2-6 ChordStrip chord-list memo). P2-3 depends on P2-2; P2-4/5/6 depend on P2-3.

- 2026-07-15: Follow-up (not an escalation) — user testing of P1-1 (df96bba) found that rapid Enter+arrow navigation can leave a key visually stuck "pressed": keydown sets pressed state on key A, focus moves before keyup, keyup lands on key B, key A never clears. Queued as P1-7 (clear keyboard-pressed state on blur).

- 2026-07-16: Session ralph_p3_20260716 started on branch `ralph/p3` — six P3 type-safety, domain-correctness & test tasks queued from ROADMAP.md (P3 tier). P0, P1, and P2 tiers all complete and merged to main. Ordering rule enforced per ROADMAP § sequencing item 4: the behavior-pinning tests (P3-5: `getChordDisplayName`, `getConflictingModifiers`, `getBorrowedChords`) land FIRST, and the type refactors that touch those functions (P3-1, P3-2, P3-3) `depends_on` P3-5. P3-4 (minor scale-degree labels) and P3-6 (AudioContext cleanup) are independent (no P3-5 dependency). Model assignments: opus for cross-file type-fallout items (P3-2 ModifierLabel union + ChordModifier discriminated union, ripples into getChordDisplayName; P3-3 noUncheckedIndexedAccess, codebase-wide fallout); sonnet for localized items (P3-5 tests authoring, P3-1 getChordTypeFromIntervals return-type change, P3-4 label fix, P3-6 audio cleanup). Smoke-check exemption added for tests-only tasks (P3-5) since they change no runtime behavior. INTENTIONAL EXISTING-TEST CHANGE flagged: P3-4 must rewrite the scale-degree label assertions at `musicTheory.test.ts:244-254`, which currently PIN the buggy duplicate `'3'/'6'/'7'` behavior — this is the one place in the tier where changing existing test expectations is correct, and the worker must record it here when P3-4 lands.

- 2026-07-14: P0-4 done (commit b33b594). Adopted `useGlissando` for the touch path in `Piano.tsx`. Added a `triggerOnStart` option to the hook so it primes de-dupe on touch-start without replaying the note `PianoKey`'s own touch-start handler already plays (prevents a double note on the first key). Mouse glissando path left fully intact per "mouse unchanged" acceptance. Note: touched a 3rd file beyond the plan's listed two — `PianoKey.tsx` gained an additive `isGlissandoPressed` prop, required to satisfy the "visual pressed states follow the finger" acceptance clause (keys the finger slides onto never get their own touch-start, so they can't light themselves). Change is additive and does not affect mouse/MIDI behavior. `npm run validate` green (typecheck, lint 0 warnings, 88 tests).
