export type Note = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

export type NoteWithOctave = `${Note}${number}`;

export type Mode = 'major' | 'minor';

export type ChordType = 'maj' | 'min' | 'dim' | 'maj7' | 'min7' | 'dom7' | 'half-dim7';

export interface ChordDefinition {
  numeral: string;
  type: ChordType;
  intervals: number[];
}

export interface ChordData {
  triads: ChordDefinition[];
  sevenths: ChordDefinition[];
}

export interface FrequencyMap {
  [key: string]: number;
}

export interface PianoKeyData {
  note: string; // e.g., "C4", "C#4"
  baseNote: Note; // e.g., "C", "C#"
  octave: number;
  midiNumber: number;
  frequency: number;
  isBlack: boolean;
  whiteKeyIndex: number; // Index among white keys only (for white keys) or left white key (for black keys)
}

export interface SelectedChord {
  rootNote: Note;
  intervals: number[];
  numeral: string;
}

/**
 * A chord resolved to a concrete root note within a key — the shape returned
 * by `getScaleChords` and `getBorrowedChords` (`src/utils/musicTheory.ts`).
 */
export interface ResolvedChord {
  numeral: string;
  rootNote: Note;
  intervals: number[];
  type: ChordType;
}

export type ViewMode = 'circular' | 'linear';

export type InteractionMode = 'keySelection' | 'play';

export type ChordDisplayMode = 'select' | 'build';
