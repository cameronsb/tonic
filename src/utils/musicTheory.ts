import type {
  Note,
  Mode,
  ChordData,
  ChordType,
  FrequencyMap,
  PianoKeyData,
  NoteWithOctave,
} from '../types/music';

export const NOTES: Note[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const FREQUENCIES: FrequencyMap = {
  C4: 261.63,
  'C#4': 277.18,
  D4: 293.66,
  'D#4': 311.13,
  E4: 329.63,
  F4: 349.23,
  'F#4': 369.99,
  G4: 392.0,
  'G#4': 415.3,
  A4: 440.0,
  'A#4': 466.16,
  B4: 493.88,
  C5: 523.25,
  'C#5': 554.37,
  D5: 587.33,
  'D#5': 622.25,
  E5: 659.25,
  F5: 698.46,
  'F#5': 739.99,
  G5: 783.99,
  'G#5': 830.61,
  A5: 880.0,
  'A#5': 932.33,
  B5: 987.77,
  C6: 1046.5,
  'C#6': 1108.73,
  D6: 1174.66,
  'D#6': 1244.51,
  E6: 1318.51,
  F6: 1396.91,
  'F#6': 1479.98,
  G6: 1567.98,
  'G#6': 1661.22,
  A6: 1760.0,
  'A#6': 1864.66,
  B6: 1975.53,
};

export const BASE_FREQUENCIES: FrequencyMap = {
  C: 261.63,
  'C#': 277.18,
  D: 293.66,
  'D#': 311.13,
  E: 329.63,
  F: 349.23,
  'F#': 369.99,
  G: 392.0,
  'G#': 415.3,
  A: 440.0,
  'A#': 466.16,
  B: 493.88,
};

export const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
};

// Standard major scale spellings for all 12 tonics
// Using circle of fifths conventions: sharp keys use sharps, flat keys use flats
// Each scale must use each letter name exactly once (C-D-E-F-G-A-B)
export const MAJOR_SCALE_SPELLINGS: Record<Note, string[]> = {
  C: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  'C#': ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C'], // Db major (5 flats)
  D: ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
  'D#': ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'], // Eb major (3 flats)
  E: ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'],
  F: ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'],
  'F#': ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#'], // F# major (6 sharps)
  G: ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
  'G#': ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G'], // Ab major (4 flats)
  A: ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'],
  'A#': ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'], // Bb major (2 flats)
  B: ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#'],
};

// Standard natural minor scale spellings for all 12 tonics
// Minor keys use the same key signature as their relative major
export const MINOR_SCALE_SPELLINGS: Record<Note, string[]> = {
  C: ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'], // C minor (3 flats, relative to Eb major)
  'C#': ['C#', 'D#', 'E', 'F#', 'G#', 'A', 'B'], // C# minor (4 sharps, relative to E major)
  D: ['D', 'E', 'F', 'G', 'A', 'Bb', 'C'], // D minor (1 flat, relative to F major)
  'D#': ['Eb', 'F', 'Gb', 'Ab', 'Bb', 'Cb', 'Db'], // Eb minor (6 flats, relative to Gb major)
  E: ['E', 'F#', 'G', 'A', 'B', 'C', 'D'], // E minor (1 sharp, relative to G major)
  F: ['F', 'G', 'Ab', 'Bb', 'C', 'Db', 'Eb'], // F minor (4 flats, relative to Ab major)
  'F#': ['F#', 'G#', 'A', 'B', 'C#', 'D', 'E'], // F# minor (3 sharps, relative to A major)
  G: ['G', 'A', 'Bb', 'C', 'D', 'Eb', 'F'], // G minor (2 flats, relative to Bb major)
  'G#': ['G#', 'A#', 'B', 'C#', 'D#', 'E', 'F#'], // G# minor (5 sharps, relative to B major)
  A: ['A', 'B', 'C', 'D', 'E', 'F', 'G'], // A minor (0 sharps/flats, relative to C major)
  'A#': ['Bb', 'C', 'Db', 'Eb', 'F', 'Gb', 'Ab'], // Bb minor (5 flats, relative to Db major)
  B: ['B', 'C#', 'D', 'E', 'F#', 'G', 'A'], // B minor (2 sharps, relative to D major)
};

// Map chromatic indices to their enharmonic equivalents
// Index 0 = C, 1 = C#/Db, 2 = D, etc.
const ENHARMONIC_PAIRS: Record<number, { sharp: string; flat: string }> = {
  0: { sharp: 'C', flat: 'C' },
  1: { sharp: 'C#', flat: 'Db' },
  2: { sharp: 'D', flat: 'D' },
  3: { sharp: 'D#', flat: 'Eb' },
  4: { sharp: 'E', flat: 'E' },
  5: { sharp: 'F', flat: 'F' },
  6: { sharp: 'F#', flat: 'Gb' },
  7: { sharp: 'G', flat: 'G' },
  8: { sharp: 'G#', flat: 'Ab' },
  9: { sharp: 'A', flat: 'A' },
  10: { sharp: 'A#', flat: 'Bb' },
  11: { sharp: 'B', flat: 'B' },
};

// Determine if a key is a "sharp key" or "flat key" based on circle of fifths
// Sharp keys: C, G, D, A, E, B, F#
// Flat keys: F, Bb, Eb, Ab, Db, Gb
const SHARP_KEYS: Set<Note> = new Set(['C', 'G', 'D', 'A', 'E', 'B', 'F#']);
const FLAT_KEYS: Set<Note> = new Set(['F', 'A#', 'D#', 'G#', 'C#']); // A# = Bb, D# = Eb, G# = Ab, C# = Db

/**
 * Get the enharmonic spelling for a chromatic note based on musical context
 * @param chromaticIndex - The chromatic index (0-11) where 0=C, 1=C#/Db, etc.
 * @param keyRoot - The root note of the current key
 * @param mode - major or minor
 * @returns The correct enharmonic spelling (e.g., "Db" instead of "C#" in Db major)
 */
export function getEnharmonicSpelling(chromaticIndex: number, keyRoot: Note, mode: Mode): string {
  // Normalize the chromatic index to 0-11
  const normalizedIndex = ((chromaticIndex % 12) + 12) % 12;

  // Get the scale spellings for the current key and mode
  const scaleSpellings =
    mode === 'major' ? MAJOR_SCALE_SPELLINGS[keyRoot] : MINOR_SCALE_SPELLINGS[keyRoot];

  // Get the scale intervals for the mode
  const scaleIntervals = SCALES[mode];

  // Get the root note index
  const rootIndex = NOTES.indexOf(keyRoot);

  // Check if this chromatic index is in the scale
  for (let i = 0; i < scaleIntervals.length; i++) {
    const scaleNoteIndex = (rootIndex + scaleIntervals[i]) % 12;
    if (scaleNoteIndex === normalizedIndex) {
      // This note is in the scale, use the scale spelling
      return scaleSpellings[i];
    }
  }

  // This note is not in the scale (chromatic passing tone)
  // Use sharps for sharp keys, flats for flat keys
  const pair = ENHARMONIC_PAIRS[normalizedIndex];

  if (SHARP_KEYS.has(keyRoot)) {
    return pair.sharp;
  } else if (FLAT_KEYS.has(keyRoot)) {
    return pair.flat;
  }

  // Default to sharp for C (which can go either way)
  return pair.sharp;
}

export const CHORD_TYPES: Record<Mode, ChordData> = {
  major: {
    triads: [
      { numeral: 'I', type: 'maj', intervals: [0, 4, 7] },
      { numeral: 'ii', type: 'min', intervals: [0, 3, 7] },
      { numeral: 'iii', type: 'min', intervals: [0, 3, 7] },
      { numeral: 'IV', type: 'maj', intervals: [0, 4, 7] },
      { numeral: 'V', type: 'maj', intervals: [0, 4, 7] },
      { numeral: 'vi', type: 'min', intervals: [0, 3, 7] },
      { numeral: 'vii°', type: 'dim', intervals: [0, 3, 6] },
    ],
    sevenths: [
      { numeral: 'Imaj7', type: 'maj7', intervals: [0, 4, 7, 11] },
      { numeral: 'ii7', type: 'min7', intervals: [0, 3, 7, 10] },
      { numeral: 'iii7', type: 'min7', intervals: [0, 3, 7, 10] },
      { numeral: 'IVmaj7', type: 'maj7', intervals: [0, 4, 7, 11] },
      { numeral: 'V7', type: 'dom7', intervals: [0, 4, 7, 10] },
      { numeral: 'vi7', type: 'min7', intervals: [0, 3, 7, 10] },
      { numeral: 'viiø7', type: 'half-dim7', intervals: [0, 3, 6, 10] },
    ],
  },
  minor: {
    triads: [
      { numeral: 'i', type: 'min', intervals: [0, 3, 7] },
      { numeral: 'ii°', type: 'dim', intervals: [0, 3, 6] },
      { numeral: 'III', type: 'maj', intervals: [0, 4, 7] },
      { numeral: 'iv', type: 'min', intervals: [0, 3, 7] },
      { numeral: 'v', type: 'min', intervals: [0, 3, 7] },
      { numeral: 'VI', type: 'maj', intervals: [0, 4, 7] },
      { numeral: 'VII', type: 'maj', intervals: [0, 4, 7] },
    ],
    sevenths: [
      { numeral: 'i7', type: 'min7', intervals: [0, 3, 7, 10] },
      { numeral: 'iiø7', type: 'half-dim7', intervals: [0, 3, 6, 10] },
      { numeral: 'IIImaj7', type: 'maj7', intervals: [0, 4, 7, 11] },
      { numeral: 'iv7', type: 'min7', intervals: [0, 3, 7, 10] },
      { numeral: 'v7', type: 'min7', intervals: [0, 3, 7, 10] },
      { numeral: 'VImaj7', type: 'maj7', intervals: [0, 4, 7, 11] },
      { numeral: 'VII7', type: 'dom7', intervals: [0, 4, 7, 10] },
    ],
  },
};

export function getChordName(rootNote: Note, scaleType: Mode, degree: number): Note {
  const noteIndex = NOTES.indexOf(rootNote);
  const scale = SCALES[scaleType];
  const chordRootIndex = (noteIndex + scale[degree]) % 12;
  return NOTES[chordRootIndex];
}

export function getChordTypeFromIntervals(intervals: number[]): string {
  const intervalStr = intervals.join(',');

  // Triads
  if (intervalStr === '0,4,7') return 'maj';
  if (intervalStr === '0,3,7') return 'min';
  if (intervalStr === '0,3,6') return 'dim';

  // Seventh chords
  if (intervalStr === '0,4,7,11') return 'maj7';
  if (intervalStr === '0,3,7,10') return 'min7';
  if (intervalStr === '0,4,7,10') return 'dom7';
  if (intervalStr === '0,3,6,10') return 'half-dim7';

  return 'maj'; // default
}

export function getChordSymbol(rootNote: Note, chordType: string): string {
  let symbol = rootNote;

  switch (chordType) {
    case 'min':
      symbol += 'm';
      break;
    case 'dim':
      symbol += '°';
      break;
    case 'maj7':
      symbol += 'maj7';
      break;
    case 'min7':
      symbol += 'm7';
      break;
    case 'dom7':
      symbol += '7';
      break;
    case 'half-dim7':
      symbol += 'ø7';
      break;
  }

  return symbol;
}

export function getFullChordName(rootNote: Note, intervals: number[]): string {
  const chordType = getChordTypeFromIntervals(intervals);
  return getChordSymbol(rootNote, chordType);
}

export function getRomanNumeralForChord(
  chordRoot: Note,
  chordIntervals: number[],
  keyRoot: Note,
  mode: Mode
): string {
  const keyRootIndex = NOTES.indexOf(keyRoot);
  const chordRootIndex = NOTES.indexOf(chordRoot);
  const scale = SCALES[mode];

  // Find which scale degree this chord root is
  let scaleDegree = -1;
  for (let i = 0; i < scale.length; i++) {
    const scaleNoteIndex = (keyRootIndex + scale[i]) % 12;
    if (scaleNoteIndex === chordRootIndex) {
      scaleDegree = i;
      break;
    }
  }

  // If not in scale, return "?"
  if (scaleDegree === -1) return '?';

  // Get the chord type from intervals
  const chordType = getChordTypeFromIntervals(chordIntervals);
  const chords = CHORD_TYPES[mode];

  // Check triads - use index-based loop
  for (let i = 0; i < chords.triads.length; i++) {
    const chord = chords.triads[i];
    const expectedRoot = getChordName(keyRoot, mode, i);

    if (expectedRoot === chordRoot && chord.type === chordType) {
      return chord.numeral;
    }
  }

  // Check sevenths - use index-based loop
  for (let i = 0; i < chords.sevenths.length; i++) {
    const chord = chords.sevenths[i];
    const expectedRoot = getChordName(keyRoot, mode, i);

    if (expectedRoot === chordRoot && chord.type === chordType) {
      return chord.numeral;
    }
  }

  // Fallback: return basic Roman numeral based on scale degree
  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  return romanNumerals[scaleDegree] || '?';
}

export function getChordFrequencies(
  rootNote: Note,
  intervals: number[],
  octave: number = 4
): number[] {
  const rootIndex = NOTES.indexOf(rootNote);
  const A4 = 440;

  return intervals.map((interval) => {
    const noteIndex = (rootIndex + interval) % 12;

    // Calculate octave adjustment if interval wraps around
    const octaveAdjust = Math.floor((rootIndex + interval) / 12);
    const finalOctave = octave + octaveAdjust;

    // Calculate frequency using equal temperament formula
    // frequency = A4 * 2^((n - 49)/12) where n is MIDI note number
    const midiNote = (finalOctave + 1) * 12 + noteIndex;
    return A4 * Math.pow(2, (midiNote - 69) / 12);
  });
}

export function getNotesForChord(keyRoot: Note, chordRoot: Note, intervals: number[]): string[] {
  const chordRootIndex = NOTES.indexOf(chordRoot);
  const keyRootIndex = NOTES.indexOf(keyRoot);

  // Determine octave based on relationship to key root
  // If chord root is before key root in the chromatic scale, use octave 5, otherwise 4
  const baseOctave = chordRootIndex < keyRootIndex ? 5 : 4;

  return intervals.map((interval) => {
    const noteIndex = (chordRootIndex + interval) % 12;
    const note = NOTES[noteIndex];

    // Adjust octave if we wrapped around
    const octave = chordRootIndex + interval >= 12 ? baseOctave + 1 : baseOctave;

    return `${note}${octave}`;
  });
}

/**
 * Get all notes in a scale based on root note and mode
 * @param rootNote - The root note of the scale
 * @param mode - major or minor
 * @returns Array of Note objects in the scale
 */
export function getScaleNotes(rootNote: Note, mode: Mode): Note[] {
  const rootIndex = NOTES.indexOf(rootNote);
  const scaleIntervals = SCALES[mode];

  return scaleIntervals.map((interval) => {
    const noteIndex = (rootIndex + interval) % 12;
    return NOTES[noteIndex];
  });
}

/**
 * Check if a note is in the current scale
 * @param note - The note to check
 * @param scaleNotes - Array of notes in the scale
 * @returns true if the note is in the scale
 */
export function isNoteInScale(note: Note, scaleNotes: Note[]): boolean {
  return scaleNotes.includes(note);
}

/**
 * Get the Roman numeral for a note's scale degree
 * @param note - The note to get the Roman numeral for
 * @param keyRoot - The root note of the key
 * @param mode - major or minor
 * @returns Roman numeral (I, ii, iii, etc.) or null if not in scale
 */
export function getScaleDegreeNumeral(note: Note, keyRoot: Note, mode: Mode): string | null {
  const keyRootIndex = NOTES.indexOf(keyRoot);
  const noteIndex = NOTES.indexOf(note);
  const scale = SCALES[mode];

  // Find which scale degree this note is
  let scaleDegree = -1;
  for (let i = 0; i < scale.length; i++) {
    const scaleNoteIndex = (keyRootIndex + scale[i]) % 12;
    if (scaleNoteIndex === noteIndex) {
      scaleDegree = i;
      break;
    }
  }

  // If not in scale, return null
  if (scaleDegree === -1) return null;

  // Get the appropriate triad for this scale degree
  const chords = CHORD_TYPES[mode];
  if (scaleDegree < chords.triads.length) {
    return chords.triads[scaleDegree].numeral;
  }

  return null;
}

/**
 * Get the scale degree label for a chromatic position relative to a key.
 * Returns numeric scale degrees (1-7) for diatonic notes, with accidentals for chromatic notes.
 *
 * @param chromaticPosition - Chromatic position (0-11) where C=0, C#=1, D=2, etc.
 * @param keyRoot - The root note of the key (tonic)
 * @param mode - 'major' or 'minor'
 * @returns Scale degree label (e.g., '1', '2', '♭3', '♯4', '5', '♭7')
 *
 * @example
 * // In C major, D (position 2) is the 2nd scale degree
 * getScaleDegreeLabel(2, 'C', 'major') // returns '2'
 *
 * // In C major, Eb (position 3) is a chromatic note (flat 3)
 * getScaleDegreeLabel(3, 'C', 'major') // returns '♭3'
 */
export function getScaleDegreeLabel(chromaticPosition: number, keyRoot: Note, mode: Mode): string {
  const keyRootIndex = NOTES.indexOf(keyRoot);
  const scale = SCALES[mode];

  // Normalize chromatic position to 0-11
  const normalizedPosition = ((chromaticPosition % 12) + 12) % 12;

  // Calculate the interval from the key root to this note
  const intervalFromRoot = (normalizedPosition - keyRootIndex + 12) % 12;

  // Check if this note is a diatonic scale degree
  const scaleDegreeIndex = scale.indexOf(intervalFromRoot);

  if (scaleDegreeIndex !== -1) {
    // Note is in the scale - return the scale degree number (1-7)
    return String(scaleDegreeIndex + 1);
  }

  // Note is chromatic - determine the appropriate accidental label
  // Strategy: find which diatonic degree this chromatic note is closest to
  // and label it as a raised or lowered version of that degree

  if (mode === 'major') {
    // Major scale chromatic labels (interval from root -> label)
    // These follow standard music theory conventions
    const majorChromaticLabels: Record<number, string> = {
      1: '♭2', // Minor 2nd (e.g., Db in C major)
      3: '♭3', // Minor 3rd (e.g., Eb in C major)
      6: '♭5', // Tritone / diminished 5th (e.g., Gb in C major)
      8: '♭6', // Minor 6th (e.g., Ab in C major)
      10: '♭7', // Minor 7th (e.g., Bb in C major)
    };
    return (
      majorChromaticLabels[intervalFromRoot] ||
      `♯${findNearestLowerDegree(intervalFromRoot, scale)}`
    );
  }

  // Minor scale chromatic labels
  const minorChromaticLabels: Record<number, string> = {
    1: '♭2', // Minor 2nd
    4: '3', // Major 3rd (raised 3rd in minor context)
    6: '♭5', // Tritone
    9: '6', // Major 6th (raised 6th in minor context)
    11: '7', // Major 7th (raised 7th / leading tone)
  };
  return (
    minorChromaticLabels[intervalFromRoot] || `♯${findNearestLowerDegree(intervalFromRoot, scale)}`
  );
}

/**
 * Helper: Find the nearest lower diatonic degree for a chromatic interval.
 * Used to label raised chromatic notes (e.g., ♯4 for interval 6 if 5 is not matched).
 */
function findNearestLowerDegree(interval: number, scale: number[]): number {
  for (let i = scale.length - 1; i >= 0; i--) {
    if (scale[i] < interval) {
      return i + 1; // Scale degrees are 1-indexed
    }
  }
  return 1;
}

// ============================================================================
// 88-Key Piano Generation and Utilities
// ============================================================================

/**
 * Calculate frequency for any MIDI note number using equal temperament
 * Formula: f = 440 * 2^((n - 69) / 12)
 * where n is MIDI note number and 69 is A4 (440 Hz)
 */
export function midiToFrequency(midiNumber: number): number {
  return 440 * Math.pow(2, (midiNumber - 69) / 12);
}

/**
 * Get the note name from MIDI number
 * MIDI 21 = A0, MIDI 108 = C8
 */
export function midiToNoteName(midiNumber: number): NoteWithOctave {
  const noteIndex = (midiNumber - 12) % 12; // Offset by 12 to align with NOTES array
  const octave = Math.floor((midiNumber - 12) / 12);
  return `${NOTES[noteIndex]}${octave}` as NoteWithOctave;
}

/**
 * Check if a note is a black key
 */
export function isBlackKey(note: Note): boolean {
  return note.includes('#');
}

/**
 * Generate complete 88-key piano data (A0 to C8)
 * Standard piano: MIDI numbers 21-108
 * Returns array of PianoKeyData with MIDI numbers and frequencies
 */
export function generate88KeyPiano(): PianoKeyData[] {
  const keys: PianoKeyData[] = [];
  const FIRST_KEY = 21; // A0
  const TOTAL_KEYS = 88;

  for (let i = 0; i < TOTAL_KEYS; i++) {
    const midiNumber = FIRST_KEY + i;
    const noteName = midiToNoteName(midiNumber);

    // Extract base note and octave
    const baseNote = noteName.replace(/\d+$/, '') as Note;
    const octave = parseInt(noteName.match(/\d+$/)?.[0] || '0');

    // Calculate frequency
    const frequency = midiToFrequency(midiNumber);

    // Calculate position for circular view (angle)
    const angle = (i / TOTAL_KEYS) * 360;

    // Calculate position for linear view
    // We'll use index-based positioning that can be scaled
    const x = i;
    const y = 0;

    keys.push({
      note: noteName,
      baseNote,
      octave,
      isBlack: isBlackKey(baseNote),
      midiNumber,
      frequency,
      angle,
      x,
      y,
    });
  }

  return keys;
}

/**
 * Create an efficient lookup map for piano keys by note name
 * O(1) lookup time
 */
export function createPianoKeyMap(keys: PianoKeyData[]): Map<NoteWithOctave, PianoKeyData> {
  return new Map(keys.map((key) => [key.note, key]));
}

/**
 * Create a lookup map by MIDI number
 * O(1) lookup time
 */
export function createMidiKeyMap(keys: PianoKeyData[]): Map<number, PianoKeyData> {
  return new Map(keys.map((key) => [key.midiNumber, key]));
}

/**
 * Get a subset of piano keys by MIDI range
 * @param keys - Full piano key array
 * @param startMidi - Starting MIDI number (inclusive)
 * @param endMidi - Ending MIDI number (inclusive)
 * @returns Filtered array of keys in range
 */
export function getKeyRange(
  keys: PianoKeyData[],
  startMidi: number,
  endMidi: number
): PianoKeyData[] {
  return keys.filter((key) => key.midiNumber >= startMidi && key.midiNumber <= endMidi);
}

/**
 * Get MIDI number for a note name
 * Useful for range calculations
 */
export function noteToMidi(note: NoteWithOctave): number {
  const match = note.match(/^([A-G]#?)(\d+)$/);
  if (!match) return 60; // Default to C4

  const [, noteName, octaveStr] = match;
  const octave = parseInt(octaveStr);
  const noteIndex = NOTES.indexOf(noteName as Note);

  if (noteIndex === -1) return 60;

  return (octave + 1) * 12 + noteIndex;
}

/**
 * Get all chords for a given scale (diatonic)
 */
export function getScaleChords(rootNote: Note, mode: Mode) {
  const scaleNotes = getScaleNotes(rootNote, mode);
  const chordData = CHORD_TYPES[mode];

  return chordData.triads.map((chord, index) => {
    const chordRootNote = scaleNotes[index];
    return {
      numeral: chord.numeral,
      rootNote: chordRootNote,
      intervals: chord.intervals,
      type: chord.type,
    };
  });
}

/**
 * Get common borrowed chords from parallel key (modal interchange)
 */
export function getBorrowedChords(rootNote: Note, mode: Mode) {
  const rootIndex = NOTES.indexOf(rootNote);
  const borrowedChords: Array<{
    numeral: string;
    rootNote: Note;
    intervals: number[];
    type: ChordType;
  }> = [];

  if (mode === 'major') {
    // Borrowing from parallel minor
    // iv chord (minor four) - adds emotional depth
    const ivRoot = NOTES[(rootIndex + 5) % 12];
    borrowedChords.push({
      numeral: 'iv',
      rootNote: ivRoot,
      intervals: [0, 3, 7],
      type: 'min',
    });

    // bVI chord (flat six) - dreamy, Beatles-esque
    const bVIRoot = NOTES[(rootIndex + 8) % 12];
    borrowedChords.push({
      numeral: 'bVI',
      rootNote: bVIRoot,
      intervals: [0, 4, 7],
      type: 'maj',
    });

    // bVII chord (flat seven) - modal/rock sound
    const bVIIRoot = NOTES[(rootIndex + 10) % 12];
    borrowedChords.push({
      numeral: 'bVII',
      rootNote: bVIIRoot,
      intervals: [0, 4, 7],
      type: 'maj',
    });

    // bIII chord (flat three) - Phrygian flavor
    const bIIIRoot = NOTES[(rootIndex + 3) % 12];
    borrowedChords.push({
      numeral: 'bIII',
      rootNote: bIIIRoot,
      intervals: [0, 4, 7],
      type: 'maj',
    });
  } else {
    // Borrowing from parallel major
    // IV chord (major four) - brightness
    const IVRoot = NOTES[(rootIndex + 5) % 12];
    borrowedChords.push({
      numeral: 'IV',
      rootNote: IVRoot,
      intervals: [0, 4, 7],
      type: 'maj',
    });

    // VI chord (major six)
    const VIRoot = NOTES[(rootIndex + 9) % 12];
    borrowedChords.push({
      numeral: 'VI',
      rootNote: VIRoot,
      intervals: [0, 4, 7],
      type: 'maj',
    });

    // VII chord (major seven) - leading tone resolution
    const VIIRoot = NOTES[(rootIndex + 11) % 12];
    borrowedChords.push({
      numeral: 'VII',
      rootNote: VIIRoot,
      intervals: [0, 4, 7],
      type: 'maj',
    });

    // III chord (major three) - relative major
    const IIIRoot = NOTES[(rootIndex + 3) % 12];
    borrowedChords.push({
      numeral: 'III',
      rootNote: IIIRoot,
      intervals: [0, 4, 7],
      type: 'maj',
    });
  }

  return borrowedChords;
}

/**
 * Common piano ranges as MIDI number pairs
 */
export const PIANO_RANGES = {
  full88: { start: 21, end: 108, label: 'Full Piano (88 keys)' },
  twoOctaves: { start: 60, end: 83, label: '2 Octaves (C4-B5)' },
  threeOctaves: { start: 48, end: 83, label: '3 Octaves (C3-B5)' },
  fourOctaves: { start: 48, end: 95, label: '4 Octaves (C3-B6)' },
  fiveOctaves: { start: 36, end: 95, label: '5 Octaves (C2-B6)' },
} as const;

/**
 * Get the display name for a chord with applied modifiers
 * Handles extensions (7, 9, 11, 13), alterations (sus, aug, dim), and special voicings (add9)
 *
 * @param rootNote - The root note of the chord (e.g., 'C', 'F#')
 * @param baseType - The base chord type ('maj', 'min', 'dim', 'aug')
 * @param baseIntervals - The base chord intervals before modifiers
 * @param activeModifiers - Set of modifier labels that are active (e.g., '7', 'add9', 'sus4')
 * @returns The formatted chord name (e.g., 'Cadd9', 'Fmaj7', 'Gsus4')
 */
export function getChordDisplayName(
  rootNote: Note,
  baseType: ChordType,
  baseIntervals: number[],
  activeModifiers: Set<string>
): string {
  // No modifiers - use simple chord name
  if (activeModifiers.size === 0) {
    return getFullChordName(rootNote, baseIntervals);
  }

  let name = rootNote;
  const modArray = Array.from(activeModifiers);

  // Handle diminished - replaces entire triad
  if (modArray.includes('dim')) {
    return rootNote + '°';
  }

  // Handle augmented - replaces entire triad
  if (modArray.includes('aug')) {
    return rootNote + '+';
  }

  // Handle sus chords - they replace the quality and take priority
  if (modArray.includes('sus2') || modArray.includes('sus4')) {
    const sus = modArray.find((m) => m.startsWith('sus'));
    name = rootNote + sus;

    // Can still add extensions to sus chords
    const extensions = modArray.filter((m) => !m.startsWith('sus') && !m.includes('7'));
    if (extensions.length > 0) {
      name += extensions.join('');
    }

    return name;
  }

  // Add base quality (minor/diminished from base type)
  if (baseType === 'min') {
    name += 'm';
  } else if (baseType === 'dim') {
    name += '°';
  }

  // Determine the highest/dominant extension
  // Priority: 13 > 11 > maj9/9 > maj7/7/6
  const hasThirteenth = modArray.includes('13');
  const hasEleventh = modArray.includes('11');
  const hasNinth = modArray.includes('9');
  const hasMaj9 = modArray.includes('maj9');
  const hasMaj7 = modArray.includes('maj7');
  const hasSeventh = modArray.includes('7');
  const hasSix = modArray.includes('6');
  const hasAdd9 = modArray.includes('add9');

  // If we have 13, it implies 9 and 11, so just show 13
  if (hasThirteenth) {
    name += '13';
  }
  // If we have 11, it implies 9, so just show 11
  else if (hasEleventh) {
    name += '11';
  }
  // Major 9th (maj7 + 9th)
  else if (hasMaj9) {
    name += 'maj9';
  }
  // Dominant 9th (b7 + 9th)
  else if (hasNinth) {
    name += '9';
  }
  // Just 7th chords
  else if (hasMaj7) {
    name += 'maj7';
  } else if (hasSeventh) {
    name += '7';
  } else if (hasSix) {
    name += '6';
  }
  // add9 is different - it doesn't imply a 7th
  else if (hasAdd9) {
    name += 'add9';
  }

  return name;
}
