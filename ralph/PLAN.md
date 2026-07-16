# Ralph Plan — Tonic P4

Ordered task queue for the P4 tier of `ROADMAP.md` (cleanup & hygiene) — the final roadmap tier. One task per iteration, in this order; full implementation detail and acceptance criteria live in each task's ROADMAP.md section (IDs match). `agent:` names the model assigned to the task.

P0, P1, P2, and P3 tiers are complete and merged to main. This queue covers P4-1 through P4-5.

## Ordering rule (critical)

ROADMAP.md § "Suggested sequencing" item 5: **P4-1's dead-code purge goes last among code changes to avoid conflicts with everything above** — "everything above" = P0/P1/P2/P3, which are all merged, so that constraint is already satisfied. **Within P4 itself, the deletion goes FIRST:** the other P4 items build on the cleaned-up `musicTheory.ts`, and per ROADMAP the data-move (P4-3) and frequency consolidation (P4-2) both reference symbols/tables that P4-1 removes ("plus the dead lookup tables removed in P4-1"). So P4-2 and P4-3 `depends_on` P4-1 — you never want to move or refactor around code that is about to be deleted. `useGlissando.ts` is NEVER deleted (P0-4 adopted it).

## Model assignment rationale

- **opus** for the two items with cross-file fallout that must stay coherent: **P4-1** (large surgical removal spanning `musicTheory.ts`, `types/music.ts`, `MusicContext.tsx`, `useMidiInput.ts`, `LearnMode.css`, `ChordStrip.tsx`, `package.json`, and the corresponding test cases — must verify nothing live references each deleted symbol before removing it) and **P4-3** (import-graph reshuffle — moving domain tables out of `musicTheory.ts` into `config/`, plus table-driving `getBorrowedChords` without changing its already-corrected output).
- **sonnet** for the mechanical, localized items: **P4-2** (frequency-formula consolidation to `midiToFrequency`), **P4-4** (CSS hygiene batch), **P4-5** (named `ResolvedChord` type).

Every task that touches `src/` runtime code must pass the browser smoke check (below) after `npm run validate` and before commit. **P4-4 additionally requires a visual before/after screenshot** of each affected component (it changes appearance, not just code). No tests-only tasks in this tier.

## Already-resolved by earlier tiers — read before implementing

Some P4 sub-points were incidentally addressed by P2/P3 work. Verify against current code; do NOT redo them:

- **P4-1 dead context actions:** `scaleViewEnabled` no longer exists as a field (consolidated by P2-2's toggle-state dedup). The still-dead context surface is `pianoRange`/`setPianoRange`, `toggleScaleView`, and `deselectChords` (verified: zero consumers outside `MusicContext.tsx`). Only remove what is genuinely unconsumed.
- **P4-1 broken scripts:** `typecheck` was already fixed to `tsc -b --noEmit` by P3-7, so it is NOT broken. The remaining dead scripts are only `check:client` / `check:all` (they call the nonexistent `scripts/check-client.mjs`) plus the unconfigured `lint-staged` devDep.
- **P4-3 getBorrowedChords:** its MINOR-mode branch was fully rewritten in P3-9 to true parallel-major chords (I/IV/vi/vii°), and `getBorrowedChords.test.ts` already pins that corrected output. P4-3 is STILL valid — the function is still eight-ish hand-copied `push` blocks (NOT yet table-driven), and the MAJOR branch still uses ASCII numerals `bVI`/`bVII`/`bIII`. Table-drive it and standardize the major-branch numerals to the `♭` glyph, but preserve P3-9's exact chord output; the co-located tests must pass unchanged except for the deliberate `bVI→♭VI` etc. glyph updates.
- **P4-3 "write the pinning tests first":** already satisfied — P3-5 authored the `getBorrowedChords` tests and P3-9 updated them. No new tests needed as a prerequisite.
- **P4-2 `midiToFrequency`:** already exists as the canonical implementation (`musicTheory.ts`). The live inline duplicates to consolidate are `getChordFrequencies` (`musicTheory.ts`, the `A4 * Math.pow(2, …)` at ~:350) and **two** copies in `pianoUtils.ts` (`generatePianoKeys` ~:42 and the frequency helper ~:65). The inline in the dead `generate88KeyPiano` is removed by P4-1, not P4-2.

---

- [x] **P4-1 · Delete dead code**
  - Scope: remove verified-dead surface area in one focused pass. (a) The entire 88-key subsystem in `src/utils/musicTheory.ts`: `generate88KeyPiano`, `createPianoKeyMap`, `createMidiKeyMap`, `getKeyRange`, `PIANO_RANGES`, `getEnharmonicSpelling`, `getRomanNumeralForChord`, `getNotesForChord`, `midiToNoteName`, `noteToMidi`, and the `FREQUENCIES`/`BASE_FREQUENCIES` tables (`:13-65`) — all referenced only by their own definitions and by tests. (b) The duplicate `PianoKeyData` in `src/types/music.ts` — keep the live one from `src/utils/pianoUtils.ts` and move it into `types/`, updating importers. (c) Dead `MusicContext` surface: `pianoRange`/`setPianoRange`, `toggleScaleView`, `deselectChords` (`scaleViewEnabled` is already gone — see above). (d) Unused `useMidiInput` returns `stopAllNotes`/`isSupported`. (e) Dead sidebar CSS in `LearnMode.css` (`.learn-mode-sidebar`, `.chord-sidebar`, `.sidebar-fab`, `.sidebar-backdrop`, ~:180-346) and `ChordStrip`'s `layout="sidebar"` branch. (f) Broken `check:client`/`check:all` npm scripts. (g) Unused `lint-staged` devDep (remove it — no configuration exists). **Delete the matching test cases** for removed functions (`midiToNoteName`/`noteToMidi` blocks in `musicTheory.test.ts`). **Never delete `useGlissando.ts`.**
  - Files: `src/utils/musicTheory.ts`, `src/types/music.ts`, `src/contexts/MusicContext.tsx`, `src/hooks/useMidiInput.ts`, `src/components/LearnMode.css`, `src/components/ChordStrip.tsx`, `src/utils/__tests__/musicTheory.test.ts`, `package.json`
  - Depends on: — (first; the rest of the tier builds on the cleaned-up files)
  - Agent: opus · Effort: M — large surgical removal across many files; each symbol must be confirmed to have zero live references before deletion (`noUnusedLocals` + `tsc -b` + grep are the safety net).
  - Accept: `npm run validate` green; grep for each deleted symbol returns nothing; every remaining npm script runs. Then run the browser smoke check. (ROADMAP.md § P4-1)

- [x] **P4-2 · Single source of truth for the equal-temperament formula**
  - Scope: have `getChordFrequencies` (`src/utils/musicTheory.ts`) and both inline sites in `src/utils/pianoUtils.ts` (`generatePianoKeys` and the frequency helper) call `midiToFrequency(midiNote)` instead of re-inlining `440 * Math.pow(2, (n - 69) / 12)`. `pianoUtils.ts` imports `midiToFrequency` from `musicTheory.ts` (verify no import cycle). The frequency pinning test (P3-5 item 6) already exists to protect the refactor.
  - Files: `src/utils/musicTheory.ts`, `src/utils/pianoUtils.ts`
  - Depends on: P4-1 (P4-1 removes the dead `FREQUENCIES`/`BASE_FREQUENCIES` tables and the dead 88-key inline; landing after it avoids touching soon-deleted code)
  - Agent: sonnet · Effort: S — swap three inline formulas for a shared call; mechanical, pinned by existing tests.
  - Accept: one grep hit for `Math.pow(2` (or `2 **`) in frequency code — inside `midiToFrequency` only; tests pass. Then run the browser smoke check. (ROADMAP.md § P4-2)

- [x] **P4-3 · Move domain data into `config/`; table-drive `getBorrowedChords`**
  - Scope: (1) move the static tables out of `musicTheory.ts` into `config/` — `NOTES`, `SCALES`, `MAJOR/MINOR_SCALE_SPELLINGS` → `config/scales.ts`; `CHORD_TYPES` → `config/diatonicChords.ts` — leaving `musicTheory.ts` as pure functions importing from config (`config/` = data, `utils/` = behavior, `types/` = shapes). (2) Replace `getBorrowedChords`' hand-copied `push` blocks with a `Record<Mode, Array<{ numeral; semitoneOffset; intervals; type }>>` table and a `.map` computing `rootNote: NOTES[(rootIndex + semitoneOffset) % 12]`. **Preserve P3-9's exact chord output** (major: iv/♭VI/♭VII/♭III; minor: I/IV/vi/vii°). (3) Standardize the major-branch numerals from ASCII `bVI`/`bVII`/`bIII` to the `♭` glyph. Update the co-located `getBorrowedChords.test.ts` for the numeral-glyph change only (deliberate) — no other assertion changes; record it in findings-log.md.
  - Files: `src/utils/musicTheory.ts`, `src/config/scales.ts` (new), `src/config/diatonicChords.ts` (new), `src/utils/__tests__/getBorrowedChords.test.ts`, and any importers of the moved tables
  - Depends on: P4-1 (must move only LIVE tables — do not relocate data P4-1 is deleting)
  - Agent: opus · Effort: M — import-graph reshuffle across `utils/` and `config/`; must keep every importer of the moved tables compiling and preserve `getBorrowedChords`' corrected output.
  - Accept: borrowed-chord tests pass unchanged except the deliberate numeral glyphs; `musicTheory.ts` contains no top-level data tables; `tsc -b` green. Then run the browser smoke check. (ROADMAP.md § P4-3)

- [ ] **P4-4 · CSS hygiene pass**
  - Scope: one PR of verified small fixes. (1) Move shared keyframes `fadeIn` (duplicated in `ConfigBar.css` and `LoadingOverlay.css`) and `pulse` (only in `LoadingOverlay.css`, but the `Piano.tsx` MIDI dot depends on it) into `index.css`; delete the duplicates. (2) Add z-index tokens (`--z-header`, `--z-drawer`, `--z-overlay`, `--z-onboarding`, `--z-toast`) and replace the scattered magic numbers (10/20/40/50/100/200/300/9999/10000). (3) Fix `var(--text)` → `var(--text-primary)` in `VolumeSlider.css`. (4) Add a global `@media (prefers-reduced-motion: reduce)` block disabling `pulse`/`fadeIn` and neutralizing transitions. (5) Raise modifier-button `min-height` in `ChordCard.css` to `var(--size-touch-target, 44px)` driven from the `SIZES.minTouchTarget = 44` token. (6) Lighten `--text-muted` (`#6e7681`) to ≥ 4.5:1 (e.g. `#8b949e`). (7) Extract the ~25 lines of inline MIDI-badge styles in `Piano.tsx` (`background: #22c55e`, `zIndex: 10`, etc.) to a CSS class using tokens (new `Piano.css` or existing component CSS).
  - Files: `src/index.css`, `src/components/ConfigBar.css`, `src/components/LoadingOverlay.css`, `src/components/VolumeSlider.css`, `src/components/ChordCard.css`, `src/components/Piano.tsx`, `src/components/Piano.css` (new), `src/config/ui.ts`
  - Depends on: — (independent of the TS items; CSS + one component)
  - Agent: sonnet · Effort: M — a batch of small, isolated, verified fixes.
  - Accept: each keyframe name defined exactly once; no `var(--text)` fallback; modifier buttons measure ≥ 44px on a phone viewport; `--text-muted` passes 4.5:1 on `--bg`. Then run the browser smoke check **plus a visual before/after screenshot** of each affected element (loading overlay, MIDI badge, modifier buttons, onboarding/about muted text). (ROADMAP.md § P4-4)

- [ ] **P4-5 · Named `ResolvedChord` type**
  - Scope: declare `export interface ResolvedChord { numeral: string; rootNote: Note; intervals: number[]; type: ChordType }` in `src/types/music.ts`; use it as the explicit return type of both `getScaleChords` and `getBorrowedChords`, and in the `ChordStrip`/`ChordCard` prop types that consume them.
  - Files: `src/types/music.ts`, `src/utils/musicTheory.ts`, `src/components/ChordStrip.tsx`, `src/components/ChordCard.tsx`
  - Depends on: P4-3 (pairs naturally with P4-3 per ROADMAP — landing after the table-drive means the named type is applied to the already-refactored `getBorrowedChords`, avoiding rework)
  - Agent: sonnet · Effort: S — one interface plus explicit return/prop annotations.
  - Accept: `tsc` passes; both functions share the declared `ResolvedChord` return type. Then run the browser smoke check. (ROADMAP.md § P4-5)

---

## Browser smoke check (required for every task touching `src/` runtime code)

All P4 tasks touch `src/` runtime code (no tests-only tasks this tier), so every task runs this after `npm run validate` passes and before commit:

1. Start the dev server: `npm run dev` (defaults to port 5173; if busy, let Vite pick another and use the URL it prints). **NOTE:** the user may already have a dev server running from this checkout — reuse it if so; do not kill a server you did not start.
2. Drive the running app with the Playwright MCP tools — `browser_navigate` to the dev URL, `browser_snapshot`, `browser_click`, `browser_console_messages`.
3. Confirm all of: the app renders; zero console errors; clicking a chord card plays with no errors; piano keys respond to interaction; the settings drawer opens.
4. **P4-4 additionally:** take before/after screenshots (`browser_take_screenshot`) of each visually affected element and confirm the intended change with no layout regression.
5. Kill the dev server afterward **only if you started it**.

If the smoke check surfaces a runtime regression, treat the iteration as red (revert per PROMPT.md's failure path) even if `npm run validate` was green.

---

Completed: P0 tier, P1 tier, P2 tier, and P3 tier — all merged to main (see git history / ROADMAP.md). P4 is the final tier.
