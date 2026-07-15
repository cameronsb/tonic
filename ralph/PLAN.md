# Ralph Plan — Tonic P1

Ordered task queue for the P1 tier of `ROADMAP.md` (core-interaction accessibility). One task per iteration, in this order; full implementation detail and acceptance criteria live in each task's ROADMAP.md section (IDs match). `agent:` names the model assigned to the task.

- [x] **P1-1 · Make piano keys keyboard operable**
  - Scope: add `onKeyDown`/`onKeyUp` (Enter/Space, guard `e.repeat`) to `PianoKey`; implement roving tabindex in `Piano` (single tab stop, ArrowLeft/ArrowRight move focus); ensure each key has a meaningful `aria-label`.
  - Files: `src/components/PianoKey.tsx`, `src/components/Piano.tsx`
  - Depends on: —
  - Agent: opus · Effort: M
  - Accept: Tab reaches the piano once; arrow keys move between keys; Enter/Space plays the focused key with the pressed visual; a screen reader announces each key's note name. (ROADMAP.md § P1-1)

- [x] **P1-2 · Make chord modifier buttons keyboard operable**
  - Scope: add `onClick` tap path to modifier buttons (prevent double-fire with the existing pointer handlers), add a keyboard "lock" path (Shift+Enter / Shift+Space mirroring long-press), reflect lock state via `aria-pressed`.
  - Files: `src/components/ChordCard.tsx`
  - Depends on: —
  - Agent: opus · Effort: M
  - Accept: keyboard only — Tab to a modifier, Enter plays the modified chord, Shift+Enter locks it (visual + `aria-pressed`), pointer behavior unchanged (no double-plays). (ROADMAP.md § P1-2)

- [x] **P1-3 · Settings drawer: `inert` when closed, dialog semantics + focus trap when open**
  - Scope: `inert={!isOpen}` on the drawer `<aside>`; add `role="dialog" aria-modal="true" aria-label="Settings"`; focus close button on open and restore focus to the settings trigger on close; trap Tab within the drawer; close on Escape.
  - Files: `src/components/ConfigBar.tsx`
  - Depends on: —
  - Agent: sonnet · Effort: M
  - Accept: drawer closed — Tab never lands on drawer controls; opening moves focus into the drawer; Tab cycles within it; Escape closes and returns focus to the settings button. (ROADMAP.md § P1-3)

- [x] **P1-4 · Re-enable pinch zoom**
  - Scope: change the viewport meta to `width=device-width, initial-scale=1.0`, dropping `maximum-scale` and `user-scalable=no`.
  - Files: `index.html`
  - Depends on: —
  - Agent: sonnet · Effort: S
  - Accept: pinch zoom works on mobile; double-tap on piano keys still doesn't trigger zoom (`touch-action: manipulation` covers interactive surfaces). (ROADMAP.md § P1-4)

- [ ] **P1-5 · Fix onboarding `aria-modal` and focus management**
  - Scope: remove `aria-modal="true"` from non-blocking coach-mark steps; on step change move focus to the tooltip heading (`tabIndex={-1}` + `.focus()` in an effect keyed on step id); add an `aria-live="polite"` region announcing step title/body.
  - Files: `src/components/Onboarding/OnboardingOverlay.tsx`
  - Depends on: —
  - Agent: sonnet · Effort: S
  - Accept: during the "select a key" step, background controls remain reachable/operable; advancing a step announces the new instruction and focus lands on the tooltip. (ROADMAP.md § P1-5)

- [ ] **P1-6 · Loading overlay accessibility semantics**
  - Scope: add `role="status" aria-live="polite"` to the overlay root; add `role="progressbar"` + `aria-valuenow`/`aria-valuemin`/`aria-valuemax` to the progress bar. (Error state from P0-5 already shares this region.)
  - Files: `src/components/LoadingOverlay.tsx`
  - Depends on: —
  - Agent: sonnet · Effort: S
  - Accept: a screen reader announces loading start and completion; the progress bar reports its value. (ROADMAP.md § P1-6)

- [ ] **P1-7 · Clear stuck pressed visual state during keyboard navigation**
  - Scope: user-reported during P1-1 testing — rapidly pressing Enter and arrowing to the next key can leave a key visually "pressed": keydown sets pressed state on key A, focus moves before keyup, so keyup fires on key B and key A never clears. Add an `onBlur` handler on `PianoKey` that clears the keyboard-pressed state (clear on focus loss regardless of which key receives keyup), and verify the keydown `e.repeat` guard + keyup pairing.
  - Files: `src/components/PianoKey.tsx` (and `src/components/Piano.tsx` if the roving-focus logic needs a hook)
  - Depends on: —
  - Agent: sonnet · Effort: S
  - Accept: arrow+Enter rapidly across keys never leaves a key stuck pressed; mouse/touch pressed behavior unchanged. (Follow-up to P1-1; not in ROADMAP.md)

---

Completed: P0 tier (see git history / ROADMAP.md).
