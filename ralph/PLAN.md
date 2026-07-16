# Ralph Plan — Tonic P3

Ordered task queue for the P3 tier of `ROADMAP.md` (types, domain correctness & tests). One task per iteration, in this order; full implementation detail and acceptance criteria live in each task's ROADMAP.md section (IDs match). `agent:` names the model assigned to the task.

P0, P1, and P2 tiers are complete and merged to main. This queue covers P3-1 through P3-6.

## Ordering rule (critical)

Per ROADMAP.md's sequencing guidance (§ "Suggested sequencing", item 4): **behavior-pinning tests must land BEFORE the refactors they protect.** `getChordDisplayName`, `getConflictingModifiers`, and `getBorrowedChords` are refactored by the P3 type work; their tests are written first (P3-5) so any behavior drift during the refactors is caught. Every type refactor therefore `depends_on` P3-5.

The one exception to "never change existing test assertions": **P3-4** deliberately rewrites the scale-degree label expectations at `musicTheory.test.ts:244-254`, because those existing tests currently PIN the bug P3-4 fixes. That intentional test-expectation change is called out in the P3-4 entry below and must be recorded in findings-log.md.

## Model assignment rationale

- **opus** for items with cross-file type fallout that must stay coherent across files: P3-2 (ModifierLabel union + `ChordModifier` discriminated union — ripples through `config/chords.ts`, `config/chordModifierRules.ts`, and the `modArray.includes(...)` checks in `getChordDisplayName`) and P3-3 (`noUncheckedIndexedAccess` — fallout across all of `musicTheory.ts` plus config/util indexing).
- **sonnet** for localized items: P3-5 (test authoring — additive, no runtime change), P3-1 (single-function return-type change with mechanical call-site fixes), P3-4 (one label function + its own tests), P3-6 (one hook's cleanup + state mirror).

Every task that touches `src/` runtime code must pass the browser smoke check (see below) after `npm run validate` and before commit. **Tests-only tasks (P3-5) are exempt** — they add no runtime behavior to regress; `npm run validate` (which runs the new tests) is the full gate for them.

---

- [x] **P3-5 · Add high-value missing tests**
  - Scope: author behavior-pinning + coverage tests, in the ROADMAP's priority order — (1) `getChordDisplayName` `it.each` table tests (base cases, single modifiers, priority ladder, sus+extension edges); (2) `getConflictingModifiers`; (3) `getBorrowedChords` (C major → `iv`=F minor, `bVI/bVII/bIII`; A minor → `IV`=D major); (4) `useSettings` merge + migration via `renderHook` against the landed `SettingsProvider`; (5) `generatePianoKeys`; (6) `getChordFrequencies`. Items 1–3 are the pinning tests the refactors depend on. Do NOT yet enable `coverage.thresholds` unless all six land cleanly (item 7 is optional follow-through per acceptance).
  - Files: `src/utils/__tests__/` (new), `src/hooks/__tests__/` (new)
  - Depends on: — (must land first)
  - Agent: sonnet · Effort: L
  - Accept: new test files pass under `npm run validate` in CI. **Tests-only task — browser smoke check is NOT required** (no runtime behavior changes). (ROADMAP.md § P3-5)

- [x] **P3-1 · `getChordTypeFromIntervals` → `ChordType | null` (no silent `'maj'`)**
  - Scope: change the signature to `getChordTypeFromIntervals(intervals: number[]): ChordType | null`, returning `null` on no match instead of falling through to `'maj'`; type `getChordSymbol(rootNote: Note, chordType: ChordType)`; fix each call site to decide what `null` means for it (fall back to raw intervals / skip the symbol).
  - Files: `src/utils/musicTheory.ts` (and its call sites)
  - Depends on: P3-5 (its pinning tests protect the shared `musicTheory.ts` display path; ROADMAP § sequencing item 4 names P3-1 explicitly)
  - Agent: sonnet · Effort: S — localized single-function return-type change; the call-site fixes are mechanical.
  - Accept: `tsc` passes; a unit test asserts an unknown interval set (e.g. `[0,1,2]`) returns `null`, not `'maj'`. Then run the browser smoke check. (ROADMAP.md § P3-1)

- [x] **P3-2 · `ModifierLabel` union + `ChordModifier` discriminated union**
  - Scope: add a shared `ModifierLabel` string-literal union in `src/types/chords.ts` (complete from `config/chords.ts`); model `ChordModifier` as a discriminated union (`kind: 'addOne' | 'addMany' | 'replace'`) with a shared `label: ModifierLabel`; drop the dead `intervalToRemove`; type `CHORD_MODIFIERS: ChordModifier[]` and `MODIFIER_CATEGORIES: Record<ModifierLabel, ModifierCategory>` (the `Record` over the union forces completeness); `getConflictingModifiers(modifierToAdd: ModifierLabel, activeModifiers: Set<ModifierLabel>)`; consumers `switch (mod.kind)`.
  - Files: `src/types/chords.ts`, `src/config/chords.ts`, `src/config/chordModifierRules.ts`, and the `modArray.includes(...)` checks in `src/utils/musicTheory.ts` (`getChordDisplayName`)
  - Depends on: P3-5 (the `getChordDisplayName` + `getConflictingModifiers` pinning tests must exist first — this refactor touches both)
  - Agent: opus · Effort: M — cross-file type fallout that must stay coherent (types + two config files + the display path).
  - Accept: commenting out one `MODIFIER_CATEGORIES` entry → `tsc` fails; a typo'd label anywhere fails to compile. Then run the browser smoke check. (ROADMAP.md § P3-2)

- [x] **P3-3 · Enable `noUncheckedIndexedAccess`**
  - Scope: add `"noUncheckedIndexedAccess": true` to `tsconfig.app.json`; fix the fallout file by file — guard `indexOf(...) === -1` cases explicitly; where an index is provably in range (`% 12` into a 12-element array), a non-null assertion WITH a one-line justification comment is acceptable. No blanket `!` without a range justification.
  - Files: `tsconfig.app.json`, `src/utils/musicTheory.ts` (plus any other files the flag lights up)
  - Depends on: P3-5 (broad sweep of the same domain functions the pinning tests cover; landing after P3-1/P3-2 in queue order means the flag also catches their new code)
  - Agent: opus · Effort: M — codebase-wide type fallout requiring per-site range reasoning.
  - Accept: `tsc -b` passes with the flag on; no unjustified `!`. Then run the browser smoke check. (ROADMAP.md § P3-3)

- [x] **P3-4 · Fix ambiguous minor scale-degree labels**
  - Scope: in `getScaleDegreeLabel`, label the raised chromatic variants distinctly from the diatonic ones — interval 4 → `'♮3'`, 9 → `'♮6'`, 11 → `'♮7'` (natural-sign accidentals, reading distinctly from `♭3/♭6/♭7`). Pick and apply one convention consistently.
  - **Intentional existing-test change:** the tests at `src/utils/__tests__/musicTheory.test.ts:244-254` currently PIN the buggy duplicate-label behavior (they assert bare `'3'/'6'/'7'` for the chromatic tones). This is the ONE place in this tier where rewriting existing test assertions is correct — update them to the new contract as part of the fix, and record the intentional change in findings-log.md.
  - Files: `src/utils/musicTheory.ts`, `src/utils/__tests__/musicTheory.test.ts`
  - Depends on: — (independent; changes behavior + its own tests, so it does not consume P3-5's pinning tests)
  - Agent: sonnet · Effort: S — one label function plus its own co-located tests.
  - Accept: in A minor, C and C♯ show different labels on the piano; tests pass with updated expectations. Then run the browser smoke check. (ROADMAP.md § P3-4)

- [x] **P3-6 · Close the `AudioContext` on cleanup; surface it via state**
  - Scope: return a cleanup from the init effect in `useAudioEngine.ts` that `close()`s the context and nulls the ref (guard for already-closed); mirror `context`/`instrument` into `useState`, set on load completion, and return the state values; update P0-2's `useMemo` deps accordingly.
  - Files: `src/hooks/useAudioEngine.ts`
  - Depends on: — (independent; touches only the audio hook, none of the tested pure functions)
  - Agent: sonnet · Effort: S — single hook, localized cleanup + state mirror.
  - Accept: with Vite HMR, repeated edits don't accumulate `AudioContext`s; audio still plays after reload. Then run the browser smoke check. (ROADMAP.md § P3-6)

- [ ] **P3-7 · Make `npm run typecheck` actually typecheck**
  - Scope: the root `tsconfig.json` has `files: []` with project references (`tsconfig.app.json`, `tsconfig.node.json`), and plain `tsc --noEmit` does NOT follow project references (only `tsc -b` does) — so the `typecheck` script in `package.json` is currently a silent no-op, meaning `npm run validate` (typecheck && lint && test), used by the pre-commit hook and CI gate, does not actually catch type errors; only the deploy build's `tsc -b` does. Change the `typecheck` script so it follows project references — e.g. `tsc -b --noEmit` if the project configs support it, or `tsc -p tsconfig.app.json --noEmit && tsc -p tsconfig.node.json --noEmit` — worker verifies which form actually works and genuinely fails on an injected type error.
  - Files: `package.json`
  - Depends on: — (independent; tooling-only change)
  - Agent: sonnet · Effort: S — a script change plus verification, no application code involved.
  - Accept: introducing a deliberate type error in `src/` makes `npm run typecheck` (and thus `npm run validate`) exit non-zero; removing it restores green; `npm run validate` stays green on a clean tree. **Tooling-only task — browser smoke check is NOT required** (no `src/` runtime change).

---

## Browser smoke check (required for every task touching `src/` runtime code)

Tests-only tasks (P3-5) are exempt — they change no runtime behavior. All other P3 tasks touch `src/` and must run this after `npm run validate` passes and before commit:

1. Start the dev server: `npm run dev` (defaults to port 5173; if busy, let Vite pick another and use the URL it prints).
2. Drive the running app with the Playwright MCP tools — `browser_navigate` to the dev URL, `browser_snapshot`, `browser_click`, `browser_console_messages`.
3. Confirm all of: the app renders; zero console errors; clicking a chord card plays with no errors; piano keys respond to interaction; the settings drawer opens.
4. Kill the dev server afterward.

If the smoke check surfaces a runtime regression, treat the iteration as red (revert per PROMPT.md's failure path) even if `npm run validate` was green.

---

Completed: P0 tier, P1 tier, and P2 tier — all merged to main (see git history / ROADMAP.md).
