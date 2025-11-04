Of course. Here is a meticulous breakdown of the steps to build the "Enso Piano" application, focusing on the business logic and functional implementation.

This plan is structured to build from the core logic outwards, ensuring a stable foundation before complex UI is added. Each step represents a distinct, testable piece of functionality.

---

### **Guiding Principles for the AI Agent**

*   **Logic First, UI Second:** In each step, focus on defining the data structures and functions first. The UI is simply a way to interact with this logic.
*   **Isolate Concerns:** Each "service" or "engine" should be a pure module/hook with no direct UI dependencies, making it reusable and testable.
*   **Follow the Data:** The application's state, especially the `Song` object, is the single source of truth. All user interactions modify this state, and the UI re-renders in response.
*   **Incremental Building:** Each step builds upon the last. Do not proceed until the current step's logic is functional.

---

## **AUDIT FINDINGS (November 2, 2025)**

### ✅ **COMPLETED ITEMS**

#### Phase 1: Core Foundation & Music Logic
- **Step 1: Project Setup & Core Data Models** ✅
  - Project initialized with React + TypeScript + Vite
  - `src/types/music.ts` contains core types (Note, NoteWithOctave, Mode, ChordType, etc.)
  - Missing from plan: `Song`, `ChordBlock`, `MelodyNote`, `DrumPattern` interfaces
  - What we have instead: `ChordInProgression`, `SelectedChord`, `PianoKeyData` interfaces

- **Step 2: Music Theory Service** ✅
  - `src/utils/musicTheory.ts` fully implemented (282 lines)
  - Has `getScaleChords()` with proper enharmonic spelling
  - Includes borrowed chords concept via CHORD_TYPES constant
  - Additional features beyond plan: MIDI utilities, frequency calculations

- **Step 3: Basic Audio Engine** ✅
  - `src/hooks/useAudioEngine.ts` implemented
  - Uses soundfont-player instead of oscillators (better quality)
  - `playNote()` and `playChord()` both work
  - Lazy loading on first user interaction

#### Phase 2: Building "Learn Mode"
- **Step 4: Global State Management & Configuration Bar** ✅
  - `src/contexts/MusicContext.tsx` with comprehensive state
  - `src/components/ConfigBar.tsx` with key/scale/time signature dropdowns
  - Using reducer pattern instead of simple state

- **Step 5: Interactive Piano Interface** ✅
  - `src/components/Piano.tsx` and `PianoKey.tsx` built
  - Configurable octave range (not fixed 24 keys)
  - Click to play with visual feedback
  - Touch support added

- **Step 6: "Learn Mode" Chord Display & Interaction** ⚠️ PARTIAL
  - `src/components/LearnMode.tsx` exists but minimal
  - ChordDisplay component NOT built (placeholder div)
  - ChordCard with modifiers NOT implemented
  - Missing hover-to-show modifier buttons ([7], [maj7], etc.)

#### Phase 3: Building "Build Mode" Foundation
- **Step 7: Mode Toggling & Timeline Layout** ✅
  - Mode toggling works in ConfigBar
  - `src/components/BuildMode.tsx` has correct layout
  - ChordPalette on left, ChordTimeline on right

- **Step 8: Grid Calculation Logic & Ruler** ❌ NOT IMPLEMENTED
  - No `useGrid()` hook or service
  - No pixel-to-time conversion functions
  - No Ruler component
  - No snap-to-grid functionality

- **Step 9: Chord Palette & Drag-and-Drop to Timeline** ⚠️ PARTIAL
  - `src/components/ChordPalette.tsx` exists and shows chords
  - NO drag-and-drop functionality
  - Chords are added by clicking, not dragging
  - No position/duration calculation from drop coordinates

- **Step 10: Chord Track Rendering & Interaction** ⚠️ PARTIAL
  - `src/components/ChordTimeline.tsx` exists
  - Shows chord progression as a list, NOT positioned blocks
  - NO visual timeline grid representation
  - NO drag to move/resize functionality
  - Delete works (remove button)

### ❌ **NOT IMPLEMENTED**

#### Phase 4: Adding Other Tracks & Playback
- **Step 11: Drum Track & Step Sequencer** ❌
  - No DrumTrack component
  - No DrumSequencer with 3x16 grid
  - No drum synthesis functions

- **Step 12: Melody Track & Recording Logic** ❌
  - No MelodyTrack component
  - No useRecorder() hook
  - No real-time note recording
  - No quantization logic

- **Step 13: Playback Engine Logic** ⚠️ BASIC ONLY
  - Basic playback in ChordTimeline using setInterval
  - NOT using Web Audio scheduling
  - No lookahead buffer
  - No requestAnimationFrame for smooth UI
  - No visual playhead

- **Step 14: Playback Controls & Song Management UI** ⚠️ PARTIAL
  - Play/Pause and Tempo controls exist in ChordTimeline
  - Loop toggle exists
  - NO Save/Load/Clear song functionality
  - NO localStorage persistence

### 🔧 **FOUNDATION GAPS TO ADDRESS**

1. **Missing Core Data Models:**
   - Need `Song` interface as the main container
   - Need `ChordBlock` with position/duration in the timeline
   - Need `MelodyNote` and `DrumPattern` structures
   - Current `ChordInProgression` is simpler than planned `ChordBlock`

2. **Timeline Grid System:**
   - Critical missing foundation: grid calculation logic
   - Need pixel ↔ time conversion functions
   - Need snap-to-grid functionality
   - Need visual ruler with measures/beats

3. **Proper Playback Scheduling:**
   - Current setInterval approach is not precise enough
   - Need Web Audio API scheduling with lookahead
   - Need proper clock synchronization

4. **Drag-and-Drop Infrastructure:**
   - No DnD implementation for chord blocks
   - Timeline is list-based, not grid-based
   - Can't position blocks at specific times

5. **Recording Infrastructure:**
   - No recording hook or logic
   - No quantization utilities
   - No real-time note capture

### 📋 **RECOMMENDED PRIORITY ORDER**

1. **CRITICAL - Fix Data Model Foundation:**
   - Create proper `Song` interface in `types/music.ts`
   - Refactor state to use Song as single source of truth
   - Migrate from `ChordInProgression[]` to proper timeline structure

2. **CRITICAL - Build Grid System:**
   - Create `useGrid()` hook with conversion functions
   - Implement snap-to-grid logic
   - Build Ruler component for visual reference

3. **HIGH - Upgrade ChordTimeline to Grid-Based:**
   - Convert from list view to positioned blocks
   - Implement drag-to-move and resize
   - Add visual timeline with proper positioning

4. **HIGH - Improve Playback Engine:**
   - Implement proper Web Audio scheduling
   - Add lookahead buffer
   - Create visual playhead

5. **MEDIUM - Complete Learn Mode:**
   - Build proper ChordDisplay component
   - Add ChordCard with modifier buttons
   - Implement chord variations ([7], [maj7], etc.)

6. **MEDIUM - Add Recording:**
   - Create useRecorder() hook
   - Implement melody track
   - Add quantization options

7. **LOW - Add Drum Track:**
   - Build step sequencer UI
   - Add drum synthesis
   - Integrate with playback engine

8. **LOW - Add Persistence:**
   - Implement Save/Load functionality
   - Add localStorage integration
   - Create song management UI

---

### **Meticulous Step-by-Step Implementation Plan**

#### **Phase 1: Core Foundation & Music Logic (No UI)**

**Objective:** Build the non-visual "brains" of the application.

*   **Step 1: Project Setup & Core Data Models**
    1.  Initialize a new React + TypeScript project (using Vite is recommended).
    2.  Create a file named `types.ts` or `models.ts`.
    3.  Define all the core TypeScript interfaces exactly as specified in the "Key Data Models" section (5.2). This includes `Song`, `ChordBlock`, `MelodyNote`, `DrumPattern`, and all the related `type` aliases. This is the most critical step for data integrity.

*   **Step 2: Music Theory Service**
    1.  Create a pure TypeScript module (e.g., `services/musicTheory.ts`).
    2.  Implement a function `getScaleChords(key: Note, scale: ScaleType)`.
    3.  This function's logic should:
        *   Take a root note (e.g., "C") and a scale type (e.g., "Major").
        *   Calculate the notes of that scale.
        *   Generate the 7 diatonic chords (I, ii, iii, IV, V, vi, vii°).
        *   For each chord, determine its name (e.g., "C major"), quality (major, minor, diminished), and the notes it contains (e.g., `['C', 'E', 'G']`).
        *   Return an array of objects, each representing a chord with its roman numeral, name, and notes.
    4.  Add logic to include a predefined list of common "borrowed chords" for the selected key.

*   **Step 3: Basic Audio Engine**
    1.  Create a custom hook `useAudioEngine()`.
    2.  Inside, use the Web Audio API (`AudioContext`).
    3.  Create a function `playNote(note: string)` (e.g., "C4"). This function will create an `OscillatorNode`, set its frequency based on the note name, connect it to the output, start it, and stop it after a short duration (e.g., 500ms).
    4.  Create a function `playChord(notes: string[])`. This function will create multiple oscillators—one for each note in the array—and play them simultaneously.

#### **Phase 2: Building "Learn Mode"**

**Objective:** Create the first interactive user-facing feature.

*   **Step 4: Global State Management & Configuration Bar**
    1.  Create a React Context for global application state (e.g., `MusicContext`).
    2.  This context will hold the currently selected `key`, `scale`, `octaveRange`, and `timeSignature`.
    3.  Build the static UI for the `<GlobalConfigurationBar />`.
    4.  Wire up the dropdowns so that changing them updates the values in your `MusicContext`.

*   **Step 5: Interactive Piano Interface**
    1.  Build the `<LinearPiano />` component.
    2.  It should render 24 keys.
    3.  Use the `octaveRange` from the `MusicContext` to label the keys correctly (e.g., C3, D3... C5).
    4.  When a key is clicked, call the `playNote()` function from the `useAudioEngine` hook (created in Step 3).
    5.  Add a simple visual feedback mechanism (e.g., change key color on click).

*   **Step 6: "Learn Mode" Chord Display & Interaction**
    1.  Create the `<LearnMode />` main component.
    2.  Inside it, create a `<ChordDisplay />` component.
    3.  This component will:
        *   Read the current `key` and `scale` from `MusicContext`.
        *   Pass them to the `getScaleChords` function (from Step 2) to get the list of chords.
        *   Map over the returned array and render a `<ChordCard />` for each chord.
        *   Distinguish visually between diatonic and borrowed chords.
    4.  Implement the `<ChordCard />` component logic:
        *   On click, get the chord's notes and call the `playChord()` function from the `useAudioEngine` hook.
        *   Implement the hover-to-show modifier buttons (`[7]`, `[maj7]`, etc.).
        *   When a modifier button is clicked:
            *   Update the component's internal state to track the active modifiers for that specific chord.
            *   Re-calculate the chord's notes to include the extension.
            *   Update the displayed chord name and notes.
            *   When the card is clicked again, play the *modified* chord.

#### **Phase 3: Building "Build Mode" Foundation**

**Objective:** Construct the timeline grid and the ability to place chords.

*   **Step 7: Mode Toggling & Timeline Layout**
    1.  In the main `App` component, add state to track the current mode (`'learn'` or `'build'`).
    2.  Connect this state to the "Learn | Build" tabs in the global bar.
    3.  Conditionally render `<LearnMode />` or `<BuildMode />` based on this state.
    4.  Create the basic layout for `<BuildMode />` as specified: `<ChordPalette />` on the left and `<TimelineGrid />` on the right.

*   **Step 8: Grid Calculation Logic & Ruler**
    1.  Create a `useGrid()` hook or service. This is pure logic.
    2.  It needs functions to convert between time and pixels, based on constants like `MEASURE_WIDTH` and `BEATS_PER_MEASURE`.
        *   `timeToPixels(timeInBeats: number): number`
        *   `pixelsToTime(pixels: number): number`
        *   `snapToGrid(pixels: number): number` (This should snap to the nearest 8th note pixel value).
    3.  Build the `<Ruler />` component. It should render measure numbers and beat lines dynamically using the grid calculation logic.

*   **Step 9: Chord Palette & Drag-and-Drop to Timeline**
    1.  Build the `<ChordPalette />` UI. It reuses the `getScaleChords` logic from Step 2 to display the list of available chords.
    2.  Implement drag-and-drop functionality for the palette items.
    3.  When a chord is dropped onto the `<ChordTrack />`:
        *   Get the drop's X coordinate.
        *   Use `pixelsToTime()` and `snapToGrid()` to calculate its starting position in 8th notes.
        *   Create a new `ChordBlock` object (using the interface from Step 1) with a default duration.
        *   Add this new object to the `song.tracks.chords.blocks` array in your main song state.

*   **Step 10: Chord Track Rendering & Interaction**
    1.  Build the `<ChordTrack />` component.
    2.  It should read the `song.tracks.chords.blocks` array from the state.
    3.  For each `ChordBlock` object, render a `<ChordBlock />` component.
    4.  Use `timeToPixels()` to set the `left` position and `width` of each block based on its `position` and `duration` properties.
    5.  Implement logic within `<ChordBlock />` for:
        *   **Moving:** Dragging the block should update its `position` property in the state (always snapping to the grid).
        *   **Resizing:** Dragging the right edge should update its `duration` property in the state (snapping to the grid).
        *   **Deleting:** Add a delete button or keypress listener that removes the block from the state array.

#### **Phase 4: Adding Other Tracks & Playback**

**Objective:** Make the timeline fully functional with all tracks and audio playback.

*   **Step 11: Drum Track & Step Sequencer**
    1.  Build the `<DrumTrack />` component, which will contain `<DrumSequencer />` instances for each measure.
    2.  The `<DrumSequencer />` component should render the 3 rows (Kick, Snare, Hi-Hat) with 16 clickable steps each.
    3.  Clicking a step toggles a `boolean` value in the corresponding `DrumPattern` object in the main song state (e.g., `song.tracks.drums.patterns[measureIndex].kick[stepIndex]`).
    4.  In your `useAudioEngine`, add simple synth functions: `playKick()`, `playSnare()`, `playHiHat()`.

*   **Step 12: Melody Track & Recording Logic**
    1.  Build the basic `<MelodyTrack />` component to render `MelodyNote` blocks, similar to how the chord track works.
    2.  Create a `useRecorder()` hook. This hook will manage the recording state (`isRecording`).
    3.  When recording starts, listen for events from the `<LinearPiano />` component.
    4.  On "key down", record the `pitch` and `startTime`.
    5.  On "key up", calculate the `duration`.
    6.  Create a new `MelodyNote` object and add it to the `song.tracks.melody.notes` array in the state.
    7.  Implement a simple quantization option (e.g., snap position and duration to the nearest 8th note).

*   **Step 13: Playback Engine Logic**
    1.  Create a `usePlayback()` hook. This will be the most complex piece of logic.
    2.  It will manage playback state (`isPlaying`, `currentPositionInBeats`).
    3.  It needs a `play()` method that:
        *   Starts a master clock (e.g., using `requestAnimationFrame` for smooth UI updates and `setTimeout` chains or a Web Worker for precise audio scheduling).
        *   Looks ahead slightly in time (e.g., 100ms).
        *   Finds all notes, chords, and drum hits that need to start within that lookahead window.
        *   Uses the Web Audio API's scheduling capabilities (`.start(time)`) to schedule the sounds precisely. **Do not trigger sounds directly from `setInterval`**.
        *   Updates the `currentPositionInBeats` state variable on each tick of the master clock.
    4.  The visual playhead in the UI will simply be a `<div>` whose `left` position is derived from `currentPositionInBeats` and the `timeToPixels()` function.

*   **Step 14: Playback Controls & Song Management UI**
    1.  Build the `<PlaybackControls />` component.
    2.  The Play/Pause button will call the `play()` and `pause()` methods from the `usePlayback()` hook.
    3.  The Tempo slider will update the `tempo` value in the global state, which the `usePlayback()` hook will use for its timing calculations.
    4.  Build the `<SongManager />` component with Save/Load/Clear buttons.
        *   **Save:** Take the entire `Song` state object, run `JSON.stringify()` on it, and save it to `localStorage`.
        *   **Load:** Retrieve the JSON string from `localStorage`, parse it, and use it to replace the current `Song` state.
        *   **Clear:** Reset the `Song` state object to its empty, default values.