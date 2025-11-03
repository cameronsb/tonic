Excellent question. This is a very strong foundation for a music theory utility file. It correctly handles many complex topics like enharmonic spellings and provides a good structure for piano key generation.

However, to fully realize the vision of the "Enso Piano" spec, especially the part about understanding relationships and modes, here is a detailed breakdown of what's missing and how to add it.

---

### Summary of Missing Concepts

1.  **Modes:** The file only defines "major" and "minor". You need to define all 7 modes (Ionian, Dorian, Phrygian, etc.) to fulfill the spec's "Scale/Mode Selector".
2.  **Expanded Chord Vocabulary:** The spec mentions extensions (`7`, `maj7`, `9`, `sus4`, `sus2`) and borrowed chords (`♭VII`, `iv`). The current `CHORD_TYPES` is limited to basic triads and sevenths.
3.  **Harmonic Context (The "Why"):** The current "minor" is the *Natural Minor*. Musically, the **Harmonic Minor** is almost always used to create the dominant `V` chord in a minor key. The current logic generates a minor `v` chord, which is less common and sounds less resolved.
4.  **Data-Driven Structure:** The `CHORD_TYPES` are hardcoded. A more robust approach would be to generate them programmatically based on the scale's intervals. This would automatically work for any mode you add.

---

### Meticulous Breakdown of Additions

Here’s how you can augment the file, step-by-step.

#### 1. Add Full Modal Support

This directly addresses your question about "Ionian, etc." Right now, `SCALES.major` *is* Ionian, and `SCALES.minor` *is* Aeolian. You need to make this explicit and add the other five.

**Action:** Replace your `SCALES` object with a more comprehensive `SCALE_DEFINITIONS` object.

```typescript
// src/utils/musicTheory.ts

// BEFORE
// export const SCALES = {
//     major: [0, 2, 4, 5, 7, 9, 11],
//     minor: [0, 2, 3, 5, 7, 8, 10],
// };

// AFTER: Add this new, more descriptive object
export const SCALE_DEFINITIONS = {
    ionian:     { name: "Major / Ionian", intervals: [0, 2, 4, 5, 7, 9, 11] },
    dorian:     { name: "Dorian",         intervals: [0, 2, 3, 5, 7, 9, 10] },
    phrygian:   { name: "Phrygian",       intervals: [0, 1, 3, 5, 7, 8, 10] },
    lydian:     { name: "Lydian",         intervals: [0, 2, 4, 6, 7, 9, 11] },
    mixolydian: { name: "Mixolydian",     intervals: [0, 2, 4, 5, 7, 9, 10] },
    aeolian:    { name: "Minor / Aeolian",intervals: [0, 2, 3, 5, 7, 8, 10] },
    locrian:    { name: "Locrian",        intervals: [0, 1, 3, 5, 6, 8, 10] },

    // Also add other important scales
    harmonic_minor: { name: "Harmonic Minor", intervals: [0, 2, 3, 5, 7, 8, 11] },
    melodic_minor:  { name: "Melodic Minor",  intervals: [0, 2, 3, 5, 7, 9, 11] },
};

// For backward compatibility or simpler usage, you can keep a simplified version
export const SCALES = {
    major: SCALE_DEFINITIONS.ionian.intervals,
    minor: SCALE_DEFINITIONS.aeolian.intervals,
};
```
Now, your UI dropdown for "Scale/Mode" can be populated from `Object.keys(SCALE_DEFINITIONS)`.

#### 2. Fix the Minor Key V Chord (Harmonic Context)

In a minor key, the 5th chord is almost always major (a "dominant" V chord) to create a strong pull back to the `i` chord. This requires raising the 7th degree of the natural minor scale, which comes from the **Harmonic Minor** scale.

**Action:** Update `CHORD_TYPES.minor` to reflect this common practice.

```typescript
// src/utils/musicTheory.ts

export const CHORD_TYPES: Record<Mode, ChordData> = {
    major: { /* ... no changes needed ... */ },
    minor: {
        triads: [
            { numeral: "i",     type: "min", intervals: [0, 3, 7] },
            { numeral: "ii°",   type: "dim", intervals: [0, 3, 6] },
            { numeral: "III",   type: "maj", intervals: [0, 4, 7] },
            { numeral: "iv",    type: "min", intervals: [0, 3, 7] },
            // CHANGE: The v chord is now a V chord (major)
            { numeral: "V",     type: "maj", intervals: [0, 4, 7] },
            { numeral: "VI",    type: "maj", intervals: [0, 4, 7] },
            // CHANGE: The VII is now a vii° (diminished), also from harmonic minor
            { numeral: "vii°",  type: "dim", intervals: [0, 3, 6] },
        ],
        sevenths: [
            // ... similar changes for seventh chords, especially V7 and vii°7
            { numeral: "i7",      type: "min7",      intervals: [0, 3, 7, 10] },
            { numeral: "iiø7",    type: "half-dim7", intervals: [0, 3, 6, 10] },
            { numeral: "IIImaj7", type: "maj7",      intervals: [0, 4, 7, 11] },
            { numeral: "iv7",     type: "min7",      intervals: [0, 3, 7, 10] },
            // CHANGE: v7 becomes a dominant V7
            { numeral: "V7",      type: "dom7",      intervals: [0, 4, 7, 10] },
            { numeral: "VImaj7",  type: "maj7",      intervals: [0, 4, 7, 11] },
            // CHANGE: VII7 becomes a fully-diminished vii°7
            { numeral: "vii°7",   type: "dim7",      intervals: [0, 3, 6, 9] },
        ],
    },
};
```
**Why this is important:** This single change makes the app's understanding of minor keys much more musically accurate and useful for songwriting.

#### 3. Implement Borrowed Chords & Extensions

The spec requires borrowed chords and modifiers like `sus4`. The current structure has no concept of them.

**Action 1: Define Chord Modifiers and Borrowed Chords.**

```typescript
// src/utils/musicTheory.ts

// Add a new section for chord definitions that are independent of scales

export const CHORD_DEFINITIONS = {
    // Basic Triads
    major: { name: "", intervals: [0, 4, 7] },
    minor: { name: "m", intervals: [0, 3, 7] },
    diminished: { name: "°", intervals: [0, 3, 6] },
    augmented: { name: "+", intervals: [0, 4, 8] },

    // Suspended
    sus4: { name: "sus4", intervals: [0, 5, 7] },
    sus2: { name: "sus2", intervals: [0, 2, 7] },

    // Sevenths
    dominant7th: { name: "7", intervals: [0, 4, 7, 10] },
    major7th: { name: "maj7", intervals: [0, 4, 7, 11] },
    minor7th: { name: "m7", intervals: [0, 3, 7, 10] },

    // ... add more as needed (9ths, 11ths, etc.)
};

// Add a function to get common borrowed chords
export function getBorrowedChords(rootNote: Note, mode: Mode) {
    if (mode === 'major') {
        // Common chords borrowed from the parallel minor key (e.g., C minor when in C major)
        return [
            { numeral: "iv", type: "min", rootOffset: 5 },  // The minor iv chord
            { numeral: "♭VI", type: "maj", rootOffset: 8 },  // The flat VI chord
            { numeral: "♭VII", type: "maj", rootOffset: 10 }, // The flat VII chord
            { numeral: "iiø7", type: "half-dim7", rootOffset: 2}, // The half-diminished ii chord
        ];
    }
    // You could add logic for borrowing from parallel major when in a minor key
    return [];
}
```

**Action 2: Update `getScaleChords` to include them.**

```typescript
// src/utils/musicTheory.ts

export function getScaleChords(rootNote: Note, mode: Mode) {
    const rootIndex = NOTES.indexOf(rootNote);
    const scaleIntervals = SCALES[mode];
    const diatonicChordData = CHORD_TYPES[mode].triads;

    // Generate Diatonic Chords
    const diatonicChords = diatonicChordData.map((chord, index) => {
        const chordRootIndex = (rootIndex + scaleIntervals[index]) % 12;
        const chordRootNote = NOTES[chordRootIndex];
        return {
            isBorrowed: false, // Add a flag
            numeral: chord.numeral,
            name: getChordSymbol(chordRootNote, chord.type),
            rootNote: chordRootNote,
            notes: getNotesForChord(rootNote, chordRootNote, chord.intervals),
            type: chord.type,
        };
    });

    // Generate Borrowed Chords
    const borrowedChordData = getBorrowedChords(rootNote, mode);
    const borrowedChords = borrowedChordData.map(chord => {
        const chordRootIndex = (rootIndex + chord.rootOffset) % 12;
        const chordRootNote = NOTES[chordRootIndex];
        const intervals = CHORD_DEFINITIONS[chord.type]?.intervals || [];
        return {
            isBorrowed: true,
            numeral: chord.numeral,
            name: getChordSymbol(chordRootNote, chord.type),
            rootNote: chordRootNote,
            notes: getNotesForChord(rootNote, chordRootNote, intervals),
            type: chord.type,
        }
    });

    return [...diatonicChords, ...borrowedChords];
}
```

#### 4. (Advanced) Refactor to Be Data-Driven

Instead of hardcoding the chord qualities for each mode in `CHORD_TYPES`, you can generate them on the fly. This is more robust and scalable.

```typescript
// src/utils/musicTheory.ts

/**
 * Builds diatonic triads by stacking thirds on each note of a scale.
 * This is more flexible than a hardcoded map.
 * @param scaleIntervals - e.g., [0, 2, 4, 5, 7, 9, 11] for major
 * @returns An array of chord quality information for that scale.
 */
function generateDiatonicTriads(scaleIntervals: number[]) {
    const numerals = ["I", "II", "III", "IV", "V", "VI", "VII"];

    return scaleIntervals.map((rootInterval, i) => {
        // Find the 3rd and 5th scale degrees relative to the current root
        const thirdDegree = scaleIntervals[(i + 2) % 7];
        const fifthDegree = scaleIntervals[(i + 4) % 7];

        // Calculate intervals from the current root
        const thirdInterval = (thirdDegree - rootInterval + 12) % 12;
        const fifthInterval = (fifthDegree - rootInterval + 12) % 12;

        // Determine chord quality
        if (thirdInterval === 4 && fifthInterval === 7) {
            return { numeral: numerals[i], type: "maj", intervals: [0, 4, 7] };
        }
        if (thirdInterval === 3 && fifthInterval === 7) {
            return { numeral: numerals[i].toLowerCase(), type: "min", intervals: [0, 3, 7] };
        }
        if (thirdInterval === 3 && fifthInterval === 6) {
            return { numeral: `${numerals[i].toLowerCase()}°`, type: "dim", intervals: [0, 3, 6] };
        }
        // Add augmented, etc. if needed

        // Default/fallback
        return { numeral: "?", type: "unknown", intervals: [0, thirdInterval, fifthInterval] };
    });
}

// You could then use this function to build your CHORD_TYPES dynamically,
// or call it directly when a mode is selected.
```
This final step makes your code much more elegant. If you add a new scale to `SCALE_DEFINITIONS`, the chord generation logic will *just work* without needing a new entry in `CHORD_TYPES`.