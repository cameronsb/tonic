import type { Note } from '../types/music';

export interface PianoKeyData {
  note: string; // e.g., "C4", "C#4"
  baseNote: Note; // e.g., "C", "C#"
  octave: number;
  midiNumber: number;
  frequency: number;
  isBlack: boolean;
  whiteKeyIndex: number; // Index among white keys only (for white keys) or left white key (for black keys)
}

const BLACK_KEY_PATTERN = [
  false,
  true,
  false,
  true,
  false,
  false,
  true,
  false,
  true,
  false,
  true,
  false,
];
const NOTE_NAMES: Note[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Generates piano key data for a given range of octaves
 */
export function generatePianoKeys(startOctave: number, octaveCount: number): PianoKeyData[] {
  const keys: PianoKeyData[] = [];
  let whiteKeyIndex = 0;

  for (let octave = startOctave; octave < startOctave + octaveCount; octave++) {
    for (let semitone = 0; semitone < 12; semitone++) {
      const baseNote = NOTE_NAMES[semitone];
      const isBlack = BLACK_KEY_PATTERN[semitone];
      const midiNumber = (octave + 1) * 12 + semitone;
      const frequency = 440 * Math.pow(2, (midiNumber - 69) / 12);

      // For black keys, whiteKeyIndex represents the white key to their left
      // For white keys, it's their actual index
      keys.push({
        note: `${baseNote}${octave}`,
        baseNote,
        octave,
        midiNumber,
        frequency,
        isBlack,
        whiteKeyIndex: isBlack ? whiteKeyIndex - 1 : whiteKeyIndex,
      });

      if (!isBlack) {
        whiteKeyIndex++;
      }
    }
  }

  // Add final C note to complete the range
  const finalOctave = startOctave + octaveCount;
  const midiNumber = (finalOctave + 1) * 12;
  const frequency = 440 * Math.pow(2, (midiNumber - 69) / 12);

  keys.push({
    note: `C${finalOctave}`,
    baseNote: 'C',
    octave: finalOctave,
    midiNumber,
    frequency,
    isBlack: false,
    whiteKeyIndex,
  });

  return keys;
}

/**
 * Get the white key count for a range
 */
export function getWhiteKeyCount(keys: PianoKeyData[]): number {
  return keys.filter((k) => !k.isBlack).length;
}
