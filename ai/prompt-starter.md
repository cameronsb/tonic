prompt-starter.md## Context for Next Agent Session

### Recent Work Completed
We just finished implementing a comprehensive chord variation system for the piano-redesign project's chord cards. This session focused exclusively on the **Chord Display** interface, separate from an ongoing drum track implementation.

### What Was Built

**Chord Variations System:**
- Added 8 chord modifiers: 7, maj7, sus2, sus4, 9, add9, 11, 13
- Implemented intelligent chord naming that follows music theory (extensions imply lower intervals: 13 → includes 9,11)
- Native `<select>` dropdown for choosing variations (compact mode)
- Full grid mode also exists but is hidden/commented out in UI

**Borrowed Chords:**
- Created `getBorrowedChords()` function in `musicTheory.ts`
- Displays 4 common borrowed chords from parallel major/minor key
- Distinguished by darker pink gradient vs purple diatonic cards

**Layout & Organization:**
- Responsive 50/50 desktop split, stacked mobile with max-height
- Dynamic grouping system (Default Order vs Grouped by Function/Impact)
- Groups: Tonic, Subdominant, Dominant, Mediant for diatonic chords
- Groups: Darkening/Emotional, Brightening/Modal for borrowed chords

**Polish:**
- Ripple effect on card clicks (20px → 600px expansion, 0.8s duration)
- Custom purple gradient scrollbars globally
- Fixed layout stability (no shifts on hover/selection)
- Improved contrast on borrowed chord cards

### Key Files Modified
- `src/components/ChordCard.tsx` - Variation logic, compact mode
- `src/components/ChordCard.css` - Ripple effect, native select styling
- `src/components/ChordDisplay.tsx` - Two-column layout, grouping system
- `src/components/ChordDisplay.css` - Responsive grid, scrollbar styling
- `src/utils/musicTheory.ts` - Borrowed chord generation
- `src/index.css` - Global scrollbar theming

### Current State
- **Compact mode is DEFAULT** (native select dropdown for variations)
- **View mode toggle is HIDDEN** (commented out, but functional if uncommented)
- **Last commit**: `7fec771` - All chord work committed
- **Uncommitted**: `src/hooks/useGrid.ts` (likely drum-related, intentionally excluded)

### Architecture Notes
- ChordCard has a `compact` prop (boolean) - defaults to compact via ChordDisplay
- Variations use single-select (can only apply one modifier at a time via select)
- Full mode still has grid of checkboxes (currently inaccessible but code intact)
- Fixed positioning was attempted for dropdowns but replaced with native select
- Ripple uses CSS-only `::before` pseudo-element on `.chord-card-main`

### Project Context
- This is a React/TypeScript music composition tool
- Uses Web Audio API for playback (via `useAudioEngine` hook)
- Has contexts: `MusicContext` for state management
- Parallel effort exists on drum sequencer (deliberately kept separate)

The chord interface is production-ready and committed. The codebase is clean with no linting errors.