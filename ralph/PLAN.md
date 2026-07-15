# Ralph Plan — Tonic P2

Ordered task queue for the remaining P2 tier of `ROADMAP.md` (state architecture & rendering). One task per iteration, in this order; full implementation detail and acceptance criteria live in each task's ROADMAP.md section (IDs match). `agent:` names the model assigned to the task.

P2-1 (single `SettingsProvider`) is already complete and merged to main — this queue covers P2-2 through P2-6.

Every task that touches `src/` must pass the browser smoke check (see the acceptance criteria and PROMPT.md's iteration protocol) after `npm run validate` and before commit.

- [x] **P2-2 · Remove toggle-state duplication between reducer and settings**
  - Scope: delete `showInScaleColors`, `keyboardPreviewEnabled`, `scaleViewEnabled` from `MusicState`, their reducer branches, and the seed logic (`MusicContext.tsx:135-140`); consumers read `settings.ui.*` directly from `useSettings()`; toggle actions become thin wrappers over the settings setters (or are deleted in favor of calling the setters directly).
  - Files: `src/contexts/MusicContext.tsx` (and the consumers that read the three flags)
  - Depends on: — (P2-1 already merged to main)
  - Agent: opus · Effort: M
  - Accept: "Reset settings" immediately reverts key highlighting/preview behavior on screen with no remount; grep confirms the three flags exist in exactly one place. Then run the browser smoke check (see below). (ROADMAP.md § P2-2)

- [x] **P2-3 · Split context into state + actions contexts, memoize both**
  - Scope: create `MusicStateContext` (state + settings-derived values + `audio.loading`) and `MusicActionsContext` (`actions` + stable `audio` functions) in the same file; the actions value is memoized with only stable callbacks in deps so it never changes after mount; export `useMusicState()` / `useMusicActions()`; migrate consumers so action-only consumers (ConfigBar selects) use `useMusicActions()`; keep a compatibility `useMusic()` during migration if useful, then delete it.
  - Files: `src/contexts/MusicContext.tsx` (and the consumers being migrated)
  - Depends on: P2-2 (shrinks the state surface first; P0-2 memoized sub-objects already landed)
  - Agent: opus · Effort: M
  - Accept: React DevTools profiler — selecting a chord no longer re-renders `ConfigBar`; only `Piano`/`ChordStrip` subtrees repaint on highlight updates. Then run the browser smoke check (see below). (ROADMAP.md § P2-3)

- [x] **P2-4 · `React.memo(PianoKey)` + stable `onPress`**
  - Scope: `const handleKeyPress = useCallback((freq: number) => audio.playNote(freq), [audio.playNote]);`; `export const PianoKey = React.memo(function PianoKey(props) { ... });`; verify remaining `PianoKey` props are stable (memoize any object/array props in `Piano`).
  - Files: `src/components/PianoKey.tsx`, `src/components/Piano.tsx`
  - Depends on: P2-3 (context split stabilizes the actions/props that feed the keys)
  - Agent: sonnet · Effort: S
  - Accept: React DevTools profiler during a MIDI/played note — only the keys whose `isMidiActive` changed re-render, not the full keyboard. Then run the browser smoke check (see below). (ROADMAP.md § P2-4)

- [x] **P2-5 · Hoist `PianoPreview` out of `ChordCard`'s render body**
  - Scope: extract the inline `const PianoPreview = () => {...}` (`ChordCard.tsx:263-351`) to a top-level component (same file is fine) taking `rootNote`, `currentIntervals`, `keyRoot`, `mode` as props; wrap in `React.memo`. (Smallest-diff alternative: call it as `{renderPianoPreview()}` — a plain function — to avoid the remount without creating a component.)
  - Files: `src/components/ChordCard.tsx`
  - Depends on: P2-3 (avoid churn against the context migration; keep the memo items sequenced after the split)
  - Agent: sonnet · Effort: S
  - Accept: in DevTools Elements panel the preview SVG nodes persist (no flash/recreate) when selecting chords. Then run the browser smoke check (see below). (ROADMAP.md § P2-5)

- [ ] **P2-6 · Memoize chord list computation in `ChordStrip`**
  - Scope: `const diatonicChords = useMemo(() => getScaleChords(key, mode), [key, mode]);` and `const borrowedChords = useMemo(() => getBorrowedChords(key, mode), [key, mode]);` in `ChordStrip`; optionally wrap `ChordCard` in `React.memo` once its props are stable.
  - Files: `src/components/ChordStrip.tsx`
  - Depends on: P2-3 (stable context props are what make `ChordCard` memoization effective)
  - Agent: sonnet · Effort: S
  - Accept: profiler shows `ChordCard`s not re-rendering when unrelated state (e.g. volume) changes. Then run the browser smoke check (see below). (ROADMAP.md § P2-6)

---

## Browser smoke check (required for every task touching `src/`)

After `npm run validate` passes and before commit:

1. Start the dev server: `npm run dev` (it defaults to port 5173; if that port is busy, let Vite pick another and use the URL it prints).
2. Drive the running app with the Playwright MCP tools — `browser_navigate` to the dev URL, `browser_snapshot`, `browser_click`, `browser_console_messages`.
3. Confirm all of: the app renders; zero console errors; clicking a chord card plays with no errors; piano keys respond to interaction; the settings drawer opens.
4. Kill the dev server afterward.

If the smoke check surfaces a runtime regression, treat the iteration as red (revert per PROMPT.md's failure path) even if `npm run validate` was green.

---

Completed: P0 tier, P1 tier, and P2-1 (single `SettingsProvider`) — all merged to main (see git history / ROADMAP.md).
