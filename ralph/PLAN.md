# Ralph Plan — Tonic P0

Ordered task queue for the P0 tier of `ROADMAP.md`. One task per iteration, in this order; full implementation detail and acceptance criteria live in each task's ROADMAP.md section (IDs match). `agent:` names the model assigned to the task.

- [x] **P0-1 · Gate the deploy on lint + tests**
  - Scope: add `npm run validate` as a step before Build in the deploy workflow so red code can't ship.
  - Files: `.github/workflows/deploy.yml`
  - Depends on: —
  - Agent: sonnet · Effort: S
  - Accept: workflow fails before deploy on a failing test; green push deploys. (Full detail: ROADMAP.md § P0-1)

- [ ] **P0-2 · Memoize the context `audio` object and full context value**
  - Scope: wrap `audio`, `actions`, and the context `value` in `useMemo` so their identities only change when their contents do.
  - Files: `src/contexts/MusicContext.tsx`
  - Depends on: —
  - Agent: opus · Effort: S
  - Accept: a `useEffect(..., [audio])` probe in a consumer fires only on loading/instrument changes, not per chord selection. (ROADMAP.md § P0-2)

- [ ] **P0-3 · Fix MIDI listener leak and re-subscription churn**
  - Scope: return cleanup synchronously from the effect (not inside `.then`), hold `onNoteOn`/`onNoteOff` in refs, subscribe once with `[]` deps.
  - Files: `src/hooks/useMidiInput.ts`, `src/components/Piano.tsx`
  - Depends on: P0-2 (stable `audio` stops the callback identity churn)
  - Agent: opus · Effort: M
  - Accept: after several chord selections, one physical key press fires the handler exactly once; UI interaction no longer re-runs the MIDI effect. (ROADMAP.md § P0-3)

- [ ] **P0-4 · Fix touch glissando by adopting the existing `useGlissando` hook**
  - Scope: wire the orphaned `src/hooks/useGlissando.ts` (elementFromPoint-based) into `Piano.tsx`, replacing the inline mouse-only glissando logic; dedupe repeat notes.
  - Files: `src/components/Piano.tsx`, `src/hooks/useGlissando.ts`
  - Depends on: —
  - Agent: opus · Effort: M
  - Accept: touch-dragging across five keys plays each exactly once with pressed visuals following the finger; mouse drag unchanged. (ROADMAP.md § P0-4)

- [ ] **P0-5 · Surface soundfont load failure with retry UI**
  - Scope: add `error` state + `retry()` to `useAudioEngine`, thread through the context `audio` object (add to the P0-2 memo deps), render an error + Retry state in `LoadingOverlay` instead of `null`; gate onboarding audio steps on `!loading && !error`.
  - Files: `src/hooks/useAudioEngine.ts`, `src/contexts/MusicContext.tsx`, `src/components/LoadingOverlay.tsx`
  - Depends on: P0-2 (error/retry ride the memoized `audio` object)
  - Agent: sonnet · Effort: M
  - Accept: blocking the soundfont CDN yields an error message + working Retry instead of a silent app. (ROADMAP.md § P0-5)

- [ ] **P0-6 · Fix borrowed-chord modifier reset bug**
  - Scope: key `ChordCard`'s modifier-reset effect on stable primitives (`keyRoot`, `mode`, `numeral`) instead of the `baseIntervals` array reference.
  - Files: `src/components/ChordCard.tsx`
  - Depends on: —
  - Agent: sonnet · Effort: S
  - Accept: a locked modifier on a borrowed chord survives selecting another chord; changing key/mode still clears all cards. (ROADMAP.md § P0-6)
