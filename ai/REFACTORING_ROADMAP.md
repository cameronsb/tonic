# Piano Redesign - Refactoring Roadmap

This document provides specific, actionable refactoring steps with code examples.

---

## Phase 1: Configuration Extraction (Week 1)

### Step 1.1: Create Config Directory Structure

```bash
mkdir -p src/config
touch src/config/chords.ts
touch src/config/audio.ts
touch src/config/ui.ts
touch src/config/music.ts
touch src/config/index.ts
```

### Step 1.2: Extract Chord Configuration

**File: `src/config/chords.ts`**

```typescript
import type { ChordModifier } from '../types/chords';

/**
 * Chord modifiers available in chord card
 * Organized in 2 rows of 6 for UI layout
 */
export const CHORD_MODIFIERS: Record<string, ChordModifier> = {
  // Row 1: Seventh chords, suspended, and altered triads
  '7': { label: '7', intervalToAdd: 10 },          // Dominant 7th
  'maj7': { label: 'maj7', intervalToAdd: 11 },    // Major 7th
  '6': { label: '6', intervalToAdd: 9 },           // Major 6th
  'sus2': { label: 'sus2', replaceWith: [0, 2, 7] },
  'sus4': { label: 'sus4', replaceWith: [0, 5, 7] },
  'dim': { label: 'dim', replaceWith: [0, 3, 6] },
  
  // Row 2: Extended chords and augmented
  '9': { label: '9', intervalsToAdd: [10, 14] },
  'maj9': { label: 'maj9', intervalsToAdd: [11, 14] },
  '11': { label: '11', intervalsToAdd: [10, 14, 17] },
  '13': { label: '13', intervalsToAdd: [10, 14, 21] },
  'add9': { label: 'add9', intervalToAdd: 14 },
  'aug': { label: 'aug', replaceWith: [0, 4, 8] },
};

/**
 * Functional groupings for diatonic chords by harmonic function
 */
export const DIATONIC_CHORD_GROUPS = {
  major: {
    tonic: { label: 'Tonic (Stable, Home)', numerals: ['I', 'vi'] },
    subdominant: { label: 'Subdominant (Departure)', numerals: ['ii', 'IV'] },
    dominant: { label: 'Dominant (Tension)', numerals: ['V', 'vii°'] },
    mediant: { label: 'Mediant (Transitional)', numerals: ['iii'] },
  },
  minor: {
    tonic: { label: 'Tonic (Stable, Home)', numerals: ['i', 'VI'] },
    subdominant: { label: 'Subdominant (Departure)', numerals: ['ii°', 'iv'] },
    dominant: { label: 'Dominant (Tension)', numerals: ['v', 'VII'] },
    mediant: { label: 'Mediant (Transitional)', numerals: ['III'] },
  },
};

/**
 * Emotional groupings for borrowed chords
 */
export const BORROWED_CHORD_GROUPS = {
  major: {
    darkening: { label: 'Darkening/Emotional', numerals: ['iv', 'bIII'] },
    brightening: { label: 'Brightening/Modal', numerals: ['bVI', 'bVII'] },
  },
  minor: {
    brightening: { label: 'Brightening/Uplifting', numerals: ['IV', 'VI', 'III'] },
    resolving: { label: 'Resolving', numerals: ['VII'] },
  },
};
```

### Step 1.3: Extract Audio Configuration

**File: `src/config/audio.ts`**

```typescript
/**
 * Audio engine configuration
 */
export const AUDIO_CONFIG = {
  soundfont: {
    name: 'acoustic_grand_piano',
    library: 'MusyngKite', // Alternative: 'FluidR3_GM'
  },
} as const;

/**
 * Drum sound synthesis parameters
 * Each drum type has specific frequency/timing characteristics
 */
export const DRUM_SOUNDS = {
  kick: {
    initialFreq: 150,      // Hz - starting frequency
    minFreq: 0.01,         // Hz - ending frequency
    duration: 0.35,        // seconds
    gainStart: 1.0,        // Normalized gain (0-1)
    gainEnd: 0.001,
  },
  snare: {
    noiseGain: 0.7,
    tonalFreq: 200,        // Hz
    tonalGain: 0.3,
    noiseDuration: 0.2,    // seconds
    tonalDuration: 0.1,    // seconds
  },
  hihat: {
    highpassFreq: 7000,    // Hz - cutoff frequency
    duration: 0.05,        // seconds
    gain: 0.3,
  },
} as const;

/**
 * Playback scheduling parameters
 */
export const PLAYBACK_CONFIG = {
  lookaheadTime: 0.1,       // seconds - how far ahead to schedule
  scheduleInterval: 25,     // milliseconds - how often to check schedule
} as const;

/**
 * Volume multiplier chain structure
 * Example: note plays at 0.8 * 0.7 (master) * 0.8 (track)
 */
export const VOLUME_DEFAULTS = {
  master: 0.7,
  tracks: {
    chords: 0.75,
    melody: 0.8,
    drums: 0.6,
  },
  drumSounds: {
    kick: 0.8,
    snare: 0.7,
    hihat: 0.6,
  },
} as const;
```

### Step 1.4: Extract UI Configuration

**File: `src/config/ui.ts`**

```typescript
/**
 * UI layout breakpoints and responsive thresholds
 */
export const UI_BREAKPOINTS = {
  // Screen size breakpoints
  mobileMax: 480,
  tabletMin: 481,
  tabletMax: 1024,
  desktopMin: 1025,
  
  // iPad specific
  ipadMin: 768,
  ipadMax: 1024,
} as const;

/**
 * Panel and component size constraints
 */
export const UI_SIZES = {
  // Builder panel height constraints
  builderPanel: {
    min: 150,
    max: 600,
    default: 250,
  },
  
  // Learn mode sidebar width constraints
  learnSidebar: {
    min: 280,
    max: 600,
    default: 420,
  },
  
  // Touch target minimum (iOS guideline)
  minTouchTarget: 44,
  
  // Spacing tokens
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
} as const;

/**
 * Color theme tokens
 */
export const COLOR_TOKENS = {
  backgrounds: {
    primary: '#1a1a1a',
    surface: '#242424',
    hover: '#2a2a2a',
  },
  text: {
    primary: '#e0e0e0',
    secondary: '#999',
  },
  interactive: {
    accent: '#4a9eff',
    accentDark: '#3a8eef',
    danger: '#ff4a4a',
    dangerBg: 'rgba(255, 74, 74, 0.1)',
    success: '#4aff4a',
    warning: '#ffaa4a',
  },
  borders: {
    default: '#333',
  },
} as const;

/**
 * Animation/transition tokens
 */
export const ANIMATION_CONFIG = {
  transitions: {
    fast: 150,    // ms
    normal: 300,  // ms
    slow: 500,    // ms
  },
} as const;
```

### Step 1.5: Extract Music Configuration

**File: `src/config/music.ts`**

```typescript
import type { Note } from '../types/music';

/**
 * Piano range presets for different use cases
 */
export const PIANO_RANGES = {
  full88: { start: 21, end: 108, label: 'Full Piano (88 keys)' },
  twoOctaves: { start: 60, end: 83, label: '2 Octaves (C4-B5)' },
  threeOctaves: { start: 48, end: 83, label: '3 Octaves (C3-B5)' },
  fourOctaves: { start: 48, end: 95, label: '4 Octaves (C3-B6)' },
  fiveOctaves: { start: 36, end: 95, label: '5 Octaves (C2-B6)' },
} as const;

/**
 * Keys grouped by circle of fifths
 * Sharp keys vs Flat keys - important for enharmonic spelling
 */
export const KEY_GROUPS = {
  sharpKeys: ['C', 'G', 'D', 'A', 'E', 'B', 'F#'] as const,
  flatKeys: ['F', 'A#', 'D#', 'G#', 'C#'] as const,
} as const;

/**
 * Default song parameters
 */
export const DEFAULT_SONG_CONFIG = {
  tempo: 120,           // BPM
  timeSignature: {
    numerator: 4,
    denominator: 4,
  },
  key: 'C' as Note,
  mode: 'major' as const,
} as const;

/**
 * MIDI note number ranges
 */
export const MIDI_RANGES = {
  piano88: { min: 21, max: 108 },  // A0 to C8
  humanVoice: { min: 36, max: 96 }, // C2 to C7
  standardKeyboard: { min: 24, max: 96 }, // C1 to C7
} as const;
```

### Step 1.6: Create Config Index

**File: `src/config/index.ts`**

```typescript
// Re-export all config for easy imports
export * from './chords';
export * from './audio';
export * from './ui';
export * from './music';

// This allows: import { CHORD_MODIFIERS, AUDIO_CONFIG } from '../config'
// Instead of: import { CHORD_MODIFIERS } from '../config/chords'
```

### Step 1.7: Update Components to Use Config

**Update `src/components/ChordCard.tsx`:**

```typescript
// OLD:
const CHORD_MODIFIERS: ChordModifier[] = [
  { label: '7', intervalToAdd: 10 },
  // ... 11 more
];

// NEW:
import { CHORD_MODIFIERS } from '../config';

// Component now just uses: CHORD_MODIFIERS
```

**Update `src/components/ChordDisplay.tsx`:**

```typescript
// OLD:
const DIATONIC_GROUPS = {
  major: { ... },
  minor: { ... },
};

// NEW:
import { DIATONIC_CHORD_GROUPS, BORROWED_CHORD_GROUPS } from '../config';

const groups = DIATONIC_CHORD_GROUPS[mode];
const borrowedGroups = BORROWED_CHORD_GROUPS[mode];
```

---

## Phase 2: Create Type Definitions (Week 1-2)

### Step 2.1: Add Missing Types

**File: `src/types/chords.ts` (new)**

```typescript
/**
 * Chord modifier transformation rules
 */
export interface ChordModifier {
  label: string;
  intervalToAdd?: number;           // Add single interval
  intervalsToAdd?: number[];        // Add multiple intervals
  intervalToRemove?: number;        // Remove specific interval
  replaceWith?: number[];           // Replace entire chord
}

/**
 * Chord grouping for UI display
 */
export interface ChordGroup {
  label: string;                    // Display label
  numerals: string[];               // Roman numerals in group
}

export type ChordGroupKey = keyof typeof DIATONIC_CHORD_GROUPS[keyof typeof DIATONIC_CHORD_GROUPS];
```

**File: `src/types/audio.ts` (new)**

```typescript
/**
 * Drum sound synthesis parameters
 */
export interface DrumSynthConfig {
  initialFreq?: number;
  minFreq?: number;
  tonalFreq?: number;
  highpassFreq?: number;
  duration: number;
  gain?: number;
  gainStart?: number;
  gainEnd?: number;
  noiseDuration?: number;
  tonalDuration?: number;
  noiseGain?: number;
  tonalGain?: number;
}

/**
 * Playback state during active playback
 */
export interface PlaybackState {
  isPlaying: boolean;
  currentTimeInEighths: number;
  loop: boolean;
  canPlay: boolean;              // Has chords to play
  hasAudio: boolean;             // Audio context ready
}

/**
 * Audio context information
 */
export interface AudioContextInfo {
  initialized: boolean;
  loading: boolean;
  suspended: boolean;
  available: boolean;
}
```

### Step 2.2: Add Branded Types for Validation

**File: `src/types/branded-types.ts` (new)**

```typescript
/**
 * Branded types for type safety
 * Prevents accidental mixing of different numeric types
 */

/**
 * Volume level (0-1 range)
 */
export type Volume = number & { readonly __volume: true };
export function createVolume(value: number): Volume {
  if (value < 0 || value > 1) {
    throw new Error(`Volume must be between 0 and 1, got ${value}`);
  }
  return value as Volume;
}

/**
 * Tempo in beats per minute
 */
export type BPM = number & { readonly __bpm: true };
export function createBPM(value: number): BPM {
  if (value <= 0) {
    throw new Error(`BPM must be positive, got ${value}`);
  }
  return value as BPM;
}

/**
 * Frequency in hertz
 */
export type Frequency = number & { readonly __frequency: true };
export function createFrequency(value: number): Frequency {
  if (value <= 0) {
    throw new Error(`Frequency must be positive, got ${value}`);
  }
  return value as Frequency;
}

/**
 * MIDI note number (0-127)
 */
export type MIDINote = number & { readonly __midi: true };
export function createMIDINote(value: number): MIDINote {
  if (value < 0 || value > 127) {
    throw new Error(`MIDI note must be 0-127, got ${value}`);
  }
  return value as MIDINote;
}
```

---

## Phase 3: Extract Business Logic from Components (Week 2-3)

### Step 3.1: Create useChordModifiers Hook

**File: `src/hooks/useChordModifiers.ts` (new)**

```typescript
import { useState, useCallback } from 'react';
import { CHORD_MODIFIERS } from '../config';
import type { Note } from '../types/music';

/**
 * Hook for managing chord modifier application
 * Separates modifier logic from component rendering
 */
export function useChordModifiers(
  initialIntervals: number[],
  rootNote: Note
) {
  const [activeModifiers, setActiveModifiers] = useState<Set<string>>(new Set());
  const [currentIntervals, setCurrentIntervals] = useState<number[]>(initialIntervals);

  /**
   * Apply or remove a chord modifier
   */
  const applyModifier = useCallback((modifierLabel: string) => {
    const modifier = CHORD_MODIFIERS[modifierLabel];
    if (!modifier) return;

    const newModifiers = new Set(activeModifiers);
    const isActive = newModifiers.has(modifierLabel);

    if (isActive) {
      newModifiers.delete(modifierLabel);
    } else {
      newModifiers.add(modifierLabel);
    }

    let newIntervals = [...initialIntervals];

    newModifiers.forEach((label) => {
      const mod = CHORD_MODIFIERS[label];
      if (!mod) return;

      if (mod.replaceWith) {
        newIntervals = mod.replaceWith;
      } else if (mod.intervalsToAdd) {
        mod.intervalsToAdd.forEach((interval) => {
          if (!newIntervals.includes(interval)) {
            newIntervals.push(interval);
          }
        });
      } else if (mod.intervalToAdd !== undefined) {
        if (!newIntervals.includes(mod.intervalToAdd)) {
          newIntervals.push(mod.intervalToAdd);
        }
      } else if (mod.intervalToRemove !== undefined) {
        newIntervals = newIntervals.filter((i) => i !== mod.intervalToRemove);
      }
    });

    newIntervals.sort((a, b) => a - b);
    setActiveModifiers(newModifiers);
    setCurrentIntervals(newIntervals);
  }, [activeModifiers, initialIntervals]);

  return {
    activeModifiers,
    currentIntervals,
    applyModifier,
    reset: useCallback(() => {
      setActiveModifiers(new Set());
      setCurrentIntervals(initialIntervals);
    }, [initialIntervals]),
  };
}
```

### Step 3.2: Create useGenericDragResize Hook

**File: `src/hooks/useDragResize.ts` (new)**

```typescript
import { useState, useCallback, useEffect, useRef } from 'react';

interface UseDragResizeOptions {
  initialSize: number;
  minSize: number;
  maxSize: number;
  direction: 'horizontal' | 'vertical';
  onResize?: (newSize: number) => void;
}

/**
 * Generic drag-to-resize hook
 * Can be used for both width and height resizing
 */
export function useDragResize({
  initialSize,
  minSize,
  maxSize,
  direction,
  onResize,
}: UseDragResizeOptions) {
  const [size, setSize] = useState(initialSize);
  const [isResizing, setIsResizing] = useState(false);
  const startPosRef = useRef(0);
  const startSizeRef = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startPosRef.current = direction === 'horizontal' ? e.clientX : e.clientY;
    startSizeRef.current = size;
  }, [size, direction]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    const currentPos = direction === 'horizontal' ? e.clientX : e.clientY;
    const delta = currentPos - startPosRef.current;
    const newSize = Math.max(minSize, Math.min(maxSize, startSizeRef.current + delta));

    setSize(newSize);
    onResize?.(newSize);
  }, [isResizing, minSize, maxSize, direction, onResize]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = direction === 'horizontal' ? 'ew-resize' : 'ns-resize';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      };
    }
    return undefined;
  }, [isResizing, handleMouseMove, handleMouseUp, direction]);

  return {
    size,
    isResizing,
    handleMouseDown,
    setSize,
  };
}
```

---

## Phase 4: Component Splitting (Week 3-4)

### Step 4.1: Split ChordCard into Smaller Components

**New file: `src/components/ChordCardModifiers.tsx`**

```typescript
import { CHORD_MODIFIERS } from '../config';
import type { ChordModifier } from '../types/chords';
import './ChordCardModifiers.css';

interface ChordCardModifiersProps {
  activeModifiers: Set<string>;
  onModifierClick: (modifier: string) => void;
  isCompact?: boolean;
}

/**
 * Chord modifier buttons component
 * Pure presentation, no logic
 */
export function ChordCardModifiers({
  activeModifiers,
  onModifierClick,
  isCompact = false,
}: ChordCardModifiersProps) {
  const modifierEntries = Object.entries(CHORD_MODIFIERS);

  return (
    <div className="chord-modifiers">
      {modifierEntries.map(([key, mod]) => (
        <button
          key={key}
          className={`modifier-btn ${activeModifiers.has(key) ? 'active' : ''}`}
          onClick={() => onModifierClick(key)}
          title={mod.label}
        >
          {mod.label}
        </button>
      ))}
    </div>
  );
}
```

### Step 4.2: Simplify ChordCard

**Updated `src/components/ChordCard.tsx`**

```typescript
import { useMusic } from '../hooks/useMusic';
import { useChordModifiers } from '../hooks/useChordModifiers';
import { ChordCardModifiers } from './ChordCardModifiers';
import { getChordFrequencies } from '../utils/musicTheory';
import type { Note, ChordType } from '../types/music';
import './ChordCard.css';

interface ChordCardProps {
  numeral: string;
  rootNote: Note;
  intervals: number[];
  type: ChordType;
  isDiatonic?: boolean;
  variationMode?: 'buttons' | 'select';
  showMiniPreview?: boolean;
}

export function ChordCard({
  numeral,
  rootNote,
  intervals,
  type,
  isDiatonic = true,
  variationMode = 'buttons',
  showMiniPreview = true,
}: ChordCardProps) {
  const { audio, actions, state } = useMusic();
  const { activeModifiers, currentIntervals, applyModifier } = 
    useChordModifiers(intervals, rootNote);

  // Check if this chord is selected
  const isSelected = state.selectedChords.length > 0 &&
    state.selectedChords[0].rootNote === rootNote &&
    state.selectedChords[0].numeral === numeral &&
    JSON.stringify(state.selectedChords[0].intervals) === JSON.stringify(currentIntervals);

  const handleSelect = () => {
    actions.selectChord(rootNote, currentIntervals, numeral);
    audio.playChord(getChordFrequencies(rootNote, currentIntervals), 0.8);
  };

  const handleModifierClick = (modifier: string) => {
    applyModifier(modifier);
    
    // Play preview
    try {
      const frequencies = getChordFrequencies(rootNote, currentIntervals);
      if (frequencies.length > 0) {
        audio.playChord(frequencies, 0.8);
      }
    } catch (error) {
      console.error('Error playing chord:', error);
    }

    // Update keyboard preview if enabled
    if (state.keyboardPreviewEnabled) {
      actions.selectChord(rootNote, currentIntervals, numeral);
    }
  };

  if (variationMode === 'select') {
    return (
      <button className="chord-card" onClick={handleSelect}>
        <div className={`chord-name ${isSelected ? 'selected' : ''}`}>
          {rootNote}{numeral}
        </div>
      </button>
    );
  }

  return (
    <div className={`chord-card ${isSelected ? 'selected' : ''}`}>
      <div className="chord-name">{rootNote}{numeral}</div>
      {showMiniPreview && <div className="mini-preview" />}
      <ChordCardModifiers
        activeModifiers={activeModifiers}
        onModifierClick={handleModifierClick}
      />
    </div>
  );
}
```

---

## Phase 5: Documentation (Week 4)

### Step 5.1: Add JSDoc Comments

**Example: `src/utils/musicTheory.ts`**

```typescript
/**
 * Get enharmonic spelling based on musical context
 * 
 * In music, the same pitch can have different names:
 * - C# (sharp) in keys with sharps (G major, D major)
 * - Db (flat) in keys with flats (F major, Bb major)
 * 
 * This function returns the correct spelling for readability.
 * 
 * @param chromaticIndex - Chromatic index (0-11) where 0=C, 1=C#/Db
 * @param keyRoot - Root note of the current key
 * @param mode - Major or minor mode
 * @returns The correct enharmonic spelling (e.g., "Db" in Db major)
 * 
 * @example
 * getEnharmonicSpelling(1, "C", "major"); // Returns "C#"
 * getEnharmonicSpelling(1, "Db", "major"); // Returns "Db"
 */
export function getEnharmonicSpelling(
  chromaticIndex: number,
  keyRoot: Note,
  mode: Mode
): string
```

---

## Implementation Order

1. **Week 1, Day 1-2:** Extract configs (chords, audio, ui, music)
2. **Week 1, Day 3-5:** Update components to use configs
3. **Week 2, Day 1-2:** Create new type definitions
4. **Week 2, Day 3-4:** Extract business logic hooks
5. **Week 2, Day 5:** Create generic hooks (drag, resize)
6. **Week 3, Day 1-3:** Split monolithic components
7. **Week 3, Day 4-5:** Testing and bug fixes
8. **Week 4:** Documentation and refinement

---

## Testing After Each Phase

After each phase, run:

```bash
npm run typecheck      # Ensure types are correct
npm run lint           # Check for linting errors
npm run build          # Verify production build
```

And manually test in browser:
- Learn mode: Can select chords, apply modifiers, hear audio
- Build mode: Can add chords to timeline, resize panels
- Settings: Can adjust volume, toggle features
- Responsive: Check tablet and desktop layouts
