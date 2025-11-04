# Piano Redesign Codebase - Comprehensive Architecture Analysis

## Executive Summary

The piano-redesign is a sophisticated React-based web application for music theory learning and composition. It features a dual-mode interface (Learn/Build), interactive piano keyboard, chord management system, and drum sequencer. The codebase is well-structured with clear separation of concerns, though there are opportunities for improved abstraction and reduced coupling.

**Total Codebase Size:** ~4,400 lines of TypeScript/TSX code

---

## 1. PROJECT STRUCTURE & ARCHITECTURE

### Directory Organization
```
src/
├── App.tsx                     # Root application component
├── main.tsx                    # Entry point
├── index.css                   # Global styles
├── types/                      # TypeScript type definitions
│   ├── music.ts               # Music domain types
│   ├── settings.ts            # User settings/preferences
│   └── soundfont-player.d.ts   # Type declarations
├── contexts/                  # React context providers
│   └── MusicContext.tsx        # Global music state management
├── hooks/                      # Custom React hooks
│   ├── useAudioEngine.ts       # Audio playback engine
│   ├── useMusic.ts             # Context consumer hook
│   ├── useSettings.ts          # Settings management
│   ├── usePlayback.ts          # Playback scheduling
│   ├── useLocalStorage.ts      # Persistent storage
│   ├── useResizable*.ts        # Drag-to-resize logic
│   └── useGrid.ts              # Grid-based layout
├── components/                 # React UI components
│   ├── ConfigBar.tsx           # Top control bar
│   ├── LearnMode.tsx           # Learning interface
│   ├── BuildMode.tsx           # Composition interface
│   ├── Piano.tsx               # Piano keyboard
│   ├── PianoKey.tsx            # Individual key
│   ├── ChordDisplay.tsx         # Chord selector UI
│   ├── ChordCard.tsx            # Individual chord card
│   ├── ChordPalette.tsx         # Chord grid
│   ├── ChordBlock.tsx           # Timeline chord block
│   ├── ChordTimeline.tsx        # Progression timeline
│   ├── DrumSequencer.tsx        # Drum pattern editor
│   ├── DrumTrack.tsx            # Drum track display
│   ├── VolumeControl.tsx        # Master volume UI
│   ├── VolumeSlider.tsx         # Volume slider widget
│   ├── VolumeKnob.tsx           # Volume knob widget
│   └── Ruler.tsx                # Timeline ruler
├── utils/                      # Utility functions
│   ├── musicTheory.ts          # Music theory calculations
│   ├── pianoUtils.ts           # Piano key generation
│   └── deviceDetection.ts      # Device/OS detection
```

### Technology Stack
- **Framework:** React 19.1.1
- **Language:** TypeScript ~5.9.3 (strict mode enabled)
- **Build Tool:** Vite 7.1.7
- **Audio:** soundfont-player 0.12.0 (Web Audio API)
- **CSS:** Pure CSS3 (no framework) - theme variables system
- **State Management:** Context API + useReducer
- **Storage:** localStorage with custom wrapper hook
- **Code Quality:** ESLint + Prettier + Husky pre-commit hooks

---

## 2. COMPONENT ORGANIZATION & HIERARCHY

### Architectural Tiers

#### Tier 1: Root Application
- **App.tsx** - Simple wrapper that:
  - Manages top-level mode state (Learn/Build)
  - Wraps children in MusicProvider
  - Routes between LearnMode and BuildMode based on state

**Concern:** Mode state could be moved to context for better testability.

#### Tier 2: Mode Components (High-Level Features)
- **LearnMode.tsx** - Learning interface with:
  - Responsive layout (desktop sidebar vs tablet full-width)
  - Device detection (iPad special handling)
  - ChordDisplay (diatonic/borrowed grouping)
  - Piano (with scale highlighting)
  - Resizable sidebar

- **BuildMode.tsx** - Composition interface with:
  - Chord palette (ChordPalette)
  - Timeline (ChordTimeline)
  - Bottom panel with tabs (Piano/Drums)
  - Resizable panel heights
  - Tab memory (localStorage)

**Concern:** Both modes have layout/UI logic mixed with state management callbacks.

#### Tier 3: Feature Components
- **ConfigBar.tsx** - Global configuration (key, mode, tempo)
  - Directly reads/writes state
  - Collapsible menu
  - Manages dropdown state locally

- **ChordDisplay.tsx** - Chord selector (450+ lines)
  - Hardcoded grouping logic (DIATONIC_GROUPS, BORROWED_GROUPS)
  - Layout variations (5 different layouts)
  - Chord filtering logic
  - Sort mode management
  - **Major Issue:** Very dense, mixes presentation with business logic

- **ChordPalette.tsx** - Chord grid (1.8KB)
  - Minimal wrapper around ChordDisplay

- **ChordTimeline.tsx** - Progression sequencer (500+ lines)
  - Block positioning logic
  - Drag-and-drop (PROBLEMATIC: no proper drag library)
  - Duration editing
  - Playback visualization
  - **Major Issue:** Complex drag/drop logic tightly coupled

#### Tier 4: Leaf Components
- **Piano.tsx** - Piano keyboard renderer
  - Glissando support (touch sliding)
  - Scale/chord highlighting
  - Key generation from utilities
  - Keyboard press callbacks

- **PianoKey.tsx** - Individual piano key
  - Visual styling (white/black, scale colors, chord highlight)
  - Click handler
  - Label rendering

- **ChordCard.tsx** - Chord display card (650+ lines)
  - Chord modifier application (12 modifiers)
  - Audio playback on modifier toggle
  - Mini piano preview
  - Multiple interaction modes
  - **Major Issue:** Extremely dense component mixing UI + state + audio

- **ChordBlock.tsx** - Timeline chord block (350+ lines)
  - Drag-to-move positioning
  - Duration editing
  - Visual feedback
  - **Issue:** Coupled drag logic

- **DrumSequencer.tsx** - 16-step drum editor
- **DrumTrack.tsx** - Drum pattern display
- **VolumeControl.tsx** - Master volume control
- **VolumeSlider.tsx** & **VolumeKnob.tsx** - Volume widgets

---

## 3. DATA MODELS & TYPE DEFINITIONS

### Core Music Types (`src/types/music.ts`)
```typescript
// Basic note representation
type Note = "C" | "C#" | "D" | ... | "B"
type NoteWithOctave = "C4" | "D5" | etc.

// Key/scale
type Mode = "major" | "minor"
type ChordType = "maj" | "min" | "dim" | "maj7" | ...

// Chord definition
interface ChordDefinition {
  numeral: string;     // "I", "ii", etc.
  type: ChordType;
  intervals: number[]; // Semitones [0, 4, 7] = major
}

// Song structure
interface Song {
  id: string;
  name: string;
  tempo: number;
  timeSignature: { numerator: number; denominator: number };
  key: Note;
  mode: Mode;
  tracks: {
    chords: ChordTrack;    // ChordBlock[]
    melody: MelodyTrack;   // MelodyNote[]
    drums: DrumTrack;      // DrumPattern[]
  };
  metadata: { createdAt: number; updatedAt: number };
}
```

### User Settings Types (`src/types/settings.ts`)
```typescript
interface VolumeSettings {
  master: number;
  tracks: { chords: number; melody: number; drums: number };
  drumSounds: { kick: number; snare: number; hihat: number };
}

interface UISettings {
  builderPanel: { height: number; activeTab: 'piano'|'drums'; rememberedHeights: {...} };
  learnSidebar: { width: number; isOpen: boolean };
  chordSort: { diatonic: 'default'|'grouped'; borrowed: 'default'|'grouped' };
  piano: { showInScaleColors: boolean; keyboardPreviewEnabled: boolean; showMiniPreview: boolean };
}
```

### Issues with Type System
1. **Incomplete enumerations** - Chord modifiers hardcoded in component, not in types
2. **Magic numbers** - Interval calculations scattered without clear contracts
3. **Missing interfaces** for:
   - Chord modifier metadata
   - Playback state details
   - Device info
   - Timeline position/duration constraints
4. **Loose coupling in types** - Settings type doesn't restrict values (volume: 0-1 not enforced)

---

## 4. STATE MANAGEMENT PATTERNS

### Context + Reducer Architecture (`MusicContext.tsx`)

**State Structure:**
```typescript
MusicState {
  song: Song;
  selectedChords: SelectedChord[];
  chordDisplayMode: "select" | "build";
  chordProgression: ChordInProgression[];
  scaleViewEnabled: boolean;
  keyboardPreviewEnabled: boolean;
  showInScaleColors: boolean;
  pianoRange: { startMidi, endMidi };
  playbackState: { isPlaying, currentBeat, loop, subdivision };
}
```

**Reducer Pattern:**
- 23+ action types (SELECT_KEY, SET_MODE, ADD_CHORD_BLOCK, etc.)
- Large switch statement (400+ lines)
- All updates create new state (immutable)
- Includes timestamp updates on modifications

**Audio Integration:**
- Wraps raw audio functions with volume multipliers
- Applies master volume × track volume × sound-specific volume
- 3 levels of volume multiplication: `finalVolume = volume * master * track[type]`

### Custom Hooks for State
1. **useMusic()** - Simple context consumer with error throwing
2. **useSettings()** - Settings with 15+ helper functions for specific paths
3. **useAudioEngine()** - Audio context initialization + playback functions
4. **usePlayback()** - Complex scheduling for audio timing

### Issues with State Management
1. **State bloat** - MusicContext handles too much (music + UI + audio)
2. **Tight coupling** - Components deeply nested in context
3. **Hard to test** - Must mock entire context
4. **Scattered logic** - Music theory calculations in utils, state in context, UI in components
5. **No clear contracts** - Settings mutations don't validate values
6. **Bidirectional coupling** - MusicContext calls useSettings, which persists to localStorage

---

## 5. STYLING APPROACH

### CSS System
- **No preprocessor** - Pure CSS3
- **Theme variables** - 11 color variables in `:root`
- **Responsive design** - Media queries + CSS Grid/Flexbox
- **Touch optimization** - Safe areas, tap targets, no callouts

### Global Theme (`src/index.css`)
```css
--bg: #1a1a1a
--surface-bg: #242424
--text: #e0e0e0
--accent: #4a9eff
--danger: #ff4a4a
/* Plus: scrollbar styling, global resets, touch optimizations */
```

### Component-Level CSS
- Each component has corresponding `.css` file
- BEM-like naming conventions
- CSS Grid heavily used for layouts
- Scoped to components (no namespace conflicts)
- Some CSS variables for dynamic values (e.g., `--white-key-count`)

### Critical Issues
1. **No design tokens system** - Hard to maintain consistent spacing, sizing
2. **Magic numbers scattered** - `44px` min-touch-height hardcoded in index.css
3. **Responsive breakpoints implicit** - No documented breakpoint strategy
4. **CSS duplication** - Similar patterns repeated in different files
5. **No CSS modules** - Relies on file organization for scoping (fragile)
6. **Inline styles in components** - `gridTemplateColumns` calculated inline
7. **Color variables not comprehensive** - Only covers primary palette

---

## 6. AUDIO SYSTEM ARCHITECTURE

### Audio Engine (`useAudioEngine.ts`)
```typescript
AudioEngine {
  context: AudioContext;           // Web Audio API context
  instrument: Player;              // soundfont-player instance
  initialized: boolean;
  loading: boolean;
}
```

### Playback Functions
1. **playNote(frequency, duration, volume)**
   - Converts frequency to MIDI
   - Plays single note with piano soundfont
   - Uses context.currentTime for scheduling

2. **playChord(frequencies[], duration, volume)**
   - Plays multiple frequencies simultaneously
   - Applies gain to each note

3. **playKick(), playSnare(), playHiHat(time, volume)**
   - Synthesized drum sounds using Web Audio API
   - Oscillators + noise generation + filters
   - Custom parameters (frequency sweeps, envelopes)

### Drum Synthesis Details
- **Kick:** Frequency sweep 150Hz → 0.01Hz (0.35s duration)
- **Snare:** Noise + tonal component (200Hz oscillator)
- **Hi-Hat:** Filtered white noise (7kHz highpass filter)

### Issues with Audio System
1. **No error recovery** - Failed audio load logs but continues silently
2. **No audio context error handling** - Suspended context may not resume
3. **Hardcoded parameters** - Frequency values, durations magic numbers
4. **No audio node cleanup** - Memory leaks possible with heavy use
5. **Single soundfont** - Only "acoustic_grand_piano" available
6. **No audio mixing** - All sounds go directly to destination
7. **Volume multiplying** - 3-level multiplication creates numerical instability

---

## 7. CONFIGURATION & CONSTANTS MANAGEMENT

### Magic Numbers/Strings (High Concentration)
Location: **Spread across components and utilities**

#### In musicTheory.ts
```typescript
const SHARP_KEYS: Set<Note> = ["C", "G", "D", "A", "E", "B", "F#"]
const FLAT_KEYS: Set<Note> = ["F", "A#", "D#", "G#", "C#"]
const PIANO_RANGES = {
  full88: { start: 21, end: 108 },
  twoOctaves: { start: 60, end: 83 },
  // ... more ranges
}
```

#### In useAudioEngine.ts
```typescript
const kick = { initialFreq: 150, minFreq: 0.01, duration: 0.35 }
const snare = { frequency: 200, noiseGain: 0.7, duration: 0.2 }
const hihat = { highpass: 7000, gain: 0.3, duration: 0.05 }
```

#### In usePlayback.ts
```typescript
const LOOKAHEAD_TIME = 0.1
const SCHEDULE_INTERVAL = 25
```

#### In ChordCard.tsx
```typescript
const CHORD_MODIFIERS = [
  { label: '7', intervalToAdd: 10 },
  { label: 'maj7', intervalToAdd: 11 },
  // ... 12 more
]
```

#### In ChordDisplay.tsx
```typescript
const DIATONIC_GROUPS = {
  major: {
    tonic: { label: 'Tonic (Stable, Home)', numerals: ['I', 'vi'] },
    // ... more groups
  }
}
```

### Issues with Constants
1. **Scattered definition** - No centralized config file
2. **Hardcoded in components** - CHORD_MODIFIERS, DIATONIC_GROUPS
3. **Unmaintainable** - Changes require searching code
4. **Not documented** - Why 7000Hz for hi-hat? Unknown
5. **Not testable** - Can't inject alternative values
6. **Duplicated** - frequencyToMidi appears in multiple files
7. **Mixed concerns** - UI strings mixed with music parameters

---

## 8. TESTING INFRASTRUCTURE

### Current Test Setup
- **Test script:** `npm run test` runs `npm run check:all`
- **TypeScript check:** `npm run typecheck` (tsc --noEmit)
- **Client check:** `npm run check:client` (custom Node.js script)
- **No unit tests** - No Jest/Vitest configuration
- **No integration tests** - No test-driven approach
- **No E2E tests** - No Cypress/Playwright

### Testing Capability Assessment
```
Component Testing:     ❌ No test framework
Hook Testing:         ❌ Would require context mocking
Integration Testing:  ❌ No approach
Audio Testing:        ⚠️ Very difficult (Web Audio API mocking)
Type Safety:          ✅ TypeScript strict mode
Linting:             ✅ ESLint + Prettier
```

### Critical Testing Gaps
1. **No tests for music theory calculations** - Interval/frequency math untested
2. **No tests for state mutations** - Reducer edge cases unknown
3. **No tests for audio scheduling** - usePlayback timing bugs possible
4. **No tests for component interactions** - UI logic untested
5. **No tests for localStorage** - Persistence assumed to work

---

## 9. BUILD & DEPLOYMENT

### Build Configuration
- **Vite build** command - Outputs to dist/
- **Source maps** - Generated for debugging
- **Production base path** - `/theory-tool-2/` (hardcoded)
- **Output format** - ESM (ES Modules)

### Deployment Strategy
- **Vite preview** - Local preview of production build
- **No CI/CD pipeline visible** - `.github/workflows/` exists but empty
- **No deployment automation** - Manual build required
- **No environment configuration** - Production path hardcoded

### Build Issues
1. **Hardcoded deployment path** - `/theory-tool-2/` in vite.config.ts
2. **No environment variables** - Configuration inflexible
3. **No build optimizations** - Tree-shaking, code splitting not configured
4. **No bundle analysis** - Unknown code size/performance

---

## 10. IDENTIFIED PROBLEMS & IMPROVEMENT AREAS

### CRITICAL ISSUES

#### 1. Monolithic Components (Very High Priority)
**Problem:** Components mix multiple concerns
- **ChordDisplay.tsx** (450+ lines): Chord logic, grouping, sorting, rendering
- **ChordCard.tsx** (650+ lines): Audio, state, UI, modifiers, preview
- **ChordTimeline.tsx** (500+ lines): Drag logic, positioning, editing, playback

**Impact:** Hard to test, reuse, reason about
**Fix Approach:** Extract business logic into custom hooks and utility functions

```typescript
// Example: Extract chord modifier logic
export function useChordModifiers(intervals: number[], rootNote: Note) {
  const [activeModifiers, setActiveModifiers] = useState<Set<string>>(new Set());
  
  const applyModifier = (modifier: ChordModifier): number[] => {
    // Pure chord interval calculation
  };
  
  return { applyModifier, activeModifiers };
}
```

#### 2. Tightly Coupled Drag-and-Drop Logic (High Priority)
**Problem:** Drag logic hardcoded in components without abstraction
- **ChordBlock.tsx**: Inline mouse event handlers
- **ChordTimeline.tsx**: Custom drag implementation
- **useResizableHorizontal.ts**: Separate resize hook but not generalized

**Impact:** Can't reuse drag patterns, hard to test, fragile
**Fix Approach:** Create generic drag/drop hook or use library

```typescript
export function useDraggable<T>(options: DraggableOptions<T>) {
  // Generalized drag logic
}
```

#### 3. Scattered Configuration & Constants (High Priority)
**Problem:** Configuration spread across codebase
- Chord modifiers hardcoded in ChordCard.tsx
- Diatonic groups hardcoded in ChordDisplay.tsx
- Audio parameters scattered in useAudioEngine.ts
- Drum sounds hardcoded with magic numbers

**Impact:** Configuration difficult to change, hard to maintain
**Fix Approach:** Create `src/config/` with:
- `chords.ts` - Chord definitions and modifiers
- `audio.ts` - Audio parameters and drum specs
- `ui.ts` - Layout constants and breakpoints
- `music.ts` - Music theory constants

#### 4. Missing Abstraction Layers (High Priority)
**Problem:** Direct coupling between components and context
- Components directly dispatch to MusicContext
- Components directly read settings
- No service/domain layer for business logic

**Impact:** Hard to refactor, test, reason about data flow
**Fix Approach:** Create domain services:

```typescript
// src/services/musicService.ts
export class MusicService {
  static getScaleChords(key: Note, mode: Mode): ChordDefinition[] { ... }
  static isNoteInScale(note: Note, scale: Note[]): boolean { ... }
  static getChordFrequencies(rootNote: Note, intervals: number[]): number[] { ... }
}
```

#### 5. Incomplete Type System (Medium-High Priority)
**Problem:** Type definitions missing critical information
- No types for chord modifiers (hardcoded in components)
- No constrained number types (0-1 for volume, not enforced)
- No types for device/responsive breakpoints
- No validation in types (e.g., tempo > 0)

**Impact:** Runtime errors not caught, unsafe operations possible
**Fix Approach:** Create comprehensive type definitions:

```typescript
// src/types/branded-types.ts
type Volume = number & { readonly __volume: true }
type BPM = number & { readonly __bpm: true }
type Frequency = number & { readonly __frequency: true }

export function createVolume(v: number): Volume {
  if (v < 0 || v > 1) throw new Error('Invalid volume');
  return v as Volume;
}
```

### HIGH PRIORITY ISSUES

#### 6. Audio System Error Handling
**Problem:** Silent failures in audio initialization
- No recovery from failed soundfont load
- AudioContext suspension not handled robustly
- Frequency/MIDI conversion errors silent

**Fix:** Proper error boundaries and user feedback

#### 7. State Management Complexity
**Problem:** 23+ action types in one reducer, too much in context
- MusicContext handles music + UI + audio state
- Hard to predict state changes
- No clear action precedence

**Fix:** Split context into multiple contexts or use state machine

#### 8. Responsive Design Issues
**Problem:** Breakpoints implicit, device detection incomplete
- iPad special handling but not other tablets
- Sidebar widths, panel heights not responsive to viewport
- CSS Grid columns hardcoded

**Fix:** Formalize responsive strategy with clear breakpoints

#### 9. Missing Documentation
**Problem:** No code comments on complex logic
- Enharmonic spelling algorithm (musicTheory.ts)
- Playback scheduling logic (usePlayback.ts)
- Drum synthesis parameters
- UI layout decisions (Learn mode vs Build mode)

**Fix:** Add JSDoc comments to all public functions/types

### MEDIUM PRIORITY ISSUES

#### 10. Component Prop Drilling
**Problem:** Many props passed through layers
- LearnMode → ChordDisplay requires many settings props
- BuildMode → Piano requires configuration props

**Fix:** Use context selectively for non-global data

#### 11. No Loading States
**Problem:** Audio loading not reflected in UI
- User can interact while soundfont loading
- No progress indication
- Silent failures if loading fails

**Fix:** Add proper loading UI and error boundaries

#### 12. Magic Numbers in CSS
**Problem:** Hardcoded values throughout styles
- `44px` minimum touch height in index.css
- `280px` - `600px` sidebar width constraints in components
- `150px` - `600px` panel height constraints

**Fix:** Centralize spacing/sizing tokens in CSS variables

#### 13. Volume Multiplication Chain
**Problem:** Three-level multiplication for audio volumes
```typescript
finalVolume = volume * master * tracks[type]
```
Creates numerical instability and complex mental models

**Fix:** Single volume calculation or use decibels

#### 14. Hardcoded Deployment Path
**Problem:** `/theory-tool-2/` hardcoded in vite.config.ts

**Fix:** Use environment variables

### LOW PRIORITY IMPROVEMENTS

#### 15. Code Organization
- Move utilities into logical modules
- Create separate file for type guards
- Organize components by feature, not by type

#### 16. Performance
- Memoization of expensive calculations
- Piano key generation could be cached
- Chord lookup maps could be memoized

#### 17. Accessibility
- ARIA labels present but inconsistent
- Keyboard navigation incomplete
- Color contrast needs verification

---

## 11. ARCHITECTURAL PATTERNS & BEST PRACTICES

### Good Patterns Used
1. ✅ **Type-safe hooks** - All hooks properly typed
2. ✅ **Immutable state** - Reducer creates new state
3. ✅ **Separation of concerns** (partial) - Utils separate from components
4. ✅ **Custom hooks** - Audio engine, settings, playback as hooks
5. ✅ **Responsive design** - CSS Grid, flexbox, safe areas
6. ✅ **Device detection** - iPad and tablet detection
7. ✅ **localStorage persistence** - Settings and songs saved
8. ✅ **Error boundaries** (partial) - Some try-catch blocks

### Problematic Patterns
1. ❌ **God component** - ChordCard, ChordDisplay too large
2. ❌ **Feature envy** - Components accessing deep context state
3. ❌ **Magic numbers** - Scattered throughout
4. ❌ **Inline styles** - Some CSS-in-JS for dynamic values
5. ❌ **Custom implementations** - Drag/drop, resizing reimplemented
6. ❌ **Tight coupling** - Components to context, components to each other
7. ❌ **No abstraction** - Direct DOM/audio API usage in components

---

## 12. RECOMMENDATIONS PRIORITIZED

### Phase 1: Stability & Testing (Weeks 1-2)
1. Create configuration module (`src/config/`)
2. Extract music theory service (pure functions)
3. Add component tests (jest/vitest)
4. Fix audio error handling

### Phase 2: Refactoring (Weeks 3-4)
1. Split MusicContext into smaller contexts
2. Extract business logic from components
3. Create reusable drag/resize hooks
4. Add comprehensive types with branded types

### Phase 3: Enhancement (Weeks 5-6)
1. Implement proper design system
2. Add loading states and error boundaries
3. Implement playback visualization
4. Add keyboard navigation

### Phase 4: Optimization (Weeks 7+)
1. Performance profiling and optimization
2. Code splitting and lazy loading
3. Bundle size analysis
4. Accessibility audit

---

## 13. COMPONENT DEPENDENCY GRAPH

```
App
├── MusicProvider (wraps all)
├── ConfigBar
│   ├── useMusic (reads state.song, actions)
│   └── NOTES constant
├── LearnMode
│   ├── Piano
│   │   ├── useMusic (reads state.showInScaleColors, selectedChords)
│   │   ├── PianoKey (x~24)
│   │   │   └── audio.playNote
│   │   ├── generatePianoKeys (utility)
│   │   └── getScaleNotes (utility)
│   ├── ChordDisplay
│   │   ├── useMusic (read only)
│   │   ├── useSettings
│   │   ├── getScaleChords (utility)
│   │   ├── getBorrowedChords (utility)
│   │   └── ChordCard (x~7)
│   │       ├── useMusic
│   │       ├── audio.playChord
│   │       └── getChordFrequencies (utility)
│   └── useResizableHorizontal (sidebar resize)
└── BuildMode
    ├── ChordPalette
    │   └── ChordDisplay
    ├── ChordTimeline
    │   └── ChordBlock (x~many)
    │       └── audio.playChord
    ├── DrumTrack
    │   └── DrumSequencer
    │       ├── useMusic
    │       └── audio.playKick/Snare/HiHat
    ├── Piano
    └── useResizable (panel resize)
```

---

## 14. DATA FLOW ANALYSIS

### Learn Mode Data Flow
```
User clicks chord → ChordCard.onClick
  ↓
state.keyboardPreviewEnabled ? 
  → actions.selectChord(rootNote, intervals, numeral)
    → MusicContext dispatch(SELECT_CHORD)
      → state.selectedChords updated
        → Piano re-renders
          → PianoKey highlights matching base notes
  AND
  → audio.playChord(frequencies)
    → useAudioEngine.playChord()
      → instrument.play() via soundfont-player
```

### Build Mode Data Flow
```
User clicks "Add Chord" → actions.selectChord()
  → MusicContext dispatch(ADD_TO_PROGRESSION)
    → state.chordProgression.push(newChord)
      → ChordTimeline re-renders
        → ChordBlock renders
          → user can drag/resize
          → onChange → dispatch(MOVE_CHORD_BLOCK) or UPDATE_CHORD_BLOCK
```

### Audio Data Flow
```
MusicContext (volume settings)
  ↓ (volume multipliers)
audio.playNote/playChord
  ↓
useAudioEngine (context, instrument)
  ↓
soundfont-player OR Web Audio API (oscillators, filters)
  ↓
AudioContext.destination → Speaker
```

---

## 15. EXTENSIBILITY ASSESSMENT

### Easy to Extend
- Adding new chord modifiers (but requires code change)
- Adding new UI themes (CSS variables)
- Adding new device breakpoints (CSS media queries)
- Adding settings (useSettings hook handles it)

### Hard to Extend
- Adding new instrument sounds (audio engine tightly coupled)
- Adding playback effects (no effect chain)
- Adding MIDI input (no device abstraction)
- Adding multi-track editing (no timeline abstraction)
- Adding undo/redo (no command pattern)
- Adding collaboration features (no data sync layer)

### Impossible to Extend (Without Refactoring)
- Custom drum sounds (hardcoded Web Audio synthesis)
- Recording/exporting (no data format)
- Template library (no song management service)
- Themes beyond color (CSS not modular)

---

## Conclusion

The piano-redesign codebase is a well-intentioned React application with good foundational patterns (TypeScript strict mode, context/reducer, custom hooks). However, it suffers from **insufficient abstraction layers** - particularly the tight coupling between components and state, the monolithic nature of feature components, and the scattered configuration throughout the codebase.

**Key strengths:**
- Clean type system (mostly)
- Good separation of utilities
- Responsive design
- Audio engine implementation

**Key weaknesses:**
- Components too large (>600 lines)
- Business logic mixed with UI
- Configuration scattered
- No testing infrastructure
- State management handles too much
- Missing abstraction for drag/drop, audio scheduling, music theory

**Estimated refactoring effort for production-ready code:** 6-8 weeks with proper testing and documentation.

