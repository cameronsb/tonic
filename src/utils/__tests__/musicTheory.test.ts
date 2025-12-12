/**
 * Music Theory Utils Test Suite
 *
 * Validates core music theory calculations used throughout the Tonic app.
 *
 * Sources of truth:
 * - MIDI Specification (MIDI 69 = A4 = 440Hz)
 * - Equal Temperament Formula: f = 440 × 2^((n-69)/12)
 * - Standard music theory (Kostka & Payne, "Tonal Harmony")
 */

import { describe, it, expect } from 'vitest';
import {
    NOTES,
    SCALES,
    getScaleNotes,
    getScaleDegreeLabel,
    midiToFrequency,
    midiToNoteName,
    noteToMidi,
    getScaleChords,
    getChordTypeFromIntervals,
    isNoteInScale,
} from '../musicTheory';

// =============================================================================
// SCALE GENERATION TESTS
// =============================================================================

describe('getScaleNotes', () => {
    describe('Major scales', () => {
        it('returns correct notes for C major (no sharps/flats)', () => {
            const scale = getScaleNotes('C', 'major');
            expect(scale).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
        });

        it('returns correct notes for G major (1 sharp)', () => {
            const scale = getScaleNotes('G', 'major');
            expect(scale).toEqual(['G', 'A', 'B', 'C', 'D', 'E', 'F#']);
        });

        it('returns correct notes for D major (2 sharps)', () => {
            const scale = getScaleNotes('D', 'major');
            expect(scale).toEqual(['D', 'E', 'F#', 'G', 'A', 'B', 'C#']);
        });

        it('returns correct notes for F major (1 flat)', () => {
            const scale = getScaleNotes('F', 'major');
            // Note: Internal representation uses sharps, Bb = A#
            expect(scale).toEqual(['F', 'G', 'A', 'A#', 'C', 'D', 'E']);
        });

        it('returns exactly 7 notes for any major scale', () => {
            NOTES.forEach(note => {
                const scale = getScaleNotes(note, 'major');
                expect(scale).toHaveLength(7);
            });
        });
    });

    describe('Minor scales (natural minor)', () => {
        it('returns correct notes for A minor (relative to C major)', () => {
            const scale = getScaleNotes('A', 'minor');
            expect(scale).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
        });

        it('returns correct notes for E minor (relative to G major)', () => {
            const scale = getScaleNotes('E', 'minor');
            expect(scale).toEqual(['E', 'F#', 'G', 'A', 'B', 'C', 'D']);
        });

        it('returns correct notes for D minor (relative to F major)', () => {
            const scale = getScaleNotes('D', 'minor');
            // Note: Internal uses A# for Bb
            expect(scale).toEqual(['D', 'E', 'F', 'G', 'A', 'A#', 'C']);
        });

        it('returns exactly 7 notes for any minor scale', () => {
            NOTES.forEach(note => {
                const scale = getScaleNotes(note, 'minor');
                expect(scale).toHaveLength(7);
            });
        });
    });
});

describe('isNoteInScale', () => {
    it('correctly identifies notes in C major scale', () => {
        const cMajor = getScaleNotes('C', 'major');
        expect(isNoteInScale('C', cMajor)).toBe(true);
        expect(isNoteInScale('D', cMajor)).toBe(true);
        expect(isNoteInScale('E', cMajor)).toBe(true);
        expect(isNoteInScale('F', cMajor)).toBe(true);
        expect(isNoteInScale('G', cMajor)).toBe(true);
        expect(isNoteInScale('A', cMajor)).toBe(true);
        expect(isNoteInScale('B', cMajor)).toBe(true);
    });

    it('correctly identifies notes NOT in C major scale', () => {
        const cMajor = getScaleNotes('C', 'major');
        expect(isNoteInScale('C#', cMajor)).toBe(false);
        expect(isNoteInScale('D#', cMajor)).toBe(false);
        expect(isNoteInScale('F#', cMajor)).toBe(false);
        expect(isNoteInScale('G#', cMajor)).toBe(false);
        expect(isNoteInScale('A#', cMajor)).toBe(false);
    });
});

// =============================================================================
// SCALE DEGREE LABEL TESTS
// =============================================================================

describe('getScaleDegreeLabel', () => {
    describe('C major scale degrees', () => {
        // C major: C=0, D=2, E=4, F=5, G=7, A=9, B=11
        it('labels C (position 0) as degree 1', () => {
            expect(getScaleDegreeLabel(0, 'C', 'major')).toBe('1');
        });

        it('labels D (position 2) as degree 2', () => {
            expect(getScaleDegreeLabel(2, 'C', 'major')).toBe('2');
        });

        it('labels E (position 4) as degree 3', () => {
            expect(getScaleDegreeLabel(4, 'C', 'major')).toBe('3');
        });

        it('labels F (position 5) as degree 4', () => {
            expect(getScaleDegreeLabel(5, 'C', 'major')).toBe('4');
        });

        it('labels G (position 7) as degree 5', () => {
            expect(getScaleDegreeLabel(7, 'C', 'major')).toBe('5');
        });

        it('labels A (position 9) as degree 6', () => {
            expect(getScaleDegreeLabel(9, 'C', 'major')).toBe('6');
        });

        it('labels B (position 11) as degree 7', () => {
            expect(getScaleDegreeLabel(11, 'C', 'major')).toBe('7');
        });
    });

    describe('chord tones show scale degrees relative to tonic', () => {
        // ii chord (Dm) in C major contains D, F, A
        // These should display as scale degrees 2, 4, 6 (not chord intervals 1, b3, 5)
        it('D (ii chord root) in C major is scale degree 2', () => {
            expect(getScaleDegreeLabel(2, 'C', 'major')).toBe('2');
        });

        it('F (ii chord third) in C major is scale degree 4', () => {
            expect(getScaleDegreeLabel(5, 'C', 'major')).toBe('4');
        });

        it('A (ii chord fifth) in C major is scale degree 6', () => {
            expect(getScaleDegreeLabel(9, 'C', 'major')).toBe('6');
        });
    });

    describe('Chromatic notes in major keys', () => {
        // Notes not in the scale should show accidentals
        it('Db (position 1) in C major is b2', () => {
            expect(getScaleDegreeLabel(1, 'C', 'major')).toBe('♭2');
        });

        it('Eb (position 3) in C major is b3', () => {
            expect(getScaleDegreeLabel(3, 'C', 'major')).toBe('♭3');
        });

        it('Gb (position 6) in C major is b5', () => {
            expect(getScaleDegreeLabel(6, 'C', 'major')).toBe('♭5');
        });

        it('Ab (position 8) in C major is b6', () => {
            expect(getScaleDegreeLabel(8, 'C', 'major')).toBe('♭6');
        });

        it('Bb (position 10) in C major is b7', () => {
            expect(getScaleDegreeLabel(10, 'C', 'major')).toBe('♭7');
        });
    });

    describe('G major scale degrees (transposition test)', () => {
        // G major: G=7, A=9, B=11, C=0, D=2, E=4, F#=6
        it('G (position 7) is degree 1 in G major', () => {
            expect(getScaleDegreeLabel(7, 'G', 'major')).toBe('1');
        });

        it('A (position 9) is degree 2 in G major', () => {
            expect(getScaleDegreeLabel(9, 'G', 'major')).toBe('2');
        });

        it('B (position 11) is degree 3 in G major', () => {
            expect(getScaleDegreeLabel(11, 'G', 'major')).toBe('3');
        });

        it('C (position 0) is degree 4 in G major', () => {
            expect(getScaleDegreeLabel(0, 'G', 'major')).toBe('4');
        });

        it('D (position 2) is degree 5 in G major', () => {
            expect(getScaleDegreeLabel(2, 'G', 'major')).toBe('5');
        });

        it('F# (position 6) is degree 7 in G major', () => {
            expect(getScaleDegreeLabel(6, 'G', 'major')).toBe('7');
        });
    });

    describe('A minor scale degrees', () => {
        // A minor: A=9, B=11, C=0, D=2, E=4, F=5, G=7
        it('A (position 9) is degree 1 in A minor', () => {
            expect(getScaleDegreeLabel(9, 'A', 'minor')).toBe('1');
        });

        it('B (position 11) is degree 2 in A minor', () => {
            expect(getScaleDegreeLabel(11, 'A', 'minor')).toBe('2');
        });

        it('C (position 0) is degree 3 in A minor', () => {
            expect(getScaleDegreeLabel(0, 'A', 'minor')).toBe('3');
        });

        it('D (position 2) is degree 4 in A minor', () => {
            expect(getScaleDegreeLabel(2, 'A', 'minor')).toBe('4');
        });

        it('E (position 4) is degree 5 in A minor', () => {
            expect(getScaleDegreeLabel(4, 'A', 'minor')).toBe('5');
        });

        it('F (position 5) is degree 6 in A minor', () => {
            expect(getScaleDegreeLabel(5, 'A', 'minor')).toBe('6');
        });

        it('G (position 7) is degree 7 in A minor', () => {
            expect(getScaleDegreeLabel(7, 'A', 'minor')).toBe('7');
        });
    });

    describe('Chromatic notes in minor keys', () => {
        // In minor, raised 3, 6, 7 are common (harmonic/melodic minor)
        it('G# (position 8) in A minor is raised 7 (leading tone)', () => {
            expect(getScaleDegreeLabel(8, 'A', 'minor')).toBe('7');
        });

        it('F# (position 6) in A minor is raised 6', () => {
            expect(getScaleDegreeLabel(6, 'A', 'minor')).toBe('6');
        });

        it('C# (position 1) in A minor is raised 3 (major third)', () => {
            expect(getScaleDegreeLabel(1, 'A', 'minor')).toBe('3');
        });
    });
});

// =============================================================================
// MIDI UTILITIES TESTS
// Source of truth: MIDI Specification and Equal Temperament
// =============================================================================

describe('midiToFrequency', () => {
    // Standard reference: A4 = MIDI 69 = 440 Hz
    it('returns 440 Hz for MIDI 69 (A4 concert pitch)', () => {
        expect(midiToFrequency(69)).toBe(440);
    });

    // Octave relationships: frequency doubles every 12 semitones
    it('returns 880 Hz for MIDI 81 (A5, one octave above A4)', () => {
        expect(midiToFrequency(81)).toBe(880);
    });

    it('returns 220 Hz for MIDI 57 (A3, one octave below A4)', () => {
        expect(midiToFrequency(57)).toBe(220);
    });

    // Middle C (C4) = MIDI 60 ≈ 261.63 Hz
    it('returns approximately 261.63 Hz for MIDI 60 (C4)', () => {
        expect(midiToFrequency(60)).toBeCloseTo(261.63, 1);
    });

    // Piano extremes
    it('returns approximately 27.5 Hz for MIDI 21 (A0, lowest piano key)', () => {
        expect(midiToFrequency(21)).toBeCloseTo(27.5, 1);
    });

    it('returns approximately 4186 Hz for MIDI 108 (C8, highest piano key)', () => {
        expect(midiToFrequency(108)).toBeCloseTo(4186.01, 0);
    });
});

describe('midiToNoteName', () => {
    it('returns C4 for MIDI 60 (middle C)', () => {
        expect(midiToNoteName(60)).toBe('C4');
    });

    it('returns A4 for MIDI 69 (concert A)', () => {
        expect(midiToNoteName(69)).toBe('A4');
    });

    it('returns A0 for MIDI 21 (lowest piano key)', () => {
        expect(midiToNoteName(21)).toBe('A0');
    });

    it('returns C8 for MIDI 108 (highest piano key)', () => {
        expect(midiToNoteName(108)).toBe('C8');
    });

    it('returns correct sharp note names', () => {
        expect(midiToNoteName(61)).toBe('C#4');
        expect(midiToNoteName(70)).toBe('A#4');
    });

    it('handles octave boundaries correctly', () => {
        expect(midiToNoteName(59)).toBe('B3');
        expect(midiToNoteName(60)).toBe('C4');
        expect(midiToNoteName(71)).toBe('B4');
        expect(midiToNoteName(72)).toBe('C5');
    });
});

describe('noteToMidi', () => {
    it('returns 60 for C4 (middle C)', () => {
        expect(noteToMidi('C4')).toBe(60);
    });

    it('returns 69 for A4 (concert A)', () => {
        expect(noteToMidi('A4')).toBe(69);
    });

    it('returns 21 for A0 (lowest piano key)', () => {
        expect(noteToMidi('A0')).toBe(21);
    });

    it('returns 108 for C8 (highest piano key)', () => {
        expect(noteToMidi('C8')).toBe(108);
    });

    it('handles sharp notes correctly', () => {
        expect(noteToMidi('C#4')).toBe(61);
        expect(noteToMidi('F#4')).toBe(66);
    });

    // Round-trip test: noteToMidi(midiToNoteName(n)) === n
    it('round-trips correctly with midiToNoteName', () => {
        const testMidiNumbers = [21, 60, 69, 72, 108];
        testMidiNumbers.forEach(midi => {
            const noteName = midiToNoteName(midi);
            expect(noteToMidi(noteName)).toBe(midi);
        });
    });
});

// =============================================================================
// CHORD GENERATION TESTS
// =============================================================================

describe('getScaleChords', () => {
    describe('C major diatonic triads', () => {
        const chords = getScaleChords('C', 'major');

        it('returns 7 diatonic chords', () => {
            expect(chords).toHaveLength(7);
        });

        it('I chord is C major', () => {
            expect(chords[0]).toMatchObject({
                numeral: 'I',
                rootNote: 'C',
                type: 'maj',
                intervals: [0, 4, 7],
            });
        });

        it('ii chord is D minor', () => {
            expect(chords[1]).toMatchObject({
                numeral: 'ii',
                rootNote: 'D',
                type: 'min',
                intervals: [0, 3, 7],
            });
        });

        it('iii chord is E minor', () => {
            expect(chords[2]).toMatchObject({
                numeral: 'iii',
                rootNote: 'E',
                type: 'min',
            });
        });

        it('IV chord is F major', () => {
            expect(chords[3]).toMatchObject({
                numeral: 'IV',
                rootNote: 'F',
                type: 'maj',
            });
        });

        it('V chord is G major', () => {
            expect(chords[4]).toMatchObject({
                numeral: 'V',
                rootNote: 'G',
                type: 'maj',
            });
        });

        it('vi chord is A minor', () => {
            expect(chords[5]).toMatchObject({
                numeral: 'vi',
                rootNote: 'A',
                type: 'min',
            });
        });

        it('vii° chord is B diminished', () => {
            expect(chords[6]).toMatchObject({
                numeral: 'vii°',
                rootNote: 'B',
                type: 'dim',
                intervals: [0, 3, 6],
            });
        });
    });

    describe('A minor diatonic triads', () => {
        const chords = getScaleChords('A', 'minor');

        it('returns 7 diatonic chords', () => {
            expect(chords).toHaveLength(7);
        });

        it('i chord is A minor', () => {
            expect(chords[0]).toMatchObject({
                numeral: 'i',
                rootNote: 'A',
                type: 'min',
            });
        });

        it('ii° chord is B diminished', () => {
            expect(chords[1]).toMatchObject({
                numeral: 'ii°',
                rootNote: 'B',
                type: 'dim',
            });
        });

        it('III chord is C major', () => {
            expect(chords[2]).toMatchObject({
                numeral: 'III',
                rootNote: 'C',
                type: 'maj',
            });
        });

        it('iv chord is D minor', () => {
            expect(chords[3]).toMatchObject({
                numeral: 'iv',
                rootNote: 'D',
                type: 'min',
            });
        });

        it('v chord is E minor', () => {
            expect(chords[4]).toMatchObject({
                numeral: 'v',
                rootNote: 'E',
                type: 'min',
            });
        });

        it('VI chord is F major', () => {
            expect(chords[5]).toMatchObject({
                numeral: 'VI',
                rootNote: 'F',
                type: 'maj',
            });
        });

        it('VII chord is G major', () => {
            expect(chords[6]).toMatchObject({
                numeral: 'VII',
                rootNote: 'G',
                type: 'maj',
            });
        });
    });
});

describe('getChordTypeFromIntervals', () => {
    describe('Triads', () => {
        it('identifies major triad [0, 4, 7]', () => {
            expect(getChordTypeFromIntervals([0, 4, 7])).toBe('maj');
        });

        it('identifies minor triad [0, 3, 7]', () => {
            expect(getChordTypeFromIntervals([0, 3, 7])).toBe('min');
        });

        it('identifies diminished triad [0, 3, 6]', () => {
            expect(getChordTypeFromIntervals([0, 3, 6])).toBe('dim');
        });
    });

    describe('Seventh chords', () => {
        it('identifies major 7th [0, 4, 7, 11]', () => {
            expect(getChordTypeFromIntervals([0, 4, 7, 11])).toBe('maj7');
        });

        it('identifies minor 7th [0, 3, 7, 10]', () => {
            expect(getChordTypeFromIntervals([0, 3, 7, 10])).toBe('min7');
        });

        it('identifies dominant 7th [0, 4, 7, 10]', () => {
            expect(getChordTypeFromIntervals([0, 4, 7, 10])).toBe('dom7');
        });

        it('identifies half-diminished 7th [0, 3, 6, 10]', () => {
            expect(getChordTypeFromIntervals([0, 3, 6, 10])).toBe('half-dim7');
        });
    });
});

// =============================================================================
// CONSTANTS VALIDATION
// =============================================================================

describe('SCALES constant', () => {
    it('major scale has correct intervals (W-W-H-W-W-W-H pattern)', () => {
        // Major scale: whole, whole, half, whole, whole, whole, half
        // Cumulative from root: 0, 2, 4, 5, 7, 9, 11
        expect(SCALES.major).toEqual([0, 2, 4, 5, 7, 9, 11]);
    });

    it('minor scale has correct intervals (W-H-W-W-H-W-W pattern)', () => {
        // Natural minor: whole, half, whole, whole, half, whole, whole
        // Cumulative from root: 0, 2, 3, 5, 7, 8, 10
        expect(SCALES.minor).toEqual([0, 2, 3, 5, 7, 8, 10]);
    });
});

describe('NOTES constant', () => {
    it('contains exactly 12 chromatic notes', () => {
        expect(NOTES).toHaveLength(12);
    });

    it('starts with C and ends with B', () => {
        expect(NOTES[0]).toBe('C');
        expect(NOTES[11]).toBe('B');
    });

    it('has sharps in correct positions', () => {
        expect(NOTES[1]).toBe('C#');
        expect(NOTES[3]).toBe('D#');
        expect(NOTES[6]).toBe('F#');
        expect(NOTES[8]).toBe('G#');
        expect(NOTES[10]).toBe('A#');
    });
});
