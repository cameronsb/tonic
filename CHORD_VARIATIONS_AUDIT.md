# Chord Variations Audit & Fix

## Issue Identified
The chord variation system was not implementing extended chords (9, 11, 13) correctly according to music theory. Extended chords should include their implied lower intervals.

## Music Theory Reference

### Extended Chords (Dominant Quality)
- **9 chord**: Contains root, 3rd, 5th, **b7**, 9th
  - Example: C9 = C, E, G, **Bb**, D
  - Intervals: [0, 4, 7, **10**, 14]

- **11 chord**: Contains root, 3rd, 5th, **b7, 9th**, 11th
  - Example: C11 = C, E, G, **Bb, D**, F
  - Intervals: [0, 4, 7, **10, 14**, 17]

- **13 chord**: Contains root, 3rd, 5th, **b7, 9th**, 13th (11th typically omitted)
  - Example: C13 = C, E, G, **Bb, D**, A
  - Intervals: [0, 4, 7, **10, 14**, 21]

### Added Tone Chords
- **add9 chord**: Triad + 9th, **NO 7th**
  - Example: Cadd9 = C, E, G, D
  - Intervals: [0, 4, 7, 14]

## Fix Applied

### Code Changes
1. **Updated `ChordModifier` interface** (`ChordCard.tsx`)
   - Added `intervalsToAdd?: number[]` property for multiple intervals

2. **Fixed modifier definitions**:
   ```typescript
   { label: '9', intervalsToAdd: [10, 14] },      // Was: intervalToAdd: 14
   { label: '11', intervalsToAdd: [10, 14, 17] }, // Was: intervalToAdd: 17
   { label: '13', intervalsToAdd: [10, 14, 21] }, // Was: intervalToAdd: 21
   ```

3. **Updated `applyModifier()` function**
   - Now handles `intervalsToAdd` array
   - Adds all implied intervals for extended chords

4. **Updated `handleSelectChange()` function**
   - Same logic for select dropdown mode

## Current Behavior (Post-Fix)

### Complete 12-Button Layout (2 rows × 6 buttons)

**Row 1: Seventh chords, suspended, and altered triads**
| Variation | What It Does | Intervals | Result |
|-----------|--------------|-----------|--------|
| **7** | Adds b7 | [base] + 10 | Dominant 7th ✓ |
| **maj7** | Adds maj7 | [base] + 11 | Major 7th ✓ |
| **6** | Adds 6th | [base] + 9 | Major 6th ✓ |
| **sus2** | Replaces 3rd with 2nd | [0, 2, 7] | Suspended 2nd ✓ |
| **sus4** | Replaces 3rd with 4th | [0, 5, 7] | Suspended 4th ✓ |
| **dim** | Diminished triad | [0, 3, 6] | Diminished (b3, b5) ✓ |

**Row 2: Extended chords and augmented**
| Variation | What It Does | Intervals | Result |
|-----------|--------------|-----------|--------|
| **9** | Adds b7 + 9th | [base] + 10, 14 | Dominant 9th ✓ |
| **maj9** | Adds maj7 + 9th | [base] + 11, 14 | Major 9th ✓ |
| **11** | Adds b7 + 9th + 11th | [base] + 10, 14, 17 | Dominant 11th ✓ |
| **13** | Adds b7 + 9th + 13th | [base] + 10, 14, 21 | Dominant 13th ✓ |
| **add9** | Adds 9th only (no 7th) | [base] + 14 | Add 9 ✓ |
| **aug** | Augmented triad | [0, 4, 8] | Augmented (#5) ✓ |

## Known Limitations

1. **No maj11 or maj13**: While we have `maj9`, the system doesn't have `maj11` or `maj13` as separate options. These are less common in practice, but if needed, users would have to combine modifiers (not currently supported for multiple selections in button mode).

2. **Single Modifier Only**: The current UI only allows selecting one variation at a time. This prevents combining modifiers like:
   - `sus4` + `7` → sus4(7)
   - `6` + `9` → 6/9 chord
   - `maj7` + `#11` → maj7#11

   This is intentional for UI simplicity, but limits some advanced jazz voicings.

3. **Altered Tensions Not Included**: Common altered tensions are not available:
   - b9, #9 (altered 9ths)
   - #11 (lydian sound)
   - b13 (altered 13th)

   These could be added in a future "advanced mode" if needed.

## Testing Recommendations

Test these chords to verify correct intervals:

**Seventh Chords:**
- **C7**: C-E-G-Bb (4 notes)
- **Cmaj7**: C-E-G-B (4 notes)
- **C6**: C-E-G-A (4 notes)

**Suspended Chords:**
- **Csus2**: C-D-G (3 notes, no E)
- **Csus4**: C-F-G (3 notes, no E)

**Altered Triads:**
- **C°** (dim): C-Eb-Gb (3 notes, b3 and b5)
- **C+** (aug): C-E-G# (3 notes, #5)

**Extended Chords:**
- **C9**: C-E-G-Bb-D (5 notes with b7)
- **Cmaj9**: C-E-G-B-D (5 notes with maj7)
- **C11**: C-E-G-Bb-D-F (6 notes)
- **C13**: C-E-G-Bb-D-A (6 notes, no 11th)

**Added Tone:**
- **Cadd9**: C-E-G-D (4 notes, no 7th!)

## Summary

The chord variation system now provides a **musically complete palette** of 12 variations covering:
- ✓ All essential seventh chords (7, maj7, 6)
- ✓ Both suspended chords (sus2, sus4)
- ✓ Altered triads (dim, aug)
- ✓ Extended dominant chords (9, 11, 13)
- ✓ Major extended chord (maj9)
- ✓ Added tone chord (add9)

All extended chords correctly include their implied lower intervals per standard music theory.

