import type { Note, Mode, ChordType } from '../types/music';
import type { ModifierLabel } from '../types/chords';
import { NOTES, SCALES, MAJOR_SCALE_SPELLINGS, MINOR_SCALE_SPELLINGS } from '../config/scales';
import { CHORD_TYPES } from '../config/diatonicChords';

// The static domain-data tables now live in `config/` (config/ = data,
// utils/ = behavior). Re-export them here so existing consumers that import
// these constants from `musicTheory` continue to resolve.
export { NOTES, SCALES, MAJOR_SCALE_SPELLINGS, MINOR_SCALE_SPELLINGS, CHORD_TYPES };

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
 * Borrowed-chord tables for modal interchange, keyed by the mode you are
 * borrowing INTO. Each entry carries only numeral/offset/quality data; the
 * concrete root note is computed at call time as
 * `NOTES[(rootIndex + semitoneOffset) % 12]`. Table-driven so every borrowed
 * chord is defined once, in one shape, rather than as hand-copied push blocks.
 */
const BORROWED_CHORDS: Record<
  Mode,
  Array<{ numeral: string; semitoneOffset: number; intervals: number[]; type: ChordType }>
> = {
  // Borrowing from the parallel minor. Numerals use the ♭ glyph to match the
  // accidental notation used elsewhere in the app (e.g. getScaleDegreeLabel).
  major: [
    { numeral: 'iv', semitoneOffset: 5, intervals: [0, 3, 7], type: 'min' }, // minor four — emotional depth
    { numeral: '♭VI', semitoneOffset: 8, intervals: [0, 4, 7], type: 'maj' }, // flat six — dreamy, Beatles-esque
    { numeral: '♭VII', semitoneOffset: 10, intervals: [0, 4, 7], type: 'maj' }, // flat seven — modal/rock sound
    { numeral: '♭III', semitoneOffset: 3, intervals: [0, 4, 7], type: 'maj' }, // flat three — Phrygian flavor
  ],
  // Borrowing from the parallel MAJOR (true modal interchange): each chord is
  // diatonic to the parallel major key, so its quality matches that major
  // scale — I and IV are major, vi is minor, vii° is diminished (not four
  // major triads).
  minor: [
    { numeral: 'I', semitoneOffset: 0, intervals: [0, 4, 7], type: 'maj' }, // Picardy tonic — bright major on the tonic
    { numeral: 'IV', semitoneOffset: 5, intervals: [0, 4, 7], type: 'maj' }, // major four — brightness
    { numeral: 'vi', semitoneOffset: 9, intervals: [0, 3, 7], type: 'min' }, // minor triad on the raised (major-scale) 6th degree
    { numeral: 'vii°', semitoneOffset: 11, intervals: [0, 3, 6], type: 'dim' }, // leading-tone diminished triad
  ],
};

/**
 * Get common borrowed chords from the parallel key (modal interchange).
 */
export function getBorrowedChords(rootNote: Note, mode: Mode) {
  const rootIndex = NOTES.indexOf(rootNote);
  // Each root is NOTES[(rootIndex + semitoneOffset) % 12]; the % 12 keeps the
  // index within 0-11, so every lookup is in range of the 12-element NOTES array.
  return BORROWED_CHORDS[mode].map((chord) => ({
    numeral: chord.numeral,
    rootNote: NOTES[(rootIndex + chord.semitoneOffset) % 12]!,
    intervals: chord.intervals,
    type: chord.type,
  }));
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
