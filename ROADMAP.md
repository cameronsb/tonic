# Tonic — Improvement Roadmap

This document is the prioritized backlog of code-quality, UX, and accessibility improvements identified in a full frontend review of the app (2026-07-13). Items are grouped into priority tiers — P0 (ship-blocking bugs and the CI safety net) through P4 (cleanup and hygiene) — and ordered by user impact and leverage: fixes that unblock or simplify other fixes come first, and dependencies between items are called out explicitly. Each item includes the problem, why it matters, exact file/line references (valid as of commit `b2fa5e4`), step-by-step implementation guidance, acceptance criteria, and an effort estimate (S = under an hour, M = a few hours, L = a day or more). Check items off as they land.

## Summary

| ID | Title | Priority | Effort | Primary files |
|----|-------|----------|--------|---------------|
| [P0-1](#p0-1) | Gate the deploy on lint + tests | P0 | S | `.github/workflows/deploy.yml` |
| [P0-2](#p0-2) | Memoize the context `audio` object (and full context value) | P0 | S | `src/contexts/MusicContext.tsx` |
| [P0-3](#p0-3) | Fix MIDI listener leak and re-subscription churn | P0 | M | `src/hooks/useMidiInput.ts`, `src/components/Piano.tsx` |
| [P0-4](#p0-4) | Fix touch glissando by adopting the existing `useGlissando` hook | P0 | M | `src/components/Piano.tsx`, `src/hooks/useGlissando.ts` |
| [P0-5](#p0-5) | Surface soundfont load failure with retry UI | P0 | M | `src/hooks/useAudioEngine.ts`, `src/components/LoadingOverlay.tsx` |
| [P0-6](#p0-6) | Fix borrowed-chord modifier reset bug | P0 | S | `src/components/ChordCard.tsx` |
| [P1-1](#p1-1) | Make piano keys keyboard operable | P1 | M | `src/components/PianoKey.tsx`, `src/components/Piano.tsx` |
| [P1-2](#p1-2) | Make chord modifier buttons keyboard operable | P1 | M | `src/components/ChordCard.tsx` |
| [P1-3](#p1-3) | Settings drawer: `inert` when closed, focus trap + dialog semantics when open | P1 | M | `src/components/ConfigBar.tsx` |
| [P1-4](#p1-4) | Re-enable pinch zoom | P1 | S | `index.html` |
| [P1-5](#p1-5) | Fix onboarding `aria-modal` and focus management | P1 | S | `src/components/Onboarding/OnboardingOverlay.tsx` |
| [P1-6](#p1-6) | Loading overlay accessibility semantics | P1 | S | `src/components/LoadingOverlay.tsx` |
| [P2-1](#p2-1) | Single `SettingsProvider` — one source of truth for settings | P2 | L | `src/hooks/useSettings.ts`, `src/hooks/useLocalStorage.ts`, new `src/contexts/SettingsContext.tsx` |
| [P2-2](#p2-2) | Remove toggle-state duplication between reducer and settings | P2 | M | `src/contexts/MusicContext.tsx` |
| [P2-3](#p2-3) | Split context into state + actions, memoize both | P2 | M | `src/contexts/MusicContext.tsx` |
| [P2-4](#p2-4) | `React.memo(PianoKey)` + stable `onPress` | P2 | S | `src/components/PianoKey.tsx`, `src/components/Piano.tsx` |
| [P2-5](#p2-5) | Hoist `PianoPreview` out of `ChordCard`'s render body | P2 | S | `src/components/ChordCard.tsx` |
| [P2-6](#p2-6) | Memoize `getScaleChords` / `getBorrowedChords` in `ChordStrip` | P2 | S | `src/components/ChordStrip.tsx` |
| [P3-1](#p3-1) | `getChordTypeFromIntervals` → `ChordType \| null` (no silent `'maj'`) | P3 | S | `src/utils/musicTheory.ts` |
| [P3-2](#p3-2) | `ModifierLabel` union + `ChordModifier` discriminated union | P3 | M | `src/types/chords.ts`, `src/config/chords.ts`, `src/config/chordModifierRules.ts` |
| [P3-3](#p3-3) | Enable `noUncheckedIndexedAccess` | P3 | M | `tsconfig.app.json`, `src/utils/musicTheory.ts` |
| [P3-4](#p3-4) | Fix ambiguous minor scale-degree labels | P3 | S | `src/utils/musicTheory.ts`, `src/utils/__tests__/musicTheory.test.ts` |
| [P3-5](#p3-5) | Add high-value missing tests | P3 | L | `src/utils/__tests__/`, `src/hooks/__tests__/` (new) |
| [P3-6](#p3-6) | Close the `AudioContext` on cleanup | P3 | S | `src/hooks/useAudioEngine.ts` |
| [P4-1](#p4-1) | Delete dead code (88-key subsystem, dead context actions, dead CSS, broken scripts) | P4 | M | `src/utils/musicTheory.ts`, `src/types/music.ts`, `src/contexts/MusicContext.tsx`, `src/components/LearnMode.css`, `package.json` |
| [P4-2](#p4-2) | Single source of truth for the frequency formula | P4 | S | `src/utils/musicTheory.ts`, `src/utils/pianoUtils.ts` |
| [P4-3](#p4-3) | Move domain data tables into `config/`; table-drive `getBorrowedChords` | P4 | M | `src/utils/musicTheory.ts`, `src/config/` |
| [P4-4](#p4-4) | CSS hygiene pass (keyframes, z-index tokens, contrast, touch targets, reduced motion) | P4 | M | `src/index.css`, `src/components/*.css` |
| [P4-5](#p4-5) | Named `ResolvedChord` type | P4 | S | `src/types/music.ts`, `src/utils/musicTheory.ts` |

## What's already good — don't "fix" these

- **Design-token foundation** (`src/index.css:8-146`): coherent color/spacing/radius/typography scales, dedicated piano-key color ramps, and mobile care (`100dvh`, `env(safe-area-inset-*)`, `overscroll-behavior`). Most components consume tokens consistently.
- **Multi-touch key handling** (`src/components/PianoKey.tsx:82-130`): touches tracked by `identifier` in a ref (no re-render per touch) while one boolean drives visual state; sound fires only on first touch. This is the correct ref-vs-state split — keep it.
- **iOS audio unlock** (`src/hooks/useAudioEngine.ts:29-76`): silent-track trick to bypass the mute switch, plus suspended-context `resume()` guard. Real-world detail most apps miss.
- **Onboarding polish**: `@floating-ui` with `offset/flip/shift/autoUpdate` (`src/components/Onboarding/OnboardingTooltip.tsx:89-97`), a proper `prefers-reduced-motion` block, Escape-to-skip, and an SVG-mask spotlight with pointer-events pass-through.
- **Tooling rigor**: `strict` tsconfig plus `noUnusedLocals/Parameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch`; ESLint with `typescript-eslint` strict + `react-hooks` (rules-of-hooks and exhaustive-deps) + `consistent-type-imports`. Everything is currently green: 0 tsc errors, 0 lint warnings, 88/88 tests pass.
- **The existing test file** (`src/utils/__tests__/musicTheory.test.ts`): well-sourced, includes round-trip and transposition tests. The problem is coverage allocation (see P3-5), not quality.
- **`useResizable` listener lifecycle** (`src/hooks/useResizable.ts:86-106`) and **`ChordCard` long-press timer management** (`src/components/ChordCard.tsx:96-98,217-260`): both handle attach/cleanup correctly.

---

## P0 — Ship-blocking bugs & safety net

<a id="p0-1"></a>
### - [x] P0-1 · Gate the deploy on lint + tests (S)

**Problem:** The deploy workflow (`.github/workflows/deploy.yml:33-34`) runs only `npm run build`. It never runs `npm run lint` or `npm run test`, so failing tests and lint errors deploy to production. The pre-commit hook is the only gate, and it's bypassed by `git commit --no-verify` or any tool that skips hooks.

**Why it matters:** This is the single highest-leverage fix in the repo — it's the difference between "broken code can't ship" and "one bypassable local hook stands between a red build and production." Land it first so every other item on this roadmap is protected as it merges.

**Implementation:**
1. In `.github/workflows/deploy.yml`, before the Build step, add:
   ```yaml
   - name: Validate
     run: npm run validate
   ```
   (`validate` already chains typecheck + lint + test in `package.json`.)
2. Optionally trim the build step to just `npm run build` since `validate` covers typecheck.

**Acceptance:** Push a branch with a deliberately failing test; the workflow must fail before the deploy job. Revert, push green, deploy succeeds.

<a id="p0-2"></a>
### - [x] P0-2 · Memoize the context `audio` object and full context value (S)

**Problem:** In `src/contexts/MusicContext.tsx:217-240`, the context `value` — and its nested `audio` object (`:220-226`) — are new object literals on every provider render. `playNote`/`playChord` are individually `useCallback`-memoized (`:155-168`), but the wrapper isn't, so any downstream `useCallback(..., [audio])` (e.g. `src/components/ChordCard.tsx:87`, `src/components/Piano.tsx:94`) recreates every render.

**Why it matters:** This one instability is the root cause of the MIDI re-subscription churn (P0-3) and defeats every memoization attempt downstream (P2-4). Both the state-flow and UI reviews independently traced their worst rendering findings back to this object. It must land **before or with P0-3**.

**Implementation:**
1. Wrap the sub-objects and the value:
   ```tsx
   const audio = useMemo(
     () => ({ playNote, playChord, loading, audioContext, instrument }),
     [playNote, playChord, loading, audioContext, instrument]
   );
   const actions = useMemo(() => ({ selectKey, setMode, /* ... */ }), [/* stable callbacks */]);
   const value = useMemo(() => ({ state, settings, audio, actions }), [state, settings, audio, actions]);
   ```
2. Note: `audioContext`/`instrument` are currently read from a ref during render (see P3-6) — they'll participate correctly in deps once mirrored into state; until then `loading` is the effective trigger.

**Acceptance:** Add a temporary `useEffect(() => console.count('audio changed'), [audio])` in a consumer — it should fire only when loading state or the instrument actually changes, not on every chord selection. Remove the probe before merging.

<a id="p0-3"></a>
### - [x] P0-3 · Fix MIDI listener leak and re-subscription churn (M)

**Problem:** Two compounding bugs in `src/hooks/useMidiInput.ts:32-95`:
1. The effect's cleanup function is returned from inside the Promise's `.then` callback (`:85-90`), not from the effect itself. React receives a Promise, so **the cleanup never runs** — `midimessage` and `statechange` listeners are never removed.
2. The effect depends on `[onNoteOn, onNoteOff]` (`:95`), and those callbacks (`src/components/Piano.tsx:84-95`) depend on the unstable `audio` object (P0-2) — so the effect re-runs on every provider render, calling `navigator.requestMIDIAccess()` and stacking listeners each time.

**Why it matters:** After a few chord selections, one physical key press fires the handler N times — the same note plays N times and `activeMidiNotes` accumulates stale entries. MIDI re-initializes on every UI interaction.

**Dependencies:** Land P0-2 first (stabilizes `audio`, so `onNoteOn`/`onNoteOff` stop changing identity).

**Implementation:**
1. Keep the callbacks in a ref so the effect can use `[]` deps:
   ```ts
   const onNoteOnRef = useRef(onNoteOn);
   const onNoteOffRef = useRef(onNoteOff);
   useEffect(() => { onNoteOnRef.current = onNoteOn; onNoteOffRef.current = onNoteOff; });
   ```
2. Restructure the subscription effect so cleanup is returned synchronously:
   ```ts
   useEffect(() => {
     if (!navigator.requestMIDIAccess) { setIsSupported(false); return; }
     let cancelled = false;
     const cleanups: Array<() => void> = [];
     navigator.requestMIDIAccess().then((access) => {
       if (cancelled) return;
       // for each input: input.addEventListener('midimessage', handler)
       // and push a matching removeEventListener into `cleanups`;
       // same for the 'statechange' listener on `access`.
     });
     return () => { cancelled = true; cleanups.forEach((fn) => fn()); };
   }, []);
   ```
3. Inside the message handler, call `onNoteOnRef.current(...)` / `onNoteOffRef.current(...)`.

**Acceptance:** With a MIDI device (or a virtual one), select several chords, then press one key: exactly one note plays. Verify with a `console.count` in the handler that it fires once per event. Confirm via React DevTools profiler that interacting with the UI no longer re-runs the MIDI effect.

<a id="p0-4"></a>
### - [x] P0-4 · Fix touch glissando by adopting the existing `useGlissando` hook (M)

**Problem:** Slide-to-play in `src/components/Piano.tsx:164-193` relies on each key's `onMouseEnter` (`src/components/PianoKey.tsx:66-72`), which never fires for touch — `touchmove` stays targeted at the element where the touch started. Dragging a finger across keys plays only the first key. Meanwhile a complete, correct implementation already exists in `src/hooks/useGlissando.ts` (299 lines, uses `document.elementFromPoint` in its `handleTouchMove`) — and is imported nowhere.

**Why it matters:** A natural piano gesture silently fails on the app's primary tablet/phone target. The correct code was already written and then orphaned.

**Implementation:**
1. Read `src/hooks/useGlissando.ts` end to end; wire it into `Piano.tsx`, replacing the inline `isGlissandoActive` mouse-only logic (`:164-193`).
2. Ensure it dedupes against the last-played note so a finger resting on a key doesn't retrigger.
3. If for some reason the hook can't be adopted as-is, the minimal alternative is an `onTouchMove` on the `.piano-keys` container that resolves the key under the touch via `document.elementFromPoint(touch.clientX, touch.clientY)` and plays it once per key change.
4. This item supersedes deleting `useGlissando` — do **not** remove it as part of the P4-1 dead-code purge.

**Acceptance:** On a touch device (or DevTools touch emulation), press and drag across five keys: each key plays exactly once as the finger crosses it, and visual pressed states follow the finger. Mouse drag behavior is unchanged.

<a id="p0-5"></a>
### - [x] P0-5 · Surface soundfont load failure with retry UI (M)

**Problem:** On soundfont load failure, the catch block in `src/hooks/useAudioEngine.ts:126-130` only `console.error`s and sets `loading = false`. `LoadingOverlay` returns `null` when not loading (`src/components/LoadingOverlay.tsx:61-63`), so the app looks fully ready — but no instrument exists, and `playNote`/`playChord` early-return forever. The soundfont is fetched from a remote CDN, so offline/blocked networks make this a realistic path.

**Why it matters:** Users on flaky networks get a rendered, completely silent app with no explanation — and onboarding proceeds, telling them to "hear the harmony."

**Implementation:**
1. In `useAudioEngine`, add `const [error, setError] = useState<string | null>(null)`; set it in the catch block, clear it when a load starts.
2. Expose a `retry()` function that re-runs the load, and include `error`/`retry` in the hook's return.
3. Thread `error`/`retry` through the context `audio` object (`src/contexts/MusicContext.tsx:220-226` — remember to add them to the P0-2 `useMemo` deps).
4. In `LoadingOverlay`, render an error state instead of `null` when `audio.error` is set: a short message ("Couldn't load piano sounds — check your connection.") and a Retry button calling `audio.retry()`.
5. Gate onboarding's audio-dependent steps on `!audio.loading && !audio.error`.

**Acceptance:** In DevTools, block the soundfont CDN request and reload: an error message with a Retry button appears instead of a silent app. Unblock, hit Retry: the piano loads and plays.

<a id="p0-6"></a>
### - [x] P0-6 · Fix borrowed-chord modifier reset bug (S)

**Problem:** `ChordCard`'s reset effect (`src/components/ChordCard.tsx:54-58`) is keyed on `baseIntervals` — an array **reference**. Diatonic chords get a stable reference into the `CHORD_TYPES` constant (`src/utils/musicTheory.ts:636-644`), so the effect is inert for them; but `getBorrowedChords` (`src/utils/musicTheory.ts:650-711`) builds fresh `[0,3,7]`-style literals on every call, so borrowed cards get a new identity each `ChordStrip` render and their `lockedModifiers`/`tempModifier` are wiped — e.g. immediately after tapping one, because playing dispatches state that re-renders the strip. Found independently by two reviewers; high confidence.

**Why it matters:** Modifiers are effectively unusable on borrowed chords, and the diatonic path only works by a shared-reference coincidence a future refactor could silently break.

**Implementation:**
1. Key the reset on stable primitives instead of the array reference:
   ```tsx
   useEffect(() => {
     setLockedModifiers(new Set());
     setTempModifier(null);
   }, [keyRoot, mode, numeral]);
   ```
2. P2-6 (memoizing the chord lists in `ChordStrip`) additionally stabilizes the references, but do this fix regardless — identity-keyed resets on data arrays are fragile.

**Acceptance:** Long-press to lock a `7` on the `iv` borrowed chord, then click any other chord: the lock persists. Changing key or mode still clears modifiers on all cards.

---

## P1 — Core-interaction accessibility

<a id="p1-1"></a>
### - [x] P1-1 · Make piano keys keyboard operable (M)

**Problem:** Each key renders `role="button" tabIndex={0}` (`src/components/PianoKey.tsx:150-166`) but has only mouse/touch handlers — no `onKeyDown`. Enter/Space do nothing. The `role="button"` actively lies to screen-reader users.

**Why it matters:** The core interaction of the app — playing a note — is completely unavailable to keyboard and switch-device users (WCAG 2.1.1 failure).

**Implementation:**
1. Add key handlers to `PianoKey`:
   ```tsx
   const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
     if (e.key === 'Enter' || e.key === ' ') {
       e.preventDefault();
       setIsMousePressed(true);
       playNote();
     }
   }, [playNote]);
   const handleKeyUp = useCallback((e: React.KeyboardEvent) => {
     if (e.key === 'Enter' || e.key === ' ') setIsMousePressed(false);
   }, []);
   ```
   Wire `onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}`. Guard against key-repeat (`e.repeat`) so held Enter doesn't machine-gun the note.
2. Implement roving tabindex so 25+ keys aren't 25+ tab stops: keep a `focusedIndex` in `Piano`, give only that key `tabIndex={0}` (others `-1`), and move focus with ArrowLeft/ArrowRight on the container.
3. Ensure each key has a meaningful accessible name (e.g. `aria-label="C4"`).

**Acceptance:** Tab reaches the piano once; arrow keys move between keys; Enter/Space plays the focused key with the pressed visual state; a screen reader announces each key's note name.

<a id="p1-2"></a>
### - [x] P1-2 · Make chord modifier buttons keyboard operable (M)

**Problem:** Modifier buttons wire only `onPointerDown/Up/Leave/Cancel` (`src/components/ChordCard.tsx:374-388`). Keyboard activation fires a `click` event, which is never handled — Enter/Space do nothing, and long-press "lock" has no keyboard equivalent at all.

**Why it matters:** Keyboard/SR users can play a base chord (the card header uses `onClick`) but can never add 7ths/sus or lock combinations — a whole feature tier is inaccessible.

**Implementation:**
1. Add `onClick={() => handleTap(modifier.label)}` for the tap path. Since `onPointerUp` already calls `handleTap`, prevent double-firing on pointer devices — e.g. call `e.preventDefault()` in the pointer-up handler, or set a flag when a pointer sequence handled the interaction and skip the synthetic click.
2. Provide a keyboard path to "lock": simplest is Shift+Enter / Shift+Space toggling the lock, mirroring long-press. Document it with `aria-keyshortcuts` or a visually hidden hint.
3. Reflect lock state accessibly: `aria-pressed={isLocked}` on each modifier button.

**Acceptance:** With keyboard only: Tab to a modifier, Enter plays the modified chord, Shift+Enter locks it (visual + `aria-pressed` update), and pointer behavior is unchanged (no double-plays).

<a id="p1-3"></a>
### - [x] P1-3 · Settings drawer: `inert` when closed, dialog semantics + focus trap when open (M)

**Problem:** The `<aside className="settings-drawer">` (`src/components/ConfigBar.tsx:101-197`) is always mounted and merely translated off-screen when closed (`src/components/ConfigBar.css:138-159`). Its selects, slider, and buttons remain in the tab order and the SR virtual cursor while invisible. When open, there's no focus trap, no initial focus move, no focus restore, and no `role="dialog"`.

**Why it matters:** Keyboard users tab into invisible off-screen controls; modal semantics are broken for SR users.

**Implementation:**
1. Add `inert={!isOpen}` to the `<aside>` (React supports the `inert` prop; it removes the subtree from tab order and accessibility tree).
2. Add `role="dialog" aria-modal="true" aria-label="Settings"` to the `<aside>`.
3. On open: `closeButtonRef.current?.focus()`. On close: restore focus to the `.settings-button` trigger.
4. Trap Tab while open: a small keydown handler on the drawer that wraps focus between its first and last focusable elements (or a ~20-line utility; no library needed at this scale).
5. Close on Escape.

**Acceptance:** With the drawer closed, Tab never lands on drawer controls. Opening moves focus into the drawer; Tab cycles within it; Escape closes and returns focus to the settings button.

<a id="p1-4"></a>
### - [x] P1-4 · Re-enable pinch zoom (S)

**Problem:** `index.html:6` sets `maximum-scale=1.0, user-scalable=no`, disabling browser zoom entirely.

**Why it matters:** Low-vision users cannot magnify (WCAG 1.4.4), which is worse given the 9–11px modifier labels (see P4-4). iOS double-tap zoom is already suppressed via `touch-action: manipulation`, so the app-like feel survives without this.

**Implementation:** Change the viewport meta to `width=device-width, initial-scale=1.0` — drop `maximum-scale` and `user-scalable`.

**Acceptance:** Pinch zoom works on a mobile device; double-tap on piano keys still doesn't trigger zoom (verify `touch-action: manipulation` covers the interactive surfaces).

<a id="p1-5"></a>
### - [x] P1-5 · Fix onboarding `aria-modal` and focus management (S)

**Problem:** The onboarding overlay is `role="dialog" aria-modal="true"` (`src/components/Onboarding/OnboardingOverlay.tsx:157`) while its container is `pointer-events: none` and the design **requires** interacting with the highlighted background element. `aria-modal="true"` tells assistive tech the rest of the page is inert — the opposite of what a coach-mark needs. Focus also never moves to the tooltip on step changes.

**Why it matters:** SR users are told the background is unavailable while being instructed to use it, and keyboard users lose their place on every step transition.

**Implementation:**
1. Remove `aria-modal="true"` from the coach-mark steps (keep it only if a step is truly blocking/centered).
2. On step change, move focus to the tooltip heading: give it `tabIndex={-1}` and call `.focus()` in an effect keyed on the step id.
3. Add an `aria-live="polite"` region announcing the step title/body.

**Acceptance:** With VoiceOver, during the "select a key" step the piano/config controls remain reachable and operable; advancing a step announces the new instruction and focus lands on the tooltip.

<a id="p1-6"></a>
### - [x] P1-6 · Loading overlay accessibility semantics (S)

**Problem:** The loading overlay (`src/components/LoadingOverlay.tsx:65-95`) has no `role="status"`/`aria-live`, and the progress bar is a styled `div` with no `role="progressbar"` or value attributes.

**Why it matters:** SR users get no indication the app is loading or when it becomes ready.

**Implementation:**
1. Add `role="status" aria-live="polite"` to the overlay root.
2. On the bar: `role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}`.
3. When P0-5 lands, the error state should live in the same region so the failure is announced.

**Acceptance:** VoiceOver announces loading start and completion; the progress bar reports its value.

---

## P2 — State architecture & rendering

<a id="p2-1"></a>
### - [ ] P2-1 · Single `SettingsProvider` — one source of truth for settings (L)

**Problem:** `useSettings` (`src/hooks/useSettings.ts:69-77`) is a plain hook backed by `useLocalStorage` (`src/hooks/useLocalStorage.ts:17-25`), and it is instantiated **six times independently**: `src/contexts/MusicContext.tsx:133`, `src/components/ConfigBar.tsx:10`, `src/components/ChordStrip.tsx:13`, `src/components/LearnMode.tsx:11`, `src/components/Onboarding/OnboardingOverlay.tsx:28`, and `src/hooks/useOnboarding.ts:11` (used by `OnboardingOverlay`, which therefore holds two copies). Each instance keeps its own private `useState` copy of the settings object, reconciled only through a custom `localStorage-change` window event. Three further defects ride on this design:

- **Migration runs during render, six times over** (`useSettings.ts:70` → body at `:6-32`): `migrateLegacyStorage()` performs `localStorage.getItem` + `removeItem` in the hook body — a side effect in the render phase, invoked by every instance on every render. This violates React's purity contract and misbehaves under StrictMode.
- **Write-back effect with stale closure** (`useSettings.ts:79-84`): on mount, `JSON.stringify` comparison against merged defaults triggers a write in all six instances, each dispatching another sync event; deps are `[]` with `exhaustive-deps` disabled.
- **Cross-tab removal not synced** (`useLocalStorage.ts:60-84`): the `storage` handler ignores `e.newValue === null`, so "reset settings" in another tab doesn't propagate.

**Why it matters:** Within a single tick, different components can render with divergent settings (e.g. `settings.onboarding.completed`), and the onboarding replay flow (`OnboardingOverlay.tsx:46-52`) is order-dependent on which copy updates first. This is the biggest architectural risk in the app; fixing it deletes three other bugs as side effects.

**Implementation (junior-friendly sequence):**
1. Create `src/contexts/SettingsContext.tsx` with a `SettingsProvider` that calls `useLocalStorage('...settings key...', DEFAULT_SETTINGS)` **once** and exposes `{ settings, setSettings, ...the existing named setters }` via context.
2. Run legacy migration exactly once, in the provider's lazy `useState` initializer (or a module-level function guarded by a boolean, called in `src/main.tsx` before `createRoot`) — never in a hook body. Do the `mergeWithDefaults` there too, and persist the merged result once, which **deletes the write-back effect** at `useSettings.ts:79-84` entirely.
3. Rewrite `useSettings()` to be `const ctx = useContext(SettingsContext); if (!ctx) throw new Error('useSettings must be used within SettingsProvider'); return ctx;` — call sites don't change.
4. Mount `<SettingsProvider>` above `<MusicProvider>` in `src/main.tsx` or `App.tsx`.
5. Delete the custom `localStorage-change` event machinery in `useLocalStorage` — with one instance, same-tab broadcast is unnecessary. Keep the cross-tab `storage` listener, and fix it to handle `e.newValue === null` by resetting to `defaultValue`.
6. Drop the `as UserSettings` cast at `useSettings.ts:25` — return `Partial<UserSettings>` from migration and let the merge produce the complete object.

**Acceptance:** Grep confirms a single `useLocalStorage` call for settings. Toggling a setting in the drawer updates every consumer in one render. "Reset settings" in one tab resets the other tab. React StrictMode double-render produces no duplicate migration side effects. All existing behavior (drawer toggles, onboarding replay) still works.

<a id="p2-2"></a>
### - [ ] P2-2 · Remove toggle-state duplication between reducer and settings (M)

**Problem:** `showInScaleColors`, `keyboardPreviewEnabled`, and `scaleViewEnabled` live in **both** the `MusicContext` reducer (`src/contexts/MusicContext.tsx:13-15,36-38`) and persisted `settings.ui.*` (`src/hooks/useSettings.ts:104-180`). The reducer seeds from settings once (`MusicContext.tsx:135-140`); toggle actions then write to both (`:195-211`).

**Why it matters:** Any settings write that bypasses the toggle actions — `resetSettings` in `ConfigBar` — updates persisted settings while the reducer copy silently keeps the old value until a full remount.

**Dependencies:** Do after P2-1 so there's one settings instance to read from.

**Implementation:**
1. Delete the three fields from `MusicState`, their reducer branches, and the seed logic at `:135-140`.
2. Consumers read `settings.ui.showInScaleColors` (etc.) directly from `useSettings()`.
3. The toggle actions become thin wrappers over the settings setters (or are deleted in favor of calling the setters directly).

**Acceptance:** "Reset settings" immediately reverts key highlighting/preview behavior on screen, with no remount. Grep confirms the three flags exist in exactly one place.

<a id="p2-3"></a>
### - [ ] P2-3 · Split context into state + actions contexts (M)

**Problem:** Beyond the P0-2 memoization, `MusicProvider` still fans every reducer dispatch out to all consumers — selecting one chord re-renders `Piano` (all keys), `ChordStrip` (all cards), `ConfigBar`, `LearnMode`, `OnboardingOverlay`, and `LoadingOverlay` simultaneously, because state and actions travel in one context value (`src/contexts/MusicContext.tsx:217-240`).

**Why it matters:** Action-only consumers (e.g. `ConfigBar`'s selects) have no reason to re-render on chord changes. This is the structural fix that P0-2's `useMemo` only mitigates.

**Dependencies:** P0-2 (memoized sub-objects) is the prerequisite; P2-2 shrinks the state surface first.

**Implementation:**
1. Create two contexts in the same file: `MusicStateContext` (state + settings-derived values + `audio.loading`) and `MusicActionsContext` (`actions` + stable `audio` functions).
2. The actions value is memoized with only stable callbacks in deps, so it never changes after mount.
3. Export `useMusicState()` and `useMusicActions()`; migrate consumers — components that only dispatch (ConfigBar selects) switch to `useMusicActions()`.
4. Keep a compatibility `useMusic()` returning both during migration if useful; delete it after.

**Acceptance:** React DevTools profiler: selecting a chord no longer re-renders `ConfigBar`. Highlight-updates shows only `Piano`/`ChordStrip` subtrees repainting.

<a id="p2-4"></a>
### - [ ] P2-4 · `React.memo(PianoKey)` + stable `onPress` (S)

**Problem:** `handleKeyPress` in `src/components/Piano.tsx:74-76` is recreated every render and passed to every key (`:178-193`), and `PianoKey` (`src/components/PianoKey.tsx:21`) is not memoized — so every `setActiveMidiNotes`/`setIsGlissandoActive` update re-renders all ~25 keys. Found independently by both the state-flow and UI reviewers. This is the hottest rendering path in the app (per-note during MIDI/glissando play), and the one place memoization clearly pays for itself.

**Dependencies:** P0-2 (stable `audio.playNote`).

**Implementation:**
1. `const handleKeyPress = useCallback((freq: number) => audio.playNote(freq), [audio.playNote]);`
2. `export const PianoKey = React.memo(function PianoKey(props: PianoKeyProps) { ... });`
3. Check remaining `PianoKey` props for stability (primitives are fine; any object/array props need memoizing in `Piano`).

**Acceptance:** React DevTools profiler during a MIDI note: only the keys whose `isMidiActive` changed re-render, not the full keyboard.

<a id="p2-5"></a>
### - [ ] P2-5 · Hoist `PianoPreview` out of `ChordCard`'s render body (S)

**Problem:** `const PianoPreview = () => {...}` is defined inside `ChordCard`'s render (`src/components/ChordCard.tsx:263-351`) and rendered as `<PianoPreview />` (`:365`). Its component identity changes every render, so React **unmounts and remounts** the entire SVG subtree (12 keys + labels) on each `ChordCard` render.

**Why it matters:** Needless DOM teardown per card on every music-state change, and any future internal state in the preview would be silently dropped.

**Implementation:** Extract it to a top-level component (same file is fine) taking `rootNote`, `currentIntervals`, `keyRoot`, `mode` as props; wrap in `React.memo`. Alternatively (smallest diff) call it as a plain function — `{renderPianoPreview()}` — which avoids the remount without creating a component.

**Acceptance:** In DevTools Elements panel, the preview SVG nodes persist (no flash/recreate) when selecting chords.

<a id="p2-6"></a>
### - [ ] P2-6 · Memoize chord list computation in `ChordStrip` (S)

**Problem:** `getScaleChords(key, mode)` and `getBorrowedChords(key, mode)` are called unconditionally on every `ChordStrip` render (`src/components/ChordStrip.tsx:17-18`), producing new object arrays each time and feeding unstable props to every `ChordCard`.

**Implementation:**
```tsx
const diatonicChords = useMemo(() => getScaleChords(key, mode), [key, mode]);
const borrowedChords = useMemo(() => getBorrowedChords(key, mode), [key, mode]);
```
Optionally wrap `ChordCard` in `React.memo` once its props are stable.

**Acceptance:** Profiler shows `ChordCard`s not re-rendering when unrelated state (e.g. volume) changes.

---

## P3 — Types, domain correctness & tests

<a id="p3-1"></a>
### - [ ] P3-1 · `getChordTypeFromIntervals` → `ChordType | null` (S)

**Problem:** `src/utils/musicTheory.ts:224-239` returns `string` (not the existing `ChordType` union from `src/types/music.ts:7`) and any un-catalogued interval set silently falls through to `return 'maj'` (`:238`). `getChordSymbol` (`:241`) likewise takes `chordType: string`.

**Why it matters:** A mis-detected chord gets labeled "major" instead of surfacing an error, and callers lose all exhaustiveness checking.

**Implementation:**
1. Change the signature to `getChordTypeFromIntervals(intervals: number[]): ChordType | null`; return `null` on no match.
2. Type `getChordSymbol(rootNote: Note, chordType: ChordType)`.
3. Fix the resulting compile errors at call sites — each caller must decide what a `null` (unknown chord) means for it (usually: fall back to showing intervals raw, or skip the symbol).

**Acceptance:** `tsc` passes; a unit test asserts an unknown interval set (e.g. `[0, 1, 2]`) returns `null`, not `'maj'`.

<a id="p3-2"></a>
### - [ ] P3-2 · `ModifierLabel` union + `ChordModifier` discriminated union (M)

**Problem:** Two related modeling gaps:
- The set of valid modifier labels exists only implicitly as bare strings across three files: `src/config/chords.ts:20`, `src/config/chordModifierRules.ts:18` (`Record<string, ModifierCategory>`), `:67` (`getConflictingModifiers(modifierToAdd: string, ...)`), and the `modArray.includes('sus4')`-style checks in `getChordDisplayName` (`src/utils/musicTheory.ts:774-841`). A new modifier added to `CHORD_MODIFIERS` but forgotten in `MODIFIER_CATEGORIES` yields `undefined` category → conflict resolution silently returns `[]`.
- `ChordModifier` (`src/types/chords.ts:9-24`) is a bag of four independent optionals (`intervalToAdd?`, `intervalsToAdd?`, `intervalToRemove?`, `replaceWith?`); nothing prevents contradictory combinations, and `intervalToRemove` is used by zero modifiers and read by zero code.

**Implementation:**
1. In `src/types/chords.ts`:
   ```ts
   export type ModifierLabel = '7' | 'maj7' | '6' | '9' | 'add9' | 'sus2' | 'sus4' | /* complete from config/chords.ts */;
   export type ChordModifier = { label: ModifierLabel; /* shared display fields */ } & (
     | { kind: 'addOne'; interval: number }
     | { kind: 'addMany'; intervals: number[] }
     | { kind: 'replace'; intervals: number[] }
   );
   ```
   Drop `intervalToRemove` until something needs it.
2. Type `CHORD_MODIFIERS: ChordModifier[]` and `MODIFIER_CATEGORIES: Record<ModifierLabel, ModifierCategory>` — the `Record` over the union forces completeness at compile time.
3. `getConflictingModifiers(modifierToAdd: ModifierLabel, activeModifiers: Set<ModifierLabel>)`.
4. Consumers `switch (mod.kind)` — with `noImplicitReturns` already on, missing cases become compile errors.

**Acceptance:** Deliberately comment out one entry in `MODIFIER_CATEGORIES` → `tsc` fails. A typo'd label anywhere fails to compile.

<a id="p3-3"></a>
### - [ ] P3-3 · Enable `noUncheckedIndexedAccess` (M)

**Problem:** `tsconfig.app.json:19-36` has an otherwise excellent strict block, but `noUncheckedIndexedAccess` is off while the domain code is saturated with unchecked indexing — `NOTES[noteIndex]`, `scaleSpellings[i]`, `romanNumerals[scaleDegree]`, etc. `NOTES.indexOf(x)` returning `-1` then `NOTES[-1]` yields runtime `undefined` with no type error.

**Implementation:**
1. Add `"noUncheckedIndexedAccess": true` to `tsconfig.app.json`.
2. Fix the fallout file by file: guard `indexOf(...) === -1` cases explicitly; where an index is provably in range (e.g. `% 12` arithmetic into a 12-element array), a non-null assertion with a one-line comment is acceptable.
3. Do this **before** the codebase grows — the fallout is tractable now.

**Acceptance:** `tsc -b` passes with the flag on; no blanket `!` sprinkled without range justification.

<a id="p3-4"></a>
### - [ ] P3-4 · Fix ambiguous minor scale-degree labels (S)

**Problem:** `getScaleDegreeLabel` (`src/utils/musicTheory.ts:481-490`) labels chromatic tones in minor with bare numbers identical to diatonic ones: interval 4 (raised 3rd) → `'3'` while diatonic interval 3 is also `'3'`; likewise `'6'` (intervals 8 and 9) and `'7'` (intervals 10 and 11). The current tests pin this behavior (`src/utils/__tests__/musicTheory.test.ts:244-254`).

**Why it matters:** In A minor, two different piano keys (C and C♯) both display "3" — actively misleading in a tool whose purpose is teaching scale degrees.

**Implementation:**
1. Label the raised chromatic variants distinctly: interval 4 → `'♮3'` (or `'3♯'` — pick one convention), 9 → `'♮6'`, 11 → `'♮7'`, reading distinctly from the diatonic `♭3/♭6/♭7`.
2. Update the test expectations at `musicTheory.test.ts:244-254` to the new contract.

**Acceptance:** In A minor, C and C♯ show different labels on the piano; tests pass with updated expectations.

<a id="p3-5"></a>
### - [ ] P3-5 · Add high-value missing tests (L)

**Problem:** There is one test file (88 cases, all green) — but it heavily covers `noteToMidi`/`midiToNoteName` utilities that are dead in the app (see P4-1), while the functions actually driving the UI are untested. Test infrastructure is fully ready (`vitest.config.ts` with jsdom + coverage, `@testing-library/react`, `src/test/setup.ts`).

**Implementation — in priority order:**
1. **`getChordDisplayName`** (`src/utils/musicTheory.ts:759`) — the most complex live function. Table-test with `it.each`: base cases (`min → 'Cm'`, `dim → 'C°'`, `aug → 'C+'`); single modifiers (`{'7'} → 'C7'`, `{'maj7'} → 'Cmaj7'`, `{'add9'} → 'Cadd9'`, `{'sus4'} → 'Csus4'`); the priority ladder (`{'7','9','13'} → 'C13'`); and the sus+extension edge cases (`{'sus4','9'}`, `{'sus2','add9'}`) — pin current behavior **before** any refactor of this function.
2. **`getConflictingModifiers`** (`src/config/chordModifierRules.ts:67`) — pure and easy: adding `'7'` with `'maj7'` active returns `['maj7']`; adding `'sus4'` clears `'dim'`; unknown label → `[]`; empty active set → `[]`.
3. **`getBorrowedChords`** (`src/utils/musicTheory.ts:650`) — copy-paste-error-prone: C major → `iv` = F minor, `bVI`/`bVII`/`bIII` roots + intervals + types; A minor → `IV` = D major, etc.
4. **`useSettings` merge + migration** via `renderHook`: a stored partial settings object merges with defaults without dropping nested keys; a legacy blob migrates and legacy keys are deleted. (Write these against the P2-1 `SettingsProvider` if it has landed.)
5. **`generatePianoKeys`** (`src/utils/pianoUtils.ts:32`) — the *live* piano generator: white-key count, `whiteKeyIndex` monotonicity, black-key pattern, appended final C.
6. **`getChordFrequencies`** (`src/utils/musicTheory.ts:325`) — C major triad at octave 4 ≈ `[261.63, 329.63, 392.00]`; wrap-around intervals bump the octave.
7. Once these land, enable `coverage.thresholds` in `vitest.config.ts` and rely on P0-1 to enforce in CI.

**Acceptance:** New test files pass in CI; coverage thresholds set and green.

<a id="p3-6"></a>
### - [ ] P3-6 · Close the `AudioContext` on cleanup; surface it via state (S)

**Problem:** The init effect in `src/hooks/useAudioEngine.ts:88-134` has no cleanup — the `AudioContext` is never `close()`d, leaking contexts under HMR/remount (browsers cap active contexts). Additionally, `audioContext`/`instrument` are returned by reading `audioRef.current` during render (`:193-194`); they only reach consumers because the async load happens to call `setLoading(false)`, coupling correctness to that state write.

**Implementation:**
1. Return a cleanup from the init effect: `return () => { audioRef.current?.context.close(); audioRef.current = null; };` (guard for already-closed).
2. Mirror `context`/`instrument` into `useState`, set when the load completes, and return the state values — consumers then get them via a real render trigger.
3. Update P0-2's `useMemo` deps accordingly.

**Acceptance:** With Vite HMR, editing a component repeatedly doesn't accumulate `AudioContext`s (check `chrome://media-internals` or count via console). Audio still plays after reload.

---

## P4 — Cleanup & hygiene

<a id="p4-1"></a>
### - [ ] P4-1 · Delete dead code (M)

**Problem:** Verified-dead surface area across the codebase misleads readers and enlarges the context value:

- **The entire 88-key subsystem** in `src/utils/musicTheory.ts` (~`:506-627`, `:739-747`): `generate88KeyPiano`, `createPianoKeyMap`, `createMidiKeyMap`, `getKeyRange`, `PIANO_RANGES`, plus `getEnharmonicSpelling`, `getRomanNumeralForChord`, `getNotesForChord`, and the `FREQUENCIES`/`BASE_FREQUENCIES` tables (`:13-65`). Zero imports outside their own definitions; `midiToNoteName`/`noteToMidi` are used only by dead code and tests.
- **Duplicate `PianoKeyData`**: `src/types/music.ts:24-35` vs the live one in `src/utils/pianoUtils.ts:3-11` — two same-named, structurally different interfaces. Keep the `pianoUtils` one and move it to `types/`.
- **Dead context surface** (`src/contexts/MusicContext.tsx`): `pianoRange`/`setPianoRange` (`:16-19,39-42,85-89,213-215`), `scaleViewEnabled`/`toggleScaleView` (partially handled by P2-2), `deselectChords` (`:191-193`) — never consumed. `stopAllNotes`/`isSupported` from `useMidiInput` (`src/hooks/useMidiInput.ts:97-109`) — unused.
- **Dead sidebar layout CSS**: `src/components/LearnMode.css:180-346` (`.learn-mode-sidebar`, `.chord-sidebar`, `.sidebar-fab`, `.sidebar-backdrop`) and `ChordStrip`'s `layout="sidebar"` branch — unreachable from `App → LearnMode`. Confirm, then prune.
- **Broken npm scripts**: `check:client`/`check:all` (`package.json:14-15`) reference `scripts/check-client.mjs`, which doesn't exist — they fail immediately. Delete or implement.
- **`lint-staged`** (`package.json:49`): installed, never configured. Either remove it, or configure `{ "*.{ts,tsx}": ["eslint --fix", "prettier --write"] }` + change `.husky/pre-commit` to `npx lint-staged` (moving full `validate` to CI, which P0-1 provides).

**Do NOT delete** `src/hooks/useGlissando.ts` — it's adopted by P0-4.

**Implementation:** Delete in one focused PR after P0/P2 items land (they touch the same files). Remove corresponding test cases for deleted functions. `noUnusedLocals` + `tsc -b` + `npm run validate` confirm nothing live broke.

**Acceptance:** `npm run validate` green; grep for each deleted symbol returns nothing; every remaining npm script runs.

<a id="p4-2"></a>
### - [ ] P4-2 · Single source of truth for the equal-temperament formula (S)

**Problem:** `A4 · 2^((midi−69)/12)` is implemented in at least three places: inlined in `getChordFrequencies` (`src/utils/musicTheory.ts:343`), encapsulated in `midiToFrequency` (`:515-517`), and inlined again in `pianoUtils.generatePianoKeys` (`src/utils/pianoUtils.ts:41`) — plus the dead lookup tables removed in P4-1.

**Implementation:** Have `getChordFrequencies` and `generatePianoKeys` call `midiToFrequency(midiNote)`. Add a frequency test first (P3-5 item 6) so the refactor is pinned.

**Acceptance:** One grep hit for `Math.pow(2` (or `2 **`) in frequency code; tests pass.

<a id="p4-3"></a>
### - [ ] P4-3 · Move domain data into `config/`; table-drive `getBorrowedChords` (M)

**Problem:** Half the music domain data lives in `config/` (`CHORD_MODIFIERS`, modifier rules) and half is embedded in the 846-line `src/utils/musicTheory.ts` (`NOTES`, `SCALES`, `MAJOR/MINOR_SCALE_SPELLINGS`, `CHORD_TYPES` at `:174-215`). Separately, `getBorrowedChords` (`:650-736`) is eight hand-copied `push` blocks differing only in numeral/offset/intervals/type, and its numerals use ASCII `'bVI'` while the rest of the app uses the `♭` glyph.

**Implementation:**
1. Move the static tables to `config/scales.ts` and `config/diatonicChords.ts`; `musicTheory.ts` becomes pure functions importing from config. Rule of thumb going forward: `config/` = data, `utils/` = behavior, `types/` = shapes.
2. Replace the push blocks with a data table:
   ```ts
   const BORROWED_CHORDS: Record<Mode, Array<{ numeral: string; semitoneOffset: number; intervals: number[]; type: ChordType }>> = { ... };
   ```
   and reduce `getBorrowedChords` to a `.map` computing `rootNote: NOTES[(rootIndex + semitoneOffset) % 12]`.
3. Standardize numerals on `♭`.
4. Write the P3-5 `getBorrowedChords` tests **before** this refactor.

**Acceptance:** Borrowed-chord tests pass unchanged (except numeral glyphs, updated deliberately); `musicTheory.ts` contains no top-level data tables.

<a id="p4-4"></a>
### - [ ] P4-4 · CSS hygiene pass (M)

**Problem — a batch of small, verified issues:**
- `@keyframes fadeIn` defined twice (`src/components/ConfigBar.css:125` and `src/components/LoadingOverlay.css:12`) — last-loaded wins globally. The MIDI dot in `src/components/Piano.tsx:158` depends on `@keyframes pulse` defined only in `LoadingOverlay.css` — a cross-file coupling that breaks if that file is split.
- z-index magic numbers scattered across files: 10, 20, 40, 50, 100, 200, 300, 9999, 10000.
- `src/components/VolumeSlider.css:158` uses `var(--text)`, which is **undefined** (tokens are `--text-primary/secondary/...`) — silently falls back to inherited color.
- No global `prefers-reduced-motion` outside onboarding: the loading overlay's infinite `pulse` (`src/components/LoadingOverlay.css:38-93`) and the MIDI status dot keep animating for vestibular-sensitive users.
- Modifier buttons resolve to 36px (coarse pointer) / 28px (`max-width:768px`) min-height with 9–11px labels (`src/components/ChordCard.css:142-159,226-277`) despite comments claiming 44px targets and an unused `SIZES.minTouchTarget = 44` token (`src/config/ui.ts:38-39`).
- `--text-muted` (`#6e7681` on `#0d1117` ≈ 4.0:1, `src/index.css:25`) is below 4.5:1 for the small text using it (`.onboarding-skip`, `.about-credit`).
- The MIDI indicator is ~25 lines of inline styles with raw hex in `src/components/Piano.tsx:135-163` — move to a CSS class using tokens.

**Implementation:** One PR: (1) move shared keyframes (`fadeIn`, `pulse`) into `index.css` and delete duplicates; (2) add z-index tokens (`--z-header`, `--z-drawer`, `--z-overlay`, `--z-onboarding`, `--z-toast`) and replace magic numbers; (3) fix `var(--text)` → `var(--text-primary)`; (4) add a global `@media (prefers-reduced-motion: reduce)` block disabling `pulse`/`fadeIn` and neutralizing transitions; (5) raise modifier `min-height` to `var(--size-touch-target, 44px)` driven from the token (accept fewer columns or horizontal scroll on small screens); (6) lighten `--text-muted` to ≥ 4.5:1 (e.g. `#8b949e`); (7) extract the MIDI badge styles to `Piano.css`.

**Acceptance:** Visual spot-check of all animated elements; each keyframe name defined exactly once; DevTools shows no `var(--text)` fallback warnings; modifier buttons measure ≥ 44px on a phone viewport; contrast checker passes `--text-muted` on `--bg`.

<a id="p4-5"></a>
### - [ ] P4-5 · Named `ResolvedChord` type (S)

**Problem:** The "resolved chord" concept (`{ numeral, rootNote, intervals, type }`) has no named type — `getScaleChords` (`src/utils/musicTheory.ts:632-645`) returns it by inference and `getBorrowedChords` (`:650-736`) re-declares it inline; `ChordCard`/`ChordStrip` consume both.

**Implementation:**
```ts
// src/types/music.ts
export interface ResolvedChord {
  numeral: string;
  rootNote: Note;
  intervals: number[];
  type: ChordType;
}
```
Use as the explicit return type of both functions and in `ChordStrip`/`ChordCard` prop types. Pairs naturally with P4-3.

**Acceptance:** `tsc` passes; both functions share the declared return type.

---

## Suggested sequencing

1. **P0-1 first** (CI gate — protects everything after it), then **P0-2 → P0-3** as a pair (the `audio` memoization is a prerequisite for the MIDI fix), then P0-4/P0-5/P0-6 in any order.
2. P1 items are independent of each other and of P2 — good parallel/first-issue candidates.
3. **P2-1 before P2-2** (one settings instance before de-duplicating flags); **P0-2 before P2-3/P2-4**.
4. In P3, write the pinning tests (P3-5 items 1–3) **before** the refactors that touch the same functions (P3-1, P4-3).
5. P4-1's dead-code purge goes last among code changes to avoid conflicts with everything above — except never delete `useGlissando.ts` (P0-4 adopts it).
