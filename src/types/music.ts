export type Note =
    | "C"
    | "C#"
    | "D"
    | "D#"
    | "E"
    | "F"
    | "F#"
    | "G"
    | "G#"
    | "A"
    | "A#"
    | "B";

export type NoteWithOctave = `${Note}${number}`;

export type Mode = "major" | "minor";

export type ChordType =
    | "maj"
    | "min"
    | "dim"
    | "maj7"
    | "min7"
    | "dom7"
    | "half-dim7";

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
    note: NoteWithOctave;
    baseNote: Note;
    displayName?: string; // Enharmonic spelling based on current key context
    angle: number;
    x: number;
    y: number;
    isBlack: boolean;
    octave: number;
    midiNumber: number; // MIDI note number (A0=21, C8=108)
    frequency: number; // Exact frequency in Hz
}

export interface SelectedChord {
    rootNote: Note;
    intervals: number[];
    numeral: string;
}

export type ViewMode = "circular" | "linear";

export type InteractionMode = "keySelection" | "play";

export type ChordDisplayMode = "select" | "build";
