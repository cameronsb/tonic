# Findings Log

## Summary

Learnings, failures, and escalations from the ralph_20260714 P0 session. Lines containing `Fix Applied:`, `STUCK`, or `ESCALATE` are the aggregation markers.

## Detailed Findings

- 2026-07-14: Session ralph_20260714 started on branch `ralph/p0` — six P0 tasks queued from ROADMAP.md.

- 2026-07-15: Session ralph_p1_20260715 started on branch `ralph/p1` — six P1 core-interaction accessibility tasks queued from ROADMAP.md (P1 tier). P0 tier complete and merged to main.

- 2026-07-14: P0-4 done (commit b33b594). Adopted `useGlissando` for the touch path in `Piano.tsx`. Added a `triggerOnStart` option to the hook so it primes de-dupe on touch-start without replaying the note `PianoKey`'s own touch-start handler already plays (prevents a double note on the first key). Mouse glissando path left fully intact per "mouse unchanged" acceptance. Note: touched a 3rd file beyond the plan's listed two — `PianoKey.tsx` gained an additive `isGlissandoPressed` prop, required to satisfy the "visual pressed states follow the finger" acceptance clause (keys the finger slides onto never get their own touch-start, so they can't light themselves). Change is additive and does not affect mouse/MIDI behavior. `npm run validate` green (typecheck, lint 0 warnings, 88 tests).
