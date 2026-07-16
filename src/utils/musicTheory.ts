import type { Note, Mode, ChordData, ChordType } from '../types/music';
import type { ModifierLabel } from '../types/chords';

export const NOTES: Note[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

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
  // degree is a valid scale index (0-6) from callers; chordRootIndex is 0-11 via % 12.
  const chordRootIndex = (noteIndex + scale[degree]!) % 12;
  return NOTES[chordRootIndex]!;
}

export function getChordTypeFromIntervals(intervals: number[]): ChordType | null {
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

  return null; // unrecognized interval set - caller decides fallback
}

export function getChordSymbol(rootNote: Note, chordType: ChordType): string {
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
  // Unrecognized interval set: skip the type symbol rather than mislabel the chord.
  if (chordType === null) return rootNote;
  return getChordSymbol(rootNote, chordType);
}

export function getChordFrequencies(
  rootNote: Note,
  intervals: number[],
  octave: number = 4
): number[] {
  const rootIndex = NOTES.indexOf(rootNote);

  return intervals.map((interval) => {
    const noteIndex = (rootIndex + interval) % 12;

    // Calculate octave adjustment if interval wraps around
    const octaveAdjust = Math.floor((rootIndex + interval) / 12);
    const finalOctave = octave + octaveAdjust;

    const midiNote = (finalOctave + 1) * 12 + noteIndex;
    return midiToFrequency(midiNote);
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
    return NOTES[noteIndex]!; // noteIndex is 0-11, always in range of NOTES
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
    // i < scale.length, so scale[i] is always defined.
    const scaleNoteIndex = (keyRootIndex + scale[i]!) % 12;
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
    // Guarded above: 0 <= scaleDegree < chords.triads.length, so this is defined.
    return chords.triads[scaleDegree]!.numeral;
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
    4: '♯3', // Major 3rd (raised 3rd in minor context) - genuinely a sharp in sharp-side minor keys (e.g. C# in A minor); distinguishes from diatonic '3'
    6: '♭5', // Tritone
    9: '♯6', // Major 6th (raised 6th in minor context) - genuinely a sharp in sharp-side minor keys (e.g. F# in A minor); distinguishes from diatonic '6'
    11: '♯7', // Major 7th (raised 7th / leading tone) - genuinely a sharp in sharp-side minor keys (e.g. G# in A minor); distinguishes from diatonic '7'
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
    // 0 <= i < scale.length, so scale[i] is always defined.
    if (scale[i]! < interval) {
      return i + 1; // Scale degrees are 1-indexed
    }
  }
  return 1;
}

// ============================================================================
// MIDI / note helpers
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
 * Check if a note is a black key
 */
export function isBlackKey(note: Note): boolean {
  return note.includes('#');
}

/**
 * Get all chords for a given scale (diatonic)
 */
export function getScaleChords(rootNote: Note, mode: Mode) {
  const scaleNotes = getScaleNotes(rootNote, mode);
  const chordData = CHORD_TYPES[mode];

  return chordData.triads.map((chord, index) => {
    // index ranges over the 7 triads and scaleNotes also has 7 entries, so in range.
    const chordRootNote = scaleNotes[index]!;
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
  // Every root below is NOTES[(rootIndex + n) % 12]; the % 12 keeps the index
  // within 0-11, so each lookup is always in range of the 12-element NOTES array.
  const borrowedChords: Array<{
    numeral: string;
    rootNote: Note;
    intervals: number[];
    type: ChordType;
  }> = [];

  if (mode === 'major') {
    // Borrowing from parallel minor
    // iv chord (minor four) - adds emotional depth
    const ivRoot = NOTES[(rootIndex + 5) % 12]!;
    borrowedChords.push({
      numeral: 'iv',
      rootNote: ivRoot,
      intervals: [0, 3, 7],
      type: 'min',
    });

    // bVI chord (flat six) - dreamy, Beatles-esque
    const bVIRoot = NOTES[(rootIndex + 8) % 12]!;
    borrowedChords.push({
      numeral: 'bVI',
      rootNote: bVIRoot,
      intervals: [0, 4, 7],
      type: 'maj',
    });

    // bVII chord (flat seven) - modal/rock sound
    const bVIIRoot = NOTES[(rootIndex + 10) % 12]!;
    borrowedChords.push({
      numeral: 'bVII',
      rootNote: bVIIRoot,
      intervals: [0, 4, 7],
      type: 'maj',
    });

    // bIII chord (flat three) - Phrygian flavor
    const bIIIRoot = NOTES[(rootIndex + 3) % 12]!;
    borrowedChords.push({
      numeral: 'bIII',
      rootNote: bIIIRoot,
      intervals: [0, 4, 7],
      type: 'maj',
    });
  } else {
    // Borrowing from parallel major (true modal interchange): each chord below
    // is diatonic to the parallel MAJOR key, so its quality matches that major
    // scale — I and IV are major, vi is minor, vii° is diminished. (Not every
    // triad is major: only I, IV, and V are, so the parallel-major set here is
    // the major/minor/diminished mix of the major scale, not four major triads.)

    // I chord (major tonic) - the Picardy third: a bright major color on the
    // tonic in place of the diatonic minor i.
    const IRoot = NOTES[(rootIndex + 0) % 12]!;
    borrowedChords.push({
      numeral: 'I',
      rootNote: IRoot,
      intervals: [0, 4, 7],
      type: 'maj',
    });

    // IV chord (major four) - brightness
    const IVRoot = NOTES[(rootIndex + 5) % 12]!;
    borrowedChords.push({
      numeral: 'IV',
      rootNote: IVRoot,
      intervals: [0, 4, 7],
      type: 'maj',
    });

    // vi chord (minor six) - minor triad on the raised (major-scale) 6th degree
    const viRoot = NOTES[(rootIndex + 9) % 12]!;
    borrowedChords.push({
      numeral: 'vi',
      rootNote: viRoot,
      intervals: [0, 3, 7],
      type: 'min',
    });

    // vii° chord (diminished seven) - leading-tone diminished triad
    const viiRoot = NOTES[(rootIndex + 11) % 12]!;
    borrowedChords.push({
      numeral: 'vii°',
      rootNote: viiRoot,
      intervals: [0, 3, 6],
      type: 'dim',
    });
  }

  return borrowedChords;
}

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
  activeModifiers: Set<ModifierLabel>
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
